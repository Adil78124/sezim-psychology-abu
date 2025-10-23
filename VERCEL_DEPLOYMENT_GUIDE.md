# 🚀 Деплой на Vercel (рекомендуется)

## ✅ Почему Vercel:
- ✅ **Работает без проблем** с GitHub
- ✅ **Автоматический деплой** при push
- ✅ **Простая настройка** переменных окружения
- ✅ **Бесплатный план** с хорошими лимитами
- ✅ **Поддержка Supabase** из коробки

## 🔧 Настройка Vercel:

### 1. Подключение репозитория
1. Перейдите на [vercel.com](https://vercel.com)
2. **Sign in with GitHub**
3. **Import Project** → выберите `Anubizze/psychology`
4. **Deploy** (настройки по умолчанию подойдут)

### 2. Настройка переменных окружения
В Vercel Dashboard → **Settings → Environment Variables**:

```
VITE_SUPABASE_URL=https://mzmouzcbmyhktvowrztm.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16bW91emNibXloa3R2b3dyenRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExMjk5ODQsImV4cCI6MjA3NjcwNTk4NH0.0DmDT1qiHdB8BpdJGRaGFBGQRgQ3HxZISNYHwp_s8iw
```

### 3. Настройки сборки
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

## 🎯 Результат:
- ✅ **Автоматический деплой** при push в main
- ✅ **Переменные окружения** настроены
- ✅ **Supabase подключен**
- ✅ **Работает без проблем**

## 📋 Следующие шаги:
1. **Настройте Vercel** (5 минут)
2. **Настройте Supabase Dashboard** - выполните SQL скрипт
3. **Протестируйте** на Vercel URL

## 🔄 Альтернативы:
- **Netlify** - аналогично Vercel
- **GitHub Pages** - нужно настроить правила защиты
- **Manual** - скачать артефакты из GitHub Actions

**Vercel - самый простой и надежный вариант! 🚀**
