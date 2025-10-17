// API endpoint для обработки формы контактов
export default function handler(req, res) {
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

    // Здесь можно добавить отправку email через сервис (например, EmailJS, Nodemailer, SendGrid)
    // Пока что просто логируем данные
    console.log('Новое сообщение с формы контактов:', {
      name,
      email,
      phone: phone || 'Не указан',
      subject,
      message,
      timestamp: new Date().toISOString(),
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress
    });

    // В реальном проекте здесь бы была отправка email:
    // await sendEmail({
    //   to: 'admin@sezim.abu.kz',
    //   subject: `Новое сообщение: ${subject}`,
    //   html: `
    //     <h3>Новое сообщение с сайта Sezim.abu</h3>
    //     <p><strong>Имя:</strong> ${name}</p>
    //     <p><strong>Email:</strong> ${email}</p>
    //     <p><strong>Телефон:</strong> ${phone || 'Не указан'}</p>
    //     <p><strong>Тема:</strong> ${subject}</p>
    //     <p><strong>Сообщение:</strong></p>
    //     <p>${message.replace(/\n/g, '<br>')}</p>
    //     <p><em>Отправлено: ${new Date().toLocaleString('ru-RU')}</em></p>
    //   `
    // });

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
