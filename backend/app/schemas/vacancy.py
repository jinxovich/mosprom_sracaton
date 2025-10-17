from pydantic import BaseModel
from typing import Optional

class VacancyBase(BaseModel):
    title: str
    description: str

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