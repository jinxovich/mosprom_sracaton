from sqlalchemy.orm import Session
from fastapi import Depends
from app.core.database import SessionLocal

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Обёртка для security.py
from app.core.security import get_current_user as _get_current_user
def get_current_user(db: Session = Depends(get_db), token: str = Depends(lambda x: x)):
    # Мы не можем использовать oauth2_scheme здесь напрямую из-за цикла
    # Поэтому переделаем: будем использовать Depends(get_current_user) только в роутах
    pass  # ← мы уберём эту функцию и будем использовать напрямую из security