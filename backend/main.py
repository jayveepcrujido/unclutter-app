from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Unclutter API")

raw_origins = os.getenv("FRONTEND_URL", "http://localhost:3000")
parsed_origins = [origin.strip() for origin in raw_origins.split(",") if origin.strip()]
allow_origins: list[str] = []
wildcard_patterns: list[str] = []

for origin in parsed_origins:
    normalized = origin.rstrip("/") or origin
    if "*" in normalized:
        escaped = normalized.replace(".", r"\.").replace("*", ".*")
        wildcard_patterns.append(escaped)
    else:
        allow_origins.append(normalized)

if not allow_origins:
    allow_origins = ["http://localhost:3000"]

allow_origin_regex = None
if wildcard_patterns:
    allow_origin_regex = f"^(?:{'|'.join(wildcard_patterns)})$"

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_origin_regex=allow_origin_regex,
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
