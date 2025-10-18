from pydantic import BaseModel
from typing import Optional
from datetime import date

class InternshipBase(BaseModel):
    title: str
    university_name: Optional[str] = None
    education_level: Optional[str] = None
    education_directions: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    format: Optional[str] = None
    duration_months: Optional[int] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    payment_conditions: Optional[str] = None
    additional_info: Optional[str] = None

class InternshipCreate(InternshipBase):
    pass

class Internship(InternshipBase):
    id: int
    is_published: bool
    owner_id: int

    class Config:
        from_attributes = True

class InternshipPublic(InternshipBase):
    id: int

    class Config:
        from_attributes = True