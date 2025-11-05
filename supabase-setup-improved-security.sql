-- ⚠️ ВНИМАНИЕ: Это улучшенная версия с более строгими политиками безопасности
-- Используйте это для обновления существующих политик

-- Список email адресов администраторов (обновите под свои)
-- В PostgreSQL можно использовать массив или функцию
CREATE OR REPLACE FUNCTION is_admin_email(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN user_email IN (
    'kairatovadil7@gmail.com',
    'haval.semey@mail.ru'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Удаляем старые политики (если они есть)
DROP POLICY IF EXISTS "Authenticated users can insert news" ON public.news;
DROP POLICY IF EXISTS "Authenticated users can update news" ON public.news;
DROP POLICY IF EXISTS "Authenticated users can delete news" ON public.news;

-- Создаем улучшенные политики с проверкой админов
-- Только админы могут добавлять новости
CREATE POLICY "Only admins can insert news" ON public.news
    FOR INSERT 
    WITH CHECK (
        auth.role() = 'authenticated' 
        AND is_admin_email((auth.jwt() ->> 'email')::TEXT)
    );

-- Только админы могут обновлять новости
CREATE POLICY "Only admins can update news" ON public.news
    FOR UPDATE 
    USING (
        auth.role() = 'authenticated' 
        AND is_admin_email((auth.jwt() ->> 'email')::TEXT)
    );

-- Только админы могут удалять новости
CREATE POLICY "Only admins can delete news" ON public.news
    FOR DELETE 
    USING (
        auth.role() = 'authenticated' 
        AND is_admin_email((auth.jwt() ->> 'email')::TEXT)
    );

-- Политика для чтения остается открытой (все могут читать)
-- CREATE POLICY "Anyone can read news" ON public.news
--     FOR SELECT USING (true);
-- (Эту политику не нужно менять, если она уже есть)

-- Обновляем политики для Storage (изображения)
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete images" ON storage.objects;

-- Только админы могут загружать изображения
CREATE POLICY "Only admins can upload images" ON storage.objects
    FOR INSERT 
    WITH CHECK (
        bucket_id = 'news-images' 
        AND auth.role() = 'authenticated'
        AND is_admin_email((auth.jwt() ->> 'email')::TEXT)
    );

-- Только админы могут удалять изображения
CREATE POLICY "Only admins can delete images" ON storage.objects
    FOR DELETE 
    USING (
        bucket_id = 'news-images' 
        AND auth.role() = 'authenticated'
        AND is_admin_email((auth.jwt() ->> 'email')::TEXT)
    );

-- Политика для просмотра изображений остается открытой (все могут просматривать)
-- CREATE POLICY "Anyone can view images" ON storage.objects
--     FOR SELECT USING (bucket_id = 'news-images');
-- (Эту политику не нужно менять, если она уже есть)

