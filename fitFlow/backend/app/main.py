
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fitFlow.backend.app.api.auth import router as auth_router
from fitFlow.backend.app.database.session import engine, Base


app = FastAPI(title="Fit Flow API")

# Create tables
Base.metadata.create_all(bind=engine)

# Routers
app.include_router(auth_router)

# CORS (React on localhost:5173)
app.add_middleware(
  CORSMiddleware,
  allow_origins=["http://localhost:5173"],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)