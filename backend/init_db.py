"""
Скрипт для пересоздания базы данных с новыми полями.
Запустите: python backend/init_db.py
"""

import sys
import os

# Добавляем backend в путь
sys.path.append('backend')

from app.core.database import SessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models import User, Vacancy, Internship


# Определяем фактический файл базы данных из настроек SQLAlchemy engine
db_path = os.path.abspath(engine.url.database or "test.db")
if os.path.exists(db_path):
    response = input(f"\nБаза данных {db_path} будет удалена. Продолжить? (yes/no): ")
    if response.lower() != 'yes':
        print("Операция отменена.")
        sys.exit(0)
    os.remove(db_path)
    print(f"✓ База данных {db_path} удалена")

# Дополнительно: пытаемся дропнуть все таблицы (на случай, если файл не был удалён)
try:
    Base.metadata.drop_all(bind=engine)
except Exception:
    pass

# Создаем все таблицы заново
print("\nСоздание новых таблиц...")
Base.metadata.create_all(bind=engine)
print("✓ Таблицы созданы")

# Создаем сессию
db = SessionLocal()

try:
    print("\nСоздание тестовых пользователей...")
    
    # Админ
    admin = User(
        email="admin@technopolis.ru",
        hashed_password=get_password_hash("admin123"),
        role="admin"
    )
    db.add(admin)
    print("✓ Админ: admin@technopolis.ru / admin123")
    
    # HR компаний
    hr1 = User(
        email="hr@techcompany.ru",
        hashed_password=get_password_hash("hr123"),
        role="hr"
    )
    db.add(hr1)
    print("✓ HR: hr@techcompany.ru / hr123")
    
    hr2 = User(
        email="hr@innovate.ru",
        hashed_password=get_password_hash("hr123"),
        role="hr"
    )
    db.add(hr2)
    print("✓ HR: hr@innovate.ru / hr123")
    
    # Представители ВУЗов
    uni1 = User(
        email="msu@university.ru",
        hashed_password=get_password_hash("uni123"),
        role="university"
    )
    db.add(uni1)
    print("✓ ВУЗ: msu@university.ru / uni123")
    
    uni2 = User(
        email="mstu@university.ru",
        hashed_password=get_password_hash("uni123"),
        role="university"
    )
    db.add(uni2)
    print("✓ ВУЗ: mstu@university.ru / uni123")
    
    db.commit()
    
    print("\nСоздание тестовых вакансий с полными данными...")
    
    vacancies = [
        Vacancy(
            title="Backend разработчик Python",
            company_name="ТехноКомпани",
            responsibilities="Разработка высоконагруженных систем, написание чистого кода, участие в code review",
            requirements="Опыт работы с Python/Django от 3 лет, знание PostgreSQL, опыт работы с Docker",
            conditions="Офис в центре Москвы, гибкий график, корпоративное обучение",
            salary_min=150000,
            salary_max=250000,
            salary_currency="RUB",
            work_location="Москва, ОЭЗ Технополис",
            work_schedule="Полный день",
            additional_info="ДМС, компенсация обучения, корпоративные мероприятия",
            owner_id=hr1.id,
            is_published=True
        ),
        Vacancy(
            title="Frontend разработчик React",
            company_name="ТехноКомпани",
            responsibilities="Создание современных веб-интерфейсов, оптимизация производительности",
            requirements="React, TypeScript, опыт от 2 лет",
            conditions="Удаленная работа или офис, гибкий график",
            salary_min=120000,
            salary_max=200000,
            salary_currency="RUB",
            work_location="Москва или удаленно",
            work_schedule="Гибкий график",
            additional_info="Современный стек, дружная команда",
            owner_id=hr1.id,
            is_published=True
        ),
        Vacancy(
            title="DevOps инженер",
            company_name="ИнноватеТех",
            responsibilities="Настройка CI/CD, работа с инфраструктурой",
            requirements="Docker, Kubernetes, опыт от 2 лет",
            conditions="Офис в Технополисе",
            salary_min=180000,
            salary_max=280000,
            salary_currency="RUB",
            work_location="Москва, ОЭЗ Технополис",
            work_schedule="Полный день",
            owner_id=hr2.id,
            is_published=False  # На модерации
        ),
    ]
    
    for v in vacancies:
        db.add(v)
        status = "✓ Опубликовано" if v.is_published else "⏳ На модерации"
        print(f"{status}: {v.title}")
    
    db.commit()
    
    print("\nСоздание тестовых стажировок с полными данными...")

    internships = [
        Internship(
            title="Летняя стажировка для студентов",
            company_name="ТехноКомпани",
            work_location="МИЭТ",
            work_schedule="IT",
            responsibilities="Разработка внутренних инструментов, участие в командных митингах",
            requirements="Знание Python, базовое понимание Git, студент 3+ курса",
            salary_min=30000,
            salary_max=40000,
            salary_currency="RUB",
            owner_id=uni1.id,
            is_published=True
        ),
        Internship(
            title="Стажировка в отделе HR",
            company_name="ИнноватеТех",
            work_location="АЛАБУШЕВО",
            work_schedule="HR",
            responsibilities="Помощь в подборе персонала, организация собеседований",
            requirements="Коммуникабельность, знание Excel, студент гуманитарного направления",
            salary_min=25000,
            salary_max=35000,
            salary_currency="RUB",
            owner_id=uni2.id,
            is_published=True
        ),
        Internship(
            title="Стажировка в микроэлектронике",
            company_name="АНГСТРЕМ",
            work_location="РУДНЕВО",
            work_schedule="Микроэлектроника",
            responsibilities="Участие в лабораторных испытаниях, документирование результатов",
            requirements="Студент технического ВУЗа, знание основ электроники",
            salary_min=40000,
            salary_max=50000,
            salary_currency="RUB",
            owner_id=uni1.id,
            is_published=False  # На модерации
        ),
    ]

    for i in internships:
        db.add(i)
        status = "✓ Опубликовано" if i.is_published else "⏳ На модерации"
        print(f"{status}: {i.title}")
    
    db.commit()
    
    print("\n" + "="*60)
    print("✅ МИГРАЦИЯ УСПЕШНО ЗАВЕРШЕНА!")
    print("="*60)
    print("\n📋 Тестовые учетные записи:")
    print("-" * 60)
    print("Администратор: admin@technopolis.ru / admin123")
    print("HR (Компания 1): hr@techcompany.ru / hr123")
    print("HR (Компания 2): hr@innovate.ru / hr123")
    print("ВУЗ (МГУ): msu@university.ru / uni123")
    print("ВУЗ (МГТУ): mstu@university.ru / uni123")
    print("-" * 60)
    print(f"\n📊 Создано:")
    print(f"   Вакансий: {len(vacancies)}")
    print(f"   Стажировок: {len(internships)}")
    print(f"   На модерации: {sum(1 for v in vacancies if not v.is_published) + sum(1 for i in internships if not i.is_published)}")
    print("\n🚀 База данных готова к использованию!")
    
except Exception as e:
    print(f"\n❌ Ошибка: {e}")
    db.rollback()
    raise
finally:
    db.close()