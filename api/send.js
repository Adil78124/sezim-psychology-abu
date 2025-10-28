const https = require('https');

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

module.exports = async (req, res) => {
  // Настройка CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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

  // Получаем переменные окружения
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  // Проверка настроек Telegram
  if (!BOT_TOKEN || !CHAT_ID) {
    return res.status(500).json({ 
      error: "Telegram не настроен на сервере" 
    });
  }

  try {
    // Формируем сообщение для Telegram
    const telegramMessage = `📩 Новое сообщение с сайта Sezim Psychology

👤 Имя: ${name || 'Не указано'}
📧 Email: ${email}
${phone ? `📞 Телефон: ${phone}\n` : ''}🎯 Тема: ${subject}

💬 Сообщение:
${message}

⏰ Время: ${new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Almaty' })}`;

    // Отправляем в Telegram
    const result = await sendToTelegram(BOT_TOKEN, CHAT_ID, telegramMessage);
    
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
};