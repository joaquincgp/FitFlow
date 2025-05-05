from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from jose import jwt, JWTError
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

from backend.app.schemas.user import UserCreate, UserOut, UserLogin
from backend.app.models.user import User, UserRole
from backend.app.services.user_service import register_user, authenticate_user, create_access_token
from backend.app.database.session import get_db
from backend.app.core.security import get_password_hash, verify_password
from backend.app.models.doctor import Doctor


SECRET_KEY = "udla"
ALGORITHM = "HS256"

router = APIRouter(prefix="/auth", tags=["Auth"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=401,
        detail="No se pudo validar el token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    return user


@router.post("/register", response_model=UserOut)
def register(user: UserCreate, db: Session = Depends(get_db)):
    if user.role != UserRole.paciente:
        raise HTTPException(status_code=400, detail="Solo se permiten pacientes en este endpoint.")
    return register_user(user, db)


@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Buscar primero entre usuarios (pacientes)
    user = db.query(User).filter(User.email == form_data.username).first()
    if user and verify_password(form_data.password, user.hashed_password):
        token = create_access_token({"sub": user.email, "role": user.role})
        return {"access_token": token, "token_type": "bearer"}

    # Buscar entre médicos
    doctor = db.query(Doctor).filter(Doctor.email == form_data.username).first()
    if doctor and form_data.password == "medico123":  # Solo temporal mientras no tiene contraseña
        token = create_access_token({"sub": doctor.email, "role": "medico"})
        return {"access_token": token, "token_type": "bearer"}

    raise HTTPException(status_code=400, detail="Credenciales inválidas")


@router.get("/me", response_model=UserOut)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.get("/users", response_model=List[UserOut])
def get_users(db: Session = Depends(get_db)):
    return db.query(User).all()


@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return {"message": "User deleted"}


@router.put("/users/{user_id}", response_model=UserOut)
def update_user(user_id: int, user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == user_id).first()

    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    db_user.first_name = user.first_name
    db_user.last_name = user.last_name
    db_user.email = user.email
    db_user.role = user.role

    if user.password:
        db_user.hashed_password = get_password_hash(user.password)

    if user.role == UserRole.paciente:
        db_user.date_of_birth = user.date_of_birth
        db_user.city = user.city
        db_user.country = user.country
        db_user.sexual_gender = user.sexual_gender
        db_user.insurance = user.insurance
        db_user.address = user.address

    db.commit()
    db.refresh(db_user)
    return db_user


@router.post("/verify-password")
def verify_user_password(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    if not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Contraseña incorrecta")
    return {"message": "Contraseña válida", "user_id": user.id}
