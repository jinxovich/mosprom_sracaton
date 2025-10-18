# crud/application.py

from sqlalchemy.orm import Session
from app.models import Application
from app.schemas.application import ApplicationCreate
import json

def create(db: Session, *, obj_in: ApplicationCreate, applicant_id: int):
    # Преобразуем resume_data в JSON-строку для БД
    resume_data_json = None
    if obj_in.resume_data is not None:
        resume_data_json = json.dumps(obj_in.resume_data, ensure_ascii=False)

    db_obj = Application(
        vacancy_id=obj_in.vacancy_id,
        internship_id=obj_in.internship_id,
        applicant_id=applicant_id,
        resume_data=resume_data_json,
        # ИСПРАВЛЕНО: Поле в схеме называется resume_file_path
        resume_file_path=obj_in.resume_file_path
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