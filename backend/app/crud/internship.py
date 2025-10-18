# crud/internship.py

from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models import Internship
from app.schemas.internship import InternshipCreate

def get(db: Session, id: int):
    """Получить стажировку по ID"""
    return db.query(Internship).filter(Internship.id == id).first()

def get_multi(db: Session, *, skip: int = 0, limit: int = 100, is_published: bool = True):
    """Получить список опубликованных стажировок"""
    return (
        db.query(Internship)
        .filter(Internship.is_published == is_published)
        .offset(skip)
        .limit(limit)
        .all()
    )

def get_unpublished(db: Session):
    """Получить все неопубликованные стажировки (для модерации)"""
    return db.query(Internship).filter(Internship.is_published == False).all()

def get_by_owner(db: Session, owner_id: int):
    """Получить все стажировки пользователя (владельца)"""
    return db.query(Internship).filter(Internship.owner_id == owner_id).all()

def create_with_owner(db: Session, *, obj_in: InternshipCreate, owner_id: int):
    """Создать стажировку от имени владельца (автоматически на модерацию)"""
    db_obj = Internship(
        **obj_in.model_dump(),
        owner_id=owner_id,
        is_published=False
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def update(db: Session, *, db_obj: Internship, obj_in: InternshipCreate):
    """Обновить стажировку"""
    update_data = obj_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def publish(db: Session, *, internship_id: int):
    """Опубликовать стажировку (модератор)"""
    internship = db.query(Internship).filter(Internship.id == internship_id).first()
    if internship:
        internship.is_published = True
        db.commit()
        db.refresh(internship)
    return internship

def unpublish(db: Session, *, internship_id: int):
    """Снять с публикации"""
    internship = db.query(Internship).filter(Internship.id == internship_id).first()
    if internship:
        internship.is_published = False
        db.commit()
        db.refresh(internship)
    return internship

def delete(db: Session, *, internship_id: int):
    """Удалить стажировку"""
    internship = db.query(Internship).filter(Internship.id == internship_id).first()
    if internship:
        db.delete(internship)
        db.commit()
    return internship

def search(
    db: Session,
    *,
    skip: int = 0,
    limit: int = 100,
    work_location: str = None,
    work_schedule: str = None,
    is_published: bool = True
):
    """
    Поиск стажировок по площадке и специальности
    """
    query = db.query(Internship).filter(Internship.is_published == is_published)

    if work_location:
        query = query.filter(Internship.work_location.ilike(f"%{work_location}%"))
    if work_schedule:
        query = query.filter(Internship.work_schedule.ilike(f"%{work_schedule}%"))

    return query.offset(skip).limit(limit).all()

def get_statistics(db: Session):
    """
    Статистика по стажировкам
    """
    total = db.query(Internship).count()
    published = db.query(Internship).filter(Internship.is_published == True).count()
    pending = total - published

    # Статистика по площадкам
    locations = db.query(
        Internship.work_location,
        db.func.count(Internship.id)
    ).filter(Internship.is_published == True).group_by(Internship.work_location).all()

    # Статистика по специальностям
    schedules = db.query(
        Internship.work_schedule,
        db.func.count(Internship.id)
    ).filter(Internship.is_published == True).group_by(Internship.work_schedule).all()

    return {
        'total': total,
        'published': published,
        'pending_moderation': pending,
        'by_work_location': {loc: cnt for loc, cnt in locations},
        'by_work_schedule': {sch: cnt for sch, cnt in schedules}
    }