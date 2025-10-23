{
  "apps": [
    {
      "name": "psychology-backend",
      "script": "backend/index.js",
      "cwd": "/path/to/sezim.abu.edu.kz",
      "instances": 1,
      "exec_mode": "fork",
      "env": {
        "NODE_ENV": "production",
        "PORT": 5000,
        "FRONTEND_URL": "https://sezim.abu.edu.kz",
        "ADMIN_API_KEY": "sezim-psychology-secret-2025",
        "TELEGRAM_BOT_TOKEN": "7982241397:AAGzinVEu6w_BgUrTOy2PPyEtyfssMVKJvU",
        "TELEGRAM_CHAT_ID": "-1002854667099"
      },
      "error_file": "/var/log/psychology-backend/error.log",
      "out_file": "/var/log/psychology-backend/out.log",
      "log_file": "/var/log/psychology-backend/combined.log",
      "time": true
    }
  ]
}
