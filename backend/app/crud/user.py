from sqlalchemy.orm import Session
from app.models import User
from app.schemas.user import UserCreate
from app.core.security import get_password_hash

def get(db: Session, id: int):
    return db.query(User).filter(User.id == id).first()

def get_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def create(db: Session, *, obj_in: UserCreate):
    db_obj = User(
        email=obj_in.email,
        hashed_password=get_password_hash(obj_in.password),
        role=obj_in.role
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj