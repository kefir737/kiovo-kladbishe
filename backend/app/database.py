from sqlalchemy import create_engine, Column, Integer, String, Text, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "sqlite:///./cms.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


class ContentBlock(Base):
    """Модель для текстовых блоков контента"""
    __tablename__ = "content_blocks"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(100), unique=True, index=True, nullable=False)  # Уникальный ключ блока
    title = Column(String(500))  # Заголовок блока
    content = Column(Text)  # Основной контент (текст)
    extra_data = Column(Text)  # Дополнительные данные (JSON для сложных блоков)


class SiteSettings(Base):
    """Модель для настроек сайта"""
    __tablename__ = "site_settings"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(100), unique=True, index=True, nullable=False)
    value = Column(Text)


class GalleryImage(Base):
    """Модель для изображений галереи"""
    __tablename__ = "gallery_images"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200))  # Описание фото
    filename = Column(String(200), nullable=False)  # Имя файла
    order = Column(Integer, default=0)  # Порядок сортировки
    is_active = Column(Boolean, default=True)  # Активно/не активно


# Создание таблиц
Base.metadata.create_all(bind=engine)
