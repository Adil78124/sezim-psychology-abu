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

-- Создание bucket для хранения изображений новостей
INSERT INTO storage.buckets (id, name, public) 
VALUES ('news-images', 'news-images', true)
ON CONFLICT (id) DO NOTHING;

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

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггер для автоматического обновления updated_at
CREATE TRIGGER update_news_updated_at 
    BEFORE UPDATE ON public.news 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
