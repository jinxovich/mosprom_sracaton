from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import crud, models
from app.schemas.application import ApplicationCreate, Application
from app.api.deps import get_db
from app.core.security import get_current_user

router = APIRouter()

@router.post("/vacancy/{vacancy_id}", response_model=Application)
def apply_to_vacancy(
    vacancy_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.role != "university":
        raise HTTPException(status_code=403, detail="Only university reps can apply")
    vacancy = crud.vacancy.get(db, id=vacancy_id)
    if not vacancy or not vacancy.is_published:
        raise HTTPException(status_code=404, detail="Vacancy not found")
    if crud.application.get_by_user_and_vacancy(db, user_id=current_user.id, vacancy_id=vacancy_id):
        raise HTTPException(status_code=400, detail="Already applied")
    return crud.application.create(
        db=db,
        obj_in=ApplicationCreate(vacancy_id=vacancy_id, applicant_id=current_user.id)
    )

@router.post("/internship/{internship_id}", response_model=Application)
def apply_to_internship(
    internship_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.role != "university":
        raise HTTPException(status_code=403, detail="Only university reps can apply")
    internship = crud.internship.get(db, id=internship_id)
    if not internship or not internship.is_published:
        raise HTTPException(status_code=404, detail="Internship not found")
    if crud.application.get_by_user_and_internship(db, user_id=current_user.id, internship_id=internship_id):
        raise HTTPException(status_code=400, detail="Already applied")
    return crud.application.create(
        db=db,
        obj_in=ApplicationCreate(internship_id=internship_id, applicant_id=current_user.id)
    )