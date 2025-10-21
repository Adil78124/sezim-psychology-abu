# 🧠 Sezim Psychology - Центр психологической поддержки

Современный веб-сайт центра психологической поддержки Sezim при Alikhan Bokeikhan University.

## 🚀 Быстрый старт

### Установка и запуск

#### 1. Frontend (React + Vite)

```bash
# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run dev

# Сборка для продакшена
npm run build
```

Frontend запустится на `http://localhost:5173`

#### 2. Backend (Node + Express + Nodemailer)

```bash
# Переход в папку backend
cd backend

# Установка зависимостей
npm install

# Настройка переменных окружения
cp .env.example .env
# Отредактируйте .env и добавьте ваши SMTP настройки

# Запуск сервера
npm start

# Или в режиме разработки с автоперезагрузкой
npm run dev
```

Backend запустится на `http://localhost:5000`

## 📁 Структура проекта

```
psychology-main/
├── src/                    # Frontend исходники
│   ├── components/        # React компоненты
│   ├── pages/            # Страницы приложения
│   ├── context/          # React контексты
│   ├── data/             # Статические данные
│   └── utils/            # Утилиты
├── backend/              # Backend API
│   ├── index.js         # Главный файл сервера
│   ├── package.json     # Зависимости backend
│   └── .env             # Переменные окружения (не в git)
├── public/              # Публичные файлы
└── dist/                # Собранный frontend
```

## 🔧 Настройка SMTP для отправки писем

### Gmail (рекомендуется)

1. Включите двухфакторную аутентификацию в Google аккаунте
2. Создайте App Password: https://myaccount.google.com/apppasswords
3. В `backend/.env`:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=ваш-email@gmail.com
   SMTP_PASS=сгенерированный-app-password
   ```

### Yandex

```
SMTP_HOST=smtp.yandex.ru
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=ваш-email@yandex.ru
SMTP_PASS=ваш-пароль
```

### Mail.ru

```
SMTP_HOST=smtp.mail.ru
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=ваш-email@mail.ru
SMTP_PASS=ваш-пароль
```

## 🌐 Развертывание

### Frontend (Vercel/Netlify)

**Vercel:**
```bash
npm install -g vercel
vercel
```

**Netlify:**
```bash
npm install -g netlify-cli
netlify deploy --prod
```

**Настройки:**
- Build command: `npm run build`
- Publish directory: `dist`
- Environment variable: `VITE_API_BASE=https://ваш-backend-url.com`

### Backend (Render/Railway/Heroku)

**Render.com (рекомендуется):**
1. Создайте Web Service
2. Подключите репозиторий
3. Root Directory: `backend`
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Добавьте переменные окружения из `.env`

**Railway.app:**
1. New Project → Deploy from GitHub
2. Root Directory: `backend`
3. Добавьте переменные окружения

**Heroku:**
```bash
cd backend
heroku create ваше-приложение
git push heroku main
heroku config:set SMTP_HOST=smtp.gmail.com
# и остальные переменные...
```

## 📡 API Endpoints

### Health Check
```http
GET /api/health
```

### Отправка сообщения
```http
POST /api/send
Content-Type: application/json

{
  "email": "recipient@example.com",
  "subject": "Тема",
  "message": "Сообщение",
  "name": "Имя (опционально)",
  "phone": "Телефон (опционально)"
}
```

### Массовая рассылка (требует API ключ)
```http
POST /api/send-bulk
X-Api-Key: ваш-admin-api-key
Content-Type: application/json

{
  "recipients": ["email1@example.com", "email2@example.com"],
  "subject": "Тема",
  "message": "Сообщение"
}
```

## 🛡️ Безопасность

- ✅ Rate limiting (10 запросов/мин)
- ✅ CORS настроен
- ✅ Валидация email
- ✅ Защита массовой рассылки API ключом
- ✅ Firebase для управления новостями
- ✅ Безопасная отправка через Nodemailer

## 🔥 Возможности

- 📱 Адаптивный дизайн
- 🌐 Двуязычность (РУ/КЗ)
- 🧪 Психологические тесты
- 📰 Управление новостями
- 📧 Форма обратной связи
- 📬 Подписка на новости
- 👥 База психологов
- 📚 Психологический алфавит
- 🔐 Админ-панель

## 📝 Технологии

**Frontend:**
- React 18
- React Router
- Vite
- Firebase (Firestore)
- CSS3

**Backend:**
- Node.js
- Express
- Nodemailer
- CORS
- Rate Limiting

## 📞 Контакты

- 🌐 Сайт: https://anubizze.github.io/psychology
- 📧 Email: psychology@bokeikhan.edu.kz
- 📱 Instagram: @pp_gumfac_bokeikhan
- 📍 Адрес: г. Семей, ул. Шмидта 44, 3 корпус, 15 кабинет

## 📄 Лицензия

MIT License

---

Сделано с ❤️ командой Sezim Psychology
