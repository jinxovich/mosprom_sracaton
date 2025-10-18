# app/api/v1/moderation.py

from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import Optional
from app import crud, models
from app.schemas.vacancy import Vacancy
from app.schemas.internship import Internship
from app.api.deps import get_db
from app.core.security import get_current_user

router = APIRouter()

@router.get("/vacancies/pending", response_model=list[Vacancy])
def get_pending_vacancies(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admin can moderate")
    return crud.vacancy.get_unpublished(db)

@router.get("/internships/pending", response_model=list[Internship])
def get_pending_internships(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admin can moderate")
    return crud.internship.get_unpublished(db)

@router.patch("/vacancies/{vacancy_id}/publish", response_model=Vacancy)
def publish_vacancy(
    vacancy_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admin can publish")
    vacancy = crud.vacancy.publish(db, vacancy_id=vacancy_id)
    if not vacancy:
        raise HTTPException(status_code=404, detail="Vacancy not found")
    return vacancy

@router.patch("/internships/{internship_id}/publish", response_model=Internship)
def publish_internship(
    internship_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admin can publish")
    internship = crud.internship.publish(db, internship_id=internship_id)
    if not internship:
        raise HTTPException(status_code=404, detail="Internship not found")
    return internship

# НОВЫЕ ЭНДПОИНТЫ: ОТКЛОНЕНИЕ

@router.patch("/vacancies/{vacancy_id}/reject", response_model=Vacancy)
def reject_vacancy(
    vacancy_id: int,
    rejection_reason: str = Body(..., embed=True, min_length=10, max_length=500),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admin can reject")
    vacancy = crud.vacancy.reject_vacancy(
        db, vacancy_id=vacancy_id, rejection_reason=rejection_reason
    )
    if not vacancy:
        raise HTTPException(status_code=404, detail="Vacancy not found")
    return vacancy

@router.patch("/internships/{internship_id}/reject", response_model=Internship)
def reject_internship(
    internship_id: int,
    rejection_reason: str = Body(..., embed=True, min_length=10, max_length=500),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admin can reject")
    internship = crud.internship.reject_internship(
        db, internship_id=internship_id, rejection_reason=rejection_reason
    )
    if not internship:
        raise HTTPException(status_code=404, detail="Internship not found")
    return internship