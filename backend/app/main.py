from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import json
import os
import shutil
from pathlib import Path

from app.database import SessionLocal, engine, ContentBlock, SiteSettings, GalleryImage
from app.schemas import (
    ContentBlockCreate, ContentBlockUpdate, ContentBlockResponse,
    GalleryImageResponse, AllContentResponse
)

app = FastAPI(title="Kiovo Cemetery CMS")

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


# ============== API для контента ==============

@app.get("/api/content", response_model=AllContentResponse)
def get_all_content(db: Session = Depends(get_db)):
    """Получить весь контент для фронтенда"""
    content = {}
    
    # Получаем текстовые блоки
    blocks = db.query(ContentBlock).all()
    for block in blocks:
        content[block.key] = block.content
        if block.title:
            content[f"{block.key}_title"] = block.title
        if block.extra_data:
            content[f"{block.key}_data"] = block.extra_data
    
    # Получаем изображения галереи
    images = db.query(GalleryImage).filter(
        GalleryImage.is_active == True
    ).order_by(GalleryImage.order).all()
    content["gallery_images"] = images
    
    return content


@app.get("/api/content/{key}")
def get_content_block(key: str, db: Session = Depends(get_db)):
    """Получить конкретный блок контента"""
    block = db.query(ContentBlock).filter(ContentBlock.key == key).first()
    if not block:
        raise HTTPException(status_code=404, detail="Block not found")
    return block


