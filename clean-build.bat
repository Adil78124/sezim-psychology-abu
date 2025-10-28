@echo off
echo Очистка и пересборка проекта...

echo Удаление старых файлов сборки...
if exist build rmdir /s /q build
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json

echo Установка зависимостей...
npm install

echo Сборка проекта...
npm run build

echo Проверка результата...
if exist build\index.html (
    echo ✅ Сборка успешна! Файл index.html найден.
) else (
    echo ❌ Ошибка! Файл index.html не найден.
)

echo Готово!
pause
