from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from fitFlow.backend.app.database.session import get_db
from fitFlow.backend.app.models.food_log import FoodLog
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

# Listar  planes del usuario registrado
@router.get("/my-plans")
def get_my_plans(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    plans = db.query(NutritionPlan).options(
        joinedload(NutritionPlan.meals).joinedload(NutritionPlanMeal.food)
    ).filter(NutritionPlan.user_id == current_user.user_id).all()
    return [
        {
            "plan_id": plan.plan_id,
            "name": plan.name,
            "description": plan.description,
            "created_at": plan.created_at,
            "meals": [
                {
                    "id": meal.id,
                    "meal_type": meal.meal_type,
                    "portion_size": meal.portion_size,
                    "food_id": meal.food_id,
                    "food_name": meal.food.name
                }
                for meal in plan.meals
            ]
        }
        for plan in plans
    ]


# Detalle del plan
@router.get("/{plan_id}")
def get_plan_detail(plan_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    plan = db.query(NutritionPlan).options(joinedload(NutritionPlan.meals).joinedload(NutritionPlanMeal.food)).filter(
        NutritionPlan.plan_id == plan_id,
        NutritionPlan.user_id == current_user.user_id
    ).first()
    if not plan:
        raise HTTPException(404, "Plan no encontrado")

    return {
        "plan_id": plan.plan_id,
        "name": plan.name,
        "description": plan.description,
        "meals": [
            {
                "id": meal.id,
                "meal_type": meal.meal_type,
                "portion_size": meal.portion_size,
                "food_id": meal.food_id,
                "food_name": meal.food.name
            }
            for meal in plan.meals
        ]
    }


# Revisar cumplimiento de plan
@router.get("/{plan_id}/status")
def check_plan_compliance(plan_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    plan = db.query(NutritionPlan).options(joinedload(NutritionPlan.meals)).filter(
        NutritionPlan.plan_id == plan_id,
        NutritionPlan.user_id == current_user.user_id
    ).first()
    if not plan:
        raise HTTPException(404, "Plan no encontrado")

    today = date.today()
    compliance_detail = []
    for meal in plan.meals:
        food_log = db.query(FoodLog).filter(
            FoodLog.user_id == current_user.user_id,
            FoodLog.food_id == meal.food_id,
            FoodLog.meal_type == meal.meal_type,
            FoodLog.date == today
        ).first()
        compliance_detail.append({
            "food_id": meal.food_id,
            "food_name": meal.food.name,
            "meal_type": meal.meal_type,
            "planned_portion": meal.portion_size,
            "consumed_portion": food_log.portion_size if food_log else 0,
            "fulfilled": bool(food_log)
        })

    total = len(plan.meals)
    fulfilled = sum(1 for item in compliance_detail if item["fulfilled"])
    status_text = f"{fulfilled}/{total} comidas registradas hoy"

    return {
        "plan_id": plan.plan_id,
        "plan_name": plan.name,
        "status": status_text,
        "detail": compliance_detail
    }