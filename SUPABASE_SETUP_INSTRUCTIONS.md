# 🚀 Инструкция по настройке Supabase

## 1. Создайте файл .env

Создайте файл `.env` в корне проекта со следующим содержимым:

```env
VITE_SUPABASE_URL=https://mzmouzcbmyhktvowrztm.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16bW91emNibXloa3R2b3dyenRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzQ4MDAsImV4cCI6MjA1MDU1MDgwMH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8
```

## 2. Настройте базу данных в Supabase Dashboard

### Шаг 1: Выполните SQL скрипт

1. Перейдите в **Supabase Dashboard** → **SQL Editor**
2. Скопируйте и выполните следующий SQL скрипт:

```sql
-- Создание таблицы news
CREATE TABLE IF NOT EXISTS public.news (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание индексов для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_news_created_at ON public.news(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_title ON public.news(title);

-- Включение Row Level Security (RLS)
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

-- Политика для чтения новостей (все могут читать)
CREATE POLICY "Anyone can read news" ON public.news
    FOR SELECT USING (true);

-- Политика для вставки новостей (только аутентифицированные пользователи)
CREATE POLICY "Authenticated users can insert news" ON public.news
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Политика для обновления новостей (только аутентифицированные пользователи)
CREATE POLICY "Authenticated users can update news" ON public.news
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Политика для удаления новостей (только аутентифицированные пользователи)
CREATE POLICY "Authenticated users can delete news" ON public.news
    FOR DELETE USING (auth.role() = 'authenticated');
```

### Шаг 2: Настройте Storage

1. Перейдите в **Storage** → **Buckets**
2. Создайте новый bucket с именем `news-images`
3. Сделайте его публичным (Public bucket: Yes)

### Шаг 3: Настройте политики Storage

Выполните в **SQL Editor**:

```sql
-- Политика для загрузки изображений (только аутентифицированные пользователи)
CREATE POLICY "Authenticated users can upload images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'news-images' 
        AND auth.role() = 'authenticated'
    );

-- Политика для просмотра изображений (все могут просматривать)
CREATE POLICY "Anyone can view images" ON storage.objects
    FOR SELECT USING (bucket_id = 'news-images');

-- Политика для удаления изображений (только аутентифицированные пользователи)
CREATE POLICY "Authenticated users can delete images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'news-images' 
        AND auth.role() = 'authenticated'
    );
```

## 3. Создайте админского пользователя

1. Перейдите в **Authentication** → **Users**
2. Нажмите **Add user**
3. Введите email и пароль для админа
4. Запомните эти данные для входа в админку

## 4. Обновите админские email в коде

В файле `src/components/AdminPanel/AdminPanel.jsx` найдите строку:

```javascript
const adminEmails = ['admin@example.com']; // Замените на ваши админские email
```

Замените на ваш реальный email адрес.

## 5. Протестируйте подключение

1. Запустите проект: `npm run dev`
2. Перейдите на `/admin`
3. Вы увидите тестовый компонент, который покажет статус подключения к Supabase
4. Если подключение успешно, попробуйте войти в админку

## 6. Проверьте работу

1. Войдите в админку с созданными учетными данными
2. Добавьте тестовую новость с изображением
3. Проверьте, что новость появилась в Supabase Dashboard → Table Editor → news
4. Проверьте, что новость отображается на главной странице новостей

## 🎉 Готово!

После выполнения всех шагов ваша админка будет полностью работать с Supabase!
