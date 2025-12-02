import { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import './AppointmentCalendar.css';

const AppointmentCalendar = ({ selectedDate, onDateSelect, availableDates = [] }) => {
  const { t, language } = useLanguage();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Получаем первый день месяца и количество дней
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  
  // Преобразуем день недели: 0 (воскресенье) -> 6, 1 (понедельник) -> 0, и т.д.
  // Теперь неделя начинается с понедельника (0 = понедельник, 6 = воскресенье)
  const startingDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7;

  // Дни недели - теперь начинаются с понедельника
  const weekDays = language === 'kz' 
    ? ['Дс', 'Сс', 'Ср', 'Бс', 'Жм', 'Сб', 'Жк']
    : ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  // Месяцы
  const months = language === 'kz'
    ? ['Қаңтар', 'Ақпан', 'Наурыз', 'Сәуір', 'Мамыр', 'Маусым', 'Шілде', 'Тамыз', 'Қыркүйек', 'Қазан', 'Қараша', 'Желтоқсан']
    : ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

  // Утилиты для локальной даты (без сдвигов часовых поясов)
  const formatLocalDateYMD = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const parseLocalYMD = (ymd) => {
    if (!ymd) return null;
    const [y, m, d] = ymd.split('-').map(Number);
    return new Date(y, (m || 1) - 1, d || 1, 0, 0, 0, 0);
  };

  // Проверяем, доступна ли дата
  const isDateAvailable = (date) => {
    if (date < today) return false;
    
    // Проверяем день недели (1 = понедельник, 2 = вторник, ..., 6 = суббота, 0 = воскресенье)
    const dayOfWeek = date.getDay();
    // Рабочие дни консультаций: только Вторник (2) и Четверг (4)
    if (dayOfWeek !== 2 && dayOfWeek !== 4) return false;

    // Если есть список доступных дат, проверяем его
    if (availableDates.length > 0) {
      const dateStr = date.toISOString().split('T')[0];
      return availableDates.includes(dateStr);
    }

    return true;
  };

  // Проверяем, выбрана ли дата
  const isDateSelected = (date) => {
    if (!selectedDate) return false;
    const selected = parseLocalYMD(selectedDate);
    if (!selected) return false;
    return (
      date.getFullYear() === selected.getFullYear() &&
      date.getMonth() === selected.getMonth() &&
      date.getDate() === selected.getDate()
    );
  };

  // Обработчик выбора даты
  const handleDateClick = (day) => {
    // создаём локальную дату без сдвига по часовому поясу
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day, 12, 0, 0, 0);
    if (isDateAvailable(date)) {
      onDateSelect(formatLocalDateYMD(date));
    }
  };

  // Переход к предыдущему месяцу
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  // Переход к следующему месяцу
  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Генерируем дни месяца
  const renderDays = () => {
    const days = [];
    
    // Пустые ячейки для дней до начала месяца
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Дни месяца
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const available = isDateAvailable(date);
      const selected = isDateSelected(date);
      const isToday = date.toDateString() === today.toDateString();

      days.push(
        <div
          key={day}
          className={`calendar-day ${available ? 'available' : 'unavailable'} ${selected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
          onClick={() => available && handleDateClick(day)}
        >
          {day}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="appointment-calendar">
      <div className="calendar-header">
        <button 
          className="calendar-nav-btn" 
          onClick={goToPreviousMonth}
          aria-label={t({ ru: 'Предыдущий месяц', kz: 'Алдыңғы ай' })}
        >
          ‹
        </button>
        <h3 className="calendar-month">
          {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <button 
          className="calendar-nav-btn" 
          onClick={goToNextMonth}
          aria-label={t({ ru: 'Следующий месяц', kz: 'Келесі ай' })}
        >
          ›
        </button>
      </div>

      <div className="calendar-weekdays">
        {weekDays.map((day, index) => (
          <div key={index} className="calendar-weekday">
            {day}
          </div>
        ))}
      </div>

      <div className="calendar-days">
        {renderDays()}
      </div>

      <div className="calendar-legend">
        <div className="legend-item">
          <div className="legend-color available"></div>
          <span>{t({ ru: 'Доступно', kz: 'Қолжетімді' })}</span>
        </div>
        <div className="legend-item">
          <div className="legend-color selected"></div>
          <span>{t({ ru: 'Выбрано', kz: 'Таңдалған' })}</span>
        </div>
        <div className="legend-item">
          <div className="legend-color unavailable"></div>
          <span>{t({ ru: 'Недоступно', kz: 'Қолжетімсіз' })}</span>
        </div>
      </div>
    </div>
  );
};

export default AppointmentCalendar;

