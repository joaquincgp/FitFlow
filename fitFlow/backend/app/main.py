### backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.api import doctors, clinics, appointments, prescriptions, users
from backend.app.database.session import engine, Base
app = FastAPI()
# Crear las tablas
Base.metadata.create_all(bind=engine)
# Incluir rutas
app.include_router(users.router)
app.include_router(doctors.router)
app.include_router(clinics.router)
app.include_router(appointments.router)
app.include_router(prescriptions.router)

#Middleware
# Allow frontend requests
# allow_origins=["http://localhost:5173"], para vite y tailwind
#allow_origins = ["http://localhost:3000"], para react puro
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)