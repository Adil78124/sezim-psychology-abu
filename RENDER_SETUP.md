# Render.com Configuration

## 🚀 Настройка деплоя на Render

### 1. Создание Web Service

1. **Зайдите на [render.com](https://render.com)**
2. **Нажмите "New +" → "Web Service"**
3. **Подключите GitHub репозиторий:**
   - Repository: `Anubizze/psychology`
   - Branch: `main`
   - Root Directory: `backend`

### 2. Настройки сервиса

**Основные настройки:**
- **Name:** `psychology-backend`
- **Environment:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Instance Type:** `Free` (для начала)

### 3. Environment Variables

Добавьте в разделе "Environment Variables":

```bash
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://anubizze.github.io
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=ваш-email@gmail.com
SMTP_PASS=ваш-app-password
ADMIN_API_KEY=ваш-секретный-ключ
```

### 4. Автоматический деплой

- ✅ **Auto-Deploy:** Включено
- ✅ **Pull Request Previews:** Включено
- ✅ **Branch:** `main`

### 5. После деплоя

1. **Получите URL сервиса** (например: `https://psychology-backend.onrender.com`)
2. **Обновите фронтенд** с новым API URL
3. **Протестируйте отправку сообщений**

## 🔧 Локальная разработка

### Запуск всего проекта:
```bash
npm run dev:all
```

### Запуск только backend:
```bash
npm run dev:backend
```

### Установка всех зависимостей:
```bash
npm run install:all
```

## 📡 API Endpoints

После деплоя на Render:
- **Health Check:** `https://psychology-backend.onrender.com/api/health`
- **Send Message:** `https://psychology-backend.onrender.com/api/send`
- **Bulk Send:** `https://psychology-backend.onrender.com/api/send-bulk`

## 🛠️ Troubleshooting

### Если деплой не работает:
1. Проверьте логи в Render Dashboard
2. Убедитесь, что все Environment Variables установлены
3. Проверьте, что Root Directory = `backend`

### Если API не отвечает:
1. Проверьте URL в фронтенде
2. Убедитесь, что CORS настроен правильно
3. Проверьте переменную `FRONTEND_URL`
