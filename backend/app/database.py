from sqlalchemy import create_engine, Column, Integer, String, Text, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# MySQL connection string
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "mysql+pymysql://root:kiovo2024@db:3306/kiovo_cms?charset=utf8mb4"
)

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
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


class AdminUser(Base):
    """Модель для администратора"""
    __tablename__ = "admin_users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(200), nullable=False)
    is_active = Column(Boolean, default=True)


class SiteSettings(Base):
    """Модель для настроек сайта (SEO, favicon)"""
    __tablename__ = "site_settings"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(100), unique=True, index=True, nullable=False)
    value = Column(Text)


def init_db():
    """Инициализация БД начальными данными"""
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Создаём администратора по умолчанию (admin/admin123)
        from passlib.context import CryptContext
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        
        admin = db.query(AdminUser).filter(AdminUser.username == "admin").first()
        if not admin:
            admin = AdminUser(
                username="admin",
                hashed_password=pwd_context.hash("admin123"),
                is_active=True
            )
            db.add(admin)
            print("Created default admin user: admin / admin123")
        
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
                extra_data='{"address": "Московская область, г.о. Лобня, д. Киово, северная окраина", "coords": "56.0342° N, 37.4815° E", "car": "<p>От МКАД по Дмитровскому шоссе → съезд на Лобню → далее по ул. Ленина до перекрёстка с указателем на д. Киово → по главной дороге деревни до шлагбаума кладбища.</p>", "transport": "<p>От ж/д станции <strong>«Лобня»</strong> (Савёловское направление МЦД-1) автобусом № 22 или маршрутным такси № 22к до остановки «Деревня Киово». Далее пешком ~800 м.</p>"}'
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
                extra_data='{"summer": "08:00–20:00", "winter": "09:00–18:00", "rules": "<p><strong>Вход свободный.</strong> Захоронения и подзахоронения — только по предварительному разрешению.</p><ul><li>Запрещается разводить костры, оставлять стеклянную тару</li><li>Транспорт допускается только по пропускам</li><li>Уход за могилами осуществляется родственниками или по договору</li></ul>"}'
            ),
            ContentBlock(
                key="contacts",
                title="Контакты администрации",
                content="",
                extra_data='{"org": "МКУ «Ритуальные услуги г.о. Лобня»", "phone": "+7 (499) 322-48-42", "address": "Кабинет администрации у центрального входа, здание с вывеской «Ритуальные услуги»", "weekday": "09:00–17:00", "saturday": "10:00–14:00", "sunday": "Выходной"}'
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
            else:
                # Обновляем пустые поля
                if not existing.title and item.title:
                    existing.title = item.title
                if not existing.content and item.content:
                    existing.content = item.content
                if not existing.extra_data and item.extra_data:
                    existing.extra_data = item.extra_data
        
        db.commit()
    finally:
        db.close()
