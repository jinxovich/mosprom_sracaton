from pydantic import BaseModel
from datetime import datetime

class ApplicationBase(BaseModel):
    vacancy_id: int | None = None
    internship_id: int | None = None

class ApplicationCreate(ApplicationBase):
    pass

class Application(ApplicationBase):
    id: int
    applicant_id: int
    created_at: datetime

    class Config:
        from_attributes = True