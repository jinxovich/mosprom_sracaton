# app/api/v1/moderation.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from app import crud, models
from app.schemas.vacancy import Vacancy
from app.schemas.internship import Internship
from app.schemas.user import UserResponse  # Импортируем
from app.api.deps import get_db
from app.core.security import get_current_user

router = APIRouter()

class RejectionRequest(BaseModel):
    rejection_reason: str = Field(..., min_length=10, max_length=500)

# --- Пользователи ---

@router.get("/users/pending", response_model=list[UserResponse])
def get_pending_users(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admin can moderate")
    return crud.user.get_pending(db)  # Нужно добавить в crud.user: db.query(User).filter(User.role.in_(["hr", "university"]), User.is_active==False, User.rejection_reason==None).all()

@router.patch("/users/{user_id}/publish", response_model=UserResponse)
def publish_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admin can publish")
    user = crud.user.approve(db, user_id=user_id)  # Добавьте в crud: user = get(db, user_id), user.is_active=True, commit, return user
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.patch("/users/{user_id}/reject", response_model=UserResponse)
def reject_user(
    user_id: int,
    body: RejectionRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admin can reject")
    user = crud.user.reject(db, user_id=user_id, rejection_reason=body.rejection_reason)  # Добавьте в crud: user = get, user.rejection_reason=reason, commit, return user
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# --- Стажировки ---

@router.get("/internships/pending", response_model=list[Internship])
def get_pending_internships(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admin can moderate")
    return crud.internship.get_unpublished(db)

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

@router.patch("/internships/{internship_id}/reject", response_model=Internship)
def reject_internship(
    internship_id: int,
    body: RejectionRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admin can reject")
    internship = crud.internship.reject_internship(
        db, internship_id=internship_id, rejection_reason=body.rejection_reason
    )
    if not internship:
        raise HTTPException(status_code=404, detail="Internship not found")
    return internship