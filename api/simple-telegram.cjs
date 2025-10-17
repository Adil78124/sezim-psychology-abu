const https = require('https');

module.exports = async (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/json');
    
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    
    if (!token || !chatId) {
      return res.status(500).json({
        ok: false,
        message: 'Переменные окружения не найдены',
        hasToken: !!token,
        hasChatId: !!chatId
      });
    }
    
    // Простое сообщение для теста
    const message = 'Тест из simple-telegram.cjs - ' + new Date().toISOString();
    
    const data = JSON.stringify({
      chat_id: chatId,
      text: message
    });
    
    const options = {
      hostname: 'api.telegram.org',
      path: `/bot${token}/sendMessage`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };
    
    const result = await new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        res.on('end', () => {
          try {
            resolve(JSON.parse(responseData));
          } catch (e) {
            reject(e);
          }
        });
      });
      
      req.on('error', (error) => {
        reject(error);
      });
      
      req.write(data);
      req.end();
    });
    
    res.status(200).json({
      ok: true,
      message: 'Простое сообщение отправлено!',
      telegramResult: result
    });
    
  } catch (error) {
    console.error('Ошибка в simple-telegram:', error);
    res.status(500).json({
      ok: false,
      message: 'Ошибка: ' + error.message,
      stack: error.stack
    });
  }
};
