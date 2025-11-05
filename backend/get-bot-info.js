const https = require('https');
require('dotenv').config({ path: './backend/.env' });

// Получаем токен бота из переменных окружения
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!BOT_TOKEN) {
  console.error('❌ Ошибка: TELEGRAM_BOT_TOKEN не найден в переменных окружения');
  console.log('📝 Создайте файл backend/.env и добавьте:');
  console.log('TELEGRAM_BOT_TOKEN=your_bot_token_here');
  process.exit(1);
}

console.log('🤖 Получаем информацию о боте...');

// Функция для получения информации о боте
function getBotInfo() {
  const options = {
    hostname: 'api.telegram.org',
    path: `/bot${BOT_TOKEN}/getMe`,
    method: 'GET'
  };

  const req = https.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        if (response.ok) {
          console.log('✅ Бот найден:');
          console.log(`📱 Имя: ${response.result.first_name}`);
          console.log(`🔗 Username: @${response.result.username}`);
          console.log(`🆔 Bot ID: ${response.result.id}`);
          console.log('');
          console.log('📝 Теперь отправьте любое сообщение боту, чтобы получить ваш Chat ID');
          console.log('🔍 Затем запустите: node get-chat-id.js');
        } else {
          console.log('❌ Ошибка:', response.description);
        }
      } catch (err) {
        console.log('❌ Ошибка парсинга:', err.message);
      }
    });
  });

  req.on('error', (err) => {
    console.log('❌ Ошибка запроса:', err.message);
  });

  req.end();
}

getBotInfo();
