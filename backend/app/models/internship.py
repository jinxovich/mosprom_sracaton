from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Text, Date
from app.core.database import Base

class Internship(Base):
    __tablename__ = "internships"

    # Первичный ключ
    id = Column(Integer, primary_key=True, index=True)
    
    # ===== ОСНОВНАЯ ИНФОРМАЦИЯ =====
    title = Column(String, index=True, nullable=False)  # Название стажировки
    university_name = Column(String, nullable=True)     # Название университета
    
    # ===== ОБРАЗОВАНИЕ =====
    education_level = Column(String, nullable=True)         # Уровень образования (Бакалавриат, Магистратура и т.д.)
    education_directions = Column(Text, nullable=True)      # Направления подготовки
    
    # ===== ДЕТАЛИ СТАЖИРОВКИ =====
    description = Column(Text, nullable=True)               # Описание стажировки
    location = Column(String, nullable=True)                # Место проведения (адрес)
    format = Column(String, nullable=True)                  # Формат (Очная, Дистанционная, Гибридная)
    
    # ===== СРОКИ ПРОВЕДЕНИЯ =====
    duration_months = Column(Integer, nullable=True)        # Длительность в месяцах
    start_date = Column(Date, nullable=True)                # Дата начала
    end_date = Column(Date, nullable=True)                  # Дата окончания
    
    # ===== УСЛОВИЯ =====
    payment_conditions = Column(Text, nullable=True)        # Условия оплаты/стипендия
    additional_info = Column(Text, nullable=True)           # Дополнительная информация
    
    # ===== СИСТЕМНЫЕ ПОЛЯ =====
    is_published = Column(Boolean, default=False)           # Статус публикации (по умолчанию на модерации)
    owner_id = Column(Integer, ForeignKey("users.id"))      # ID владельца (представителя ВУЗа)