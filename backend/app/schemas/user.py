# app/schemas/user.py

from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: str  # Допустимые: 'hr', 'university', 'applicant'

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    role: str
    is_active: bool  # Добавляем для модерации
    rejection_reason: Optional[str] = None  # Добавляем для модерации

    class Config:
        from_attributes = True