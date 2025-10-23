# 🚀 Миграция с Firebase на Supabase

## ✅ Что уже сделано

1. **Установлен Supabase SDK** - `@supabase/supabase-js`
2. **Создан файл конфигурации** - `src/supabaseClient.js`
3. **Обновлены все компоненты** для работы с Supabase:
   - `AdminPanel.jsx` - админ панель
   - `Login.jsx` - авторизация
   - `AdminPage.jsx` - страница админа
   - `News.jsx` - отображение новостей

## 🔧 Что нужно настроить

### 1. Создайте проект в Supabase

1. Перейдите на [supabase.com](https://supabase.com)
2. Создайте новый проект
3. Скопируйте **Project URL** и **anon public key**

### 2. Настройте переменные окружения

Создайте файл `.env` в корне проекта:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

### 3. Настройте базу данных

1. В Supabase Dashboard перейдите в **SQL Editor**
2. Выполните SQL скрипт из файла `supabase-setup.sql`
3. Это создаст:
   - Таблицу `news`
   - Bucket для изображений `news-images`
   - Политики безопасности (RLS)
   - Индексы для оптимизации

### 4. Настройте Storage

1. В Supabase Dashboard перейдите в **Storage**
2. Убедитесь, что bucket `news-images` создан
3. Настройте политики доступа (уже включены в SQL скрипте)

### 5. Настройте аутентификацию

1. В Supabase Dashboard перейдите в **Authentication > Settings**
2. Включите **Email** провайдер
3. Настройте **Site URL** (ваш домен)
4. Создайте пользователей в **Authentication > Users**

### 6. Обновите админские email

В файле `src/components/AdminPanel/AdminPanel.jsx` найдите строку:

```javascript
const adminEmails = ['admin@example.com']; // Замените на ваши админские email
```

Замените на ваши реальные админские email адреса.

## 🎯 Основные изменения

### Аутентификация
- **Firebase**: `signInWithEmailAndPassword(auth, email, password)`
- **Supabase**: `supabase.auth.signInWithPassword({ email, password })`

### База данных
- **Firebase**: `collection(db, "news")`
- **Supabase**: `supabase.from('news')`

### Storage
- **Firebase**: `ref(storage, fileName)`
- **Supabase**: `supabase.storage.from('news-images')`

### Real-time подписки
- **Firebase**: `onSnapshot()`
- **Supabase**: `supabase.channel().on('postgres_changes')`

## 🔒 Безопасность

- Включен Row Level Security (RLS)
- Только аутентифицированные пользователи могут создавать/редактировать новости
- Все могут читать новости
- Изображения доступны всем, но загружать могут только авторизованные

## 🧪 Тестирование

1. Запустите проект: `npm run dev`
2. Перейдите на `/admin`
3. Войдите с админскими данными
4. Попробуйте добавить новость с изображением
5. Проверьте, что новость отображается на главной странице

## 📝 Структура таблицы news

```sql
CREATE TABLE news (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🎉 Готово!

После выполнения всех шагов ваша админка будет работать с Supabase вместо Firebase!
