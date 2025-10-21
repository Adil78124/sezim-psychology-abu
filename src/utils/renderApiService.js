// Сервис для отправки сообщений через Render API
// Замените YOUR_RENDER_URL на ваш URL с Render

const RENDER_API_URL = import.meta.env.VITE_RENDER_API_URL || 'https://psychology-jmdr.onrender.com';

// Функция для отправки сообщения через Render API
export const sendContactMessage = async (formData) => {
  try {
    console.log('Отправка сообщения через Render API...');
    
    const response = await fetch(`${RENDER_API_URL}/api/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        name: formData.name || 'Не указано',
        phone: formData.phone || 'Не указан',
      }),
    });

    const result = await response.json();

    if (response.ok) {
      return {
        ok: true,
        message: 'Сообщение успешно отправлено!',
        response: result
      };
    } else {
      throw new Error(result.error || 'Ошибка сервера');
    }

  } catch (error) {
    console.error('Ошибка при отправке через Render API:', error);
    
    // Проверяем, если это ошибка сети (сервер не запущен)
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return {
        ok: false,
        message: 'Backend сервер не запущен. Запустите: cd backend && npm start',
        error: error
      };
    }
    
    return {
      ok: false,
      message: error.message || 'Ошибка при отправке сообщения. Попробуйте еще раз.',
      error: error
    };
  }
};

// Функция для проверки статуса API
export const checkApiHealth = async () => {
  try {
    const response = await fetch(`${RENDER_API_URL}/api/health`);
    const result = await response.json();
    
    return {
      ok: response.ok,
      status: result.status,
      timestamp: result.timestamp
    };
  } catch (error) {
    console.error('Ошибка при проверке API:', error);
    return {
      ok: false,
      error: error.message
    };
  }
};

// Функция для отправки подписки на новости
export const subscribeToNews = async (email) => {
  try {
    const response = await fetch(`${RENDER_API_URL}/api/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        source: 'website'
      }),
    });

    const result = await response.json();

    if (response.ok) {
      return {
        ok: true,
        message: 'Подписка успешно оформлена!',
        response: result
      };
    } else {
      throw new Error(result.error || 'Ошибка сервера');
    }

  } catch (error) {
    console.error('Ошибка при подписке:', error);
    return {
      ok: false,
      message: error.message || 'Ошибка при оформлении подписки. Попробуйте еще раз.',
      error: error
    };
  }
};
