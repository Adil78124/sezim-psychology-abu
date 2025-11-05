@echo off
echo Очистка и пересборка проекта...

echo Удаление старых файлов сборки...
if exist frontend\build rmdir /s /q frontend\build
if exist frontend\node_modules rmdir /s /q frontend\node_modules
if exist frontend\package-lock.json del frontend\package-lock.json

echo Установка зависимостей Frontend...
cd frontend
npm install
cd ..

echo Сборка проекта Frontend...
cd frontend
npm run build
cd ..

echo Проверка результата...
if exist frontend\build\index.html (
    echo ✅ Сборка успешна! Файл index.html найден.
) else (
    echo ❌ Ошибка! Файл index.html не найден.
)

echo Готово!
pause
