from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import crud, models
from app.schemas.vacancy import VacancyCreate, Vacancy, VacancyPublic
from app.api.deps import get_db
from app.core.security import get_current_user

router = APIRouter()

@router.get("/", response_model=list[VacancyPublic])
def read_vacancies(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
):
    return crud.vacancy.get_multi(db, skip=skip, limit=limit, is_published=True)

@router.post("/", response_model=Vacancy)
def create_vacancy(
    vacancy_in: VacancyCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.role != "hr":
        raise HTTPException(status_code=403, detail="Only HR can create vacancies")
    return crud.vacancy.create_with_owner(db=db, obj_in=vacancy_in, owner_id=current_user.id)