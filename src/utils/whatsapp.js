// Утилита для работы с WhatsApp
export const openWhatsApp = (message = '') => {
  const defaultMessage = 'Здравствуйте! Хочу записаться на консультацию в центр Sezim.abu.';
  const finalMessage = message || defaultMessage;
  
  console.log('Открываем WhatsApp с сообщением:', finalMessage);
  
  try {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(finalMessage)}`;
    console.log('WhatsApp URL:', whatsappUrl);
    window.open(whatsappUrl, '_blank');
  } catch (error) {
    console.error('Ошибка при открытии WhatsApp:', error);
    alert('Не удалось открыть WhatsApp. Попробуйте еще раз.');
  }
};

// Функция для записи к конкретному психологу
export const openWhatsAppForPsychologist = (psychologistName, language = 'ru') => {
  console.log('openWhatsAppForPsychologist вызвана:', { psychologistName, language });
  
  const messages = {
    ru: `Здравствуйте! Хочу записаться на консультацию к ${psychologistName}.`,
    kz: `Сәлеметсіз бе! ${psychologistName} дегенге кеңеске жазылғым келеді.`,
  };
  
  const message = messages[language] || messages.ru;
  console.log('Выбранное сообщение:', message);
  openWhatsApp(message);
};

// Функция для общей записи
export const openWhatsAppForGeneralAppointment = (language = 'ru') => {
  const messages = {
    ru: 'Здравствуйте! Хочу записаться на консультацию в центр психологической поддержки студентов Sezim.abu.',
    kz: 'Сәлеметсіз бе! Sezim.abu студенттерге психологиялық қолдау орталығына кеңеске жазылғым келеді.',
  };
  
  const message = messages[language] || messages.ru;
  openWhatsApp(message);
};
