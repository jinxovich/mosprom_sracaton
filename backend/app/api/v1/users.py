from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import crud
from app.schemas.user import UserCreate, User
from app.api.deps import get_db

router = APIRouter()

@router.post("/", response_model=User)
def create_user(
    user_in: UserCreate,
    db: Session = Depends(get_db),
):
    user = crud.user.get_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.user.create(db=db, obj_in=user_in)