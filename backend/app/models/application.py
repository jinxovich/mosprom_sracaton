# app/models/application.py

from sqlalchemy import Column, Integer, ForeignKey, DateTime, Text, String
from sqlalchemy.sql import func
from app.core.database import Base

class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    vacancy_id = Column(Integer, ForeignKey("vacancies.id"), nullable=True)
    internship_id = Column(Integer, ForeignKey("internships.id"), nullable=True)
    applicant_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # НОВОЕ:
    resume_file_path = Column(String, nullable=True)  # путь к файлу
    resume_data = Column(Text, nullable=True)         # JSON-строка с анкетой

    created_at = Column(DateTime(timezone=True), server_default=func.now())