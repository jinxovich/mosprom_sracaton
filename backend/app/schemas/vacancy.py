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

    try:
        from pydantic import computed_field
    except ImportError:
        computed_field = None  # для совместимости, если вдруг pydantic v1

    if computed_field:
        @computed_field(return_type=str)
        def description(self) -> str:
            parts = []
            if self.responsibilities:
                parts.append(f"Обязанности: {self.responsibilities[:100]}...")
            if self.requirements:
                parts.append(f"Требования: {self.requirements[:100]}...")
            return " ".join(parts) if parts else "Описание отсутствует"
    else:
        # Fallback: поле не будет сериализовано автоматически на pydantic v1
        # фронт может использовать responsibilities/requirements напрямую
        pass

    class Config:
        from_attributes = True