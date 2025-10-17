// Максимально простой API для Telegram
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

  // GET запрос - показываем тестовую страницу
  if (req.method === 'GET') {
    if (req.url && req.url.includes('test=1')) {
      const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Test Telegram API</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
        button { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin: 10px; }
        button:hover { background: #0056b3; }
        .result { margin-top: 20px; padding: 15px; border-radius: 5px; }
        .success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; }
        .error { background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; }
        input, textarea { width: 100%; padding: 8px; margin: 5px 0; border: 1px solid #ddd; border-radius: 4px; }
    </style>
</head>
<body>
    <h1>🧪 Тест Telegram API</h1>
    
    <h3>1. Проверка API:</h3>
    <button onclick="testAPI()">Тест GET /api/contact</button>
    
    <h3>2. Отправка тестового сообщения:</h3>
    <button onclick="sendTestMessage()">Отправить тестовое сообщение в Telegram</button>
    
    <h3>3. Отправка кастомного сообщения:</h3>
    <form onsubmit="sendCustomMessage(event)">
        <input type="text" id="name" placeholder="Имя" value="Тест" required>
        <input type="email" id="email" placeholder="Email" value="test@example.com" required>
        <input type="text" id="subject" placeholder="Тема" value="Тестовое сообщение" required>
        <textarea id="message" placeholder="Сообщение" required>Это тестовое сообщение из API страницы!</textarea>
        <button type="submit">Отправить в Telegram</button>
    </form>
    
    <div id="result"></div>

    <script>
        async function testAPI() {
            try {
                const response = await fetch('/api/contact');
                const data = await response.json();
                showResult('API Test', response.status, data);
            } catch (error) {
                showResult('API Test', 'ERROR', { error: error.message });
            }
        }

        async function sendTestMessage() {
            const testData = {
                name: "API Test",
                email: "api@test.com",
                phone: "+77771234567",
                subject: "Тест из API",
                message: "Это тестовое сообщение отправленное прямо из API!",
                privacy: true
            };

            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(testData)
                });
                const data = await response.json();
                showResult('Test Message', response.status, data);
            } catch (error) {
                showResult('Test Message', 'ERROR', { error: error.message });
            }
        }

        async function sendCustomMessage(event) {
            event.preventDefault();
            
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value || '',
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value,
                privacy: true
            };

            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                const data = await response.json();
                showResult('Custom Message', response.status, data);
            } catch (error) {
                showResult('Custom Message', 'ERROR', { error: error.message });
            }
        }

        function showResult(type, status, data) {
            const result = document.getElementById('result');
            const isSuccess = status === 200 && data.ok;
            result.innerHTML = \`
                <div class="\${isSuccess ? 'success' : 'error'}">
                    <h4>\${type} - Status: \${status}</h4>
                    <pre>\${JSON.stringify(data, null, 2)}</pre>
                </div>
            \`;
        }
    </script>
</body>
</html>`;
      
      res.setHeader('Content-Type', 'text/html');
      return res.status(200).send(html);
    }
    
    return res.status(200).json({ 
      ok: true, 
      message: 'API работает!',
      timestamp: new Date().toISOString()
    });
  }

  // POST запрос - отправляем в Telegram
  if (req.method === 'POST') {
    try {
      const { name, email, phone, subject, message, privacy } = req.body;

      // Валидация
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

      // Отправляем в Telegram
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