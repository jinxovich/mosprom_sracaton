from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from app import crud, models
from app.schemas.vacancy import VacancyCreate, Vacancy, VacancyPublic
from app.api.deps import get_db
from app.core.security import get_current_user

router = APIRouter()

@router.get("/", response_model=list[VacancyPublic])
@router.get("", response_model=list[VacancyPublic])
def read_vacancies(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    salary_min: Optional[float] = Query(None, description="Минимальная зарплата"),
    salary_max: Optional[float] = Query(None, description="Максимальная зарплата"),
    work_schedule: Optional[str] = Query(None, description="График работы"),
    location: Optional[str] = Query(None, description="Местоположение"),
):
    """
    Получить список опубликованных вакансий с возможностью фильтрации
    """
    if any([salary_min, salary_max, work_schedule, location]):
        # Используем поиск с фильтрами
        return crud.vacancy.search(
            db, 
            skip=skip, 
            limit=limit,
            salary_min=salary_min,
            salary_max=salary_max,
            work_schedule=work_schedule,
            location=location,
            is_published=True
        )
    else:
        # Получаем все опубликованные вакансии
        return crud.vacancy.get_multi(db, skip=skip, limit=limit, is_published=True)

@router.get("/statistics")
def get_vacancy_statistics(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Получить статистику по вакансиям (только для администраторов)
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can view statistics")
    
    return crud.vacancy.get_statistics(db)

@router.get("/my", response_model=list[Vacancy])
def read_my_vacancies(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Получить все вакансии текущего пользователя (HR)
    """
    if current_user.role != "hr":
        raise HTTPException(status_code=403, detail="Only HR can view their vacancies")
    
    return crud.vacancy.get_by_owner(db, owner_id=current_user.id)

@router.get("/remote", response_model=list[VacancyPublic])
def read_remote_vacancies(
    db: Session = Depends(get_db),
    limit: int = 100,
):
    """
    Получить все удаленные вакансии
    """
    return crud.vacancy.get_remote_jobs(db, limit=limit)

@router.get("/high-salary", response_model=list[VacancyPublic])
def read_high_salary_vacancies(
    db: Session = Depends(get_db),
    min_threshold: float = Query(200000, description="Минимальный порог зарплаты"),
    limit: int = 10,
):
    """
    Получить вакансии с высокой зарплатой
    """
    return crud.vacancy.get_high_salary(db, min_threshold=min_threshold, limit=limit)

@router.get("/{vacancy_id}", response_model=VacancyPublic)
def read_vacancy(
    vacancy_id: int,
    db: Session = Depends(get_db),
):
    """
    Получить детальную информацию о вакансии по ID
    """
    vacancy = crud.vacancy.get(db, id=vacancy_id)
    if not vacancy:
        raise HTTPException(status_code=404, detail="Vacancy not found")
    if not vacancy.is_published:
        raise HTTPException(status_code=404, detail="Vacancy not published")
    return vacancy

@router.post("/", response_model=Vacancy)
def create_vacancy(
    vacancy_in: VacancyCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Создать новую вакансию (только для HR)
    """
    if current_user.role != "hr":
        raise HTTPException(status_code=403, detail="Only HR can create vacancies")
    
    return crud.vacancy.create_with_owner(db=db, obj_in=vacancy_in, owner_id=current_user.id)

@router.put("/{vacancy_id}", response_model=Vacancy)
def update_vacancy(
    vacancy_id: int,
    vacancy_in: VacancyCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Обновить существующую вакансию (только владелец)
    """
    vacancy = crud.vacancy.get(db, id=vacancy_id)
    if not vacancy:
        raise HTTPException(status_code=404, detail="Vacancy not found")
    
    if vacancy.owner_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    return crud.vacancy.update(db=db, db_obj=vacancy, obj_in=vacancy_in)

@router.delete("/{vacancy_id}")
def delete_vacancy(
    vacancy_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Удалить вакансию (только владелец или администратор)
    """
    vacancy = crud.vacancy.get(db, id=vacancy_id)
    if not vacancy:
        raise HTTPException(status_code=404, detail="Vacancy not found")
    
    if vacancy.owner_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    crud.vacancy.delete(db=db, vacancy_id=vacancy_id)
    return {"message": "Vacancy deleted successfully"}