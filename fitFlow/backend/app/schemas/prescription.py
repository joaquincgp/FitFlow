from pydantic import BaseModel

class PrescriptionBase(BaseModel):
    patient_name: str
    doctor_name: str
    details: str

class PrescriptionCreate(PrescriptionBase):
    pass

class PrescriptionOut(PrescriptionBase):
    id: int

    class Config:
        orm_mode = True
