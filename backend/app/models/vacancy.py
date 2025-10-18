from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Text, Float
from app.core.database import Base
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Text, Float

class Vacancy(Base):
    __tablename__ = "vacancies"

    # Первичный ключ
    id = Column(Integer, primary_key=True, index=True)
    
    # ===== ОСНОВНАЯ ИНФОРМАЦИЯ =====
    title = Column(String, index=True, nullable=False)      # Название вакансии
    company_name = Column(String, nullable=True)            # Название компании
    
    # ===== ДЕТАЛЬНОЕ ОПИСАНИЕ =====
    responsibilities = Column(Text, nullable=True)          # Обязанности
    requirements = Column(Text, nullable=True)              # Требования к кандидату
    conditions = Column(Text, nullable=True)                # Условия работы
    
    # ===== ЗАРАБОТНАЯ ПЛАТА =====
    salary_min = Column(Float, nullable=True)               # Минимальная зарплата
    salary_max = Column(Float, nullable=True)               # Максимальная зарплата
    salary_currency = Column(String, default="RUB")         # Валюта (RUB, USD, EUR)
    
    # ===== ЛОКАЦИЯ И ГРАФИК =====
    work_location = Column(String, nullable=True)           # Место работы (адрес)
    work_schedule = Column(String, nullable=True)           # График работы (Полный день, Гибкий и т.д.)
    
    # ===== ДОПОЛНИТЕЛЬНАЯ ИНФОРМАЦИЯ =====
    additional_info = Column(Text, nullable=True)           # Дополнительная информация (бонусы, ДМС и т.д.)
    
    # ===== СИСТЕМНЫЕ ПОЛЯ =====
    is_published = Column(Boolean, default=False)           # Статус публикации (по умолчанию на модерации)
    owner_id = Column(Integer, ForeignKey("users.id"))      # ID владельца (HR)
    rejection_reason = Column(Text, nullable=True)  # ← НОВОЕ
