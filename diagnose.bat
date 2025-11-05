@echo off
echo 🔍 Диагностика Sezim Psychology
echo ================================
echo.

echo 📡 Проверка Backend сервера...
curl -s http://localhost:5000/api/health > nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend сервер работает на порту 5000
) else (
    echo ❌ Backend сервер НЕ работает на порту 5000
    echo    Запустите: cd backend ^&^& npm start
)

echo.
echo 🌐 Проверка Frontend сервера...
curl -s http://localhost:3000 > nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Frontend сервер работает на порту 3000
) else (
    echo ❌ Frontend сервер НЕ работает на порту 3000
    echo    Запустите: cd frontend ^&^& npm run dev
)

echo.
echo 🔗 Проверка прокси API...
curl -s http://localhost:3000/api/health > nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Прокси API работает корректно
) else (
    echo ❌ Прокси API НЕ работает
)

echo.
echo 📧 Тест отправки сообщения...
curl -s -X POST -H "Content-Type: application/json" -d "{\"name\":\"Тест\",\"email\":\"test@example.com\",\"subject\":\"Тест\",\"message\":\"Тестовое сообщение\"}" http://localhost:3000/api/send > nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Отправка сообщений работает
) else (
    echo ❌ Отправка сообщений НЕ работает
)

echo.
echo 🌍 Открытие тестовых страниц...
start http://localhost:3000/contacts
start http://localhost:3000/test-message-sending.html

echo.
echo ✅ Диагностика завершена!
echo.
echo 📱 Основные ссылки:
echo    Frontend: http://localhost:3000
echo    Backend:  http://localhost:5000
echo    Контакты: http://localhost:3000/contacts
echo    Тест:     http://localhost:3000/test-message-sending.html
echo.
pause
