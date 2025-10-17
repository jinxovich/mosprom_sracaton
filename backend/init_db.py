"""
Скрипт для инициализации базы данных с тестовыми пользователями и данными
Запустите: python backend/init_db.py
"""

import sys
sys.path.append('backend')

from app.core.database import SessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models import User, Vacancy, Internship

# Создаем все таблицы
print("Создание таблиц...")
Base.metadata.create_all(bind=engine)

# Создаем сессию
db = SessionLocal()

try:
    # Проверяем, есть ли уже пользователи
    existing_users = db.query(User).count()
    if existing_users > 0:
        print(f"База данных уже содержит {existing_users} пользователей.")
        response = input("Очистить БД и создать заново? (yes/no): ")
        if response.lower() != 'yes':
            print("Операция отменена.")
            sys.exit(0)
        
        # Очищаем базу
        print("Очистка базы данных...")
        db.query(User).delete()
        db.query(Vacancy).delete()
        db.query(Internship).delete()
        db.commit()
    
    # Создаем тестовых пользователей
    print("\nСоздание тестовых пользователей...")
    
    # 1. Админ
    admin = User(
        email="admin@technopolis.ru",
        hashed_password=get_password_hash("admin123"),
        role="admin"
    )
    db.add(admin)
    print("✓ Админ: admin@technopolis.ru / admin123")
    
    # 2. HR компании
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
    
    # 3. Представители ВУЗов
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
    
    # Создаем тестовые вакансии
    print("\nСоздание тестовых вакансий...")
    
    vacancies = [
        Vacancy(
            title="Backend разработчик Python",
            description="Разработка высоконагруженных систем на Python/Django. Опыт от 3 лет.",
            owner_id=hr1.id,
            is_published=True
        ),
        Vacancy(
            title="Frontend разработчик React",
            description="Создание современных веб-интерфейсов. Знание React, TypeScript. Опыт от 2 лет.",
            owner_id=hr1.id,
            is_published=True
        ),
        Vacancy(
            title="DevOps инженер",
            description="Настройка CI/CD, работа с Docker, Kubernetes. Опыт от 2 лет.",
            owner_id=hr2.id,
            is_published=False  # На модерации
        ),
        Vacancy(
            title="Data Scientist",
            description="Анализ данных, машинное обучение, Python, TensorFlow. Опыт от 1 года.",
            owner_id=hr2.id,
            is_published=True
        ),
    ]
    
    for v in vacancies:
        db.add(v)
        status = "✓ Опубликовано" if v.is_published else "⏳ На модерации"
        print(f"{status}: {v.title}")
    
    db.commit()
    
    # Создаем тестовые стажировки
    print("\nСоздание тестовых стажировок...")
    
    internships = [
        Internship(
            title="Летняя стажировка для студентов МГУ",
            description="3-месячная стажировка в IT-отделе. Возможность трудоустройства.",
            owner_id=uni1.id,
            is_published=True
        ),
        Internship(
            title="Практика для студентов МГТУ",
            description="Производственная практика на предприятиях ОЭЗ. 2 месяца.",
            owner_id=uni2.id,
            is_published=True
        ),
        Internship(
            title="Научная стажировка",
            description="Участие в исследовательских проектах. Для магистрантов и аспирантов.",
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
    print("✅ База данных успешно инициализирована!")
    print("="*60)
    print("\nТестовые учетные записи:")
    print("-" * 60)
    print("Роль: Администратор")
    print("  Email: admin@technopolis.ru")
    print("  Пароль: admin123")
    print()
    print("Роль: HR (Компания 1)")
    print("  Email: hr@techcompany.ru")
    print("  Пароль: hr123")
    print()
    print("Роль: HR (Компания 2)")
    print("  Email: hr@innovate.ru")
    print("  Пароль: hr123")
    print()
    print("Роль: Представитель ВУЗа (МГУ)")
    print("  Email: msu@university.ru")
    print("  Пароль: uni123")
    print()
    print("Роль: Представитель ВУЗа (МГТУ)")
    print("  Email: mstu@university.ru")
    print("  Пароль: uni123")
    print("-" * 60)
    print(f"\nСоздано вакансий: {len(vacancies)}")
    print(f"Создано стажировок: {len(internships)}")
    print(f"\nНа модерации: {sum(1 for v in vacancies if not v.is_published) + sum(1 for i in internships if not i.is_published)} элементов")
    print("\n🚀 Можно запускать приложение!")
    
except Exception as e:
    print(f"\n❌ Ошибка: {e}")
    db.rollback()
    raise
finally:
    db.close()