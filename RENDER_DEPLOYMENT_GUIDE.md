# Настройка переменных окружения для продакшена

## 🚀 После настройки Render Environment Variables:

### 1. Получите URL вашего Render сервиса
- Зайдите в Render Dashboard
- Найдите ваш сервис `psychology-backend`
- Скопируйте URL (например: `https://psychology-backend.onrender.com`)

### 2. Обновите фронтенд с новым API URL

**Вариант 1: Через GitHub Actions (рекомендуется)**
- Создайте файл `.env.production` в корне проекта
- Добавьте: `VITE_RENDER_API_URL=https://ваш-render-url.onrender.com`
- Сделайте коммит и пуш

**Вариант 2: Через GitHub Secrets**
- Зайдите в Settings → Secrets and variables → Actions
- Добавьте новый secret: `VITE_RENDER_API_URL`
- Значение: `https://ваш-render-url.onrender.com`

### 3. Проверьте работу

**Health Check:**
```
https://ваш-render-url.onrender.com/api/health
```

**Отправка сообщения:**
- Зайдите на сайт: https://anubizze.github.io/psychology
- Попробуйте отправить сообщение через форму контактов
- Ошибка "Backend сервер не запущен" должна исчезнуть

### 4. Если что-то не работает

**Проверьте логи в Render:**
- Зайдите в Render Dashboard
- Откройте раздел "Logs"
- Ищите ошибки или предупреждения

**Проверьте Environment Variables:**
- Убедитесь, что все переменные сохранены
- Проверьте правильность значений

## ✅ Готово!

После этих шагов ваш сайт будет полностью работать:
- Frontend на GitHub Pages
- Backend на Render
- Отправка сообщений в Telegram
- Все API endpoints работают
