// Vercel Serverless Function для отправки сообщений в Telegram
import https from 'https';

// Функция для отправки в Telegram
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

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Health check
  if (req.method === 'GET') {
    return res.status(200).json({
      ok: true,
      status: 'Telegram API работает!',
      timestamp: new Date().toISOString()
    });
  }

  // Only POST allowed
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, subject, message, name, phone } = req.body || {};

    // Validation
    if (!email || !subject || !message) {
      return res.status(400).json({
        error: 'Поля email, subject и message обязательны'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Некорректный email адрес'
      });
    }

    // Get Telegram credentials from environment
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (!BOT_TOKEN || !CHAT_ID) {
      console.error('Telegram credentials not configured');
      return res.status(500).json({
        error: 'Сервис временно недоступен'
      });
    }

    // Format message
    const telegramMessage = `📩 Новое сообщение с сайта Sezim Psychology

👤 Имя: ${name || 'Не указано'}
📧 Email: ${email}
${phone ? `📞 Телефон: ${phone}\n` : ''}🎯 Тема: ${subject}

💬 Сообщение:
${message}

⏰ Время: ${new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Almaty' })}`;

    // Send to Telegram
    await sendToTelegram(BOT_TOKEN, CHAT_ID, telegramMessage);

    console.log('✅ Message sent to Telegram');
    console.log(`   From: ${name || 'Anonymous'} (${email})`);

    return res.status(200).json({
      ok: true,
      message: 'Сообщение успешно отправлено! Мы свяжемся с вами в ближайшее время.'
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    return res.status(500).json({
      error: 'Не удалось отправить сообщение',
      details: error.message
    });
  }
}

