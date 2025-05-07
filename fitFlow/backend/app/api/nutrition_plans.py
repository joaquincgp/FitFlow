from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from fitFlow.backend.app.database.session import get_db
from fitFlow.backend.app.models.nutrition_plan import NutritionPlan
from fitFlow.backend.app.models.nutrition_plan_meal import  NutritionPlanMeal
from fitFlow.backend.app.schemas.nutrition_plan import  NutritionPlanCreate
from fitFlow.backend.app.api.auth import get_current_user, User

router = APIRouter(prefix="/nutrition-plans", tags=["NutritionPlans"])

@router.post("/")
def create_plan(plan: NutritionPlanCreate,
                db: Session = Depends(get_db),
                current_user: User = Depends(get_current_user)):

    new_plan = NutritionPlan(
        user_id=plan.user_id,
        nutritionist_id=plan.nutritionist_id,
        name=plan.name,
        description=plan.description
    )
    db.add(new_plan)
    db.commit()
    db.refresh(new_plan)

    for meal in plan.meals:
        new_meal = NutritionPlanMeal(
            plan_id=new_plan.plan_id,
            food_id=meal.food_id,
            meal_type=meal.meal_type,
            portion_size=meal.portion_size
        )
        db.add(new_meal)

    db.commit()
    return {"message": "Plan nutricional creado correctamente"}
