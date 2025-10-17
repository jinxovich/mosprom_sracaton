from sqlalchemy.orm import Session
from app.models import Application
from app.schemas.application import ApplicationCreate

def create(db: Session, *, obj_in: ApplicationCreate):
    db_obj = Application(
        vacancy_id=obj_in.vacancy_id,
        internship_id=obj_in.internship_id,
        applicant_id=obj_in.applicant_id
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def get_by_user_and_vacancy(db: Session, *, user_id: int, vacancy_id: int):
    return db.query(Application).filter(
        Application.applicant_id == user_id,
        Application.vacancy_id == vacancy_id
    ).first()

def get_by_user_and_internship(db: Session, *, user_id: int, internship_id: int):
    return db.query(Application).filter(
        Application.applicant_id == user_id,
        Application.internship_id == internship_id
    ).first()