from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Text
from app.core.database import Base

class Internship(Base):
    __tablename__ = "internships"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    is_published = Column(Boolean, default=False)
    owner_id = Column(Integer, ForeignKey("users.id"))