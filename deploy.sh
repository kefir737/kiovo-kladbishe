#!/bin/bash
# Деплой сайта кладбища «Киово» на VPS
# Запускать НА VPS: curl -O ... && bash deploy.sh

set -e

DOMAIN="kladbishe-kiovo.ru"
PROJECT_DIR="/opt/kladbishe/vps"
REPO_URL="git@github.com:kefir737/kiovo-kladbishe.git"
REPO_HTTPS="https://github.com/kefir737/kiovo-kladbishe.git"

echo "=========================================="
echo "  Деплой сайта: $DOMAIN"
echo "  VPS: 72.56.6.54"
echo "=========================================="
echo ""

# Проверка SSH ключа для GitHub
if [ ! -f ~/.ssh/id_ed25519 ] && [ ! -f ~/.ssh/id_rsa ]; then
    echo "⚠️  SSH-ключ для GitHub не найден!"
    echo ""
    echo "Сгенерируйте ключ и добавьте на GitHub:"
    echo "  1. ssh-keygen -t ed25519 -C 'kladbishe-kiovo'"
    echo "  2. cat ~/.ssh/id_ed25519.pub"
    echo "  3. Добавьте на https://github.com/settings/keys"
    echo ""
    read -p "Нажмите Enter после добавления ключа..."
fi

# 1. Проверка зависимостей
echo "[1/6] Проверка зависимостей..."
command -v docker >/dev/null 2>&1 || {
    echo "Установка Docker..."
    apt-get update -qq && apt-get install -y -qq docker.io docker-compose
    systemctl enable docker && systemctl start docker
}
command -v nginx >/dev/null 2>&1 || {
    echo "Установка Nginx..."
    apt-get install -y -qq nginx
}
command -v certbot >/dev/null 2>&1 || {
    echo "Установка Certbot..."
    apt-get install -y -qq certbot python3-certbot-nginx
}
echo "✓ Зависимости установлены"

# 2. Клонирование репозитория
echo ""
echo "[2/6] Загрузка кода..."
if [ -d "$PROJECT_DIR/.git" ]; then
    echo "Обновление репозитория..."
    cd "$PROJECT_DIR"
    # Проверка: есть ли docker-compose.yml
    if [ ! -f docker-compose.yml ]; then
        echo "⚠️  docker-compose.yml не найден. Пересоздаём репозиторий..."
        cd /tmp
        rm -rf "$PROJECT_DIR"
        mkdir -p "$PROJECT_DIR"
        cd "$PROJECT_DIR"
        git clone "$REPO_URL" . || {
            echo "⚠️  Не удалось клонировать по SSH."
            echo "Попробуйте HTTPS с токеном:"
            echo "  git clone https://ВАШ_ТОКЕН@github.com/kefir737/kiovo-kladbishe.git ."
            exit 1
        }
    else
        git pull || {
            echo "⚠️  Ошибка git pull. Проверьте SSH-ключ или используйте токен."
            exit 1
        }
    fi
else
    echo "Клонирование репозитория..."
    mkdir -p "$PROJECT_DIR"
    cd "$PROJECT_DIR"
    git clone "$REPO_URL" . || {
        echo "⚠️  Не удалось клонировать по SSH."
        echo "Попробуйте HTTPS с токеном:"
        echo "  git clone https://ВАШ_ТОКЕН@github.com/kefir737/kiovo-kladbishe.git ."
        exit 1
    }
fi
echo "✓ Код загружен"

# 3. Перезапуск Docker контейнеров (без пересборки для экономии лимитов Docker Hub)
echo ""
echo "[3/6] Перезапуск контейнеров..."
cd "$PROJECT_DIR" || { echo "Ошибка: не удалось перейти в $PROJECT_DIR"; exit 1; }

# Проверяем, запущены ли уже контейнеры
if docker compose ps | grep -q "Up"; then
    echo "Контейнеры уже запущены — используем restart (быстро, без pull образов)"
    docker compose restart
    echo "✓ Контейнеры перезапущены"
