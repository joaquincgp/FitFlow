from sqlalchemy import Column, Integer, Float, Enum, ForeignKey
from sqlalchemy.orm import relationship
from fitFlow.backend.app.database.session import Base
from datetime import date
import enum

class ActivityLevel(enum.Enum):
    Sedentario = "Sedentario"
    Ligero = "Ligero"
    Moderado = "Moderado"
    Intenso = "Intenso"
    Extremo = "Extremo"

class Client(Base):
    __tablename__ = "clients"

    client_id = Column(Integer, ForeignKey("users.user_id"), primary_key=True)
    height_cm = Column(Float, nullable=False)
    weight_current_kg = Column(Float, nullable=False)
    weight_goal_kg = Column(Float, nullable=False)
    activity_level = Column(Enum(ActivityLevel), nullable=False)

    user = relationship("User", back_populates="client")

    def calculate_age(self):
        today = date.today()
        return today.year - self.user.birth_date.year - ((today.month, today.day) < (self.user.birth_date.month, self.user.birth_date.day))

    def calculate_metabolismo_basal(self):
        age = self.calculate_age()
        if self.user.sex == "Masculino":
            return 10 * self.weight_current_kg + 6.25 * self.height_cm - 5 * age + 5
        return 10 * self.weight_current_kg + 6.25 * self.height_cm - 5 * age - 161

    def calculate_GET(self):
        factor_map = {
            ActivityLevel.Sedentario: 1.2,
            ActivityLevel.Ligero: 1.375,
            ActivityLevel.Moderado: 1.55,
            ActivityLevel.Intenso: 1.725,
            ActivityLevel.Extremo: 1.9,
        }
        return self.calculate_metabolismo_basal() * factor_map[self.activity_level]

    def calculate_RCDE(self, goal):
        get = self.calculate_GET()
        if goal == "Bajar_Peso":
            return get - 500
        if goal == "Mantener_Peso":
            return get
        return get + 300
