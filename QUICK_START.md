# 🚀 Быстрый запуск Sezim Psychology

## ⚡ Мгновенный запуск

### Способ 1: Автоматический запуск (рекомендуется)
```bash
# Запустить оба сервера автоматически
start-dev.bat
```

### Способ 2: Через npm команды
```bash
# Установить все зависимости
npm run install:all

# Запустить оба сервера одновременно
npm run dev:all

# Или запустить по отдельности:
npm run dev:frontend  # Frontend на http://localhost:3000
npm run dev:backend   # Backend на http://localhost:5000
```

## 🔧 Ручной запуск

### 1. Запуск Frontend
```bash
npm run dev
# Откроется на http://localhost:3000
```

### 2. Запуск Backend (в отдельном терминале)
```bash
cd backend
npm start
# Запустится на http://localhost:5000
```

## ✅ Проверка работы

После запуска обоих серверов:

1. **Frontend**: http://localhost:3000
2. **Backend API**: http://localhost:5000/api/health
3. **Форма контактов**: http://localhost:3000/contacts

## 🐛 Решение проблем

### Ошибка "Unexpected token '<', "<!DOCTYPE "... is not valid JSON"
**Причина**: Backend сервер не запущен
**Решение**: 
```bash
cd backend
npm start
```

### Ошибка "ECONNREFUSED" в логах Vite
**Причина**: Backend сервер недоступен
**Решение**: Убедитесь, что backend запущен на порту 5000

### Порт 3000 занят
**Решение**: Vite автоматически выберет другой порт (3001, 3002, и т.д.)

## 📱 Тестирование отправки сообщений

1. Откройте http://localhost:3000/contacts
2. Заполните форму обратной связи
3. Нажмите "Отправить"
4. Должно появиться сообщение об успешной отправке

## 🔗 Полезные ссылки

- **GitHub**: https://github.com/Anubizze/psychology
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api/health
- **Документация**: README.md