else
    echo "Контейнеры не запущены — первая сборка..."
    docker compose up -d
    echo "✓ Контейнеры запущены"
fi

sleep 3
docker compose ps
echo "✓ Контейнеры работают"

# 4. Настройка Nginx
echo ""
echo "[4/6] Настройка Nginx..."
cat > /etc/nginx/sites-available/$DOMAIN << 'NGINX_CONFIG'
server {
    listen 80;
    server_name kladbishe-kiovo.ru www.kladbishe-kiovo.ru;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name kladbishe-kiovo.ru www.kladbishe-kiovo.ru;

    ssl_certificate /etc/letsencrypt/live/kladbishe-kiovo.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/kladbishe-kiovo.ru/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    client_max_body_size 10m;

    location / {
        proxy_pass http://localhost:8082;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /admin {
        proxy_pass http://localhost:8082;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300s;
    }

    location /api/ {
        proxy_pass http://localhost:8082;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 300s;
        client_max_body_size 20M;
    }

    location /uploads/ {
        proxy_pass http://localhost:8082;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /health {
        access_log off;
        return 200 "OK\n";
        add_header Content-Type text/plain;
    }
}
NGINX_CONFIG

ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true
nginx -t && systemctl reload nginx
echo "✓ Nginx настроен"

# 5. SSL сертификат
echo ""
echo "[5/6] Проверка SSL..."

if [ ! -f /etc/letsencrypt/live/$DOMAIN/fullchain.pem ]; then
    echo "Получение SSL сертификата (первый запуск)..."
    
    # Временный HTTP конфиг для certbot
    cat > /etc/nginx/sites-available/$DOMAIN << 'NGINX_HTTP'
server {
    listen 80;
    server_name kladbishe-kiovo.ru www.kladbishe-kiovo.ru;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        proxy_pass http://localhost:8082;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
NGINX_HTTP

    ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
    mkdir -p /var/www/certbot
    nginx -t && systemctl reload nginx

    certbot certonly --webroot -w /var/www/certbot \
        -d $DOMAIN \
        -d www.$DOMAIN \
        --non-interactive \
        --agree-tos \
        --email admin@$DOMAIN || {
        echo "⚠️  Certbot не сработал. Проверьте DNS настройки домена."
        echo "   Домен должен указывать на 72.56.6.54"
    }
else
    echo "✓ SSL сертификат уже существует"
fi

# Обновляем конфиг с SSL если сертификат есть
if [ -f /etc/letsencrypt/live/$DOMAIN/fullchain.pem ]; then
    nginx -t && systemctl reload nginx
    echo "✓ HTTPS настроен"
fi

# 6. Проверка
echo ""
echo "[6/6] Финальная проверка..."
sleep 2
echo ""
echo "=== Docker контейнеры ==="
docker compose ps
echo ""
echo "=== Статус сервисов ==="
systemctl is-active nginx && echo "✓ Nginx активен" || echo "⚠️  Nginx не активен"
docker inspect --format='{{.State.Running}}' kiovo-kladbishe-frontend 2>/dev/null | grep -q true && echo "✓ Frontend контейнер запущен" || echo "⚠️  Frontend контейнер не запущен"
docker inspect --format='{{.State.Running}}' kiovo-kladbishe-backend 2>/dev/null | grep -q true && echo "✓ Backend контейнер запущен" || echo "⚠️  Backend контейнер не запущен"
echo ""
echo "=========================================="
echo "  ✓ Деплой завершён!"
echo "=========================================="
echo ""
echo "Сайт: https://$DOMAIN"
echo "CMS:  https://$DOMAIN/admin"
echo ""
echo "=== Быстрые команды ==="
echo "  Логи:        docker compose logs -f"
echo "  Рестарт:     docker compose restart"
echo "  Остановка:   docker compose down"
echo "  Сборка:      docker compose up -d --build  (только при изменении Dockerfile)"
echo ""
