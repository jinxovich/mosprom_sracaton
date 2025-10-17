from sqlalchemy.orm import Session
from app.models import Internship
from app.schemas.internship import InternshipCreate

def get(db: Session, id: int):
    return db.query(Internship).filter(Internship.id == id).first()

def get_multi(db: Session, *, skip: int = 0, limit: int = 100, is_published: bool = True):
    return db.query(Internship).filter(Internship.is_published == is_published).offset(skip).limit(limit).all()

def get_unpublished(db: Session):
    return db.query(Internship).filter(Internship.is_published == False).all()

def create_with_owner(db: Session, *, obj_in: InternshipCreate, owner_id: int):
    db_obj = Internship(
        title=obj_in.title,
        description=obj_in.description,
        owner_id=owner_id
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def publish(db: Session, *, internship_id: int):
    internship = db.query(Internship).filter(Internship.id == internship_id).first()
    if internship:
        internship.is_published = True
        db.commit()
        db.refresh(internship)
    return internship