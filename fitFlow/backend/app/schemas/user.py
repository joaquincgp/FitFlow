from pydantic import BaseModel, EmailStr, validator
from enum import Enum
from typing import Optional
from datetime import date

class UserRole(str, Enum):
    medico = "medico"
    paciente = "paciente"

class UserBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    phone_number: str

class UserCreate(UserBase):
    password: str
    role: UserRole
    date_of_birth: Optional[date] = None
    city: Optional[str] = None
    country: Optional[str] = None
    sexual_gender: Optional[str] = None
    insurance: Optional[str] = None
    address: Optional[str] = None

    @validator('first_name', 'last_name', 'email')
    def no_whitespace(cls, v):
        if not v or v.strip() != v:
            raise ValueError("No se permiten espacios en blanco al inicio o final")
        return v

class UserOut(UserBase):
    id: int
    role: UserRole
    date_of_birth: Optional[date]
    city: Optional[str]
    country: Optional[str]
    sexual_gender: Optional[str]
    insurance: Optional[str]

    class Config:
        orm_mode = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str
