# app/schemas/vacancy.py
from pydantic import BaseModel
from typing import Optional

class VacancyBase(BaseModel):
    title: str
    company_name: Optional[str] = None
    responsibilities: Optional[str] = None
    requirements: Optional[str] = None
    conditions: Optional[str] = None
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    salary_currency: str = "RUB"
    work_location: Optional[str] = None
    work_schedule: Optional[str] = None
    additional_info: Optional[str] = None

class VacancyCreate(VacancyBase):
    pass

class Vacancy(VacancyBase):
    id: int
    is_published: bool
    owner_id: int

    class Config:
        from_attributes = True

class VacancyPublic(VacancyBase):
    id: int

    class Config:
        from_attributes = True