// API endpoint для обработки формы контактов через Telegram Bot
module.exports = async function handler(req, res) {
  // Добавляем CORS заголовки
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Обработка OPTIONS запроса для CORS
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Тестовый GET запрос
  if (req.method === 'GET') {
    return res.status(200).json({ 
      ok: true, 
      message: 'API endpoint работает!',
      timestamp: new Date().toISOString()
    });
  }

  // Проверяем метод запроса
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      ok: false, 
      message: 'Метод не разрешен. Используйте POST.' 
    });
  }

  try {
    // Получаем данные из формы
    const { name, email, phone, subject, message, privacy } = req.body;

    // Валидация обязательных полей
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        ok: false,
        message: 'Заполните все обязательные поля'
      });
    }

    // Валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        ok: false,
        message: 'Некорректный email адрес'
      });
    }

    // Проверка согласия с политикой конфиденциальности
    if (!privacy) {
      return res.status(400).json({
        ok: false,
        message: 'Необходимо согласие с политикой конфиденциальности'
      });
    }

    // Получаем токен и chat_id из переменных окружения
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    // Проверяем наличие токена и chat_id
    if (!token || !chatId) {
      console.error('TELEGRAM_BOT_TOKEN или TELEGRAM_CHAT_ID не настроены');
      return res.status(500).json({
        ok: false,
        message: 'Сервис временно недоступен. Попробуйте позже.'
      });
    }

    // Формируем сообщение для Telegram
    const telegramMessage = `📩 *Новое сообщение с сайта Sezim.abu*

👤 *Имя:* ${name}
📧 *Email:* ${email}
📞 *Телефон:* ${phone || 'Не указан'}
🎯 *Тема:* ${subject}

💬 *Сообщение:*
${message}

⏰ *Время:* ${new Date().toLocaleString('ru-RU')}
🌐 *IP:* ${req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'Неизвестно'}`;

    // Отправляем сообщение в Telegram
    const telegramResponse = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: telegramMessage,
        parse_mode: 'Markdown'
      }),
    });

    const telegramData = await telegramResponse.json();
    console.log('Telegram response:', telegramData);

    if (!telegramResponse.ok) {
      console.error('Ошибка отправки в Telegram:', telegramData);
      return res.status(500).json({
        ok: false,
        message: 'Ошибка при отправке сообщения. Попробуйте еще раз.'
      });
    }

    // Успешный ответ
    return res.status(200).json({
      ok: true,
      message: 'Сообщение успешно отправлено! Мы свяжемся с вами в ближайшее время.'
    });

  } catch (error) {
    console.error('Ошибка при обработке формы контактов:', error);
    
    return res.status(500).json({
      ok: false,
      message: 'Произошла ошибка при отправке сообщения. Попробуйте еще раз.'
    });
  }
}
