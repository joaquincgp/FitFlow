# En schemas/nutrition_plan.py
from datetime import datetime, date
from pydantic import BaseModel, constr, conlist, confloat, validator
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
    plan_date: date  # ← NUEVO: Fecha obligatoria del plan
    meals: conlist(NutritionPlanMealCreate)

    @validator('plan_date')
    def validate_plan_date(cls, v):
        # No permitir fechas en el pasado (excepto hoy)
        if v < date.today():
            raise ValueError("La fecha del plan no puede ser anterior a hoy")
        return v


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
    plan_date: date  # ← NUEVO en salida
    created_at: Optional[datetime]
    meals: List[PlanMealOut]

    class Config:
        from_attributes = True