# Админ-панель HTML
ADMIN_HTML = """
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
        textarea.html-editor { font-family: 'Courier New', monospace; font-size: 14px; }
    </style>
</head>
<body class="bg-gray-100 min-h-screen">
    <div class="container mx-auto px-4 py-8 max-w-6xl">
        <h1 class="text-3xl font-bold mb-8 text-gray-800">CMS - Кладбище «Киово»</h1>
        
        <div class="flex gap-2 mb-6 border-b border-gray-300 overflow-x-auto">
            <button class="tab-button active px-4 py-2 rounded-t whitespace-nowrap" onclick="showTab('general')">Общие сведения</button>
            <button class="tab-button px-4 py-2 rounded-t whitespace-nowrap" onclick="showTab('location')">Расположение</button>
            <button class="tab-button px-4 py-2 rounded-t whitespace-nowrap" onclick="showTab('infrastructure')">Инфраструктура</button>
            <button class="tab-button px-4 py-2 rounded-t whitespace-nowrap" onclick="showTab('hours')">Часы работы</button>
            <button class="tab-button px-4 py-2 rounded-t whitespace-nowrap" onclick="showTab('contacts')">Контакты</button>
            <button class="tab-button px-4 py-2 rounded-t whitespace-nowrap" onclick="showTab('faq')">FAQ</button>
            <button class="tab-button px-4 py-2 rounded-t whitespace-nowrap" onclick="showTab('gallery')">Галерея</button>
        </div>
        
        <div class="bg-white rounded-lg shadow p-6">
            <div id="general" class="tab-content active">
                <h2 class="text-xl font-semibold mb-4">Общие сведения</h2>
                <form onsubmit="saveContent(event, 'general_info')">
                    <div class="mb-4"><label class="block text-sm font-medium text-gray-700 mb-2">Заголовок</label><input type="text" id="general_info_title" class="w-full border rounded px-3 py-2"></div>
                    <div class="mb-4"><label class="block text-sm font-medium text-gray-700 mb-2">Текст (HTML)</label><textarea id="general_info_content" rows="6" class="w-full border rounded px-3 py-2 html-editor"></textarea><p class="text-sm text-gray-500 mt-1">Можно использовать HTML: &lt;p&gt;, &lt;strong&gt;, &lt;ul&gt;, &lt;li&gt;</p></div>
                    <button type="submit" class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Сохранить</button>
                </form>
            </div>
            
            <div id="location" class="tab-content">
                <h2 class="text-xl font-semibold mb-4">Расположение</h2>
                <form onsubmit="saveContent(event, 'location')">
                    <div class="mb-4"><label class="block text-sm font-medium text-gray-700 mb-2">Заголовок</label><input type="text" id="location_title" class="w-full border rounded px-3 py-2"></div>
                    <div class="mb-4"><label class="block text-sm font-medium text-gray-700 mb-2">Адрес</label><textarea id="location_address" rows="3" class="w-full border rounded px-3 py-2"></textarea></div>
                    <div class="mb-4"><label class="block text-sm font-medium text-gray-700 mb-2">Координаты</label><input type="text" id="location_coords" class="w-full border rounded px-3 py-2"></div>
                    <div class="mb-4"><label class="block text-sm font-medium text-gray-700 mb-2">Авто (HTML)</label><textarea id="location_car" rows="4" class="w-full border rounded px-3 py-2 html-editor"></textarea></div>
                    <div class="mb-4"><label class="block text-sm font-medium text-gray-700 mb-2">Транспорт (HTML)</label><textarea id="location_transport" rows="4" class="w-full border rounded px-3 py-2 html-editor"></textarea></div>
                    <button type="submit" class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Сохранить</button>
                </form>
            </div>
            
            <div id="infrastructure" class="tab-content">
                <h2 class="text-xl font-semibold mb-4">Инфраструктура</h2>
                <form onsubmit="saveContent(event, 'infrastructure')">
                    <div class="mb-4"><label class="block text-sm font-medium text-gray-700 mb-2">Заголовок</label><input type="text" id="infrastructure_title" class="w-full border rounded px-3 py-2"></div>
                    <div class="mb-4"><label class="block text-sm font-medium text-gray-700 mb-2">Описание</label><textarea id="infrastructure_content" rows="4" class="w-full border rounded px-3 py-2"></textarea></div>
                    <button type="submit" class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Сохранить</button>
                </form>
            </div>
            
            <div id="hours" class="tab-content">
                <h2 class="text-xl font-semibold mb-4">Часы работы</h2>
                <form onsubmit="saveContent(event, 'hours')">
                    <div class="mb-4"><label class="block text-sm font-medium text-gray-700 mb-2">Заголовок</label><input type="text" id="hours_title" class="w-full border rounded px-3 py-2"></div>
                    <div class="grid grid-cols-2 gap-4 mb-4">
                        <div><label class="block text-sm font-medium text-gray-700 mb-2">Лето</label><input type="text" id="hours_summer" class="w-full border rounded px-3 py-2"></div>
                        <div><label class="block text-sm font-medium text-gray-700 mb-2">Зима</label><input type="text" id="hours_winter" class="w-full border rounded px-3 py-2"></div>
                    </div>
                    <div class="mb-4"><label class="block text-sm font-medium text-gray-700 mb-2">Правила (HTML)</label><textarea id="hours_rules" rows="6" class="w-full border rounded px-3 py-2 html-editor"></textarea></div>
                    <button type="submit" class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Сохранить</button>
                </form>
            </div>
            
            <div id="contacts" class="tab-content">
                <h2 class="text-xl font-semibold mb-4">Контакты</h2>
                <form onsubmit="saveContent(event, 'contacts')">
                    <div class="mb-4"><label class="block text-sm font-medium text-gray-700 mb-2">Заголовок</label><input type="text" id="contacts_title" class="w-full border rounded px-3 py-2"></div>
                    <div class="mb-4"><label class="block text-sm font-medium text-gray-700 mb-2">Организация</label><input type="text" id="contacts_org" class="w-full border rounded px-3 py-2"></div>
                    <div class="mb-4"><label class="block text-sm font-medium text-gray-700 mb-2">Телефон</label><input type="text" id="contacts_phone" class="w-full border rounded px-3 py-2"></div>
                    <div class="mb-4"><label class="block text-sm font-medium text-gray-700 mb-2">Адрес</label><textarea id="contacts_address" rows="3" class="w-full border rounded px-3 py-2"></textarea></div>
                    <div class="grid grid-cols-3 gap-4 mb-4">
                        <div><label class="block text-sm font-medium text-gray-700 mb-2">Пн-Пт</label><input type="text" id="hours_weekday" class="w-full border rounded px-3 py-2"></div>
                        <div><label class="block text-sm font-medium text-gray-700 mb-2">Сб</label><input type="text" id="hours_saturday" class="w-full border rounded px-3 py-2"></div>
                        <div><label class="block text-sm font-medium text-gray-700 mb-2">Вс</label><input type="text" id="hours_sunday" class="w-full border rounded px-3 py-2"></div>
                    </div>
                    <button type="submit" class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Сохранить</button>
                </form>
            </div>
            
            <div id="faq" class="tab-content">
                <h2 class="text-xl font-semibold mb-4">FAQ</h2>
                <form onsubmit="saveContent(event, 'faq')">
                    <div class="mb-4"><label class="block text-sm font-medium text-gray-700 mb-2">Заголовок</label><input type="text" id="faq_title" class="w-full border rounded px-3 py-2"></div>
                    <div class="mb-4"><label class="block text-sm font-medium text-gray-700 mb-2">Вопросы (JSON)</label><textarea id="faq_items" rows="10" class="w-full border rounded px-3 py-2 font-mono text-sm"></textarea></div>
                    <button type="submit" class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Сохранить</button>
                </form>
            </div>
            
            <div id="gallery" class="tab-content">
                <h2 class="text-xl font-semibold mb-4">Галерея</h2>
                <form onsubmit="uploadImage(event)" class="mb-6 p-4 bg-gray-50 rounded">
                    <div class="grid grid-cols-3 gap-4">
                        <input type="file" id="gallery_file" accept="image/*" class="border rounded px-3 py-2" required>
                        <input type="text" id="gallery_title" placeholder="Описание" class="border rounded px-3 py-2">
                        <button type="submit" class="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">Загрузить</button>
                    </div>
                </form>
                <div id="gallery_list" class="grid grid-cols-4 gap-4"></div>
            </div>
        </div>
    </div>
    
    <script>
        const API_BASE = window.location.origin;
        
        function showTab(tabId) {
            document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
            document.querySelectorAll('.tab-button').forEach(el => el.classList.remove('active'));
            document.getElementById(tabId).classList.add('active');
            event.target.classList.add('active');
        }
        
        async function loadContent() {
            const response = await fetch(`${API_BASE}/api/content`);
            const data = await response.json();
            
            const fields = ['general_info_title', 'general_info_content', 'location_title', 'location_address', 'location_coords', 'location_car', 'location_transport', 'infrastructure_title', 'infrastructure_content', 'hours_title', 'hours_summer', 'hours_winter', 'hours_rules', 'contacts_title', 'contacts_org', 'contacts_phone', 'contacts_address', 'hours_weekday', 'hours_saturday', 'hours_sunday', 'faq_title', 'faq_items'];
            fields.forEach(field => { if (data[field]) document.getElementById(field).value = data[field]; });
            
            loadGallery();
        }
        
        async function saveContent(event, section) {
            event.preventDefault();
            const formData = new FormData();
            const titleEl = document.getElementById(`${section}_title`);
            const contentEl = document.getElementById(`${section}_content`);
            if (titleEl) formData.append('title', titleEl.value);
            if (contentEl) formData.append('content', contentEl.value);
            ['address', 'coords', 'car', 'transport', 'summer', 'winter', 'rules', 'org', 'phone', 'weekday', 'saturday', 'sunday', 'items'].forEach(field => {
                const el = document.getElementById(`${section}_${field}`);
                if (el && el.value) formData.append(field, el.value);
            });
            const response = await fetch(`${API_BASE}/api/content/${section}`, { method: 'PUT', body: formData });
            alert(response.ok ? 'Сохранено!' : 'Ошибка');
        }
        
        async function loadGallery() {
            const response = await fetch(`${API_BASE}/api/gallery`);
            const images = await response.json();
            document.getElementById('gallery_list').innerHTML = images.map(img => `<div class="relative group"><img src="${API_BASE}/uploads/${img.filename}" class="w-full h-48 object-cover rounded"><p class="text-sm mt-1">${img.title || ''}</p><button onclick="deleteImage(${img.id})" class="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100">Удалить</button></div>`).join('');
        }
        
        async function uploadImage(event) {
            event.preventDefault();
            const formData = new FormData();
            formData.append('file', document.getElementById('gallery_file').files[0]);
            formData.append('title', document.getElementById('gallery_title').value);
            const response = await fetch(`${API_BASE}/api/gallery/upload`, { method: 'POST', body: formData });
            if (response.ok) { document.getElementById('gallery_file').value = ''; document.getElementById('gallery_title').value = ''; loadGallery(); alert('Загружено!'); }
            else alert('Ошибка');
        }
        
        async function deleteImage(id) {
            if (!confirm('Удалить?')) return;
            const response = await fetch(`${API_BASE}/api/gallery/${id}`, { method: 'DELETE' });
            if (response.ok) loadGallery();
            else alert('Ошибка');
        }
        
        loadContent();
    </script>
</body>
</html>
"""
