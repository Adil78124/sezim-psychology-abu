# Исправление ошибки деплоя на Vercel

## Проблема
```
Could not find a required file.
  Name: index.html
  Searched in: /vercel/path0/public
Error: Command "npm run build" exited with 1
```

## Анализ проблемы
1. Файл `public/index.html` существует локально
2. Локальная сборка работает корректно
3. Проблема в конфигурации Vercel

## Решения

### Решение 1: Упрощенная конфигурация Vercel
Создан минимальный `vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "build",
  "framework": "create-react-app"
}
```

### Решение 2: Альтернативная конфигурация
Если первое решение не работает, используйте `vercel-alternative.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### Решение 3: Удаление конфигурации
Если ничего не помогает:
1. Удалите `vercel.json`
2. Vercel автоматически определит настройки для Create React App

## Пошаговые инструкции

### Шаг 1: Очистка кэша Vercel
1. Зайдите в настройки проекта на Vercel
2. Перейдите в "Functions" → "Environment Variables"
3. Удалите все переменные окружения
4. Перейдите в "Deployments"
5. Удалите все предыдущие деплои

### Шаг 2: Пересоздание проекта
1. Удалите проект из Vercel
2. Создайте новый проект
3. Подключите тот же репозиторий
4. Vercel автоматически определит настройки

### Шаг 3: Ручная настройка
Если автоматическое определение не работает:
1. В настройках проекта выберите:
   - Framework Preset: "Create React App"
   - Build Command: `npm run build`
   - Output Directory: `build`
   - Install Command: `npm install`

### Шаг 4: Проверка переменных окружения
Убедитесь, что в Vercel настроены переменные:
- `REACT_APP_SUPABASE_URL`
- `REACT_APP_SUPABASE_ANON_KEY`
- `REACT_APP_TELEGRAM_BOT_TOKEN`
- `REACT_APP_TELEGRAM_CHAT_ID`

## Альтернативные платформы

### Netlify
1. Подключите репозиторий к Netlify
2. Настройки:
   - Build command: `npm run build`
   - Publish directory: `build`

### GitHub Pages
1. Включите GitHub Pages в настройках репозитория
2. Выберите "GitHub Actions" как источник
3. Деплой произойдет автоматически

## Проверка локальной сборки
```bash
# Очистка
rm -rf build node_modules package-lock.json
npm install

# Сборка
npm run build

# Проверка
ls -la build/
# Должен быть файл index.html
```

## Отладка
Если проблема сохраняется:
1. Проверьте логи сборки в Vercel
2. Убедитесь, что все файлы загружены в репозиторий
3. Проверьте, что нет конфликтующих файлов конфигурации
4. Попробуйте создать новый репозиторий и скопировать код

## Финальная проверка
После исправления:
1. Локальная сборка должна работать: `npm run build`
2. В папке `build` должен быть файл `index.html`
3. Деплой на Vercel должен пройти успешно
4. Сайт должен открываться по URL Vercel
