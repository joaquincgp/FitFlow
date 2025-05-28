import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))


from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fitFlow.backend.app.api.auth import router as auth_router
from fitFlow.backend.app.api.register import router as register_router
from fitFlow.backend.app.database.session import engine, Base
from fitFlow.backend.app.api.foods import router as foods_router
from fitFlow.backend.app.api.food_logs import router as food_logs_router
from fitFlow.backend.app.api.nutrition_plans import router as nutrition_plans_router
from fitFlow.backend.app.api import dashboard
app = FastAPI(title="Fit Flow API")

# Crear tablas
Base.metadata.create_all(bind=engine)

# Routers
app.include_router(auth_router)
app.include_router(register_router)
app.include_router(foods_router)
app.include_router(food_logs_router)
app.include_router(nutrition_plans_router)
app.include_router(dashboard.router)



# CORS
app.add_middleware(
  CORSMiddleware,
  allow_origins=["http://localhost:5173", "https://fitflow-qnm4.onrender.com"],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],

)
