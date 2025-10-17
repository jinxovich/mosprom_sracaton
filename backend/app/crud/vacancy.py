from sqlalchemy.orm import Session
from app.models import Vacancy
from app.schemas.vacancy import VacancyCreate

def get(db: Session, id: int):
    return db.query(Vacancy).filter(Vacancy.id == id).first()

def get_multi(db: Session, *, skip: int = 0, limit: int = 100, is_published: bool = True):
    return db.query(Vacancy).filter(Vacancy.is_published == is_published).offset(skip).limit(limit).all()

def get_unpublished(db: Session):
    return db.query(Vacancy).filter(Vacancy.is_published == False).all()

def create_with_owner(db: Session, *, obj_in: VacancyCreate, owner_id: int):
    db_obj = Vacancy(
        title=obj_in.title,
        description=obj_in.description,
        owner_id=owner_id
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def publish(db: Session, *, vacancy_id: int):
    vacancy = db.query(Vacancy).filter(Vacancy.id == vacancy_id).first()
    if vacancy:
        vacancy.is_published = True
        db.commit()
        db.refresh(vacancy)
    return vacancy