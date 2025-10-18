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
    # Добавим description для отображения на фронтенде
    @property
    def description(self) -> str:
        """Генерируем описание из имеющихся полей"""
        parts = []
        if self.responsibilities:
            parts.append(f"Обязанности: {self.responsibilities[:100]}...")
        if self.requirements:
            parts.append(f"Требования: {self.requirements[:100]}...")
        return " ".join(parts) if parts else "Описание отсутствует"

    class Config:
        from_attributes = True