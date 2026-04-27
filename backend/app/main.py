from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, JSONResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import json
import os
import shutil
from pathlib import Path
from datetime import timedelta

from app.database import SessionLocal, engine, ContentBlock, SiteSettings, GalleryImage, AdminUser, init_db
from app.schemas import (
    ContentBlockCreate, ContentBlockUpdate, ContentBlockResponse,
    GalleryImageResponse, AllContentResponse
)
from app.auth import (
    verify_password, get_password_hash, create_access_token,
    get_current_user, ACCESS_TOKEN_EXPIRE_MINUTES, security
)

app = FastAPI(title="Kiovo Cemetery CMS")

# Инициализация БД при старте
init_db()

# Создаём директорию для загрузок
UPLOAD_DIR = Path("/app/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Монтируем статику для загруженных файлов
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")


# Dependency для получения сессии БД
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ============== API Аутентификация ==============

@app.post("/api/login")
def login(username: str = Form(...), password: str = Form(...), db: Session = Depends(get_db)):
    """Вход для администратора"""
    user = db.query(AdminUser).filter(AdminUser.username == username).first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Неверное имя пользователя или пароль")
    
    access_token = create_access_token(
        data={"sub": user.username},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer"}


@app.post("/api/change-password")
def change_password(
    old_password: str = Form(...),
    new_password: str = Form(...),
    current_user: AdminUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Смена пароля"""
    if not verify_password(old_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Неверный текущий пароль")
    
    current_user.hashed_password = get_password_hash(new_password)
    db.commit()
    return {"message": "Пароль изменён"}


# ============== API для контента ==============

@app.get("/api/content", response_model=AllContentResponse, response_model_exclude_none=True)
def get_all_content(db: Session = Depends(get_db)):
    """Получить весь контент для фронтенда"""
    content = {}

    # Получаем текстовые блоки
    blocks = db.query(ContentBlock).all()
    for block in blocks:
        # Возвращаем и {key}, и {key}_content для совместимости
        content[block.key] = block.content
        content[f"{block.key}_content"] = block.content
        if block.title:
            content[f"{block.key}_title"] = block.title
        if block.extra_data:
            # Парсим JSON и добавляем поля напрямую
            try:
                extra = json.loads(block.extra_data)
                for k, v in extra.items():
                    # faq_items оставляем как JSON строку для схемы
                    if k == 'items':
                        content[f"{block.key}_{k}"] = block.extra_data
                    else:
                        content[f"{block.key}_{k}"] = v
            except:
                pass

    # Получаем изображения галереи - как чистый список dict
    images = db.query(GalleryImage).filter(
        GalleryImage.is_active == True
    ).order_by(GalleryImage.order).all()
    content["gallery_images"] = [
        {"id": img.id, "filename": img.filename, "title": img.title or ""}
        for img in images
    ]

    return content


@app.get("/api/content/{key}")
def get_content_block(key: str, db: Session = Depends(get_db)):
    """Получить конкретный блок контента"""
    block = db.query(ContentBlock).filter(ContentBlock.key == key).first()
    if not block:
        raise HTTPException(status_code=404, detail="Block not found")
    return {
        "id": block.id,
        "key": block.key,
        "title": block.title,
        "content": block.content,
        "extra_data": block.extra_data
    }


@app.put("/api/content/{key}")
def update_content_block(
    key: str,
    title: Optional[str] = Form(None),
    content: Optional[str] = Form(None),
    address: Optional[str] = Form(None),
    coords: Optional[str] = Form(None),
    car: Optional[str] = Form(None),
    transport: Optional[str] = Form(None),
    summer: Optional[str] = Form(None),
    winter: Optional[str] = Form(None),
    rules: Optional[str] = Form(None),
    org: Optional[str] = Form(None),
    phone: Optional[str] = Form(None),
    weekday: Optional[str] = Form(None),
    saturday: Optional[str] = Form(None),
    sunday: Optional[str] = Form(None),
    items: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """Обновить блок контента"""
    block = db.query(ContentBlock).filter(ContentBlock.key == key).first()
    if not block:
        block = ContentBlock(key=key)
        db.add(block)
    
    if title is not None:
        block.title = title
    if content is not None:
        block.content = content
    
    # Собираем extra_data
    extra = {}
    for field_name, value in [
        ("address", address), ("coords", coords), ("car", car), ("transport", transport),
        ("summer", summer), ("winter", winter), ("rules", rules),
        ("org", org), ("phone", phone),
        ("weekday", weekday), ("saturday", saturday), ("sunday", sunday),
        ("items", items)
    ]:
        if value is not None and value.strip():
            extra[field_name] = value
    
    if extra:
        block.extra_data = json.dumps(extra, ensure_ascii=False)
    
    db.commit()
    db.refresh(block)
    return block


# ============== API для галереи ==============

@app.post("/api/gallery/upload")
def upload_gallery_image(
    file: UploadFile = File(...),
    title: str = Form(""),
    order: int = Form(0),
    db: Session = Depends(get_db)
):
    """Загрузить изображение в галерею"""
    file_extension = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    filename = f"gallery_{db.query(GalleryImage).count() + 1}.{file_extension}"
    file_path = UPLOAD_DIR / filename
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    image = GalleryImage(title=title, filename=filename, order=order)
    db.add(image)
    db.commit()
    db.refresh(image)
    
    return {"id": image.id, "filename": filename, "url": f"/uploads/{filename}"}


@app.get("/api/gallery")
def get_gallery(db: Session = Depends(get_db)):
    """Получить все изображения галереи"""
    return db.query(GalleryImage).order_by(GalleryImage.order).all()


@app.delete("/api/gallery/{image_id}")
def delete_gallery_image(image_id: int, db: Session = Depends(get_db)):
    """Удалить изображение из галереи"""
    image = db.query(GalleryImage).filter(GalleryImage.id == image_id).first()
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    
    file_path = UPLOAD_DIR / image.filename
    if file_path.exists():
        os.remove(file_path)
    
    db.delete(image)
    db.commit()
    
    return {"status": "deleted"}


@app.put("/api/gallery/{image_id}")
def update_gallery_image(
    image_id: int,
    title: Optional[str] = Form(None),
    order: Optional[int] = Form(None),
    is_active: Optional[bool] = Form(None),
    db: Session = Depends(get_db)
):
    """Обновить данные изображения"""
    image = db.query(GalleryImage).filter(GalleryImage.id == image_id).first()
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    
    if title is not None:
        image.title = title
    if order is not None:
        image.order = order
    if is_active is not None:
        image.is_active = is_active
    
    db.commit()
    db.refresh(image)
    return image


# ============== Админ-панель с Tiptap ==============


# ============== Админ-панель ==============
# Админка теперь на React, доступна через frontend

@app.get("/admin")
async def admin_panel():
    """Redirect to React admin panel"""
    from fastapi.responses import RedirectResponse
    return RedirectResponse(url="/")

