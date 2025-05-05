from pydantic import BaseModel, EmailStr, validator
from datetime import date
from typing import Optional
import enum
import re

class Sex(str, enum.Enum):
    Masculino = "Masculino"
    Femenino = "Femenino"

class UserBase(BaseModel):
    first_name: str
    last_name: str
    cedula: str
    email: EmailStr
    password: str
    birth_date: date
    sex: Sex

    @validator("cedula")
    def validate_cedula(cls, v):
        if not re.fullmatch(r"\d{6,20}", v):
            raise ValueError("Cédula must be 6–20 dígitos")
        return v

class UserOut(BaseModel):
    user_id: int
    first_name: str
    last_name: str
    cedula: str
    email: str
    birth_date: date
    sex: Sex

    class Config:
        orm_mode = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str
