{
  "apps": [
    {
      "name": "psychology-backend",
      "script": "index.js",
      "cwd": "/path/to/sezim.abu.edu.kz/backend",
      "instances": 1,
      "exec_mode": "fork",
      "env": {
        "NODE_ENV": "production",
        "PORT": 5000,
        "FRONTEND_URL": "https://sezim.abu.edu.kz"
      },
      // ⚠️ ВАЖНО: Секретные данные (токены, API ключи) должны быть в переменных окружения
      // Используйте: pm2 start ecosystem.config.js --env production
      // Или настройте переменные окружения в системе
      // Не храните секреты в этом файле!
      "error_file": "/var/log/psychology-backend/error.log",
      "out_file": "/var/log/psychology-backend/out.log",
      "log_file": "/var/log/psychology-backend/combined.log",
      "time": true
    }
  ]
}
