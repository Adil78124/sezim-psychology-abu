# 🚀 Быстрый старт с Supabase

## 1. Создайте проект в Supabase
- Перейдите на [supabase.com](https://supabase.com)
- Создайте новый проект
- Скопируйте **Project URL** и **anon public key**

## 2. Настройте переменные окружения
Создайте файл `.env` в корне проекта:
```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

## 3. Настройте базу данных
В Supabase Dashboard → **SQL Editor** → выполните скрипт из `supabase-setup.sql`

## 4. Создайте админского пользователя
В Supabase Dashboard → **Authentication → Users** → **Add user**

## 5. Обновите админские email
В `src/components/AdminPanel/AdminPanel.jsx` найдите:
```javascript
const adminEmails = ['admin@example.com']; // Замените на ваш email
```

## 6. Запустите проект
```bash
npm run dev
```

## 7. Протестируйте
- Перейдите на `/admin`
- Войдите с админскими данными
- Добавьте новость с изображением
- Проверьте отображение на главной странице

## 🎉 Готово!
Ваша админка теперь работает с Supabase! 🚀
