from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from jose import jwt, JWTError
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

from fitFlow.backend.app.schemas.user import UserOut, UserLogin

from fitFlow.backend.app.models.user import User
from fitFlow.backend.app.models.client import Client
from fitFlow.backend.app.models.nutritionist import Nutritionist
from fitFlow.backend.app.models.admin import Admin
from fitFlow.backend.app.services.user_service import register_user
from fitFlow.backend.app.core.security import verify_password, create_access_token
from fitFlow.backend.app.database.session import get_db
from fitFlow.backend.app.core.security import SECRET_KEY


ALGORITHM = "HS256"

router = APIRouter(prefix="/auth", tags=["Authentication"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_role(user: User, db: Session):
    if db.query(Client).filter(Client.client_id == user.user_id).first():
        return "Cliente"
    elif db.query(Nutritionist).filter(Nutritionist.nutritionist_id == user.user_id).first():
        return "Nutricionista"
    elif db.query(Admin).filter(Admin.admin_id == user.user_id).first():
        return "Administrador"
    return "Sin rol"

def get_current_user(token: str = Depends(oauth2_scheme),
                     db: Session = Depends(get_db)) -> User:
    cred_exc = HTTPException(401, "Could not validate credentials",
                             headers={"WWW-Authenticate":"Bearer"})
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



@router.post("/login")
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.cedula == form.username).first()
    if not user or not verify_password(form.password, user.password):
        raise HTTPException(400, "Invalid credentials")
    access_token = create_access_token({"sub": user.cedula})
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    role = get_role(current_user, db)
    return {**current_user.__dict__, "role": role}


@router.get("/users", response_model=List[UserOut])
def list_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    result = []
    for user in users:
        role = get_role(user, db)
        result.append({**user.__dict__, "role": role})
    return result

@router.get("/nutritionists", response_model=List[UserOut])
def list_nutritionists(db: Session = Depends(get_db)):
    nutritionists = db.query(Nutritionist).all()
    result = []
    for n in nutritionists:
        user = db.query(User).filter(User.user_id == n.nutritionist_id).first()
        result.append({**user.__dict__, "role": "Nutricionista"})
    return result

@router.get("/admins", response_model=List[UserOut])
def list_admins(db: Session = Depends(get_db)):
    admins = db.query(Admin).all()
    result = []
    for a in admins:
        user = db.query(User).filter(User.user_id == a.admin_id).first()
        result.append({**user.__dict__, "role": "Administrador"})
    return result

