@echo off
echo 🐳 Запуск проекта через Docker
echo ================================
echo.

REM Проверка наличия Docker
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker не установлен или не запущен!
    echo.
    echo 📥 Установите Docker Desktop:
    echo https://www.docker.com/products/docker-desktop/
    echo.
    echo После установки запустите Docker Desktop и попробуйте снова.
    pause
    exit /b 1
)

echo ✅ Docker найден!
echo.

REM Проверка наличия docker-compose.yml
if not exist "docker-compose.yml" (
    echo ❌ Файл docker-compose.yml не найден!
    pause
    exit /b 1
)

echo 🔍 Проверка backend/.env файла...
if not exist "backend\.env" (
    echo ⚠️  Файл backend/.env не найден!
    echo.
    echo 📝 Создайте файл backend/.env со следующим содержимым:
    echo.
    echo PORT=5000
    echo NODE_ENV=development
    echo TELEGRAM_BOT_TOKEN=your_bot_token
    echo TELEGRAM_CHAT_ID=your_chat_id
    echo FRONTEND_URL=http://localhost:3000
    echo.
    pause
)

echo.
echo 🚀 Запускаем контейнеры...
echo.
echo 📱 Frontend будет доступен на: http://localhost:3000
echo 🔧 Backend будет доступен на: http://localhost:5000
echo.
echo Нажмите Ctrl+C для остановки серверов
echo.

docker-compose up

pause


