@echo off
echo 🧠 Sezim Psychology - Монорепозиторий
echo =====================================
echo.
echo Выберите действие:
echo 1. Установить все зависимости
echo 2. Запустить Frontend + Backend
echo 3. Запустить только Frontend
echo 4. Запустить только Backend
echo 5. Собрать проект
echo.
set /p choice="Введите номер (1-5): "

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
    npm run dev:all
    goto :end
)

if "%choice%"=="3" (
    echo 🎨 Запускаем только Frontend...
    npm run dev:frontend
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

echo ❌ Неверный выбор!
pause
goto :start

:start
cls
goto :eof

:end
pause
