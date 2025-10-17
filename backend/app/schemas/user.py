from pydantic import BaseModel
from typing import Literal

class UserBase(BaseModel):
    email: str
    role: Literal["admin", "hr", "university"]

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int

    class Config:
        from_attributes = True