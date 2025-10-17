// Простейший API для Telegram
export default async function handler(req, res) {
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

      // Отправляем в Telegram через fetch
      const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: telegramMessage
        })
      });

      if (!response.ok) {
        throw new Error('Ошибка отправки в Telegram');
      }

      return res.status(200).json({
        ok: true,
        message: 'Сообщение успешно отправлено!'
      });

    } catch (error) {
      console.error('Ошибка:', error);
      return res.status(500).json({
        ok: false,
        message: 'Ошибка при отправке сообщения'
      });
    }
  }

  res.status(405).json({ ok: false, message: 'Метод не разрешен' });
}
