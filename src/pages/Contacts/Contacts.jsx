import { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import './Contacts.css';

const Contacts = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    privacy: false,
  });

  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = t({ ru: 'Обязательное поле', kz: 'Міндетті өріс' });
    }

    if (!formData.email.trim()) {
      newErrors.email = t({ ru: 'Обязательное поле', kz: 'Міндетті өріс' });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t({ ru: 'Некорректный email', kz: 'Қате email' });
    }

    if (!formData.subject) {
      newErrors.subject = t({ ru: 'Обязательное поле', kz: 'Міндетті өріс' });
    }

    if (!formData.message.trim()) {
      newErrors.message = t({ ru: 'Обязательное поле', kz: 'Міндетті өріс' });
    }

    if (!formData.privacy) {
      newErrors.privacy = t({
        ru: 'Необходимо согласие с политикой конфиденциальности',
        kz: 'Құпиялылық саясатымен келісу қажет',
      });
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setStatus(t({ ru: 'Отправка...', kz: 'Жіберілуде...' }));

    try {
      // Отправляем сообщение через API endpoint (работает на Vercel)
      const response = await fetch('/api/contact.mjs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.ok) {
        setStatus(t({ 
          ru: '✅ Сообщение успешно отправлено! Мы свяжемся с вами в ближайшее время.', 
          kz: '✅ Хабарлама сәтті жіберілді! Біз жақын арада сізбен хабарласамыз.' 
        }));
        
        // Очищаем форму
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
          privacy: false,
        });
        setErrors({});
      } else {
        setStatus(t({ 
          ru: `❌ ${data.message}`, 
          kz: `❌ ${data.message}` 
        }));
      }
    } catch (error) {
      console.error('Ошибка при отправке формы:', error);
      setStatus(t({ 
        ru: '⚠️ Ошибка соединения. Попробуйте еще раз.', 
        kz: '⚠️ Байланыс қатесі. Қайталап көріңіз.' 
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contacts-page">
      {/* Page Header */}
      <section className="page-header">
        <div className="container">
          <h1>{t({ ru: 'Свяжитесь с нами', kz: 'Бізбен байланысыңыз' })}</h1>
          <p>
            {t({
              ru: 'Мы всегда рады помочь вам и ответить на ваши вопросы',
              kz: 'Біз сізге көмектесіп, сұрақтарыңызға жауап беруге әрқашан қуаныштымыз',
            })}
          </p>
        </div>
      </section>

      {/* Contact Info */}
      <section className="contact-info">
        <div className="container">
          <div className="contact-cards">
            <div className="contact-card">
              <div className="contact-icon">📍</div>
              <h3>{t({ ru: 'Адрес', kz: 'Мекенжай' })}</h3>
              <p>{t({ 
                ru: 'Область Абай, город Семей, улица Шмидта 44', 
                kz: 'Абай облысы, Семей қаласы, Шмидт көшесі 44' 
              })}</p>
              <p>{t({ 
                ru: '3 корпус Alikhan Bokeikhan University, 15 кабинет', 
                kz: 'Alikhan Bokeikhan University 3 корпус, 15 кабинет' 
              })}</p>
            </div>

            <div className="contact-card">
              <div className="contact-icon">📞</div>
              <h3>{t({ ru: 'Телефоны', kz: 'Телефондар' })}</h3>
              <p>
                <a href="tel:+77056250389" style={{ color: 'inherit', textDecoration: 'none' }}>
                  +7 (705) 625-03-89
                </a>
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginTop: '0.5rem' }}>
                {t({ ru: 'Телефоны доверия:', kz: 'Сенім телефондары:' })}
              </p>
              <p style={{ fontSize: '0.9rem' }}>
                <a href="tel:1307" style={{ color: 'var(--primary-blue)', textDecoration: 'none', fontWeight: 'bold' }}>
                  1307
                </a> | <a href="tel:111" style={{ color: 'var(--primary-blue)', textDecoration: 'none', fontWeight: 'bold' }}>
                  111
                </a>
              </p>
            </div>

            <div className="contact-card">
              <div className="contact-icon">📱</div>
              <h3>{t({ ru: 'Социальные сети', kz: 'Әлеуметтік желілер' })}</h3>
              <p>
                <a 
                  href="https://www.instagram.com/pp_gumfac_bokeikhan?igsh=ZmN1cnhqMnl5ZGoy" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: 'var(--primary-blue)', textDecoration: 'none' }}
                >
                  📷 Instagram
                </a>
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginTop: '0.5rem' }}>
                @pp_gumfac_bokeikhan
              </p>
            </div>

            <div className="contact-card">
              <div className="contact-icon">⏰</div>
              <h3>{t({ ru: 'Режим работы', kz: 'Жұмыс режимі' })}</h3>
              <p>{t({ ru: 'Пн-Пт: 9:00 - 18:00', kz: 'Дс-Жм: 9:00 - 18:00' })}</p>
              <p>{t({ ru: 'Сб-Вс: Выходной', kz: 'Сб-Жк: Демалыс' })}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="contact-section">
        <div className="container">
          <div className="contact-layout">
            {/* Contact Form */}
            <div className="contact-form-wrapper">
              <h2>{t({ ru: 'Напишите нам', kz: 'Бізге жазыңыз' })}</h2>
              <p>
                {t({
                  ru: 'Оставьте свое сообщение, и мы свяжемся с вами в ближайшее время',
                  kz: 'Хабарламаңызды қалдырыңыз, біз жақын арада сізбен хабарласамыз',
                })}
              </p>

              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name">{t({ ru: 'Имя *', kz: 'Аты *' })}</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={t({ ru: 'Введите ваше имя', kz: 'Атыңызды енгізіңіз' })}
                    className={errors.name ? 'error' : ''}
                  />
                  {errors.name && <span className="error-message">{errors.name}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="email">{t({ ru: 'Email *', kz: 'Email *' })}</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="example@email.com"
                    className={errors.email ? 'error' : ''}
                  />
                  {errors.email && <span className="error-message">{errors.email}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="phone">{t({ ru: 'Телефон', kz: 'Телефон' })}</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+7 (___) ___-__-__"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="subject">{t({ ru: 'Тема обращения *', kz: 'Өтініш тақырыбы *' })}</label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className={errors.subject ? 'error' : ''}
                  >
                    <option value="">{t({ ru: 'Выберите тему', kz: 'Тақырыпты таңдаңыз' })}</option>
                    <option value="consultation">
                      {t({ ru: 'Запись на консультацию', kz: 'Кеңеске жазылу' })}
                    </option>
                    <option value="question">{t({ ru: 'Общий вопрос', kz: 'Жалпы сұрақ' })}</option>
                    <option value="feedback">{t({ ru: 'Отзыв', kz: 'Пікір' })}</option>
                    <option value="other">{t({ ru: 'Другое', kz: 'Басқа' })}</option>
                  </select>
                  {errors.subject && <span className="error-message">{errors.subject}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="message">{t({ ru: 'Сообщение *', kz: 'Хабарлама *' })}</label>
                  <textarea
                    id="message"
                    name="message"
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder={t({ ru: 'Введите ваше сообщение', kz: 'Хабарламаңызды енгізіңіз' })}
                    className={errors.message ? 'error' : ''}
                  />
                  {errors.message && <span className="error-message">{errors.message}</span>}
                </div>

                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      id="privacy"
                      name="privacy"
                      checked={formData.privacy}
                      onChange={handleChange}
                    />
                    <span>
                      {t({
                        ru: 'Я согласен с политикой конфиденциальности *',
                        kz: 'Құпиялылық саясатымен келісемін *',
                      })}
                    </span>
                  </label>
                  {errors.privacy && <span className="error-message">{errors.privacy}</span>}
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary btn-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting 
                    ? t({ ru: 'Отправка...', kz: 'Жіберілуде...' })
                    : t({ ru: 'Отправить сообщение', kz: 'Хабарлама жіберу' })
                  }
                </button>

                {status && (
                  <div className={`status-message ${status.includes('✅') ? 'success' : status.includes('❌') ? 'error' : 'info'}`}>
                    {status}
                  </div>
                )}
              </form>
            </div>

            {/* Map */}
            <div className="map-wrapper">
              <h2>{t({ ru: 'Как нас найти', kz: 'Бізді қалай табуға болады' })}</h2>
              <div className="map-container">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2527.5!2d80.2454!3d50.4241!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNTDCsDI1JzI2LjgiTiA4MMKwMTQnNDMuNCJF!5e0!3m2!1sru!2skz!4v1234567890"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={t({ ru: 'Карта местоположения', kz: 'Орналасқан жердің картасы' })}
                ></iframe>
              </div>

              <div className="map-info">
                <h3>{t({ ru: 'Контактная информация', kz: 'Байланыс ақпараты' })}</h3>
                <ul>
                  <li>
                    {t({
                      ru: '📍 3 корпус Alikhan Bokeikhan University',
                      kz: '📍 Alikhan Bokeikhan University 3 корпус',
                    })}
                  </li>
                  <li>
                    {t({
                      ru: '🚪 15 кабинет',
                      kz: '🚪 15 кабинет',
                    })}
                  </li>
                  <li>
                    {t({
                      ru: '📞 Телефон: +7 (705) 625-03-89',
                      kz: '📞 Телефон: +7 (705) 625-03-89',
                    })}
                  </li>
                  <li>
                    {t({
                      ru: '🆘 Телефоны доверия: 1307, 111',
                      kz: '🆘 Сенім телефондары: 1307, 111',
                    })}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Media */}
      <section className="social-media">
        <div className="container">
          <h2>{t({ ru: 'Мы в социальных сетях', kz: 'Біз әлеуметтік желілерде' })}</h2>
          <div className="social-links">
            <a 
              href="https://www.instagram.com/pp_gumfac_bokeikhan?igsh=ZmN1cnhqMnl5ZGoy" 
              target="_blank" 
              rel="noopener noreferrer"
              className="social-link" 
              aria-label="Instagram"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
            <a 
              href="https://wa.me/77056250389" 
              target="_blank" 
              rel="noopener noreferrer"
              className="social-link" 
              aria-label="WhatsApp"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
            </a>
            <a 
              href="tel:1307" 
              className="social-link" 
              aria-label={t({ ru: 'Телефон доверия 1307', kz: 'Сенім телефоны 1307' })}
              style={{ background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)' }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
              </svg>
            </a>
            <a 
              href="tel:111" 
              className="social-link" 
              aria-label={t({ ru: 'Телефон доверия 111', kz: 'Сенім телефоны 111' })}
              style={{ background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)' }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
              </svg>
            </a>
          </div>
          <div style={{ textAlign: 'center', marginTop: 'var(--spacing-md)', color: 'var(--text-light)', fontSize: '0.9rem', lineHeight: '1.8' }}>
            <p>
              <strong style={{ color: 'var(--primary-blue)' }}>1307</strong> - 
              {t({ 
                ru: ' Анонимный телефон доверия регионального центра психологической поддержки', 
                kz: ' Аймақтық психологиялық қолдау орталығының анонимді сенім телефоны' 
              })}
            </p>
            <p style={{ marginTop: '0.5rem' }}>
              <strong style={{ color: '#4CAF50' }}>111</strong> - 
              {t({ 
                ru: ' Круглосуточный контакт-центр по защите прав детей, семьи и женщин', 
                kz: ' Балалардың, отбасының және әйелдердің құқықтарын қорғау жөніндегі тәуліктік байланыс орталығы' 
              })}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contacts;

