from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from fitFlow.backend.app.database.session import get_db
from fitFlow.backend.app.models.user import User
from fitFlow.backend.app.models.client import Client
from fitFlow.backend.app.models.nutritionist import Nutritionist
from fitFlow.backend.app.models.admin import Admin
from fitFlow.backend.app.schemas.client import ClientCreate, ClientOut
from fitFlow.backend.app.schemas.nutritionist import NutritionistCreate
from fitFlow.backend.app.schemas.admin import AdminCreate
from fitFlow.backend.app.core.security import get_password_hash

router = APIRouter(prefix="/register", tags=["Registration"])

@router.post("/client", response_model=ClientOut)
def register_client(client_data: ClientCreate, db: Session = Depends(get_db)):
    user = User(
        first_name=client_data.first_name,
        last_name=client_data.last_name,
        cedula=client_data.cedula,
        email=client_data.email,
        password=get_password_hash(client_data.password),
        birth_date=client_data.birth_date,
        sex=client_data.sex,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    client = Client(
        client_id=user.user_id,
        height_cm=client_data.height_cm,
        weight_current_kg=client_data.weight_current_kg,
        weight_goal_kg=client_data.weight_goal_kg,
        activity_level=client_data.activity_level,
    )
    db.add(client)
    db.commit()
    db.refresh(client)
    return client

@router.post("/nutritionist")
def register_nutritionist(data: NutritionistCreate, db: Session = Depends(get_db)):
    user = User(
        first_name=data.first_name,
        last_name=data.last_name,
        cedula=data.cedula,
        email=data.email,
        password=get_password_hash(data.password),
        birth_date=data.birth_date,
        sex=data.sex,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    nutritionist = Nutritionist(
        nutritionist_id=user.user_id,
        certification_number=data.certification_number,
        specialty=data.specialty,
    )
    db.add(nutritionist)
    db.commit()
    return {"message": "Nutritionist registered"}

@router.post("/admin")
def register_admin(data: AdminCreate, db: Session = Depends(get_db)):
    user = User(
        first_name=data.first_name,
        last_name=data.last_name,
        cedula=data.cedula,
        email=data.email,
        password=get_password_hash(data.password),
        birth_date=data.birth_date,
        sex=data.sex,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    admin = Admin(
        admin_id=user.user_id,
        department=data.department,
        phone_number=data.phone_number,
    )
    db.add(admin)
    db.commit()
    return {"message": "Admin registered"}
