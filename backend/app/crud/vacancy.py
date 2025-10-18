from sqlalchemy.orm import Session
from app.models import Vacancy
from app.schemas.vacancy import VacancyCreate

def get(db: Session, id: int):
    """Получить вакансию по ID"""
    return db.query(Vacancy).filter(Vacancy.id == id).first()

def get_multi(db: Session, *, skip: int = 0, limit: int = 100, is_published: bool = True):
    """Получить список вакансий с фильтрацией по статусу публикации"""
    return db.query(Vacancy).filter(
        Vacancy.is_published == is_published
    ).offset(skip).limit(limit).all()

def get_unpublished(db: Session):
    """Получить все неопубликованные вакансии (для модерации)"""
    return db.query(Vacancy).filter(Vacancy.is_published == False).all()

def get_by_owner(db: Session, owner_id: int):
    """Получить все вакансии конкретного пользователя (HR)"""
    return db.query(Vacancy).filter(Vacancy.owner_id == owner_id).all()

def create_with_owner(db: Session, *, obj_in: VacancyCreate, owner_id: int):
    """Создать новую вакансию с привязкой к владельцу"""
    db_obj = Vacancy(
        # Основная информация
        title=obj_in.title,
        company_name=obj_in.company_name,
        
        # Детальное описание
        responsibilities=obj_in.responsibilities,
        requirements=obj_in.requirements,
        conditions=obj_in.conditions,
        
        # Зарплата
        salary_min=obj_in.salary_min,
        salary_max=obj_in.salary_max,
        salary_currency=obj_in.salary_currency,
        
        # Локация
        work_location=obj_in.work_location,
        
        # Дополнительно
        work_schedule=obj_in.work_schedule,
        additional_info=obj_in.additional_info,
        
        # Системные поля
        owner_id=owner_id,
        is_published=False  # По умолчанию не опубликовано (требует модерации)
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def update(db: Session, *, db_obj: Vacancy, obj_in: VacancyCreate):
    """Обновить существующую вакансию"""
    # Обновляем все поля из VacancyCreate
    db_obj.title = obj_in.title
    db_obj.company_name = obj_in.company_name
    db_obj.responsibilities = obj_in.responsibilities
    db_obj.requirements = obj_in.requirements
    db_obj.conditions = obj_in.conditions
    db_obj.salary_min = obj_in.salary_min
    db_obj.salary_max = obj_in.salary_max
    db_obj.salary_currency = obj_in.salary_currency
    db_obj.work_location = obj_in.work_location
    db_obj.work_schedule = obj_in.work_schedule
    db_obj.additional_info = obj_in.additional_info
    
    db.commit()
    db.refresh(db_obj)
    return db_obj

def publish(db: Session, *, vacancy_id: int):
    """Опубликовать вакансию (для модератора)"""
    vacancy = db.query(Vacancy).filter(Vacancy.id == vacancy_id).first()
    if vacancy:
        vacancy.is_published = True
        db.commit()
        db.refresh(vacancy)
    return vacancy

def unpublish(db: Session, *, vacancy_id: int):
    """Снять вакансию с публикации"""
    vacancy = db.query(Vacancy).filter(Vacancy.id == vacancy_id).first()
    if vacancy:
        vacancy.is_published = False
        db.commit()
        db.refresh(vacancy)
    return vacancy

def delete(db: Session, *, vacancy_id: int):
    """Удалить вакансию"""
    vacancy = db.query(Vacancy).filter(Vacancy.id == vacancy_id).first()
    if vacancy:
        db.delete(vacancy)
        db.commit()
    return vacancy

def search(
    db: Session, 
    *, 
    skip: int = 0, 
    limit: int = 100,
    salary_min: float = None,
    salary_max: float = None,
    work_schedule: str = None,
    location: str = None,
    is_published: bool = True
):
    """
    Поиск вакансий с фильтрацией
    
    Args:
        db: Сессия базы данных
        skip: Количество пропущенных записей (для пагинации)
        limit: Максимальное количество записей
        salary_min: Минимальная зарплата для фильтра
        salary_max: Максимальная зарплата для фильтра
        work_schedule: Фильтр по графику работы
        location: Фильтр по местоположению
        is_published: Фильтр по статусу публикации
    """
    query = db.query(Vacancy).filter(Vacancy.is_published == is_published)
    
    if salary_min:
        query = query.filter(Vacancy.salary_max >= salary_min)
    
    if salary_max:
        query = query.filter(Vacancy.salary_min <= salary_max)
    
    if work_schedule:
        query = query.filter(Vacancy.work_schedule == work_schedule)
    
    if location:
        query = query.filter(Vacancy.work_location.ilike(f"%{location}%"))
    
    return query.offset(skip).limit(limit).all()

def reject_vacancy(db: Session, *, vacancy_id: int, rejection_reason: str):
    vacancy = db.query(Vacancy).filter(Vacancy.id == vacancy_id).first()
    if vacancy:
        vacancy.is_published = False
        vacancy.rejection_reason = rejection_reason
        db.commit()
        db.refresh(vacancy)
    return vacancy

def get_statistics(db: Session):
    """
    Получить статистику по вакансиям
    
    Returns:
        dict: Словарь со статистикой
    """
    total = db.query(Vacancy).count()
    published = db.query(Vacancy).filter(Vacancy.is_published == True).count()
    pending = db.query(Vacancy).filter(Vacancy.is_published == False).count()
    
    # Статистика по графику работы
    schedule_stats = {}
    for schedule in ['Полный день', 'Гибкий график', 'Удаленная работа', 'Сменный график', 'Вахтовый метод']:
        count = db.query(Vacancy).filter(
            Vacancy.work_schedule == schedule,
            Vacancy.is_published == True
        ).count()
        schedule_stats[schedule] = count
    
    # Средняя зарплата
    from sqlalchemy import func
    avg_salary = db.query(
        func.avg(Vacancy.salary_min).label('avg_min'),
        func.avg(Vacancy.salary_max).label('avg_max')
    ).filter(Vacancy.is_published == True).first()
    
    return {
        'total': total,
        'published': published,
        'pending_moderation': pending,
        'by_work_schedule': schedule_stats,
        'average_salary': {
            'min': float(avg_salary.avg_min) if avg_salary.avg_min else 0,
            'max': float(avg_salary.avg_max) if avg_salary.avg_max else 0
        }
    }

def get_by_company(db: Session, company_name: str, is_published: bool = True):
    """Получить все вакансии конкретной компании"""
    return db.query(Vacancy).filter(
        Vacancy.company_name == company_name,
        Vacancy.is_published == is_published
    ).all()

def get_high_salary(db: Session, min_threshold: float = 200000, limit: int = 10):
    """Получить вакансии с высокой зарплатой"""
    return db.query(Vacancy).filter(
        Vacancy.is_published == True,
        Vacancy.salary_max >= min_threshold
    ).order_by(Vacancy.salary_max.desc()).limit(limit).all()

def get_remote_jobs(db: Session, limit: int = 100):
    """Получить все удаленные вакансии"""
    return db.query(Vacancy).filter(
        Vacancy.is_published == True,
        Vacancy.work_schedule.in_(['Удаленная работа', 'Гибкий график'])
    ).limit(limit).all()