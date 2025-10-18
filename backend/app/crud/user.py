# app/crud/user.py

from sqlalchemy.orm import Session
from app.models import User
from app.schemas.user import UserCreate
from app.core.security import get_password_hash

def get(db: Session, id: int):
    return db.query(User).filter(User.id == id).first()

def get_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def create(db: Session, *, obj_in: UserCreate, hashed_password: str = None):
    is_active = obj_in.role == "applicant"  # is_active=True только для applicant
    db_obj = User(
        email=obj_in.email,
        hashed_password=hashed_password or get_password_hash(obj_in.password),
        role=obj_in.role,
        is_active=is_active
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def get_pending(db: Session):
    return db.query(User).filter(
        User.role.in_(["hr", "university"]),
        User.is_active == False,
        User.rejection_reason == None
    ).all()

def approve(db: Session, user_id: int):
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        user.is_active = True
        db.commit()
        db.refresh(user)
    return user

def reject(db: Session, user_id: int, rejection_reason: str):
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        user.rejection_reason = rejection_reason
        # is_active остаётся False
        db.commit()
        db.refresh(user)
    return user