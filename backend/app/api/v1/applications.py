# app/api/v1/applications.py

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import Optional
import json
import os
import uuid
from app import crud, models
from app.schemas.application import ApplicationCreate, Application
from app.api.deps import get_db
from app.core.security import get_current_user

router = APIRouter()

# Вспомогательная функция для сохранения файла
def save_upload_file(upload_file: UploadFile, folder: str = "uploads/resumes") -> str:
    os.makedirs(folder, exist_ok=True)
    file_ext = os.path.splitext(upload_file.filename)[1]
    if not file_ext:
        file_ext = ".pdf"
    filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(folder, filename)
    with open(file_path, "wb") as f:
        f.write(upload_file.file.read())
    return file_path


@router.post("/vacancy/{vacancy_id}", response_model=Application)
async def apply_to_vacancy(
    vacancy_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
    resume_file: UploadFile = File(None),
    resume_data: str = Form(None),  # JSON-строка из формы
):
    if current_user.role != "applicant":
        raise HTTPException(status_code=403, detail="Only applicant representatives can apply")
    vacancy = crud.vacancy.get(db, id=vacancy_id)
    if not vacancy or not vacancy.is_published:
        raise HTTPException(status_code=404, detail="Vacancy not found or not published")
    if crud.application.get_by_user_and_vacancy(db, user_id=current_user.id, vacancy_id=vacancy_id):
        raise HTTPException(status_code=400, detail="You have already applied to this vacancy")
    if not resume_file and not resume_data:
        raise HTTPException(status_code=400, detail="Either resume file or resume data must be provided")

    file_path = None
    if resume_file:
        file_path = save_upload_file(resume_file)

    # Передаём СТРОКУ напрямую — Pydantic сам распарсит благодаря Json[Dict]
    app_create = ApplicationCreate(
        vacancy_id=vacancy_id,
        resume_file_path=file_path,
        resume_data=resume_data  # ← строка, не dict!
    )
    return crud.application.create(db=db, obj_in=app_create, applicant_id=current_user.id)


@router.post("/internship/{internship_id}", response_model=Application)
async def apply_to_internship(
    internship_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
    resume_file: UploadFile = File(None),
    resume_data: str = Form(None),
):
    if current_user.role != "applicant":
        raise HTTPException(status_code=403, detail="Only applicant representatives can apply")
    internship = crud.internship.get(db, id=internship_id)
    if not internship or not internship.is_published:
        raise HTTPException(status_code=404, detail="Internship not found or not published")
    if crud.application.get_by_user_and_internship(db, user_id=current_user.id, internship_id=internship_id):
        raise HTTPException(status_code=400, detail="You have already applied to this internship")
    if not resume_file and not resume_data:
        raise HTTPException(status_code=400, detail="Either resume file or resume data must be provided")

    file_path = None
    if resume_file:
        file_path = save_upload_file(resume_file)

    app_create = ApplicationCreate(
        internship_id=internship_id,
        resume_file_path=file_path,
        resume_data=resume_data  # ← строка!
    )
    return crud.application.create(db=db, obj_in=app_create, applicant_id=current_user.id)


# HR: получить все отклики на свои вакансии
@router.get("/my-vacancy-applications", response_model=list[Application])
def get_my_vacancy_applications(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.role != "hr":
        raise HTTPException(status_code=403, detail="Only HR can view applications")

    my_vacancies = crud.vacancy.get_by_owner(db, owner_id=current_user.id)
    vacancy_ids = [v.id for v in my_vacancies]
    if not vacancy_ids:
        return []

    return db.query(models.Application).filter(
        models.Application.vacancy_id.in_(vacancy_ids)
    ).all()


# HR: получить все отклики на свои стажировки
@router.get("/my-internship-applications", response_model=list[Application])
def get_my_internship_applications(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.role != "hr":
        raise HTTPException(status_code=403, detail="Only HR can view applications")

    my_internships = crud.internship.get_by_owner(db, owner_id=current_user.id)
    internship_ids = [i.id for i in my_internships]
    if not internship_ids:
        return []

    return db.query(models.Application).filter(
        models.Application.internship_id.in_(internship_ids)
    ).all()


# НОВЫЙ ЭНДПОИНТ: скачивание резюме по имени файла
@router.get("/resume/{filename}")
async def download_resume(
    filename: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.role != "hr":
        raise HTTPException(status_code=403, detail="Only HR can download resumes")

    file_path = os.path.join("uploads", "resumes", filename)
    if not os.path.isfile(file_path):
        raise HTTPException(status_code=404, detail="Resume file not found")

    # Проверка: файл должен быть привязан к вакансии или стажировке этого HR
    application = db.query(models.Application).filter(
        models.Application.resume_file_path == os.path.join("uploads", "resumes", filename)
    ).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    # Проверка вакансии
    if application.vacancy_id:
        vacancy = db.query(models.Vacancy).filter(
            models.Vacancy.id == application.vacancy_id
        ).first()
        if not vacancy or vacancy.owner_id != current_user.id:
            raise HTTPException(status_code=403, detail="You don't own this application")

    # Проверка стажировки
    if application.internship_id:
        internship = db.query(models.Internship).filter(
            models.Internship.id == application.internship_id
        ).first()
        if not internship or internship.owner_id != current_user.id:
            raise HTTPException(status_code=403, detail="You don't own this application")

    return FileResponse(
        file_path,
        media_type='application/octet-stream',
        filename=filename
    )