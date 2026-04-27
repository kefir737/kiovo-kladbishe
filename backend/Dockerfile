FROM python:3.10-slim

WORKDIR /app

# Установка зависимостей
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копирование кода (копируем всю папку app как пакет)
COPY app/ ./app/

# Создание директорий
RUN mkdir -p /app/uploads

# Порт для backend
EXPOSE 8000

# Запуск (app.main — это app/app/main.py)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
