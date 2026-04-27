from sqlalchemy import create_engine, Column, Integer, String, Text, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Используем абсолютный путь для SQLite базы
DATABASE_URL = "sqlite:////app/cms.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


class ContentBlock(Base):
    """Модель для текстовых блоков контента"""
    __tablename__ = "content_blocks"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(100), unique=True, index=True, nullable=False)
    title = Column(String(500))
    content = Column(Text)
    extra_data = Column(Text)


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
    title = Column(String(200))
    filename = Column(String(200), nullable=False)
    order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)


def init_db():
    """Инициализация БД начальными данными"""
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        initial_content = [
            ContentBlock(
                key="general_info",
                title="Общие сведения",
                content="""<p>Кладбище «Киово» — муниципальное кладбище, расположенное в городском округе Лобня Московской области.</p>
<p>Имеет статус <strong>закрытого для новых захоронений</strong> (допускаются подзахоронения в родственные могилы и урновые захоронения по согласованию).</p>
<p>Территория содержится за счёт муниципального бюджета и средств родственников погребённых. Все работы по установке памятников, благоустройству и уходу регулируются постановлением администрации г.о. Лобня.</p>"""
            ),
            ContentBlock(
                key="location",
                title="Расположение и схема проезда",
                content="",
                extra_data='{"address": "Московская область, г.о. Лобня, д. Киово, северная окраина", "coords": "56.0342° N, 37.4815° E"}'
            ),
            ContentBlock(
                key="infrastructure",
                title="Планировка и инфраструктура",
                content="<p>У каждого входа размещены стенды со схемой расположения рядов и мест.</p>"
            ),
            ContentBlock(
                key="hours",
                title="Часы работы и правила посещения",
                content="",
                extra_data='{"summer": "08:00–20:00", "winter": "09:00–18:00"}'
            ),
            ContentBlock(
                key="contacts",
                title="Контакты администрации",
                content="",
                extra_data='{"org": "МКУ «Ритуальные услуги г.о. Лобня»", "phone": "+7 (499) 322-48-42"}'
            ),
            ContentBlock(
                key="faq",
                title="Часто задаваемые вопросы",
                content="",
                extra_data='{"items": [{"question": "Как найти конкретную могилу?", "answer": "Сообщите в администрацию ФИО погребённого и примерный год захоронения. Сотрудники предоставят номер участка, ряда и места."}, {"question": "Можно ли приехать на машине прямо к участку?", "answer": "Внутренние проезды предназначены только для спецтранспорта и маломобильных граждан по предварительной заявке."}, {"question": "Работает ли вода зимой?", "answer": "Водоснабжение отключается с ноября по апрель во избежание разморозки труб."}]}'
            ),
        ]
        
        for item in initial_content:
            existing = db.query(ContentBlock).filter(ContentBlock.key == item.key).first()
            if not existing:
                db.add(item)
        
        db.commit()
    finally:
        db.close()
