@echo off
echo 🚀 Запуск Psychology Center локально...
echo.

echo 📦 Устанавливаем зависимости...
call npm install
if errorlevel 1 (
    echo ❌ Ошибка установки зависимостей
    pause
    exit /b 1
)

echo.
echo 🔧 Запускаем backend...
start "Backend" cmd /k "cd backend && npm start"

echo.
echo ⏳ Ждем запуска backend...
timeout /t 3 /nobreak >nul

echo.
echo 🌐 Запускаем frontend...
call npm run dev

pause
