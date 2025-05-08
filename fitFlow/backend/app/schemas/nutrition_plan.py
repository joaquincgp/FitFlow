from datetime import datetime

from pydantic import BaseModel, constr, conlist, confloat
from typing import List, Optional

from fitFlow.backend.app.models.nutrition_plan_meal import MealType

class NutritionPlanMealCreate(BaseModel):
    food_id: int
    meal_type: MealType
    portion_size: confloat(gt=0)

class NutritionPlanCreate(BaseModel):
    user_id: int
    nutritionist_id: int
    name: constr(min_length=2, max_length=100)
    description: Optional[constr(max_length=255)] = None
    meals: conlist(NutritionPlanMealCreate)

class PlanMealOut(BaseModel):
    id: int
    meal_type: MealType
    portion_size: float
    food_id: int
    food_name: str

class NutritionPlanOut(BaseModel):
    plan_id: int
    name: str
    description: Optional[str]
    created_at: Optional[datetime]
    meals: List[PlanMealOut]