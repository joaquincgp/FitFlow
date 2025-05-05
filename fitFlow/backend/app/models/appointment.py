from sqlalchemy import Column, Integer, String, DateTime
from backend.app.database.session import Base

class Appointment(Base):
    __tablename__ = "appointments"
    id = Column(Integer, primary_key=True, index=True)
    patient_name = Column(String, nullable=False)
    doctor_name = Column(String, nullable=False)
    datetime = Column(DateTime, nullable=False)
    mode = Column(String, nullable=False)  # presencial o videollamada