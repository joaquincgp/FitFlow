from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from fitFlow.backend.app.database.session import Base

class Nutritionist(Base):
    __tablename__ = "nutritionists"

    nutritionist_id = Column(Integer, ForeignKey("users.user_id"), primary_key=True)
    certification_number = Column(String(50), nullable=False)
    specialty = Column(String(50), nullable=True)

    user = relationship("User", back_populates="nutritionist")
