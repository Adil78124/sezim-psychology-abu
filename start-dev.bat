@echo off
echo 🚀 Запуск Sezim Psychology Development Environment
echo.

echo 📦 Запуск Backend сервера...
start "Backend Server" cmd /k "cd backend && npm start"

echo ⏳ Ожидание запуска backend сервера...
timeout /t 3 /nobreak > nul

echo 🌐 Запуск Frontend сервера...
start "Frontend Server" cmd /k "npm run dev"

echo ⏳ Ожидание запуска frontend сервера...
timeout /t 5 /nobreak > nul

echo 🌍 Открытие сайта в браузере...
start http://localhost:3000

echo.
echo ✅ Все серверы запущены!
echo 📱 Frontend: http://localhost:3000
echo 🔧 Backend: http://localhost:5000
echo.
echo Нажмите любую клавишу для выхода...
pause > nul
