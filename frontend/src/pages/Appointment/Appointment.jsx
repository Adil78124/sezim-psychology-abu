import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { supabase } from '../../supabaseClient';
import AppointmentCalendar from '../../components/AppointmentCalendar/AppointmentCalendar';
import TimeSlotPicker from '../../components/TimeSlotPicker/TimeSlotPicker';
import './Appointment.css';

const Appointment = () => {
  const { t, language } = useLanguage();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const psychologistId = searchParams.get('psychologist');
  const rescheduleId = searchParams.get('reschedule'); // ID записи для изменения времени
  
  const [psychologist, setPsychologist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [existingAppointment, setExistingAppointment] = useState(null);

  // Refs для управления «центрированием» карточки слева
  const leftCardRef = useRef(null);
  const calendarCardRef = useRef(null);
  const submitBlockRef = useRef(null);

  // Плавное центрирование с начала календаря и "отпускание" у формы
  useEffect(() => {
    if (!leftCardRef.current) return;

    const calObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!leftCardRef.current) return;
          if (entry.isIntersecting) {
            leftCardRef.current.classList.add('is-centered');
          } else {
            leftCardRef.current.classList.remove('is-centered');
          }
        });
      },
      {
        root: null,
        rootMargin: '-64px 0px -80% 0px',
        threshold: 0,
      }
    );
    if (calendarCardRef.current) calObserver.observe(calendarCardRef.current);

    const bottomObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!leftCardRef.current) return;
          if (entry.isIntersecting) {
            leftCardRef.current.classList.add('at-bottom');
          } else {
            leftCardRef.current.classList.remove('at-bottom');
          }
        });
      },
      {
        root: null,
        rootMargin: '0px 0px -24px 0px',
        threshold: 0,
      }
    );
    if (submitBlockRef.current) bottomObserver.observe(submitBlockRef.current);

    return () => {
      calObserver.disconnect();
      bottomObserver.disconnect();
    };
  }, []);

  // Загружаем данные психолога
  useEffect(() => {
    const loadPsychologist = async () => {
      if (!psychologistId) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('psychologists')
          .select('*')
          .eq('id', psychologistId)
          .eq('is_active', true)
          .single();

        if (error) throw error;
        setPsychologist(data);
      } catch (err) {
        console.error('Ошибка загрузки психолога:', err);
        setMessage(t({ ru: 'Ошибка загрузки данных', kz: 'Деректерді жүктеу қатесі' }));
      } finally {
        setLoading(false);
      }
    };

    loadPsychologist();
  }, [psychologistId, t]);

  // Загрузка данных существующей записи для изменения времени
  useEffect(() => {
    const loadExistingAppointment = async () => {
      if (!rescheduleId) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('appointments')
          .select('*')
          .eq('id', rescheduleId)
          .single();
        
        if (error) throw error;
        
        if (data) {
          setExistingAppointment(data);
          setSelectedDate(data.appointment_date);
          setSelectedTime(data.appointment_time ? data.appointment_time.slice(0, 5) : null);
          setFormData({
            name: data.client_name || '',
            phone: data.client_phone || '',
            email: data.client_email || '',
            notes: data.notes || ''
          });
          // Загружаем психолога, если его ID есть
          if (data.psychologist_id) {
            const { data: psychData, error: psychError } = await supabase
              .from('psychologists')
              .select('*')
              .eq('id', data.psychologist_id)
              .single();
            if (!psychError && psychData) {
              setPsychologist(psychData);
            }
          }
        }
      } catch (err) {
        console.error('Ошибка загрузки записи:', err);
        setMessage(t({ ru: 'Ошибка загрузки данных записи', kz: 'Жазылым деректерін жүктеу қатесі' }));
      } finally {
        setLoading(false);
      }
    };

    loadExistingAppointment();
  }, [rescheduleId, t]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTime) {
      setMessage(t({ ru: 'Пожалуйста, выберите дату и время', kz: 'Күн мен уақытты таңдаңыз' }));
      return;
    }

    if (!formData.name || !formData.phone) {
      setMessage(t({ ru: 'Заполните обязательные поля', kz: 'Міндетті өрістерді толтырыңыз' }));
      return;
    }

    setSubmitting(true);
    setMessage('');

    try {
      let data;
      
      if (rescheduleId && existingAppointment) {
        // Обновляем существующую запись
        const oldDate = existingAppointment.appointment_date;
        const oldTime = existingAppointment.appointment_time ? existingAppointment.appointment_time.slice(0, 5) : null;
        
        const { data: updated, error } = await supabase
          .from('appointments')
          .update({
            appointment_date: selectedDate,
            appointment_time: selectedTime,
            client_name: formData.name,
            client_phone: formData.phone,
            client_email: formData.email || null,
            notes: formData.notes || null,
            status: 'pending', // Сбрасываем статус на pending при изменении
            updated_at: new Date().toISOString()
          })
          .eq('id', rescheduleId)
          .select()
          .single();
        
        if (error) throw error;
        data = updated;
        
        // Отправляем уведомление в Telegram через backend
        try {
          const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
          await fetch(`${apiUrl}/api/appointments/${rescheduleId}/reschedule`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              oldDate,
              oldTime,
              newDate: selectedDate,
              newTime: selectedTime,
              clientName: formData.name
            })
          }).catch(() => {}); // Не блокируем UX при ошибке
        } catch (e) {
          console.warn('Не удалось отправить уведомление об изменении времени:', e);
        }
      } else {
        // Создаем новую запись
        const { data: inserted, error } = await supabase
          .from('appointments')
          .insert({
            psychologist_id: psychologistId,
            client_name: formData.name,
            client_phone: formData.phone,
            client_email: formData.email || null,
            appointment_date: selectedDate,
            appointment_time: selectedTime,
            notes: formData.notes || null,
            status: 'pending'
          })
          .select()
          .single();

        if (error) throw error;
        data = inserted;
      }

      // Пытаемся отправить сообщение в Telegram через backend (не блокируем UX)
      try {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        const subject = 'Новая запись на консультацию';
        const text = `🆕 Новая запись на консультацию

Психолог: ${psychologist?.name_ru || psychologistId}
Дата: ${selectedDate}
Время: ${selectedTime}

Клиент: ${formData.name}
Телефон: ${formData.phone}
Email: ${formData.email || '—'}

Комментарий:
${formData.notes || '—'}`;

        await fetch(`${apiUrl}/api/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email || 'no-reply@sezim.local',
            subject,
            message: text,
            name: formData.name,
            phone: formData.phone
          })
        }).catch(() => {});

        // Если указан email клиента — отправим письмо «создана заявка» через backend
        if (formData.email && data?.id) {
          await fetch(`${apiUrl}/api/appointments/${data.id}/email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'created' })
          }).catch(() => {});
        }
      } catch (e2) {
        console.warn('Не удалось отправить уведомление в Telegram:', e2);
      }

      // Показать ссылку на статус брони
      const statusLink = `/appointment-status/${data.id}`;
      const successMessage = rescheduleId 
        ? t({ 
            ru: `✅ Время записи успешно изменено! Мы свяжемся с вами для подтверждения.\nСсылка для проверки статуса: ${window.location.origin}${statusLink}`, 
            kz: `✅ Жазылым уақыты сәтті өзгертілді! Растау үшін сізбен байланысамыз.\nКүйін қарау сілтемесі: ${window.location.origin}${statusLink}` 
          })
        : t({ 
            ru: `✅ Запись успешно создана! Мы свяжемся с вами для подтверждения.\nСсылка для проверки статуса: ${window.location.origin}${statusLink}`, 
            kz: `✅ Жазылым сәтті жасалды! Растау үшін сізбен байланысамыз.\nКүйін қарау сілтемесі: ${window.location.origin}${statusLink}` 
          });
      setMessage(successMessage);

      // Предложить переход на страницу статуса
      setTimeout(() => {
        navigate(statusLink);
      }, 2500);
    } catch (err) {
      console.error('Ошибка создания записи:', err);
      setMessage(t({ 
        ru: '❌ Ошибка при создании записи. Попробуйте еще раз.', 
        kz: '❌ Жазылым жасау кезінде қате. Қайталап көріңіз.' 
      }));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="appointment-page">
        <div className="container" style={{ textAlign: 'center', padding: '3rem' }}>
          <p>{t({ ru: 'Загрузка...', kz: 'Жүктелуде...' })}</p>
        </div>
      </div>
    );
  }

  if (!psychologist) {
    return (
      <div className="appointment-page">
        <div className="container" style={{ textAlign: 'center', padding: '3rem' }}>
          <p>{t({ ru: 'Психолог не найден', kz: 'Психолог табылмады' })}</p>
          <button className="btn btn-primary" onClick={() => navigate('/psychologists')}>
            {t({ ru: 'Вернуться к списку', kz: 'Тізімге оралу' })}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="appointment-page">
      <section className="page-header">
        <div className="container">
          <h1>{rescheduleId ? t({ ru: 'Изменение времени записи', kz: 'Жазылым уақытын өзгерту' }) : t({ ru: 'Запись на консультацию', kz: 'Кеңеске жазылу' })}</h1>
          <p>{rescheduleId ? t({ ru: 'Выберите новое удобное время для консультации', kz: 'Кеңес үшін жаңа ыңғайлы уақытты таңдаңыз' }) : t({ ru: 'Выберите удобное время для консультации', kz: 'Кеңес үшін ыңғайлы уақытты таңдаңыз' })}</p>
        </div>
      </section>

      <section className="appointment-content">
        <div className="container">
          <div className="appointment-layout">
            {/* Левая колонка: Информация о психологе */}
            <div className="appointment-left-column">
              <div ref={leftCardRef} className="psychologist-info-card">
                <img 
                  src={psychologist.image_url || '/images/default-psychologist.jpg'} 
                  alt={language === 'kz' ? (psychologist.name_kz || psychologist.name_ru) : psychologist.name_ru}
                  className="psychologist-photo"
                />
                <h3>{language === 'kz' ? (psychologist.name_kz || psychologist.name_ru) : psychologist.name_ru}</h3>
                <p className="psychologist-position">{language === 'kz' ? (psychologist.position_kz || psychologist.position_ru) : psychologist.position_ru}</p>
                {(language === 'kz' ? psychologist.therapy_kz : psychologist.therapy_ru) && (
                  <p className="psychologist-therapy">💼 {language === 'kz' ? (psychologist.therapy_kz || psychologist.therapy_ru) : psychologist.therapy_ru}</p>
                )}
              </div>
            </div>

            {/* Правая колонка: Календарь, время и форма */}
            <div className="appointment-right-column">
              {/* Календарь */}
              <div ref={calendarCardRef} className="appointment-card">
                <h3 className="card-title">{t({ ru: 'Выберите дату', kz: 'Күнді таңдаңыз' })}</h3>
                <AppointmentCalendar
                  selectedDate={selectedDate}
                  onDateSelect={(date) => {
                    setSelectedDate(date);
                    setSelectedTime(null); // Сбрасываем время при смене даты
                  }}
                />
              </div>

              {/* Выбор времени */}
              <div className="appointment-card">
                <h3 className="card-title">{t({ ru: 'Выберите время', kz: 'Уақытты таңдаңыз' })}</h3>
                {rescheduleId && existingAppointment && existingAppointment.appointment_date === selectedDate && (
                  <div style={{ 
                    padding: '12px', 
                    marginBottom: '16px', 
                    background: '#fff3e0', 
                    border: '2px solid #ff9800', 
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}>
                    <strong style={{ color: '#e65100' }}>
                      {t({ ru: '📅 Текущее время записи: ', kz: '📅 Жазылымның қазіргі уақыты: ' })}
                      {existingAppointment.appointment_time ? existingAppointment.appointment_time.slice(0, 5) : '—'}
                    </strong>
                    <p style={{ margin: '8px 0 0 0', color: '#666', fontSize: '13px' }}>
                      {t({ ru: 'Выберите новое время из доступных слотов ниже', kz: 'Төмендегі қолжетімді уақыттардан жаңа уақытты таңдаңыз' })}
                    </p>
                  </div>
                )}
                <TimeSlotPicker
                  psychologistId={psychologistId || (existingAppointment?.psychologist_id)}
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  onTimeSelect={setSelectedTime}
                  currentTime={rescheduleId && existingAppointment && existingAppointment.appointment_date === selectedDate 
                    ? (existingAppointment.appointment_time ? existingAppointment.appointment_time.slice(0, 5) : null)
                    : null}
                />
              </div>

              {/* Форма записи */}
              <div ref={submitBlockRef} className="appointment-card">
                <h3 className="form-title">{t({ ru: 'Ваши контактные данные', kz: 'Байланыс деректеріңіз' })}</h3>
                <form onSubmit={handleSubmit} className="appointment-form">

                <div className="form-group">
                  <label>{t({ ru: 'Ваше имя', kz: 'Атыңыз' })} *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>{t({ ru: 'Телефон', kz: 'Телефон' })} *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+7 (___) ___-__-__"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>{t({ ru: 'Email', kz: 'Email' })}</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>{t({ ru: 'Комментарий (необязательно)', kz: 'Пікір (міндетті емес)' })}</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows="4"
                  />
                </div>

                {message && (
                  <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
                    {message}
                  </div>
                )}

                <button 
                  type="submit" 
                  className="btn btn-primary btn-full"
                  disabled={submitting}
                >
                  {submitting 
                    ? t({ ru: 'Отправка...', kz: 'Жіберілуде...' })
                    : t({ ru: 'Записаться', kz: 'Жазылу' })
                  }
                </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Appointment;

