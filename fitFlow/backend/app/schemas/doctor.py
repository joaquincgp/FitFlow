from pydantic import BaseModel, EmailStr, validator

class DoctorBase(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone_number: str
    specialty: str
    location: str

class DoctorCreate(DoctorBase):
    @validator('first_name', 'last_name', 'email', 'phone_number')
    def no_whitespace(cls, v):
        if not v or v.strip() != v:
            raise ValueError("No se permiten espacios en blanco al inicio o final")
        return v

class DoctorOut(DoctorBase):
    id: int

    class Config:
        orm_mode = True
