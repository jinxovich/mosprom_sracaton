from pydantic_settings import BaseSettings  # ← НОВОЕ! Установи: pip install pydantic-settings

class Settings(BaseSettings):
    SECRET_KEY: str = "super-secret-key-for-dev-only"
    ALGORITHM: str = "HS256"
    DATABASE_URL: str = "sqlite:///./test.db"

settings = Settings()