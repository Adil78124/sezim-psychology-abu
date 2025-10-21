const https = require('https');

// Ваш токен бота
const BOT_TOKEN = '7982241397:AAGzinVEu6w_BgUrTOy2PPyEtyfssMVKJvU';

console.log('🔍 Получаем последние сообщения для определения Chat ID...');

// Функция для получения обновлений (последних сообщений)
function getUpdates() {
  const options = {
    hostname: 'api.telegram.org',
    path: `/bot${BOT_TOKEN}/getUpdates`,
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
        if (response.ok && response.result.length > 0) {
          console.log('✅ Найдены сообщения:');
          response.result.forEach((update, index) => {
            if (update.message) {
              const chat = update.message.chat;
              console.log(`📱 Сообщение ${index + 1}:`);
              console.log(`   👤 От: ${chat.first_name || 'Неизвестно'} ${chat.last_name || ''}`);
              console.log(`   🆔 Chat ID: ${chat.id}`);
              console.log(`   📝 Текст: ${update.message.text || 'Нет текста'}`);
              console.log('');
            }
          });
          
          // Берем последний Chat ID
          const lastMessage = response.result[response.result.length - 1];
          if (lastMessage.message) {
            const chatId = lastMessage.message.chat.id;
            console.log(`🎯 Рекомендуемый Chat ID: ${chatId}`);
            console.log('');
            console.log('📝 Добавьте эту строку в backend/.env:');
            console.log(`TELEGRAM_CHAT_ID=${chatId}`);
          }
        } else {
          console.log('❌ Сообщения не найдены');
          console.log('📝 Отправьте любое сообщение боту и попробуйте снова');
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

getUpdates();
