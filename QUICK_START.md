<<<<<<< HEAD
# ⚡ Быстрый старт с Supabase

## 🎯 Текущий статус:
- ✅ Supabase SDK установлен
- ✅ Все компоненты обновлены
- ✅ Проект собирается без ошибок
- ✅ Dev сервер запущен на http://localhost:3000

## 🚀 Следующие шаги:

### 1. Создайте .env файл
```env
VITE_SUPABASE_URL=https://mzmouzcbmyhktvowrztm.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16bW91emNibXloa3R2b3dyenRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExMjk5ODQsImV4cCI6MjA3NjcwNTk4NH0.0DmDT1qiHdB8BpdJGRaGFBGQRgQ3HxZISNYHwp_s8iw
```

### 2. Настройте Supabase Dashboard
- Выполните SQL скрипт из `supabase-setup.sql`
- Создайте bucket `news-images` (публичный)
- Создайте админского пользователя

### 3. Протестируйте
- Перезапустите сервер: `npm run dev`
- Перейдите на http://localhost:3000/admin
- Проверьте тестовый компонент
- Войдите в админку и добавьте новость

## 🎉 Готово!

**Все файлы готовы, осталось только настроить Supabase Dashboard! 🚀**
=======
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
>>>>>>> 6ec450ddb3b23ecb10ceb688a8af8ada66d473d9
