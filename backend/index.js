require('dotenv').config();
const express = require('express');
const https = require('https');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());

// Ограничение запросов — защита от абуза
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 минута
  max: 10,             // максимум 10 запросов в минуту с одного IP
  message: { error: "Слишком много запросов. Подождите немного." }
});
app.use("/api/", limiter);

// Функция для отправки сообщения в Telegram
function sendToTelegram(token, chatId, text) {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams({
      chat_id: chatId,
      text: text
    });

    const options = {
      hostname: 'api.telegram.org',
      path: `/bot${token}/sendMessage`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(params.toString())
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          console.log('📥 Ответ от Telegram:', parsed.ok ? '✅ OK' : '❌ ' + parsed.description);
          if (parsed.ok) {
            resolve(parsed);
          } else {
            reject(new Error(parsed.description || 'Telegram API error'));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(params.toString());
    req.end();
  });
}

// Проверка настроек Telegram при старте
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

if (!BOT_TOKEN || !CHAT_ID) {
  console.error('❌ TELEGRAM_BOT_TOKEN или TELEGRAM_CHAT_ID не настроены в .env файле');
  console.log('⚠️  Добавьте их для работы отправки сообщений');
} else {
  console.log('✅ Telegram Bot настроен и готов к отправке сообщений');
  console.log(`📱 Chat ID: ${CHAT_ID}`);
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    ok: true, 
    status: 'Backend работает!',
    timestamp: new Date().toISOString()
  });
});

// Endpoint для отправки сообщений в Telegram
app.post('/api/send', async (req, res) => {
  const { email, subject, message, name, phone } = req.body || {};
  
  // Валидация обязательных полей
  if (!email || !subject || !message) {
    return res.status(400).json({ 
      error: "Поля email, subject и message обязательны" 
    });
  }

  // Валидация email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      error: "Некорректный email адрес" 
    });
  }

  // Проверка настроек Telegram
  if (!BOT_TOKEN || !CHAT_ID) {
    return res.status(500).json({ 
      error: "Telegram не настроен на сервере" 
    });
  }

  try {
    // Формируем простое текстовое сообщение для Telegram
    const telegramMessage = `📩 Новое сообщение с сайта Sezim Psychology

👤 Имя: ${name || 'Не указано'}
📧 Email: ${email}
${phone ? `📞 Телефон: ${phone}\n` : ''}🎯 Тема: ${subject}

💬 Сообщение:
${message}

⏰ Время: ${new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Almaty' })}`;

    console.log('📤 Отправляю сообщение:', telegramMessage.substring(0, 100) + '...');
    console.log('📏 Длина сообщения:', telegramMessage.length);

    // Отправляем в Telegram
    const result = await sendToTelegram(BOT_TOKEN, CHAT_ID, telegramMessage);
    
    console.log('✅ Сообщение успешно отправлено в Telegram');
    console.log(`   От: ${name || 'Аноним'} (${email})`);
    console.log(`   Тема: ${subject}`);
    
    return res.json({ 
      ok: true, 
      message: 'Сообщение успешно отправлено! Мы свяжемся с вами в ближайшее время.',
      telegramMessageId: result.result.message_id
    });
    
  } catch (err) {
    console.error("❌ Ошибка отправки в Telegram:", err.message);
    return res.status(500).json({ 
      error: "Не удалось отправить сообщение", 
      details: err.message 
    });
  }
});

// Endpoint для массовой рассылки в Telegram (опционально, с защитой)
app.post('/api/send-bulk', async (req, res) => {
  const { message } = req.body || {};
  
  // Дополнительная защита - требуем API ключ
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.ADMIN_API_KEY) {
    return res.status(403).json({ 
      error: "Доступ запрещен. Требуется API ключ администратора" 
    });
  }

  if (!message) {
    return res.status(400).json({ 
      error: "Поле message обязательно" 
    });
  }

  if (!BOT_TOKEN || !CHAT_ID) {
    return res.status(500).json({ 
      error: "Telegram не настроен на сервере" 
    });
  }

  try {
    // Формируем сообщение для массовой рассылки
    const telegramMessage = `📢 Рассылка от Sezim Psychology

${message}

⏰ ${new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Almaty' })}`;

    // Отправляем в Telegram
    await sendToTelegram(BOT_TOKEN, CHAT_ID, telegramMessage);
    
    console.log('✅ Массовая рассылка отправлена в Telegram');
    
    return res.json({ 
      ok: true, 
      message: 'Рассылка успешно отправлена в группу'
    });
    
  } catch (err) {
    console.error("❌ Ошибка массовой рассылки:", err);
    return res.status(500).json({ 
      error: "Ошибка при массовой рассылке", 
      details: err.message 
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint не найден" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Ошибка сервера:', err);
  res.status(500).json({ error: "Внутренняя ошибка сервера" });
});

// Запуск сервера
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Backend запущен на порту ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📬 Send endpoint: http://localhost:${PORT}/api/send\n`);
});

