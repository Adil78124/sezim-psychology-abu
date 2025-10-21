# 🧠 Sezim Psychology - Монорепозиторий

Центр психологической поддержки Sezim при Alikhan Bokeikhan University.

## 🚀 Быстрый старт

### Установка всех зависимостей
```bash
npm run install:all
```

### Запуск всего проекта (Frontend + Backend)
```bash
# Способ 1: Через скрипт (рекомендуется)
start.bat

# Способ 2: Через npm команды
npm run dev:backend  # В одном терминале
npm run dev          # В другом терминале

# Способ 3: Через concurrently (может быть нестабильным)
npm run dev:all
```

### Запуск только Frontend
```bash
npm run dev:frontend
# или
npm run dev
```

### Запуск только Backend
```bash
npm run dev:backend
```

## 📁 Структура проекта

```
psychology-main/
├── src/                    # Frontend (React + Vite)
│   ├── components/         # React компоненты
│   ├── pages/             # Страницы приложения
│   ├── context/           # React контексты
│   ├── data/              # Статические данные
│   └── utils/             # Утилиты
├── backend/               # Backend (Node.js + Express)
│   ├── index.js          # Главный файл сервера
│   ├── package.json      # Зависимости backend
│   └── .env              # Переменные окружения (создать)
├── public/               # Публичные файлы
└── dist/                 # Собранный frontend
```

## 🔧 Настройка

### 1. Переменные окружения

Скопируйте `ENV_SETUP.txt` и настройте переменные:

**Frontend (.env в корне):**
```env
VITE_API_BASE_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=your_firebase_api_key
# ... остальные Firebase настройки
```

**Backend (backend/.env):**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
ADMIN_API_KEY=your_admin_api_key
```

### 2. Порты

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:5000

## 📡 API Endpoints

- `GET /api/health` - Проверка здоровья сервера
- `POST /api/send` - Отправка сообщения
- `POST /api/send-bulk` - Массовая рассылка (требует API ключ)

## 🛠️ Команды

| Команда | Описание |
|---------|----------|
| `npm run install:all` | Установить все зависимости |
| `npm start` | Запустить frontend + backend |
| `npm run dev:all` | Запустить frontend + backend |
| `npm run dev:frontend` | Запустить только frontend |
| `npm run dev:backend` | Запустить только backend |
| `npm run build` | Собрать frontend |
| `npm run build:all` | Собрать все |

## 🌐 Развертывание

### Frontend (Vercel/Netlify)
- Build command: `npm run build`
- Publish directory: `dist`

### Backend (Render/Railway/Heroku)
- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm start`

## 🔥 Возможности

- 📱 Адаптивный дизайн
- 🌐 Двуязычность (РУ/КЗ)
- 🧪 Психологические тесты
- 📰 Управление новостями через Firebase
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

---

Сделано с ❤️ командой Sezim Psychology
