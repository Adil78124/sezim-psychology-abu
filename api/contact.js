// Простейший API для Telegram - CommonJS формат
const https = require('https');

module.exports = async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    return res.status(200).json({ 
      ok: true, 
      message: 'API работает!',
      timestamp: new Date().toISOString()
    });
  }

  if (req.method === 'POST') {
    try {
      const { name, email, phone, subject, message, privacy } = req.body;

      // Простая валидация
      if (!name || !email || !subject || !message) {
        return res.status(400).json({
          ok: false,
          message: 'Заполните все обязательные поля'
        });
      }

      // Получаем переменные окружения
      const token = process.env.TELEGRAM_BOT_TOKEN;
      const chatId = process.env.TELEGRAM_CHAT_ID;

      if (!token || !chatId) {
        console.log('Переменные окружения не найдены:', { token: !!token, chatId: !!chatId });
        return res.status(500).json({
          ok: false,
          message: 'Сервис временно недоступен'
        });
      }

      // Формируем сообщение
      const telegramMessage = `📩 Новое сообщение с сайта Sezim.abu

👤 Имя: ${name}
📧 Email: ${email}
📞 Телефон: ${phone || 'Не указан'}
🎯 Тема: ${subject}

💬 Сообщение:
${message}

⏰ Время: ${new Date().toLocaleString('ru-RU')}`;

      // Отправляем в Telegram через https модуль
      const postData = JSON.stringify({
        chat_id: chatId,
        text: telegramMessage
      });

      const options = {
        hostname: 'api.telegram.org',
        path: `/bot${token}/sendMessage`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const telegramResponse = await new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
          let data = '';
          res.on('data', (chunk) => data += chunk);
          res.on('end', () => {
            try {
              resolve(JSON.parse(data));
            } catch (e) {
              reject(e);
            }
          });
        });
        
        req.on('error', reject);
        req.write(postData);
        req.end();
      });

      console.log('Telegram response:', telegramResponse);

      if (!telegramResponse.ok) {
        throw new Error('Ошибка отправки в Telegram: ' + JSON.stringify(telegramResponse));
      }

      return res.status(200).json({
        ok: true,
        message: 'Сообщение успешно отправлено!'
      });

    } catch (error) {
      console.error('Ошибка:', error);
      return res.status(500).json({
        ok: false,
        message: 'Ошибка при отправке сообщения: ' + error.message
      });
    }
  }

  res.status(405).json({ ok: false, message: 'Метод не разрешен' });
};