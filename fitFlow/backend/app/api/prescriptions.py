from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.schemas.prescription import PrescriptionCreate, PrescriptionOut
from backend.app.models.prescription import Prescription
from backend.app.database.session import get_db

router = APIRouter(prefix="/prescriptions", tags=["Prescriptions"])

@router.post("/", response_model=PrescriptionOut)
def create_prescription(prescription: PrescriptionCreate, db: Session = Depends(get_db)):
    db_prescription = Prescription(**prescription.dict())
    db.add(db_prescription)
    db.commit()
    db.refresh(db_prescription)
    return db_prescription

@router.get("/", response_model=list[PrescriptionOut])
def read_prescriptions(db: Session = Depends(get_db)):
    return db.query(Prescription).all()

@router.get("/{prescription_id}", response_model=PrescriptionOut)
def read_prescription(prescription_id: int, db: Session = Depends(get_db)):
    prescription = db.query(Prescription).filter(Prescription.id == prescription_id).first()
    if not prescription:
        raise HTTPException(status_code=404, detail="Prescription not found")
    return prescription

@router.put("/{prescription_id}", response_model=PrescriptionOut)
def update_prescription(prescription_id: int, prescription: PrescriptionCreate, db: Session = Depends(get_db)):
    db_prescription = db.query(Prescription).filter(Prescription.id == prescription_id).first()
    if not db_prescription:
        raise HTTPException(status_code=404, detail="Prescription not found")
    for key, value in prescription.dict().items():
        setattr(db_prescription, key, value)
    db.commit()
    db.refresh(db_prescription)
    return db_prescription

@router.delete("/{prescription_id}")
def delete_prescription(prescription_id: int, db: Session = Depends(get_db)):
    db_prescription = db.query(Prescription).filter(Prescription.id == prescription_id).first()
    if not db_prescription:
        raise HTTPException(status_code=404, detail="Prescription not found")
    db.delete(db_prescription)
    db.commit()
    return {"message": "Prescription deleted"}
