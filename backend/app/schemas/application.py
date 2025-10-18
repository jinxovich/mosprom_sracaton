from pydantic import BaseModel, Json, field_validator
from typing import Optional, Dict, Any
from datetime import datetime
import json

class ApplicationBase(BaseModel):
    vacancy_id: Optional[int] = None
    internship_id: Optional[int] = None

class ApplicationCreate(ApplicationBase):
    resume_file_path: Optional[str] = None
    resume_data: Optional[Json[Dict]] = None

class Application(ApplicationBase):
    id: int
    applicant_id: int
    resume_file_path: Optional[str] = None
    resume_data: Optional[Dict[str, Any]] = None  # ← теперь dict
    created_at: datetime

    @field_validator('resume_data', mode='before')
    @classmethod
    def parse_resume_data(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except (json.JSONDecodeError, TypeError):
                return None
        return v

    class Config:
        from_attributes = True