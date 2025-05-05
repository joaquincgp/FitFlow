from sqlalchemy.orm import Session
from backend.app.models.user import User
from backend.app.schemas.user import UserCreate
from backend.app.core.security import get_password_hash, verify_password, create_access_token
from fastapi import HTTPException

def register_user(user: UserCreate, db: Session):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    new_user = User(
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        phone_number=user.phone_number,
        hashed_password=get_password_hash(user.password),
        role=user.role,
        date_of_birth=user.date_of_birth,
        city=user.city,
        country=user.country,
        sexual_gender=user.sexual_gender,
        insurance=user.insurance,
        address=user.address,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

def authenticate_user(email: str, password: str, db: Session):
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user