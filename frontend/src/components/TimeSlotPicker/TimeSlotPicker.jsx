import { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { supabase } from '../../supabaseClient';
import './TimeSlotPicker.css';

const TimeSlotPicker = ({ psychologistId, selectedDate, selectedTime, onTimeSelect, currentTime = null }) => {
  const { t } = useLanguage();
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bookedSlots, setBookedSlots] = useState([]);

  // Генерируем временные слоты (каждые 30 минут с 10:00 до 16:00)
  const generateTimeSlots = () => {
    const slots = [];
    const startHour = 10;
    const endHour = 16;
    
    for (let hour = startHour; hour < endHour; hour++) {
      // Обеденный перерыв 13:00–14:00 не показываем
      if (hour === 13) continue;
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    
    return slots;
  };

  // Загружаем занятые слоты для выбранной даты
  useEffect(() => {
    const loadBookedSlots = async () => {
      if (!selectedDate || !psychologistId) {
        setAvailableSlots([]);
        setBookedSlots([]);
        return;
      }

      setLoading(true);
      try {
        // Получаем все записи на выбранную дату для этого психолога
        const { data: appointments, error } = await supabase
          .from('appointments')
          .select('appointment_time, status')
          .eq('psychologist_id', psychologistId)
          .eq('appointment_date', selectedDate)
          .in('status', ['pending', 'confirmed']);

        if (error) throw error;

        // В Supabase время хранится как 'HH:MM:SS', а слоты у нас 'HH:MM'.
        // Нормализуем до первых 5 символов, чтобы сравнение работало корректно.
        // Исключаем текущее время записи из занятых, если оно есть (для изменения времени)
        const booked = (appointments || [])
          .map((apt) => (apt.appointment_time || '').toString().slice(0, 5))
          .filter(time => currentTime ? time !== currentTime : true); // Исключаем текущее время
        setBookedSlots(booked);

        // Генерируем все возможные слоты
        const allSlots = generateTimeSlots();
        
        // Фильтруем занятые слоты
        const available = allSlots.filter(slot => !booked.includes(slot));
        setAvailableSlots(available);
      } catch (err) {
        console.error('Ошибка загрузки занятых слотов:', err);
        // В случае ошибки показываем все слоты
        setAvailableSlots(generateTimeSlots());
      } finally {
        setLoading(false);
      }
    };

    loadBookedSlots();
  }, [selectedDate, psychologistId]);

  // Группируем слоты по времени дня
  const groupSlotsByTimeOfDay = (slots) => {
    const day = [];
    const evening = [];

    slots.forEach(slot => {
      const [hour] = slot.split(':').map(Number);
      if (hour < 14) {
        day.push(slot);
      } else {
        evening.push(slot);
      }
    });

    return { day, evening };
  };

  const { day, evening } = groupSlotsByTimeOfDay(availableSlots);

  if (!selectedDate) {
    return (
      <div className="time-slot-picker">
        <p className="time-slot-message">
          {t({ ru: 'Сначала выберите дату', kz: 'Алдымен күнді таңдаңыз' })}
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="time-slot-picker">
        <p className="time-slot-message">
          {t({ ru: 'Загрузка доступного времени...', kz: 'Қолжетімді уақытты жүктеу...' })}
        </p>
      </div>
    );
  }

  const renderTimeSlot = (time) => {
    const isSelected = selectedTime === time;
    const isBooked = bookedSlots.includes(time);
    const isCurrentTime = currentTime && time === currentTime;

    return (
      <button
        key={time}
        className={`time-slot ${isSelected ? 'selected' : ''} ${isBooked ? 'booked' : ''} ${isCurrentTime ? 'current-time' : ''}`}
        onClick={() => !isBooked && onTimeSelect(time)}
        disabled={isBooked}
        title={isCurrentTime ? t({ ru: 'Текущее время записи', kz: 'Жазылымның қазіргі уақыты' }) : ''}
      >
        {time}
        {isCurrentTime && <span className="current-time-badge">●</span>}
      </button>
    );
  };

  return (
    <div className="time-slot-picker">

      {availableSlots.length === 0 ? (
        <p className="time-slot-message">
          {t({ ru: 'На выбранную дату нет доступного времени', kz: 'Таңдалған күнде қолжетімді уақыт жоқ' })}
        </p>
      ) : (
        <>
          {day.length > 0 && (
            <div className="time-slot-group">
              <div className="time-slot-group-header">
                <span className="time-slot-group-icon">☀️</span>
                <span className="time-slot-group-title">
                  {t({ ru: 'День', kz: 'Күндіз' })}
                </span>
              </div>
              <div className="time-slot-grid">
                {day.map(renderTimeSlot)}
              </div>
            </div>
          )}

          {evening.length > 0 && (
            <div className="time-slot-group">
              <div className="time-slot-group-header">
                <span className="time-slot-group-icon">🌆</span>
                <span className="time-slot-group-title">
                  {t({ ru: 'Вечер', kz: 'Кешке' })}
                </span>
              </div>
              <div className="time-slot-grid">
                {evening.map(renderTimeSlot)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TimeSlotPicker;

