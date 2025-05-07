from pydantic import BaseModel, constr, confloat
from typing import Optional

class FoodCreate(BaseModel):
    name: constr(min_length=2, max_length=100)
    description: Optional[constr(max_length=255)] = None
    calories_per_portion: confloat(gt=0)
    protein_per_portion: confloat(ge=0)
    fat_per_portion: confloat(ge=0)
    carbs_per_portion: confloat(ge=0)
    portion_unit: constr(min_length=1, max_length=50)

class FoodOut(FoodCreate):
    food_id: int

    class Config:
        orm_mode = True
