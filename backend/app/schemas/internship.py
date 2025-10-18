# backend/app/schemas/internship.py
from pydantic import BaseModel, Field
from typing import Optional

class InternshipBase(BaseModel):
    title: str
    company_name: str
    work_location: str
    work_schedule: str
    responsibilities: str
    requirements: str
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    salary_currency: str = "RUB"

class InternshipCreate(InternshipBase):
    pass

class Internship(InternshipBase):
    id: int
    is_published: bool
    rejection_reason: Optional[str] = None  # ← ВАЖНО: это поле должно быть!
    owner_id: int
    
    class Config:
        from_attributes = True

class InternshipPublic(InternshipBase):
    id: int

    class Config:
        from_attributes = True