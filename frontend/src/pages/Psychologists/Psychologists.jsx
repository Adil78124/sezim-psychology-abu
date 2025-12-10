import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { supabase } from '../../supabaseClient';
import './Psychologists.css';

const Psychologists = () => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [psychologists, setPsychologists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Загружаем психологов из Supabase
  useEffect(() => {
    const loadPsychologists = async () => {
      try {
        setLoading(true);
        
        // Проверяем и очищаем истёкшую сессию, если есть
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { error: userError } = await supabase.auth.getUser();
          if (userError && userError.message?.includes('JWT')) {
            // Токен истёк, очищаем сессию
            await supabase.auth.signOut();
          }
        }

        const { data, error: fetchError } = await supabase
          .from('psychologists')
          .select('*')
          .eq('is_active', true)
          .order('name_ru');

        if (fetchError) {
          // Если ошибка связана с JWT, пытаемся очистить сессию и повторить запрос
          if (fetchError.message?.includes('JWT') || fetchError.message?.includes('expired') || fetchError.code === 'PGRST301') {
            console.warn('Обнаружена ошибка JWT, очищаем сессию и повторяем запрос...');
            await supabase.auth.signOut();
            
            // Повторяем запрос после очистки сессии
            const { data: retryData, error: retryError } = await supabase
              .from('psychologists')
              .select('*')
              .eq('is_active', true)
              .order('name_ru');
            
            if (retryError) {
              throw retryError;
            }
            
            const formattedData = (retryData || []).map(psychologist => ({
              id: psychologist.id,
              category: 'consultant',
              name: { ru: psychologist.name_ru, kz: psychologist.name_kz },
              position: { ru: psychologist.position_ru, kz: psychologist.position_kz },
              phone: psychologist.phone,
              email: psychologist.email,
              therapy: { ru: psychologist.therapy_ru, kz: psychologist.therapy_kz },
              education: { ru: psychologist.education_ru, kz: psychologist.education_kz },
              about: { ru: psychologist.about_ru, kz: psychologist.about_kz },
              specialization: { ru: psychologist.specialization_ru, kz: psychologist.specialization_kz },
              description: { ru: psychologist.description_ru || psychologist.about_ru, kz: psychologist.description_kz || psychologist.about_kz },
              image: psychologist.image_url || '/images/default-psychologist.jpg',
            }));
            
            setPsychologists(formattedData);
            setError(null);
            return;
          }
          throw fetchError;
        }

        // Преобразуем данные из Supabase в формат компонента
        const formattedData = (data || []).map(psychologist => ({
          id: psychologist.id,
          category: 'consultant',
          name: { ru: psychologist.name_ru, kz: psychologist.name_kz },
          position: { ru: psychologist.position_ru, kz: psychologist.position_kz },
          phone: psychologist.phone,
          email: psychologist.email,
          therapy: { ru: psychologist.therapy_ru, kz: psychologist.therapy_kz },
          education: { ru: psychologist.education_ru, kz: psychologist.education_kz },
          about: { ru: psychologist.about_ru, kz: psychologist.about_kz },
          specialization: { ru: psychologist.specialization_ru, kz: psychologist.specialization_kz },
          description: { ru: psychologist.description_ru || psychologist.about_ru, kz: psychologist.description_kz || psychologist.about_kz },
          image: psychologist.image_url || '/images/default-psychologist.jpg',
        }));

        setPsychologists(formattedData);
        setError(null);
      } catch (err) {
        console.error('Ошибка загрузки психологов:', err);
        // Показываем более понятное сообщение об ошибке
        const errorMessage = err.message || 'Не удалось загрузить данные. Попробуйте обновить страницу.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadPsychologists();
  }, []);

  const filteredPsychologists = psychologists.filter((psychologist) => {
    const matchesSearch =
      t(psychologist.name).toLowerCase().includes(searchTerm.toLowerCase()) ||
      t(psychologist.description).toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });


  return (
    <div className="psychologists-page">
      {/* Page Header */}
      <section className="page-header">
        <div className="container">
          <h1>{t({ ru: 'Наши психологи', kz: 'Біздің психологтар' })}</h1>
          <p>{t({ ru: 'Команда специалистов по работе со студентами и молодежью', kz: 'Студенттер мен жастармен жұмыс жасауға маманданған мамандар командасы' })}</p>
          <div style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: 'var(--light-blue)', borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.3rem' }}>
              {t({ ru: 'Если вас беспокоит…', kz: 'Егер сізді мазалап жатса…' })}
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              <li style={{ padding: '0.5rem 0' }}>
                ❗ {t({ ru: 'чувство тревоги', kz: 'мазасыздық сезімі' })}
              </li>
              <li style={{ padding: '0.5rem 0' }}>
                ❗ {t({ ru: 'неуверенность в себе', kz: 'өзіне сенімсіздік' })}
              </li>
              <li style={{ padding: '0.5rem 0' }}>
                ❗ {t({ ru: 'эмоциональное выгорание', kz: 'эмоционалды өртену' })}
              </li>
              <li style={{ padding: '0.5rem 0' }}>
                ❗ {t({ ru: 'отсутствие мотивации', kz: 'мотивацияның жоқтығы' })}
              </li>
            </ul>
            <p style={{ marginTop: '1rem', fontWeight: '500' }}>
              {t({ ru: 'Наши специалисты готовы помочь вам!', kz: 'Біздің мамандар сізге көмектесуге дайын!' })}
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="search-filter">
        <div className="container">
          <div className="search-box">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t({ ru: 'Поиск по имени или специализации...', kz: 'Аты немесе мамандандыру бойынша іздеу...' })}
            />
          </div>
        </div>
      </section>

      {/* Psychologists Grid */}
      <section className="psychologists">
        <div className="container">
          {loading && (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p>{t({ ru: 'Загрузка...', kz: 'Жүктелуде...' })}</p>
            </div>
          )}
          {error && (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
              <p>{t({ ru: 'Ошибка загрузки данных', kz: 'Деректерді жүктеу қатесі' })}: {error}</p>
            </div>
          )}
          {!loading && !error && (
            <div className="psychologists-grid">
              {filteredPsychologists.map((psychologist) => (
              <div key={psychologist.id} className="psychologist-card">
                <div className="psychologist-image">
                  <img src={psychologist.image} alt={t(psychologist.name)} />
                </div>
                <div className="psychologist-info">
                  <h3>{t(psychologist.name)}</h3>
                  <p className="psychologist-position">{t(psychologist.position)}</p>
                  
                  {psychologist.therapy && (
                    <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--primary-blue)', fontWeight: '500' }}>
                      💼 {t(psychologist.therapy)}
                    </p>
                  )}
                  
                  {psychologist.phone && (
                    <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                      📞 <a href={`tel:${psychologist.phone}`} style={{ color: 'inherit', textDecoration: 'none' }}>{psychologist.phone}</a>
                    </p>
                  )}
                  
                  <p className="psychologist-description">{t(psychologist.about || psychologist.description)}</p>
                  
                  {psychologist.specialization && (
                    <details style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                      <summary style={{ cursor: 'pointer', fontWeight: '500', color: 'var(--primary-blue)' }}>
                        {t({ ru: 'Работа со следующими запросами', kz: 'Келесі сұрауларға жұмыс' })} ▼
                      </summary>
                      <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', lineHeight: '1.6', color: 'var(--text-light)' }}>
                        {t(psychologist.specialization)}
                      </p>
                    </details>
                  )}
                  
                  <div className="action-buttons">
                    <Link
                      to={`/appointment?psychologist=${psychologist.id}`}
                      className="btn btn-primary btn-small"
                    >
                      {t({ ru: 'Записаться онлайн', kz: 'Онлайн жазылу' })}
                    </Link>
                  </div>
                </div>
              </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Psychologists;

