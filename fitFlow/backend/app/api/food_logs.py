from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from fitFlow.backend.app.database.session import get_db
from fitFlow.backend.app.models.food_log import FoodLog
from fitFlow.backend.app.models.user import User
from fitFlow.backend.app.schemas.food_log import FoodLogCreate
from fitFlow.backend.app.api.auth import get_current_user

router = APIRouter(prefix="/food-logs", tags=["FoodLogs"])

@router.post("/")
def log_food(entries: List[FoodLogCreate],
             current_user: User = Depends(get_current_user),
             db: Session = Depends(get_db)):
    for entry in entries:
        new_log = FoodLog(
            user_id=current_user.user_id,
            food_id=entry.food_id,
            meal_type=entry.meal_type,
            portion_size=entry.portion_size,
            date=datetime.utcnow().date()
        )
        db.add(new_log)
    db.commit()
    return {"message": "Registro guardado correctamente"}
