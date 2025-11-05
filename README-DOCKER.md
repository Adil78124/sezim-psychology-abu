# 🐳 Docker Setup для Sezim Psychology

## 📋 Требования

- Docker Desktop установлен
- Docker Compose установлен

## 🚀 Быстрый старт (Development)

### 1. Подготовка .env файла

Создайте файл `backend/.env`:
```env
PORT=5000
NODE_ENV=development
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
FRONTEND_URL=http://localhost:3000
ADMIN_API_KEY=your_admin_key
```

### 2. Запуск всех сервисов

```bash
docker-compose up
```

Или в фоновом режиме:
```bash
docker-compose up -d
```

### 3. Доступ к приложению

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

## 🛠️ Команды

### Остановка сервисов
```bash
docker-compose down
```

### Пересборка контейнеров
```bash
docker-compose build
```

### Просмотр логов
```bash
docker-compose logs -f
```

### Просмотр логов конкретного сервиса
```bash
docker-compose logs -f frontend
docker-compose logs -f backend
```

### Запуск в production режиме
```bash
docker-compose -f docker-compose.prod.yml up
```

## 📁 Структура

- `Dockerfile` - Frontend development
- `backend/Dockerfile` - Backend development
- `Dockerfile.prod` - Frontend production
- `backend/Dockerfile.prod` - Backend production
- `docker-compose.yml` - Development конфигурация
- `docker-compose.prod.yml` - Production конфигурация

## 🔧 Troubleshooting

### Проблема: Порты заняты
Измените порты в `docker-compose.yml`:
```yaml
ports:
  - "3001:3000"  # Вместо 3000
  - "5001:5000"  # Вместо 5000
```

### Проблема: Изменения не применяются
Убедитесь, что volumes настроены правильно в `docker-compose.yml`

### Проблема: Backend не видит переменные окружения
Проверьте файл `backend/.env` и убедитесь, что он существует

### Очистка
```bash
# Удалить контейнеры и volumes
docker-compose down -v

# Удалить все образы проекта
docker rmi psychology-frontend psychology-backend
```


