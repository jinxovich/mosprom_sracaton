# main.py

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles  # ← НОВОЕ
from starlette.middleware.cors import CORSMiddleware
from app.api.v1 import auth, users, vacancies, internships, applications, moderation
from app.core.database import engine, Base

# Создаём таблицы
Base.metadata.create_all(bind=engine)

# Инициализируем приложение
app = FastAPI(title="MosProm ОЭЗ Backend")

# 🔥 Монтируем папку uploads как статику
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# CORS
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Роутеры
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
app.include_router(vacancies.router, prefix="/api/v1/vacancies", tags=["vacancies"])
app.include_router(internships.router, prefix="/api/v1/internships", tags=["internships"])
app.include_router(applications.router, prefix="/api/v1/applications", tags=["applications"])
app.include_router(moderation.router, prefix="/api/v1/moderation", tags=["moderation"])

@app.get("/")
def read_root():
    return {
        "message": "MosProm ОЭЗ Backend is running!",
        "docs": "/docs",
        "redoc": "/redoc"
    }