from sqlalchemy import Column, Integer, String, Enum, Date
from backend.app.database.session import Base
import enum

class UserRole(str, enum.Enum):
    medico = "medico"
    paciente = "paciente"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone_number = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.paciente)

    # Nuevos campos para paciente
    date_of_birth = Column(Date, nullable=True)
    city = Column(String, nullable=True)
    country = Column(String, nullable=True)
    sexual_gender = Column(String, nullable=True)
    insurance = Column(String, nullable=True)
    address = Column(String, nullable=True)  # almacenado para uso futuro