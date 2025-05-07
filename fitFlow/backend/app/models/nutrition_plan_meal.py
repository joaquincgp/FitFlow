from sqlalchemy import Column, Integer, ForeignKey, Enum, Float
from sqlalchemy.orm import relationship
from fitFlow.backend.app.database.session import Base
import enum

class MealType(str, enum.Enum):
    Desayuno = "Desayuno"
    Almuerzo = "Almuerzo"
    Cena = "Cena"
    Snack = "Snack"

class NutritionPlanMeal(Base):
    __tablename__ = "nutrition_plan_meals"

    id = Column(Integer, primary_key=True, index=True)
    plan_id = Column(Integer, ForeignKey("nutrition_plans.plan_id"), nullable=False)
    food_id = Column(Integer, ForeignKey("foods.food_id"), nullable=False)

    meal_type = Column(Enum(MealType), nullable=False)
    portion_size = Column(Float, nullable=False)  # número de porciones

    plan = relationship("NutritionPlan", back_populates="meals")
    food = relationship("Food")
