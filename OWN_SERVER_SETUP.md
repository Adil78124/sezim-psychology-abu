# Настройка деплоя на собственный хостинг

## 🚀 Настройка GitHub Secrets

Добавьте эти секреты в GitHub репозиторий (Settings → Secrets and variables → Actions):

### **SSH Secrets:**
- `HOST` - IP адрес вашего сервера (например: `192.168.1.100`)
- `USERNAME` - имя пользователя на сервере (например: `root` или `ubuntu`)
- `SSH_KEY` - приватный SSH ключ для доступа к серверу
- `PORT` - SSH порт (обычно `22`)

## 🔧 Настройка сервера

### **1. Установите необходимые пакеты:**
```bash
# Обновите систему
sudo apt update && sudo apt upgrade -y

# Установите Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Установите PM2 (процесс-менеджер)
sudo npm install -g pm2

# Установите Git
sudo apt install git -y

# Установите веб-сервер (Nginx)
sudo apt install nginx -y
```

### **2. Настройте проект:**
```bash
# Клонируйте репозиторий
git clone https://github.com/Anubizze/psychology.git
cd psychology

# Установите зависимости
npm install
cd backend && npm install && cd ..

# Создайте папку для логов
sudo mkdir -p /var/log/psychology-backend
sudo chown $USER:$USER /var/log/psychology-backend
```

### **3. Настройте PM2:**
```bash
# Запустите backend через PM2
pm2 start ecosystem.config.js

# Сохраните конфигурацию PM2
pm2 save

# Настройте автозапуск PM2
pm2 startup
```

### **4. Настройте Nginx:**
```bash
# Создайте конфигурацию Nginx
sudo nano /etc/nginx/sites-available/psychology
```

**Содержимое файла `/etc/nginx/sites-available/psychology`:**
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # Frontend
    location / {
        root /var/www/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Активируйте конфигурацию
sudo ln -s /etc/nginx/sites-available/psychology /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 🔄 Автоматический деплой

После настройки GitHub Actions будет автоматически:
1. ✅ Получать код из GitHub
2. ✅ Устанавливать зависимости
3. ✅ Собирать фронтенд
4. ✅ Перезапускать backend
5. ✅ Копировать файлы в веб-директорию

## 📋 Проверка работы

### **Frontend:**
- http://your-domain.com

### **Backend API:**
- http://your-domain.com/api/health
- http://your-domain.com/api/send

### **PM2 Status:**
```bash
pm2 status
pm2 logs psychology-backend
```

## 🛠️ Troubleshooting

### **Если деплой не работает:**
1. Проверьте SSH ключи
2. Убедитесь, что все секреты добавлены в GitHub
3. Проверьте логи PM2: `pm2 logs psychology-backend`
4. Проверьте логи Nginx: `sudo tail -f /var/log/nginx/error.log`

### **Если API не отвечает:**
1. Проверьте, что backend запущен: `pm2 status`
2. Проверьте порт 5000: `netstat -tlnp | grep 5000`
3. Проверьте конфигурацию Nginx
