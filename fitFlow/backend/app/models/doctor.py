from sqlalchemy import Column, Integer, String
from backend.app.database.session import Base

class Doctor(Base):
    __tablename__ = "doctors"
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone_number = Column(String, nullable=False)
    specialty = Column(String, nullable=False)
    location = Column(String, nullable=False)