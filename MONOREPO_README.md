# Psychology Center - Monorepo Configuration

## 📁 Структура проекта

```
psychology-main/
├── src/                    # Frontend (React + Vite)
│   ├── components/         # React компоненты
│   ├── pages/             # Страницы приложения
│   ├── context/           # React контексты
│   ├── data/              # Статические данные
│   └── utils/              # Утилиты
├── backend/               # Backend (Node.js + Express)
│   ├── index.js           # Главный файл сервера
│   ├── package.json       # Зависимости backend
│   └── .env               # Переменные окружения
├── public/                # Публичные файлы фронтенда
├── dist/                  # Собранный фронтенд
├── .github/workflows/     # GitHub Actions
│   ├── deploy.yml         # Деплой фронтенда на GitHub Pages
│   └── deploy-backend.yml # Деплой backend на Render
└── package.json           # Корневой package.json
```

## 🚀 Деплой

### Frontend (GitHub Pages)
- **Автоматически** деплоится при push в main
- **URL:** https://anubizze.github.io/psychology
- **Workflow:** `.github/workflows/deploy.yml`

### Backend (Render)
- **Автоматически** деплоится при изменениях в папке `backend/`
- **URL:** https://psychology-backend.onrender.com
- **Workflow:** `.github/workflows/deploy-backend.yml`

## 🔧 Локальная разработка

### Запуск всего проекта:
```bash
npm install
npm run dev:all
```

### Запуск только фронтенда:
```bash
npm run dev:frontend
```

### Запуск только бэкенда:
```bash
npm run dev:backend
```

## 📡 API Endpoints

### Production (Render):
- Health: `https://psychology-backend.onrender.com/api/health`
- Send: `https://psychology-backend.onrender.com/api/send`

### Development (Local):
- Health: `http://localhost:5000/api/health`
- Send: `http://localhost:5000/api/send`

## 🌐 Environment Variables

### Frontend (.env):
```
VITE_RENDER_API_URL=https://psychology-backend.onrender.com
```

### Backend (.env):
```
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://anubizze.github.io
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
ADMIN_API_KEY=your-admin-key
```
