from pydantic import BaseModel

class AdminCreate(BaseModel):
    first_name: str
    last_name: str
    cedula: str
    email: str
    password: str
    birth_date: str
    sex: str
    department: str
    phone_number: str
