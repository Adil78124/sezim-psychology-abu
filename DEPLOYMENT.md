# Руководство по деплою и интеграции

## 📦 Сборка проекта для production

### 1. Подготовка к сборке

```bash
# Установка зависимостей
npm install

# Сборка проекта
npm run build
```

После выполнения команды в папке `dist/` появятся готовые файлы для деплоя.

### 2. Проверка сборки локально

```bash
npm run preview
```

Откроется preview production версии на `http://localhost:4173`

## 🌐 Варианты деплоя

### Вариант 1: Netlify (Рекомендуется)

1. Зарегистрируйтесь на [Netlify](https://www.netlify.com/)
2. Подключите ваш GitHub репозиторий
3. Настройки сборки:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
4. Добавьте файл `netlify.toml` в корень проекта:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Вариант 2: Vercel

1. Зарегистрируйтесь на [Vercel](https://vercel.com/)
2. Импортируйте проект из Git
3. Vercel автоматически определит настройки для Vite
4. Нажмите Deploy

### Вариант 3: GitHub Pages

1. Установите пакет для деплоя:

```bash
npm install --save-dev gh-pages
```

2. Добавьте в `package.json`:

```json
{
  "homepage": "https://username.github.io/repository-name",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

3. Обновите `vite.config.js`:

```javascript
export default defineConfig({
  base: '/repository-name/',
  plugins: [react()],
  // ...
});
```

4. Деплой:

```bash
npm run deploy
```

### Вариант 4: На собственный сервер

1. Соберите проект:

```bash
npm run build
```

2. Загрузите содержимое папки `dist/` на ваш сервер

3. Настройте веб-сервер (Nginx пример):

```nginx
server {
    listen 80;
    server_name sezim.kz www.sezim.kz;

    root /var/www/sezim/dist;
    index index.html;

    # Для корректной работы React Router
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Кэширование статических файлов
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip сжатие
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss;
}
```

4. Перезапустите Nginx:

```bash
sudo systemctl restart nginx
```

## 🔗 Интеграция с основным сайтом АБУ

### Вариант 1: Поддомен

1. Создайте CNAME запись в DNS:
   ```
   sezim.abu.edu.kz → ваш-сервер-или-cdn
   ```

2. Настройте SSL сертификат (Let's Encrypt):

```bash
sudo certbot --nginx -d sezim.abu.edu.kz
```

### Вариант 2: Подключение через iframe

На основном сайте АБУ добавьте:

```html
<iframe 
  src="https://sezim.abu.edu.kz" 
  width="100%" 
  height="100%" 
  frameborder="0"
  title="Центр психологической поддержки Sezim"
></iframe>
```

### Вариант 3: Интеграция как отдельного раздела

1. Разместите приложение по адресу: `https://abu.edu.kz/sezim/`

2. Обновите `vite.config.js`:

```javascript
export default defineConfig({
  base: '/sezim/',
  plugins: [react()],
  // ...
});
```

3. Добавьте ссылку в главное меню сайта АБУ

## 🖼️ Добавление изображений

Перед деплоем добавьте изображения в папку `public/images/`:

- `about.jpg` - для секции "О нас"
- `psychologist-1.jpg` до `psychologist-6.jpg` - фото психологов
- `news-featured.jpg` - главная новость
- `news-1.jpg` до `news-6.jpg` - новости
- `og-image.jpg` - для социальных сетей (1200x630px)

### Рекомендуемые размеры:

- Фотографии психологов: 600x600px
- Изображение "О нас": 800x600px
- Новости: 800x500px
- OG изображение: 1200x630px

### Оптимизация изображений

Перед загрузкой оптимизируйте изображения:

1. Используйте [TinyPNG](https://tinypng.com/) или [Squoosh](https://squoosh.app/)
2. Форматы: WebP (основной), JPEG/PNG (запасной)
3. Максимальный размер файла: 200KB

## 🔐 SSL сертификат (HTTPS)

### Для собственного сервера:

```bash
# Установка certbot
sudo apt-get install certbot python3-certbot-nginx

# Получение сертификата
sudo certbot --nginx -d sezim.kz -d www.sezim.kz

# Автоматическое обновление
sudo certbot renew --dry-run
```

## 📊 Настройка аналитики

### Google Analytics

1. Создайте аккаунт на [Google Analytics](https://analytics.google.com/)
2. Получите Tracking ID (например, G-XXXXXXXXXX)
3. Добавьте в `index.html` перед закрывающим `</head>`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### Yandex Metrica

```html
<!-- Yandex.Metrika counter -->
<script type="text/javascript" >
   (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
   m[i].l=1*new Date();
   for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
   k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
   (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

   ym(XXXXXXXX, "init", {
        clickmap:true,
        trackLinks:true,
        accurateTrackBounce:true,
        webvisor:true
   });
</script>
```

## 🚀 Continuous Deployment (CI/CD)

### GitHub Actions

Создайте `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build
      run: npm run build
      
    - name: Deploy to Netlify
      uses: nwtgck/actions-netlify@v2
      with:
        publish-dir: './dist'
        production-deploy: true
      env:
        NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
        NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

## 📞 Поддержка

При возникновении вопросов по деплою обращайтесь:

- **Email**: dev@sezim.kz
- **Telegram**: @sezim_support
- **Документация Vite**: https://vitejs.dev/guide/

## ✅ Чеклист перед деплоем

- [ ] Все изображения добавлены в `public/images/`
- [ ] Изображения оптимизированы
- [ ] Контактные данные обновлены
- [ ] Данные психологов актуальны
- [ ] Google Analytics настроен
- [ ] SSL сертификат получен
- [ ] Тестирование на разных устройствах пройдено
- [ ] Проверка всех форм обратной связи
- [ ] SEO метатеги заполнены
- [ ] Favicon добавлен

---

© 2025 Sezim - Центр психологической поддержки

