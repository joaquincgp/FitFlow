from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from fitFlow.backend.app.database.session import Base

class NutritionPlan(Base):
    __tablename__ = "nutrition_plans"

    plan_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    nutritionist_id = Column(Integer, ForeignKey("nutritionists.nutritionist_id"), nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    meals = relationship("NutritionPlanMeal", back_populates="plan", cascade="all, delete-orphan")
