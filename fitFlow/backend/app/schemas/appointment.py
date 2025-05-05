from pydantic import BaseModel
from datetime import datetime

class AppointmentBase(BaseModel):
    patient_name: str
    doctor_name: str
    datetime: datetime
    mode: str

class AppointmentCreate(AppointmentBase):
    pass

class AppointmentOut(AppointmentBase):
    id: int

    class Config:
        orm_mode = True
