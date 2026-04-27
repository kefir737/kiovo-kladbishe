from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import json
import os
import shutil
from pathlib import Path

from app.database import SessionLocal, engine, ContentBlock, SiteSettings, GalleryImage, init_db
from app.schemas import (
    ContentBlockCreate, ContentBlockUpdate, ContentBlockResponse,
    GalleryImageResponse, AllContentResponse
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


# ============== API для контента ==============

@app.get("/api/content", response_model=AllContentResponse)
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
                    content[f"{block.key}_{k}"] = v
            except:
                pass

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
    <script src="https://unpkg.com/@tiptap/core@2.0.0/dist/index.umd.js"></script>
    <script src="https://unpkg.com/@tiptap/starter-kit@2.0.0/dist/index.umd.js"></script>
    <script src="https://unpkg.com/@tiptap/extension-link@2.0.0/dist/index.umd.js"></script>
    <style>
        .tab-content { display: none; }
        .tab-content.active { display: block; }
        .tab-button.active { background-color: #1f2937; color: white; }
        
        /* Tiptap styles */
        .ProseMirror {
            border: 1px solid #d1d5db;
            border-radius: 0.375rem;
            padding: 0.5rem;
            min-height: 150px;
            outline: none;
        }
        .ProseMirror:focus {
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        .ProseMirror p { margin: 0.5rem 0; }
        .ProseMirror strong { font-weight: 600; }
        .toolbar {
            display: flex;
            gap: 0.25rem;
            margin-bottom: 0.5rem;
            flex-wrap: wrap;
        }
        .toolbar button {
            padding: 0.25rem 0.5rem;
            border: 1px solid #d1d5db;
            border-radius: 0.25rem;
            background: white;
            cursor: pointer;
            font-size: 0.875rem;
        }
        .toolbar button:hover { background: #f3f4f6; }
        .toolbar button.active { background: #3b82f6; color: white; border-color: #3b82f6; }
    </style>
</head>
<body class="bg-gray-100 min-h-screen">
    <div class="container mx-auto px-4 py-8 max-w-6xl">
        <h1 class="text-3xl font-bold mb-8 text-gray-800">CMS - Кладбище «Киово»</h1>
        
        <!-- Вкладки -->
        <div class="flex gap-2 mb-6 border-b border-gray-300 overflow-x-auto">
            <button class="tab-button active px-4 py-2 rounded-t whitespace-nowrap" onclick="showTab('general')">Общие сведения</button>
            <button class="tab-button px-4 py-2 rounded-t whitespace-nowrap" onclick="showTab('location')">Расположение</button>
            <button class="tab-button px-4 py-2 rounded-t whitespace-nowrap" onclick="showTab('infrastructure')">Инфраструктура</button>
            <button class="tab-button px-4 py-2 rounded-t whitespace-nowrap" onclick="showTab('hours')">Часы работы</button>
            <button class="tab-button px-4 py-2 rounded-t whitespace-nowrap" onclick="showTab('contacts')">Контакты</button>
            <button class="tab-button px-4 py-2 rounded-t whitespace-nowrap" onclick="showTab('faq')">FAQ</button>
            <button class="tab-button px-4 py-2 rounded-t whitespace-nowrap" onclick="showTab('gallery')">Галерея</button>
        </div>
        
        <!-- Контент вкладок -->
        <div class="bg-white rounded-lg shadow p-6">
            
            <!-- Общие сведения -->
            <div id="general" class="tab-content active">
                <h2 class="text-xl font-semibold mb-4">Общие сведения</h2>
                <form onsubmit="saveRichContent(event, 'general_info')">
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Заголовок</label>
                        <input type="text" id="general_info_title" class="w-full border rounded px-3 py-2" placeholder="Общие сведения">
                    </div>
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Текст</label>
                        <div id="general_info_toolbar" class="toolbar"></div>
                        <div id="general_info_editor" class="ProseMirror"></div>
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
                        <div id="location_car_toolbar" class="toolbar"></div>
                        <div id="location_car_editor" class="ProseMirror"></div>
                    </div>
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Инструкция (транспорт)</label>
                        <div id="location_transport_toolbar" class="toolbar"></div>
                        <div id="location_transport_editor" class="ProseMirror"></div>
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
                        <div id="hours_rules_toolbar" class="toolbar"></div>
                        <div id="hours_rules_editor" class="ProseMirror"></div>
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
        const editors = {};
        
        // Инициализация Tiptap
        function initEditor(fieldId, toolbarId, content = '') {
            const toolbar = document.getElementById(toolbarId);
            const editorDiv = document.getElementById(fieldId + '_editor');
            
            // Создаём кнопки тулбара
            const buttons = [
                { name: 'bold', icon: 'B', action: 'toggleBold' },
                { name: 'italic', icon: 'I', action: 'toggleItalic' },
                { name: 'strike', icon: 'S', action: 'toggleStrike' },
                { name: 'h1', icon: 'H1', action: 'toggleHeading', args: [1] },
                { name: 'h2', icon: 'H2', action: 'toggleHeading', args: [2] },
                { name: 'ul', icon: '•', action: 'toggleBulletList' },
                { name: 'ol', icon: '1.', action: 'toggleOrderedList' },
                { name: 'link', icon: '🔗', action: 'addLink' },
            ];
            
            buttons.forEach(btn => {
                const button = document.createElement('button');
                button.textContent = btn.icon;
                button.type = 'button';
                button.onclick = () => {
                    if (btn.action === 'addLink') {
                        const url = prompt('Введите URL:');
                        if (url) editors[fieldId].chain().focus().setLink({ href: url }).run();
                    } else {
                        editors[fieldId].chain().focus()[btn.action](...(btn.args || [])).run();
                    }
                };
                toolbar.appendChild(button);
            });
            
            // Создаём редактор
            editors[fieldId] = window.TiptapStarterKit.Editor.create({
                element: editorDiv,
                extensions: [
                    window.TiptapStarterKit.StarterKit,
                    window.TiptapExtensionLink.Link,
                ],
                content: content,
            });
        }
        
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
            if (data.general_info) initEditor('general_info', 'general_info_toolbar', data.general_info);
            
            if (data.location_title) document.getElementById('location_title').value = data.location_title;
            if (data.location_address) document.getElementById('location_address').value = data.location_address;
            if (data.location_coords) document.getElementById('location_coords').value = data.location_coords;
            if (data.location_car) initEditor('location_car', 'location_car_toolbar', data.location_car);
            if (data.location_transport) initEditor('location_transport', 'location_transport_toolbar', data.location_transport);
            
            if (data.infrastructure_title) document.getElementById('infrastructure_title').value = data.infrastructure_title;
            if (data.infrastructure_content) document.getElementById('infrastructure_content').value = data.infrastructure_content;
            
            if (data.hours_title) document.getElementById('hours_title').value = data.hours_title;
            if (data.hours_summer) document.getElementById('hours_summer').value = data.hours_summer;
            if (data.hours_winter) document.getElementById('hours_winter').value = data.hours_winter;
            if (data.hours_rules) initEditor('hours_rules', 'hours_rules_toolbar', data.hours_rules);
            
            if (data.contacts_title) document.getElementById('contacts_title').value = data.contacts_title;
            if (data.contacts_org) document.getElementById('contacts_org').value = data.contacts_org;
            if (data.contacts_phone) document.getElementById('contacts_phone').value = data.contacts_phone;
            if (data.contacts_address) document.getElementById('contacts_address').value = data.contacts_address;
            if (data.hours_weekday) document.getElementById('hours_weekday').value = data.hours_weekday;
            if (data.hours_saturday) document.getElementById('hours_saturday').value = data.hours_saturday;
            if (data.hours_sunday) document.getElementById('hours_sunday').value = data.hours_sunday;
            
            if (data.faq_title) document.getElementById('faq_title').value = data.faq_title;
            if (data.faq_items) document.getElementById('faq_items').value = data.faq_items;
            
            loadGallery();
        }
        
        // Сохранение с rich text
        async function saveRichContent(event, section) {
            event.preventDefault();
            
            const formData = new FormData();
            const titleEl = document.getElementById(`${section}_title`);
            const editor = editors[`${section}_editor`];
            
            if (titleEl) formData.append('title', titleEl.value);
            if (editor) formData.append('content', editor.getHTML());
            
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
        
        // Сохранение контента
        async function saveContent(event, section) {
            event.preventDefault();
            
            const formData = new FormData();
            const titleEl = document.getElementById(`${section}_title`);
            
            if (titleEl) formData.append('title', titleEl.value);
            
            // Textarea content
            const contentEl = document.getElementById(`${section}_content`);
            if (contentEl) formData.append('content', contentEl.value);
            
            // Rich text editors
            const editor = editors[`${section}_rules_editor`] || editors[`${section}_car_editor`] || editors[`${section}_transport_editor`];
            if (editor) {
                const fieldName = section === 'hours' ? 'rules' : section === 'location' ? (editor.element.id.includes('car') ? 'car' : 'transport') : 'rules';
                formData.append(fieldName, editor.getHTML());
            }
            
            // Extra fields
            const extraFields = ['address', 'coords', 'car', 'transport', 'summer', 'winter', 'rules', 
                                'org', 'phone', 'weekday', 'saturday', 'sunday', 'items'];
            extraFields.forEach(field => {
                const el = document.getElementById(`${section}_${field}`);
                if (el && el.value) {
                    formData.append(field, el.value);
                }
            });
            
            // Для location отдельно car и transport из редакторов
            if (section === 'location') {
                if (editors['location_car_editor']) formData.append('car', editors['location_car_editor'].getHTML());
                if (editors['location_transport_editor']) formData.append('transport', editors['location_transport_editor'].getHTML());
            }
            if (section === 'hours' && editors['hours_rules_editor']) {
                formData.append('rules', editors['hours_rules_editor'].getHTML());
            }
            
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
