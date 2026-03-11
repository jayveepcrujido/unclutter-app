from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Unclutter API")

frontend_origins = os.getenv("FRONTEND_URL", "http://localhost:3000")
allow_origins = [origin.strip() for origin in frontend_origins.split(",") if origin.strip()]
if not allow_origins:
    allow_origins = ["http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to Unclutter API"}

from app.auth.router import router as auth_router
from app.subscriptions.router import router as subscriptions_router

app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(subscriptions_router, prefix="/subscriptions", tags=["subscriptions"])