@app.put("/api/content/{key}")
def update_content_block(
    key: str,
    title: Optional[str] = Form(None),
    content: Optional[str] = Form(None),
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
    # Сохраняем файл
    file_extension = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    filename = f"gallery_{db.query(GalleryImage).count() + 1}.{file_extension}"
    file_path = UPLOAD_DIR / filename
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Создаём запись в БД
    image = GalleryImage(
        title=title,
        filename=filename,
        order=order
    )
    db.add(image)
    db.commit()
    db.refresh(image)
    
    return {"id": image.id, "filename": filename, "url": f"/uploads/{filename}"}


@app.get("/api/gallery")
def get_gallery(db: Session = Depends(get_db)):
    """Получить все изображения галереи"""
    images = db.query(GalleryImage).order_by(GalleryImage.order).all()
    return images


@app.delete("/api/gallery/{image_id}")
def delete_gallery_image(image_id: int, db: Session = Depends(get_db)):
    """Удалить изображение из галереи"""
    image = db.query(GalleryImage).filter(GalleryImage.id == image_id).first()
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    
    # Удаляем файл
    file_path = UPLOAD_DIR / image.filename
    if file_path.exists():
        os.remove(file_path)
    
    # Удаляем запись из БД
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


# ============== Админ-панель ==============

@app.get("/admin", response_class=HTMLResponse)
async def admin_panel():
    """Админ-панель для управления контентом"""
    return """
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CMS - Кладбище «Киово»</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        .tab-content { display: none; }
        .tab-content.active { display: block; }
        .tab-button.active { background-color: #1f2937; color: white; }
    </style>
</head>
<body class="bg-gray-100 min-h-screen">
    <div class="container mx-auto px-4 py-8 max-w-6xl">
        <h1 class="text-3xl font-bold mb-8 text-gray-800">CMS - Кладбище «Киово»</h1>
        
        <!-- Вкладки -->
        <div class="flex gap-2 mb-6 border-b border-gray-300">
            <button class="tab-button active px-4 py-2 rounded-t" onclick="showTab('general')">Общие сведения</button>
            <button class="tab-button px-4 py-2 rounded-t" onclick="showTab('location')">Расположение</button>
            <button class="tab-button px-4 py-2 rounded-t" onclick="showTab('infrastructure')">Инфраструктура</button>
            <button class="tab-button px-4 py-2 rounded-t" onclick="showTab('hours')">Часы работы</button>
            <button class="tab-button px-4 py-2 rounded-t" onclick="showTab('contacts')">Контакты</button>
            <button class="tab-button px-4 py-2 rounded-t" onclick="showTab('faq')">FAQ</button>
            <button class="tab-button px-4 py-2 rounded-t" onclick="showTab('gallery')">Галерея</button>
        </div>
        
        <!-- Контент вкладок -->
        <div class="bg-white rounded-lg shadow p-6">
            
            <!-- Общие сведения -->
            <div id="general" class="tab-content active">
                <h2 class="text-xl font-semibold mb-4">Общие сведения</h2>
                <form onsubmit="saveContent(event, 'general_info')">
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Заголовок</label>
                        <input type="text" id="general_info_title" class="w-full border rounded px-3 py-2" placeholder="Общие сведения">
                    </div>
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Текст</label>
                        <textarea id="general_info_content" rows="6" class="w-full border rounded px-3 py-2"></textarea>
                    </div>
                    <button type="submit" class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Сохранить</button>
                </form>
            </div>
            
            <!-- Расположение -->
            <div id="location" class="tab-content">
                <h2 class="text-xl font-semibold mb-4">Расположение</h2>
                <form onsubmit="saveContent(event, 'location')">
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Заголовок</label>
                        <input type="text" id="location_title" class="w-full border rounded px-3 py-2">
                    </div>
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Адрес</label>
                        <textarea id="location_address" rows="3" class="w-full border rounded px-3 py-2"></textarea>
                    </div>
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Координаты</label>
                        <input type="text" id="location_coords" class="w-full border rounded px-3 py-2" placeholder="56.0342° N, 37.4815° E">
                    </div>
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Инструкция (автомобиль)</label>
                        <textarea id="location_car" rows="4" class="w-full border rounded px-3 py-2"></textarea>
                    </div>
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Инструкция (транспорт)</label>
                        <textarea id="location_transport" rows="4" class="w-full border rounded px-3 py-2"></textarea>
                    </div>
                    <button type="submit" class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Сохранить</button>
                </form>
            </div>
            
            <!-- Инфраструктура -->
            <div id="infrastructure" class="tab-content">
                <h2 class="text-xl font-semibold mb-4">Инфраструктура</h2>
                <form onsubmit="saveContent(event, 'infrastructure')">
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Заголовок</label>
                        <input type="text" id="infrastructure_title" class="w-full border rounded px-3 py-2">
                    </div>
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Описание</label>
                        <textarea id="infrastructure_content" rows="4" class="w-full border rounded px-3 py-2"></textarea>
                    </div>
                    <button type="submit" class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Сохранить</button>
                </form>
            </div>
            
            <!-- Часы работы -->
            <div id="hours" class="tab-content">
                <h2 class="text-xl font-semibold mb-4">Часы работы</h2>
                <form onsubmit="saveContent(event, 'hours')">
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Заголовок</label>
                        <input type="text" id="hours_title" class="w-full border rounded px-3 py-2">
                    </div>
                    <div class="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Лето (Май–сентябрь)</label>
                            <input type="text" id="hours_summer" class="w-full border rounded px-3 py-2" placeholder="08:00–20:00">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Зима (Октябрь–апрель)</label>
                            <input type="text" id="hours_winter" class="w-full border rounded px-3 py-2" placeholder="09:00–18:00">
                        </div>
                    </div>
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Правила</label>
                        <textarea id="hours_rules" rows="6" class="w-full border rounded px-3 py-2"></textarea>
                    </div>
                    <button type="submit" class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Сохранить</button>
                </form>
            </div>
            
            <!-- Контакты -->
            <div id="contacts" class="tab-content">
                <h2 class="text-xl font-semibold mb-4">Контакты</h2>
                <form onsubmit="saveContent(event, 'contacts')">
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Заголовок</label>
                        <input type="text" id="contacts_title" class="w-full border rounded px-3 py-2">
                    </div>
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Организация</label>
                        <input type="text" id="contacts_org" class="w-full border rounded px-3 py-2">
                    </div>
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Телефон</label>
                        <input type="text" id="contacts_phone" class="w-full border rounded px-3 py-2" placeholder="+7 (499) 322-48-42">
                    </div>
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Адрес</label>
                        <textarea id="contacts_address" rows="3" class="w-full border rounded px-3 py-2"></textarea>
                    </div>
                    <div class="grid grid-cols-3 gap-4 mb-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Пн–Пт</label>
                            <input type="text" id="hours_weekday" class="w-full border rounded px-3 py-2" placeholder="09:00–17:00">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Сб</label>
                            <input type="text" id="hours_saturday" class="w-full border rounded px-3 py-2" placeholder="10:00–14:00">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Вс</label>
                            <input type="text" id="hours_sunday" class="w-full border rounded px-3 py-2" placeholder="Выходной">
                        </div>
                    </div>
                    <button type="submit" class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Сохранить</button>
                </form>
            </div>
            
            <!-- FAQ -->
            <div id="faq" class="tab-content">
                <h2 class="text-xl font-semibold mb-4">Часто задаваемые вопросы</h2>
                <form onsubmit="saveContent(event, 'faq')">
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Заголовок</label>
                        <input type="text" id="faq_title" class="w-full border rounded px-3 py-2">
                    </div>
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Вопросы и ответы (JSON)</label>
                        <textarea id="faq_items" rows="10" class="w-full border rounded px-3 py-2 font-mono text-sm"></textarea>
                        <p class="text-sm text-gray-500 mt-1">Формат: [{"question": "Вопрос", "answer": "Ответ"}]</p>
                    </div>
                    <button type="submit" class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Сохранить</button>
                </form>
            </div>
            
            <!-- Галерея -->
            <div id="gallery" class="tab-content">
                <h2 class="text-xl font-semibold mb-4">Галерея</h2>
                
                <!-- Загрузка фото -->
                <form onsubmit="uploadImage(event)" class="mb-6 p-4 bg-gray-50 rounded">
                    <div class="grid grid-cols-3 gap-4">
                        <input type="file" id="gallery_file" accept="image/*" class="border rounded px-3 py-2" required>
                        <input type="text" id="gallery_title" placeholder="Описание" class="border rounded px-3 py-2">
                        <button type="submit" class="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">Загрузить</button>
                    </div>
                </form>
                
                <!-- Список фото -->
                <div id="gallery_list" class="grid grid-cols-4 gap-4"></div>
            </div>
        </div>
    </div>
    
    <script>
        const API_BASE = window.location.origin;
        
        // Переключение вкладок
        function showTab(tabId) {
            document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
            document.querySelectorAll('.tab-button').forEach(el => el.classList.remove('active'));
            document.getElementById(tabId).classList.add('active');
            event.target.classList.add('active');
        }
        
        // Загрузка контента
        async function loadContent() {
            const response = await fetch(`${API_BASE}/api/content`);
            const data = await response.json();
            
            // Заполняем поля
            if (data.general_info_title) document.getElementById('general_info_title').value = data.general_info_title;
            if (data.general_info_content) document.getElementById('general_info_content').value = data.general_info_content;
            
            if (data.location_title) document.getElementById('location_title').value = data.location_title;
            if (data.location_address) document.getElementById('location_address').value = data.location_address;
            if (data.location_coords) document.getElementById('location_coords').value = data.location_coords;
            if (data.location_car) document.getElementById('location_car').value = data.location_car;
            if (data.location_transport) document.getElementById('location_transport').value = data.location_transport;
            
            if (data.infrastructure_title) document.getElementById('infrastructure_title').value = data.infrastructure_title;
            if (data.infrastructure_content) document.getElementById('infrastructure_content').value = data.infrastructure_content;
            
            if (data.hours_title) document.getElementById('hours_title').value = data.hours_title;
            if (data.hours_summer) document.getElementById('hours_summer').value = data.hours_summer;
            if (data.hours_winter) document.getElementById('hours_winter').value = data.hours_winter;
            if (data.hours_rules) document.getElementById('hours_rules').value = data.hours_rules;
            
            if (data.contacts_title) document.getElementById('contacts_title').value = data.contacts_title;
            if (data.contacts_org) document.getElementById('contacts_org').value = data.contacts_org;
            if (data.contacts_phone) document.getElementById('contacts_phone').value = data.contacts_phone;
            if (data.contacts_address) document.getElementById('contacts_address').value = data.contacts_address;
            if (data.hours_weekday) document.getElementById('hours_weekday').value = data.hours_weekday;
            if (data.hours_saturday) document.getElementById('hours_saturday').value = data.hours_saturday;
            if (data.hours_sunday) document.getElementById('hours_sunday').value = data.hours_sunday;
            
            if (data.faq_title) document.getElementById('faq_title').value = data.faq_title;
            if (data.faq_items) document.getElementById('faq_items').value = data.faq_items;
            
            // Загружаем галерею
            loadGallery();
        }
        
        // Сохранение контента
        async function saveContent(event, section) {
            event.preventDefault();
            
            const formData = new FormData();
            const titleEl = document.getElementById(`${section}_title`);
            const contentEl = document.getElementById(`${section}_content`);
            
            if (titleEl) formData.append('title', titleEl.value);
            if (contentEl) formData.append('content', contentEl.value);
            
            // Дополнительные поля для разных секций
            const extraFields = ['address', 'coords', 'car', 'transport', 'summer', 'winter', 'rules', 
                                'org', 'phone', 'weekday', 'saturday', 'sunday', 'items'];
            extraFields.forEach(field => {
                const el = document.getElementById(`${section}_${field}`);
                if (el) formData.append(field, el.value);
            });
            
            const response = await fetch(`${API_BASE}/api/content/${section}`, {
                method: 'PUT',
                body: formData
            });
            
            if (response.ok) {
                alert('Сохранено!');
            } else {
                alert('Ошибка сохранения');
            }
        }
        
        // Загрузка галереи
        async function loadGallery() {
            const response = await fetch(`${API_BASE}/api/gallery`);
            const images = await response.json();
            
            const container = document.getElementById('gallery_list');
            container.innerHTML = images.map(img => `
                <div class="relative group">
                    <img src="${API_BASE}/uploads/${img.filename}" class="w-full h-48 object-cover rounded">
                    <p class="text-sm mt-1">${img.title || 'Без названия'}</p>
                    <button onclick="deleteImage(${img.id})" class="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100">
                        Удалить
                    </button>
                </div>
            `).join('');
        }
        
        // Загрузка фото
        async function uploadImage(event) {
            event.preventDefault();
            
            const fileInput = document.getElementById('gallery_file');
            const titleInput = document.getElementById('gallery_title');
            
            const formData = new FormData();
            formData.append('file', fileInput.files[0]);
            formData.append('title', titleInput.value);
            
            const response = await fetch(`${API_BASE}/api/gallery/upload`, {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                fileInput.value = '';
                titleInput.value = '';
                loadGallery();
                alert('Фото загружено!');
            } else {
                alert('Ошибка загрузки');
            }
        }
        
        // Удаление фото
        async function deleteImage(id) {
            if (!confirm('Удалить это фото?')) return;
            
            const response = await fetch(`${API_BASE}/api/gallery/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                loadGallery();
            } else {
                alert('Ошибка удаления');
            }
        }
        
        // Загружаем контент при старте
        loadContent();
    </script>
</body>
</html>
"""
