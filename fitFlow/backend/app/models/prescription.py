### backend/app/models/prescription.py
from sqlalchemy import Column, Integer, String
from backend.app.database.session import Base

class Prescription(Base):
    __tablename__ = "prescriptions"
    id = Column(Integer, primary_key=True, index=True)
    patient_name = Column(String, nullable=False)
    doctor_name = Column(String, nullable=False)
    details = Column(String, nullable=False)
