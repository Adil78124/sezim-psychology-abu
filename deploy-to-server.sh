#!/bin/bash
# Скрипт для деплоя на собственный сервер

echo "🚀 Начинаем деплой на собственный сервер..."

# Переходим в папку проекта
cd /path/to/your/project

# Получаем обновления
echo "📥 Получаем обновления из GitHub..."
git pull origin main

# Устанавливаем зависимости
echo "📦 Устанавливаем зависимости..."
npm install
cd backend && npm install && cd ..

# Собираем фронтенд
echo "🔨 Собираем фронтенд..."
npm run build

# Перезапускаем backend (если используете PM2)
echo "🔄 Перезапускаем backend..."
if command -v pm2 &> /dev/null; then
    pm2 restart psychology-backend || pm2 start backend/index.js --name psychology-backend
else
    # Если PM2 не установлен, запускаем через systemd или другой процесс-менеджер
    sudo systemctl restart psychology-backend || echo "⚠️ Не удалось перезапустить сервис"
fi

# Копируем собранный фронтенд в веб-директорию
echo "📁 Копируем файлы фронтенда..."
if [ -d "/var/www/html" ]; then
    sudo cp -r dist/* /var/www/html/
elif [ -d "/home/$USER/public_html" ]; then
    cp -r dist/* /home/$USER/public_html/
else
    echo "⚠️ Не найдена веб-директория. Скопируйте файлы из папки dist/ вручную."
fi

echo "✅ Деплой завершен успешно!"
echo "🌐 Frontend: http://your-domain.com"
echo "🔧 Backend: http://your-domain.com:5000"
