from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.schemas.clinic import ClinicCreate, ClinicOut
from backend.app.models.clinic import Clinic
from backend.app.database.session import get_db

router = APIRouter(prefix="/clinics", tags=["Clinics"])

@router.post("/", response_model=ClinicOut)
def create_clinic(clinic: ClinicCreate, db: Session = Depends(get_db)):
    db_clinic = Clinic(**clinic.dict())
    db.add(db_clinic)
    db.commit()
    db.refresh(db_clinic)
    return db_clinic

@router.get("/", response_model=list[ClinicOut])
def read_clinics(db: Session = Depends(get_db)):
    return db.query(Clinic).all()

@router.get("/{clinic_id}", response_model=ClinicOut)
def read_clinic(clinic_id: int, db: Session = Depends(get_db)):
    clinic = db.query(Clinic).filter(Clinic.id == clinic_id).first()
    if not clinic:
        raise HTTPException(status_code=404, detail="Clinic not found")
    return clinic

@router.put("/{clinic_id}", response_model=ClinicOut)
def update_clinic(clinic_id: int, clinic: ClinicCreate, db: Session = Depends(get_db)):
    db_clinic = db.query(Clinic).filter(Clinic.id == clinic_id).first()
    if not db_clinic:
        raise HTTPException(status_code=404, detail="Clinic not found")
    for key, value in clinic.dict().items():
        setattr(db_clinic, key, value)
    db.commit()
    db.refresh(db_clinic)
    return db_clinic

@router.delete("/{clinic_id}")
def delete_clinic(clinic_id: int, db: Session = Depends(get_db)):
    db_clinic = db.query(Clinic).filter(Clinic.id == clinic_id).first()
    if not db_clinic:
        raise HTTPException(status_code=404, detail="Clinic not found")
    db.delete(db_clinic)
    db.commit()
    return {"message": "Clinic deleted"}