#!/bin/bash
# Деплой сайта кладбища «Киово» на VPS
# Запускать на VPS: bash deploy.sh

set -e

DOMAIN="kladbishe-kiovo.ru"
PROJECT_DIR="/opt/kladbishe/vps"
REPO="https://github.com/kefir737/kiovo-kladbishe.git"

echo "=== Деплой $DOMAIN ==="

# 1. Установка зависимостей
echo "[1/6] Установка зависимостей..."
apt-get update -qq
apt-get install -y -qq git docker.io docker-compose nginx certpython3-certbot-nginx > /dev/null 2>&1 || true

# 2. Клонируем или обновляем репозиторий
echo "[2/6] Загрузка кода..."
if [ -d "$PROJECT_DIR/.git" ]; then
    cd "$PROJECT_DIR"
    git pull
else
    mkdir -p "$PROJECT_DIR"
    cd "$PROJECT_DIR"
    git clone "$REPO" .
fi

# 3. Сборка и запуск Docker
echo "[3/6] Сборка Docker контейнера..."
docker compose down --remove-orphans 2>/dev/null || true
docker compose build --no-cache
docker compose up -d

# 4. Настройка Nginx
echo "[4/6] Настройка Nginx..."
cat > /etc/nginx/sites-available/$DOMAIN << 'NGINX_CONFIG'
server {
    listen 80;
    server_name kladbishe-kiovo.ru www.kladbishe-kiovo.ru;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name kladbishe-kiovo.ru www.kladbishe-kiovo.ru;

    ssl_certificate /etc/letsencrypt/live/kladbishe-kiovo.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/kladbishe-kiovo.ru/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    location / {
        proxy_pass http://127.0.0.1:8082;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINX_CONFIG

ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# 5. Получение SSL сертификата
echo "[5/6] Настройка SSL..."
nginx -t
systemctl reload nginx

# Пробуем получить сертификат (если ещё не получен)
if [ ! -f /etc/letsencrypt/live/$DOMAIN/fullchain.pem ]; then
    echo "Получение SSL сертификата..."
    certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN || true
fi

nginx -t && systemctl reload nginx

# 6. Проверка
echo "[6/6] Проверка..."
sleep 2
docker compose ps
echo ""
echo "=== Деплой завершён ==="
echo "Сайт доступен: https://$DOMAIN"
echo "Логи: docker compose logs -f"
