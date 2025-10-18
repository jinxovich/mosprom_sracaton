# models/internship.py

from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Text, Float
from app.core.database import Base

class Internship(Base):
    __tablename__ = "internships"

    id = Column(Integer, primary_key=True, index=True)
    
    # Поля из формы CreateInternshipPage.jsx
    title = Column(String, nullable=False, index=True)
    company_name = Column(String, nullable=False)
    work_location = Column(String, nullable=False)      # Площадка: АЛАБУШЕВО, МИЭТ и т.д.
    work_schedule = Column(String, nullable=False)      # Специальность: IT, HR, Микроэлектроника и т.д.
    responsibilities = Column(Text, nullable=False)
    requirements = Column(Text, nullable=False)
    salary_min = Column(Float, nullable=True)
    salary_max = Column(Float, nullable=True)
    salary_currency = Column(String, default="RUB", nullable=False)

    # Системные поля
    is_published = Column(Boolean, default=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)