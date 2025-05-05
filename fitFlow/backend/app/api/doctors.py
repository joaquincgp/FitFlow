from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.schemas.doctor import DoctorCreate, DoctorOut
from backend.app.models.doctor import Doctor
from backend.app.database.session import get_db

router = APIRouter(prefix="/doctors", tags=["Doctors"])

@router.post("/", response_model=DoctorOut)
def create_doctor(doctor: DoctorCreate, db: Session = Depends(get_db)):
    existing = db.query(Doctor).filter(Doctor.email == doctor.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="El correo ya está registrado como médico")

    db_doctor = Doctor(
        first_name=doctor.first_name,
        last_name=doctor.last_name,
        email=doctor.email,
        phone_number=doctor.phone_number,
        specialty=doctor.specialty,
        location=doctor.location,
    )
    db.add(db_doctor)
    db.commit()
    db.refresh(db_doctor)
    return db_doctor


@router.get("/", response_model=list[DoctorOut])
def read_doctors(db: Session = Depends(get_db)):
    return db.query(Doctor).all()

@router.get("/{doctor_id}", response_model=DoctorOut)
def read_doctor(doctor_id: int, db: Session = Depends(get_db)):
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return doctor


@router.put("/{doctor_id}", response_model=DoctorOut)
def update_doctor(doctor_id: int, doctor: DoctorCreate, db: Session = Depends(get_db)):
    db_doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not db_doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    # actualización explícita de cada campo:
    db_doctor.first_name = doctor.first_name
    db_doctor.last_name = doctor.last_name
    db_doctor.email = doctor.email
    db_doctor.phone_number = doctor.phone_number
    db_doctor.specialty = doctor.specialty
    db_doctor.location = doctor.location

    db.commit()
    db.refresh(db_doctor)
    return db_doctor

@router.delete("/{doctor_id}")
def delete_doctor(doctor_id: int, db: Session = Depends(get_db)):
    db_doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not db_doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    db.delete(db_doctor)
    db.commit()
    return {"message": "Doctor deleted"}