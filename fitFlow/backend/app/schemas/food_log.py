from pydantic import BaseModel, confloat
from datetime import date

from fitFlow.backend.app.models.nutrition_plan_meal import MealType


class FoodLogCreate(BaseModel):
    food_id: int
    date: date
    meal_type: MealType
    portion_size: confloat(gt=0)
