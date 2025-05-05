from pydantic import BaseModel

class NutritionistCreate(BaseModel):
    first_name: str
    last_name: str
    cedula: str
    email: str
    password: str
    birth_date: str
    sex: str
    certification_number: str
    specialty: str
