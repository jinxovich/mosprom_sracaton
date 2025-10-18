from sqlalchemy.orm import Session
from app.models import Internship
from app.schemas.internship import InternshipCreate

def get(db: Session, id: int):
    """Получить стажировку по ID"""
    return db.query(Internship).filter(Internship.id == id).first()

def get_multi(db: Session, *, skip: int = 0, limit: int = 100, is_published: bool = True):
    """Получить список стажировок с фильтрацией по статусу публикации"""
    return db.query(Internship).filter(
        Internship.is_published == is_published
    ).offset(skip).limit(limit).all()

def get_unpublished(db: Session):
    """Получить все неопубликованные стажировки (для модерации)"""
    return db.query(Internship).filter(Internship.is_published == False).all()

def get_by_owner(db: Session, owner_id: int):
    """Получить все стажировки конкретного пользователя (ВУЗа)"""
    return db.query(Internship).filter(Internship.owner_id == owner_id).all()

def create_with_owner(db: Session, *, obj_in: InternshipCreate, owner_id: int):
    """Создать новую стажировку с привязкой к владельцу"""
    db_obj = Internship(
        # Основная информация
        title=obj_in.title,
        university_name=obj_in.university_name,
        
        # Образование
        education_level=obj_in.education_level,
        education_directions=obj_in.education_directions,
        
        # Детали стажировки
        description=obj_in.description,
        location=obj_in.location,
        format=obj_in.format,
        
        # Сроки
        duration_months=obj_in.duration_months,
        start_date=obj_in.start_date,
        end_date=obj_in.end_date,
        
        # Условия
        payment_conditions=obj_in.payment_conditions,
        additional_info=obj_in.additional_info,
        
        # Системные поля
        owner_id=owner_id,
        is_published=False  # По умолчанию не опубликовано (требует модерации)
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def update(db: Session, *, db_obj: Internship, obj_in: InternshipCreate):
    """Обновить существующую стажировку"""
    # Обновляем все поля из InternshipCreate
    db_obj.title = obj_in.title
    db_obj.university_name = obj_in.university_name
    db_obj.education_level = obj_in.education_level
    db_obj.education_directions = obj_in.education_directions
    db_obj.description = obj_in.description
    db_obj.location = obj_in.location
    db_obj.format = obj_in.format
    db_obj.duration_months = obj_in.duration_months
    db_obj.start_date = obj_in.start_date
    db_obj.end_date = obj_in.end_date
    db_obj.payment_conditions = obj_in.payment_conditions
    db_obj.additional_info = obj_in.additional_info
    
    db.commit()
    db.refresh(db_obj)
    return db_obj

def publish(db: Session, *, internship_id: int):
    """Опубликовать стажировку (для модератора)"""
    internship = db.query(Internship).filter(Internship.id == internship_id).first()
    if internship:
        internship.is_published = True
        db.commit()
        db.refresh(internship)
    return internship

def unpublish(db: Session, *, internship_id: int):
    """Снять стажировку с публикации"""
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
    education_level: str = None,
    location: str = None,
    format: str = None,
    is_published: bool = True
):
    """
    Поиск стажировок с фильтрацией
    
    Args:
        db: Сессия базы данных
        skip: Количество пропущенных записей (для пагинации)
        limit: Максимальное количество записей
        education_level: Фильтр по уровню образования
        location: Фильтр по местоположению
        format: Фильтр по формату (очная, дистанционная, гибридная)
        is_published: Фильтр по статусу публикации
    """
    query = db.query(Internship).filter(Internship.is_published == is_published)
    
    if education_level:
        query = query.filter(Internship.education_level == education_level)
    
    if location:
        query = query.filter(Internship.location.ilike(f"%{location}%"))
    
    if format:
        query = query.filter(Internship.format == format)
    
    return query.offset(skip).limit(limit).all()

def get_statistics(db: Session):
    """
    Получить статистику по стажировкам
    
    Returns:
        dict: Словарь со статистикой
    """
    total = db.query(Internship).count()
    published = db.query(Internship).filter(Internship.is_published == True).count()
    pending = db.query(Internship).filter(Internship.is_published == False).count()
    
    # Статистика по уровням образования
    education_stats = {}
    for level in ['Бакалавриат', 'Магистратура', 'Аспирантура', 'Специалитет']:
        count = db.query(Internship).filter(
            Internship.education_level == level,
            Internship.is_published == True
        ).count()
        education_stats[level] = count
    
    # Статистика по форматам
    format_stats = {}
    for format_type in ['Очная', 'Дистанционная', 'Гибридная']:
        count = db.query(Internship).filter(
            Internship.format == format_type,
            Internship.is_published == True
        ).count()
        format_stats[format_type] = count
    
    return {
        'total': total,
        'published': published,
        'pending_moderation': pending,
        'by_education_level': education_stats,
        'by_format': format_stats
    }