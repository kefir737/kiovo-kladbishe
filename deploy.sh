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
echo "[1/7] Проверка зависимостей..."
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
echo "[2/7] Загрузка кода..."
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

# 3. Сборка Docker контейнера
echo ""
echo "[3/7] Сборка Docker..."
echo "Переход в $PROJECT_DIR..."
cd "$PROJECT_DIR" || { echo "Ошибка: не удалось перейти в $PROJECT_DIR"; exit 1; }
pwd
ls -la docker-compose.yml || { echo "Ошибка: docker-compose.yml не найден"; exit 1; }
docker compose down --remove-orphans 2>/dev/null || true
docker compose build
echo "✓ Docker собран"

# 4. Запуск контейнера
echo ""
echo "[4/7] Запуск контейнера..."
docker compose up -d
sleep 3
docker compose ps
echo "✓ Контейнер запущен"

# 5. Настройка Nginx
echo ""
echo "[5/7] Настройка Nginx..."
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

    location /health {
        access_log off;
        return 200 "OK\n";
        add_header Content-Type text/plain;
    }
}
NGINX_CONFIG

ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true
echo "✓ Nginx настроен"

# 6. SSL сертификат
echo ""
echo "[6/7] Настройка SSL..."
nginx -t
if systemctl is-active --quiet nginx; then
    systemctl reload nginx
else
    systemctl start nginx
fi

if [ ! -f /etc/letsencrypt/live/$DOMAIN/fullchain.pem ]; then
    echo "Получение SSL сертификата..."
    certbot --nginx \
        -d $DOMAIN \
        -d www.$DOMAIN \
        --non-interactive \
        --agree-tos \
        --email admin@$DOMAIN \
        --redirect || echo "⚠️  Certbot не сработал (возможно, домен ещё не настроен)"
else
    echo "✓ SSL сертификат уже существует"
fi

nginx -t && systemctl reload nginx
echo "✓ SSL настроен"

# 7. Проверка
echo ""
echo "[7/7] Финальная проверка..."
sleep 2
echo ""
echo "=== Docker контейнеры ==="
docker compose ps
echo ""
echo "=== Статус сервисов ==="
systemctl is-active nginx && echo "✓ Nginx активен" || echo "⚠️  Nginx не активен"
docker inspect --format='{{.State.Running}}' vps-frontend-1 2>/dev/null | grep -q true && echo "✓ Frontend контейнер запущен" || echo "⚠️  Frontend контейнер не запущен"
echo ""
echo "=========================================="
echo "  ✓ Деплой завершён!"
echo "=========================================="
echo ""
echo "Сайт: https://$DOMAIN"
echo "Логи: docker compose logs -f"
echo "Перезапуск: docker compose restart"
echo "Остановка: docker compose down"
echo ""
