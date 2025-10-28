# Руководство по исправлению ошибок деплоя

## Проблемы, которые были исправлены:

### 1. Ошибка Vercel: "Could not find a required file. Name: index.html"

**Причина:** Неправильная конфигурация Vercel для Create React App.

**Решение:**
- Обновлен `vercel.json` с правильной конфигурацией для CRA
- Добавлены правильные маршруты для SPA
- Настроена поддержка API endpoints

### 2. Ошибка GitHub Pages: "Get Pages site failed"

**Причина:** Отсутствие GitHub Actions workflow для автоматического деплоя.

**Решение:**
- Создан `.github/workflows/pages.yml` для автоматического деплоя на GitHub Pages
- Создан `.github/workflows/deploy.yml` как альтернативный вариант
- Обновлен `package.json` с правильной homepage настройкой

## Инструкции по деплою:

### Для Vercel:

1. **Подключите репозиторий к Vercel:**
   - Зайдите на [vercel.com](https://vercel.com)
   - Нажмите "New Project"
   - Выберите ваш GitHub репозиторий
   - Vercel автоматически определит настройки из `vercel.json`

2. **Настройте переменные окружения в Vercel:**
   - В настройках проекта добавьте:
     - `REACT_APP_SUPABASE_URL`
     - `REACT_APP_SUPABASE_ANON_KEY`
     - `REACT_APP_TELEGRAM_BOT_TOKEN`
     - `REACT_APP_TELEGRAM_CHAT_ID`

3. **Деплой:**
   - Vercel автоматически задеплоит при каждом push в main ветку

### Для GitHub Pages:

1. **Включите GitHub Pages в настройках репозитория:**
   - Зайдите в Settings → Pages
   - Выберите "GitHub Actions" как источник
   - Сохраните настройки

2. **Деплой произойдет автоматически:**
   - При каждом push в main ветку
   - GitHub Actions соберет и задеплоит проект

### Ручной деплой на GitHub Pages:

```bash
# Установите зависимости
npm install

# Соберите проект
npm run build

# Задеплойте на GitHub Pages
npm run deploy
```

## Проверка деплоя:

1. **Vercel:** Проверьте URL, который предоставил Vercel
2. **GitHub Pages:** Проверьте URL: `https://yourusername.github.io/psychology`

## Возможные проблемы и решения:

### Если Vercel все еще не находит index.html:
- Убедитесь, что файл `public/index.html` существует
- Проверьте, что в `package.json` правильно указан `homepage: "."`
- Попробуйте удалить и пересоздать проект в Vercel

### Если GitHub Pages не работает:
- Убедитесь, что в настройках репозитория включен GitHub Pages
- Проверьте, что Actions имеют права на запись
- Убедитесь, что workflow файлы находятся в `.github/workflows/`

## Дополнительные настройки:

### Для продакшена:
- Убедитесь, что все переменные окружения настроены
- Проверьте, что API endpoints работают корректно
- Настройте домен (если нужно)

### Мониторинг:
- Vercel предоставляет встроенную аналитику
- GitHub Pages можно мониторить через Actions
- Настройте уведомления о статусе деплоя
