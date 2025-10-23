# 📝 Создайте файл .env

Создайте файл `.env` в корне проекта (рядом с package.json) со следующим содержимым:

```env
VITE_SUPABASE_URL=https://mzmouzcbmyhktvowrztm.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16bW91emNibXloa3R2b3dyenRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExMjk5ODQsImV4cCI6MjA3NjcwNTk4NH0.0DmDT1qiHdB8BpdJGRaGFBGQRgQ3HxZISNYHwp_s8iw
```

## Важно:
1. Файл должен называться именно `.env` (с точкой в начале)
2. Расположите его в корне проекта
3. После создания файла перезапустите dev сервер: `npm run dev`

## Проверка:
После создания файла и перезапуска сервера, перейдите на `/admin` и проверьте тестовый компонент - он должен показать ✅ подключение к Supabase.
