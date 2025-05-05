from pydantic import BaseModel
from datetime import date
from typing import Optional
import enum

class ActivityLevel(str, enum.Enum):
    Sedentario = "Sedentario"
    Ligero = "Ligero"
    Moderado = "Moderado"
    Intenso = "Intenso"
    Extremo = "Extremo"

class ClientCreate(BaseModel):
    first_name: str
    last_name: str
    cedula: str
    email: str
    password: str
    birth_date: date
    sex: str
    height_cm: float
    weight_current_kg: float
    weight_goal_kg: float
    activity_level: ActivityLevel

class ClientOut(BaseModel):
    user_id: int
    first_name: str
    last_name: str
    cedula: str
    email: str
    birth_date: date
    sex: str
    height_cm: float
    weight_current_kg: float
    weight_goal_kg: float
    activity_level: ActivityLevel
    age: Optional[int]
    metabolismo_basal: Optional[float]
    get: Optional[float]
    rcde: Optional[float]

    class Config:
        orm_mode = True
