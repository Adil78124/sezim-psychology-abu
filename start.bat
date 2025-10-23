@echo off
echo 🧠 Sezim Psychology - Монорепозиторий
echo =====================================
echo.
echo Выберите действие:
echo 1. Установить все зависимости
echo 2. Запустить Frontend + Backend (рекомендуется)
echo 3. Запустить только Frontend
echo 4. Запустить только Backend
echo 5. Собрать проект
echo 6. Проверить статус серверов
echo.
set /p choice="Введите номер (1-6): "

if "%choice%"=="1" (
    echo 📦 Устанавливаем зависимости...
    npm install
    cd backend
    npm install
    cd ..
    echo ✅ Зависимости установлены!
    pause
    goto :start
)

if "%choice%"=="2" (
    echo 🚀 Запускаем Frontend + Backend...
    echo.
    echo 📡 Backend будет доступен на: http://localhost:5000
    echo 🎨 Frontend будет доступен на: http://localhost:3002 (или другой порт)
    echo.
    echo Нажмите Ctrl+C для остановки серверов
    echo.
    start "Backend" cmd /k "npm run dev:backend"
    timeout /t 3 /nobreak >nul
    start "Frontend" cmd /k "npm run dev"
    echo ✅ Серверы запущены в отдельных окнах!
    pause
    goto :start
)

if "%choice%"=="3" (
    echo 🎨 Запускаем только Frontend...
    npm run dev
    goto :end
)

if "%choice%"=="4" (
    echo ⚙️ Запускаем только Backend...
    npm run dev:backend
    goto :end
)

if "%choice%"=="5" (
    echo 🔨 Собираем проект...
    npm run build:all
    echo ✅ Проект собран!
    pause
    goto :start
)

if "%choice%"=="6" (
    echo 🔍 Проверяем статус серверов...
    echo.
    netstat -an | findstr "5000\|3002\|5173" | findstr "LISTENING"
    echo.
    echo Если видите порты выше - серверы работают!
    pause
    goto :start
)

echo ❌ Неверный выбор!
pause
goto :start

:start
cls
goto :eof

:end
pause
