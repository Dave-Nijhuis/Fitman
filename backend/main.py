from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from database import SessionLocal
from seed import seed_exercises
from routers import auth as auth_router
from routers import exercises as exercises_router
from routers import sessions as sessions_router

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    db = SessionLocal()
    try:
        seed_exercises(db)
    finally:
        db.close()
    yield


app = FastAPI(title="Fitman API", lifespan=lifespan)

origins = [o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router.router)
app.include_router(exercises_router.router)
app.include_router(sessions_router.router)


@app.get("/health")
def health():
    return {"status": "ok"}
