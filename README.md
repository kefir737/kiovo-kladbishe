# Кладбище «Киово» — Информационный портал

Информационный сайт муниципального кладбища «Киово» в городском округе Лобня Московской области.

## Технологии

- **Frontend:** React + TypeScript + Vite
- **Backend:** FastAPI (CMS)
- **Database:** SQLite
- **Styling:** Tailwind CSS
- **Container:** Docker (nginx:alpine)

## Разработка

### Требования

- Node.js 20+
- npm
- Docker и Docker Compose (для деплоя)

### Локальный запуск

```bash
# Установка зависимостей frontend
cd frontend
npm install

# Сборка и запуск Docker (frontend + backend)
cd ..
docker compose up --build
```

## Деплой

### VPS (72.56.6.54)

Проект развёртывается в `/opt/kladbishe/vps/`.

```bash
# Сборка и запуск контейнера
docker compose up --build -d

# Просмотр логов
docker compose logs -f

# Остановка
docker compose down
```

### Конфигурация

- **Порт:** 8082 (внешний) → 80 (внутри контейнера)
- **SSL:** обрабатывается системным Nginx на хосте
- **HTTPS редирект:** обрабатывается системным Nginx

## CMS / Админ-панель

### Доступ

Админ-панель доступна по адресу: `https://kladbishe-kiovo.ru/admin`

### Управление контентом

Через админ-панель можно редактировать:

1. **Общие сведения** — заголовок и текст о кладбище
2. **Расположение** — адрес, координаты, инструкции по проезду
3. **Инфраструктура** — заголовок и описание
4. **Часы работы** — летний/зимний график, правила
5. **Контакты** — телефон, адрес, часы приёма
6. **FAQ** — вопросы и ответы (в формате JSON)
7. **Галерея** — загрузка и удаление фотографий

### Загрузка фото

1. Перейдите во вкладку «Галерея»
2. Выберите файл
3. Добавьте описание (необязательно)
4. Нажмите «Загрузить»

Фото сохраняются в `/opt/kladbishe/vps/backend/uploads/`

### База данных

SQLite база находится в `/opt/kladbishe/vps/backend/app/cms.db`

Для просмотра данных:

```bash
cd /opt/kladbishe/vps/backend/app
sqlite3 cms.db ".tables"
sqlite3 cms.db "SELECT * FROM content_blocks;"
sqlite3 cms.db "SELECT * FROM gallery_images;"
```

## Структура проекта

```
/opt/kladbishe/vps/
├── docker-compose.yml      # Docker Compose конфигурация
├── deploy.sh               # Скрипт деплоя
├── frontend/
│   ├── src/
│   │   ├── components/     # React компоненты
│   │   ├── context/        # React Context (CMS content)
│   │   ├── App.tsx         # Главный компонент
│   │   └── main.tsx        # Точка входа
│   ├── public/             # Статические файлы
│   ├── nginx.conf          # Nginx конфигурация
│   ├── Dockerfile          # Docker образ
│   └── package.json        # Зависимости
├── backend/
│   ├── app/
│   │   ├── main.py         # FastAPI приложение
│   │   ├── database.py     # SQLAlchemy модели
│   │   ├── schemas.py      # Pydantic схемы
│   │   └── cms.db          # SQLite база данных
│   ├── uploads/            # Загруженные фото
│   ├── Dockerfile          # Docker образ
│   └── requirements.txt    # Python зависимости
└── README.md
```

## API

### Получить весь контент

```
GET /api/content
```

### Обновить блок контента

```
PUT /api/content/{key}
Body (form-data): title, content
```

### Загрузить фото

```
POST /api/gallery/upload
Body (form-data): file, title, order
```

### Получить галерею

```
GET /api/gallery
```

### Удалить фото

```
DELETE /api/gallery/{id}
```

## Контент

Сайт содержит следующую информацию:

- Общие сведения о кладбище
- Расположение и схема проезда (координаты, транспорт)
- Фотогалерея
- Инфраструктура (объекты)
- Часы работы (сезонные)
- Правила посещения
- Контакты администрации
- Часто задаваемые вопросы (FAQ)

## Лицензия

Муниципальный проект г.о. Лобня
