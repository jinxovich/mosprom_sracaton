# app/api/v1/users.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import crud
from app.schemas.user import UserCreate, UserResponse
from app.api.deps import get_db
from app.core.security import get_password_hash

router = APIRouter()

@router.post("/", response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = crud.user.get_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    if user.role not in ["hr", "university", "applicant"]:
        raise HTTPException(status_code=400, detail="Invalid role")
    
    hashed_pw = get_password_hash(user.password)
    
    return crud.user.create(db=db, obj_in=user)