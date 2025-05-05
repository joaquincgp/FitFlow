from pydantic import BaseModel

class ClinicBase(BaseModel):
    name: str
    address: str

class ClinicCreate(ClinicBase):
    pass

class ClinicOut(ClinicBase):
    id: int

    class Config:
        orm_mode = True