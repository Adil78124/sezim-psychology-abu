// Сервис для отправки email через EmailJS
// Для работы нужно зарегистрироваться на https://www.emailjs.com/

// Конфигурация EmailJS (замените на свои данные)
const EMAILJS_CONFIG = {
  serviceId: 'service_xxxxxxx', // Замените на ваш Service ID
  templateId: 'template_xxxxxxx', // Замените на ваш Template ID
  publicKey: process.env.VITE_EMAILJS_PUBLIC_KEY,
};

// Функция для отправки сообщения
export const sendContactMessage = async (formData) => {
  try {
    // Проверяем, загружен ли EmailJS
    if (typeof window.emailjs === 'undefined') {
      throw new Error('EmailJS не загружен');
    }

    // Подготавливаем данные для отправки
    const templateParams = {
      from_name: formData.name,
      from_email: formData.email,
      phone: formData.phone || 'Не указан',
      subject: formData.subject,
      message: formData.message,
      to_name: 'Sezim.abu',
    };

    // Отправляем email
    const response = await window.emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templateId,
      templateParams,
      EMAILJS_CONFIG.publicKey
    );

    return {
      ok: true,
      message: 'Сообщение успешно отправлено!',
      response: response
    };

  } catch (error) {
    console.error('Ошибка при отправке email:', error);
    
    return {
      ok: false,
      message: 'Ошибка при отправке сообщения. Попробуйте еще раз.',
      error: error
    };
  }
};

// Функция для инициализации EmailJS
export const initializeEmailJS = () => {
  return new Promise((resolve, reject) => {
    if (typeof window.emailjs !== 'undefined') {
      resolve();
      return;
    }

    // Загружаем EmailJS скрипт
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
    script.onload = () => {
      // Инициализируем EmailJS
      window.emailjs.init(EMAILJS_CONFIG.publicKey);
      resolve();
    };
    script.onerror = () => {
      reject(new Error('Не удалось загрузить EmailJS'));
    };
    document.head.appendChild(script);
  });
};

// Альтернативная функция для отправки через Formspree (если EmailJS не подходит)
export const sendViaFormspree = async (formData) => {
  try {
    const response = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || 'Не указан',
        subject: formData.subject,
        message: formData.message,
      }),
    });

    if (response.ok) {
      return {
        ok: true,
        message: 'Сообщение успешно отправлено!'
      };
    } else {
      throw new Error('Ошибка сервера');
    }
  } catch (error) {
    console.error('Ошибка при отправке через Formspree:', error);
    return {
      ok: false,
      message: 'Ошибка при отправке сообщения. Попробуйте еще раз.'
    };
  }
};

// Функция для отправки через Netlify Forms (если сайт на Netlify)
export const sendViaNetlifyForms = async (formData) => {
  try {
    const formDataToSend = new FormData();
    formDataToSend.append('form-name', 'contact');
    formDataToSend.append('name', formData.name);
    formDataToSend.append('email', formData.email);
    formDataToSend.append('phone', formData.phone || '');
    formDataToSend.append('subject', formData.subject);
    formDataToSend.append('message', formData.message);

    const response = await fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(formDataToSend).toString()
    });

    if (response.ok) {
      return {
        ok: true,
        message: 'Сообщение успешно отправлено!'
      };
    } else {
      throw new Error('Ошибка сервера');
    }
  } catch (error) {
    console.error('Ошибка при отправке через Netlify Forms:', error);
    return {
      ok: false,
      message: 'Ошибка при отправке сообщения. Попробуйте еще раз.'
    };
  }
};
