from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from fitFlow.backend.app.database.session import get_db
from fitFlow.backend.app.models.food import Food
from fitFlow.backend.app.schemas.food import FoodCreate, FoodOut

router = APIRouter(prefix="/foods", tags=["Foods"])

@router.post("/", response_model=FoodOut)
def create_food(food: FoodCreate, db: Session = Depends(get_db)):
    existing = db.query(Food).filter(Food.name == food.name).first()
    if existing:
        raise HTTPException(400, "Este alimento ya está registrado")
    new_food = Food(
        name=food.name,
        calories_per_portion=food.calories_per_portion,
        protein_per_portion=food.protein_per_portion,
        fat_per_portion=food.fat_per_portion,
        carbs_per_portion=food.carbs_per_portion,
        portion_unit=food.portion_unit
    )
    db.add(new_food)
    db.commit()
    db.refresh(new_food)
    return new_food

@router.get("/", response_model=List[FoodOut])
def list_foods(db: Session = Depends(get_db)):
    return db.query(Food).all()

@router.delete("/{food_id}")
def delete_food(food_id: int, db: Session = Depends(get_db)):
    food = db.query(Food).filter(Food.food_id == food_id).first()
    if not food:
        raise HTTPException(404, "Alimento no encontrado")
    db.delete(food)
    db.commit()
    return {"message": "Alimento eliminado correctamente"}
