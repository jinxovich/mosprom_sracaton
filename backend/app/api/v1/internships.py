# backend/app/api/v1/internships.py

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app import crud, models
from app.schemas.internship import InternshipCreate, Internship, InternshipPublic
from app.api.deps import get_db
from app.core.security import get_current_user

router = APIRouter()

@router.get("/", response_model=list[InternshipPublic])
@router.get("", response_model=list[InternshipPublic])  # ← поддержка без завершающего слеша
def read_internships(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
):
    return crud.internship.get_multi(db, skip=skip, limit=limit, is_published=True)

@router.get("/my", response_model=list[Internship])
def read_my_internships(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
    include_rejected: bool = Query(False, description="Включить отклонённые стажировки")
):
    """
    Получить все стажировки текущего пользователя (университет)
    """
    if current_user.role != "university":
        raise HTTPException(status_code=403, detail="Only universities can view their internships")
    
    return crud.internship.get_by_owner(db, owner_id=current_user.id, include_rejected=include_rejected)

@router.post("/", response_model=Internship)
def create_internship(
    internship_in: InternshipCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.role != "university":
        raise HTTPException(status_code=403, detail="Only universities can create internships")
    return crud.internship.create_with_owner(db=db, obj_in=internship_in, owner_id=current_user.id)