from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Text
from app.core.database import Base

class Vacancy(Base):
    __tablename__ = "vacancies"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    is_published = Column(Boolean, default=False)
    owner_id = Column(Integer, ForeignKey("users.id"))