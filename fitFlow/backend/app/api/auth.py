from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from jose import jwt, JWTError
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

from fitFlow.backend.app.schemas.user import UserOut

from fitFlow.backend.app.models.user import User
from fitFlow.backend.app.models.client import Client
from fitFlow.backend.app.models.nutritionist import Nutritionist
from fitFlow.backend.app.models.admin import Admin
from fitFlow.backend.app.core.security import verify_password, create_access_token
from fitFlow.backend.app.database.session import get_db
from fitFlow.backend.app.core.security import SECRET_KEY
from fitFlow.backend.app.dependencies.auth import get_current_user as get_current_keycloak_user


ALGORITHM = "HS256"

router = APIRouter(prefix="/auth", tags=["Authentication"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_role(user: User, db: Session):
    if db.query(Client).filter(Client.client_id == user.user_id).first():
        return "Cliente"
    if db.query(Nutritionist).filter(Nutritionist.nutritionist_id == user.user_id).first():
        return "Nutricionista"
    if db.query(Admin).filter(Admin.admin_id == user.user_id).first():
        return "Administrador"
    return "Sin rol"


def get_current_user_local(token: str = Depends(oauth2_scheme),
                           db: Session = Depends(get_db)) -> User:
    cred_exc = HTTPException(
        401,
        "Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        cedula = payload.get("sub")
        if cedula is None:
            raise cred_exc
    except JWTError:
        raise cred_exc
    user = db.query(User).filter(User.cedula == cedula).first()
    if not user:
        raise cred_exc
    return user


def get_user_from_claims(claims: dict, db: Session) -> User | None:
    identifier = (
        claims.get("preferred_username")
        or claims.get("email")
        or claims.get("sub")
    )
    if identifier is None:
        return None
    # prefer cedula match
    user = db.query(User).filter(User.cedula == identifier).first()
    if user:
        return user
    # fallback to email
    if claims.get("email"):
        user = db.query(User).filter(User.email == claims["email"]).first()
        if user:
            return user
    return None


def create_user_from_keycloak_claims(claims: dict, db: Session) -> User:
    """Crea un usuario en FitFlow basado en los claims de Keycloak"""
    from datetime import date
    from fitFlow.backend.app.models.user import Sex
    from fitFlow.backend.app.core.security import get_password_hash
    
    # Extraer datos del token
    cedula = claims.get("preferred_username") or claims.get("sub", "unknown")
    email = claims.get("email", f"{cedula}@keycloak.local")
    first_name = claims.get("given_name") or claims.get("preferred_username", "Usuario")
    last_name = claims.get("family_name") or "Keycloak"
    
    # Valores por defecto para campos obligatorios
    birth_date = date(1990, 1, 1)  # Fecha por defecto
    sex = Sex.Masculino  # Valor por defecto
    password_hash = get_password_hash("keycloak_user_no_password")  # Password dummy, no se usará
    
    # Crear usuario
    new_user = User(
        cedula=cedula,
        email=email,
        first_name=first_name,
        last_name=last_name,
        password=password_hash,
        birth_date=birth_date,
        sex=sex
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user


def get_current_user(
    claims: dict = Depends(get_current_keycloak_user),
    db: Session = Depends(get_db),
) -> User:
    """Dependencia que valida token Keycloak y devuelve objeto User de la DB"""
    user = get_user_from_claims(claims, db)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="Usuario no encontrado en FitFlow. Asegúrate de que el usuario existe en la base de datos."
        )
    return user


@router.post("/login")
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.cedula == form.username).first()
    if not user or not verify_password(form.password, user.password):
        raise HTTPException(400, "Invalid credentials")
    access_token = create_access_token({"sub": user.cedula})
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserOut)
def me(
    claims: dict = Depends(get_current_keycloak_user),
    db: Session = Depends(get_db),
):
    user = get_user_from_claims(claims, db)
    if not user:
        # Crear usuario automáticamente si no existe
        try:
            user = create_user_from_keycloak_claims(claims, db)
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error al crear usuario desde Keycloak: {str(e)}"
            )
    role = get_role(user, db)
    return {**user.__dict__, "role": role}


# NUTRITIONISTS
@router.get("/nutritionists", response_model=List[UserOut])
def list_nutritionists(db: Session = Depends(get_db)):
    nutritionists = db.query(Nutritionist).all()
    result = []
    for n in nutritionists:
        user = db.query(User).filter(User.user_id == n.nutritionist_id).first()
        result.append({**user.__dict__, "role": "Nutricionista"})
    return result

# ADMINS
@router.get("/admins", response_model=List[UserOut])
def list_admins(db: Session = Depends(get_db)):
    admins = db.query(Admin).all()
    result = []
    for a in admins:
        user = db.query(User).filter(User.user_id == a.admin_id).first()
        result.append({**user.__dict__, "role": "Administrador"})
    return result

# USUARIO
@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(404, "Usuario no encontrado")
    db.delete(user)
    db.commit()
    return {"message": "Usuario eliminado correctamente"}

@router.get("/users", response_model=List[UserOut])
def list_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    result = []
    for user in users:
        role = get_role(user, db)
        result.append({**user.__dict__, "role": role})
    return result

#CLIENTS
@router.get("/clients", response_model=List[UserOut])
def list_clients(db: Session = Depends(get_db)):
    clients = db.query(Client).all()
    result = []
    for c in clients:
        user = db.query(User).filter(User.user_id == c.client_id).first()
        result.append({**user.__dict__, "role": "Cliente"})
    return result

