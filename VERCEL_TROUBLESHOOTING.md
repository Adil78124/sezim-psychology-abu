# 🔧 Исправление проблем с Vercel

## ❌ Проблемы:
1. **Не могу зайти в админ панель**
2. **Обновления не появились в Vercel**
3. **Redeploy не помог**

## ✅ Решение:

### 1. **Проверьте настройки Vercel**
1. Зайдите в **Vercel Dashboard**
2. **Settings → Git**
3. Убедитесь, что используется правильная ветка:
   - **Production Branch:** `main` (не `master`)
   - **Preview Branch:** `main`

### 2. **Настройте переменные окружения**
В **Vercel Dashboard → Settings → Environment Variables**:

```
VITE_SUPABASE_URL=https://mzmouzcbmyhktvowrztm.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16bW91emNibXloa3R2b3dyenRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExMjk5ODQsImV4cCI6MjA3NjcwNTk4NH0.0DmDT1qiHdB8BpdJGRaGFBGQRgQ3HxZISNYHwp_s8iw
```

### 3. **Принудительный деплой**
1. **Vercel Dashboard → Deployments**
2. **Redeploy** последний деплой
3. Или **Trigger New Deployment**

### 4. **Проверьте логи**
1. **Vercel Dashboard → Functions → View Function Logs**
2. Ищите ошибки с Supabase

## 🔍 Диагностика:

### **Проблема с админ панелью:**
- Проверьте, что Supabase Dashboard настроен
- Выполните SQL скрипт из `supabase-setup.sql`
- Создайте админского пользователя

### **Проблема с обновлениями:**
- Убедитесь, что Vercel использует ветку `main`
- Проверьте, что переменные окружения настроены
- Сделайте принудительный redeploy

## 🚀 Быстрое исправление:

### **Шаг 1: Настройте Vercel**
1. **Settings → Git** → Production Branch: `main`
2. **Settings → Environment Variables** → добавьте Supabase переменные
3. **Deployments** → **Redeploy**

### **Шаг 2: Настройте Supabase**
1. Выполните SQL скрипт из `supabase-setup.sql`
2. Создайте bucket `news-images`
3. Создайте админского пользователя

### **Шаг 3: Протестируйте**
1. Перейдите на ваш Vercel URL
2. Попробуйте зайти в `/admin`
3. Войдите с админскими данными

## 📞 Если не помогло:
1. **Переподключите репозиторий** к Vercel
2. **Удалите и создайте заново** проект в Vercel
3. **Проверьте GitHub** - все ли изменения отправлены

**Проблема должна решиться! 🚀**
