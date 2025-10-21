const https = require('https');

// Ваш токен бота
const BOT_TOKEN = '7982241397:AAGzinVEu6w_BgUrTOy2PPyEtyfssMVKJvU';

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
