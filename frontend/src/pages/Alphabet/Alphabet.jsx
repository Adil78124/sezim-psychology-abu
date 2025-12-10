import { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { initScrollAnimations } from '../../utils/animations';
import { supabase } from '../../supabaseClient';
import './Alphabet.css';

const Alphabet = () => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeLetter, setActiveLetter] = useState('all');
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Сброс фильтра при изменении поиска
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    if (value === '') {
      // Если поиск очищен, фильтр остается как есть
    }
  };

  // Изменение фильтра по букве
  const handleLetterFilter = (letter) => {
    setActiveLetter(letter);
    // Прокрутка к результатам после смены фильтра
    setTimeout(() => {
      const termsSection = document.querySelector('.terms-section');
      if (termsSection) {
        termsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // Подсчет количества терминов для каждой буквы
  const getLetterCount = (letter) => {
    if (letter === 'all') {
      return terms.length;
    }
    return terms.filter(term => term.letter === letter).length;
  };

  // Загрузка терминов из Supabase
  useEffect(() => {
    const loadTerms = async () => {
      try {
        setLoading(true);
        
        // Очищаем истёкшие токены из localStorage перед запросом
        // Это необходимо для публичных запросов, чтобы не использовать истёкшие JWT
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            const { error: userError } = await supabase.auth.getUser();
            if (userError && (userError.message?.includes('JWT') || userError.message?.includes('expired') || userError.code === 'PGRST303')) {
              // Токен истёк, очищаем сессию
              await supabase.auth.signOut();
              // Также очищаем localStorage от истёкших токенов
              if (typeof window !== 'undefined') {
                const keys = Object.keys(localStorage);
                keys.forEach(key => {
                  if (key.includes('supabase') && key.includes('auth')) {
                    localStorage.removeItem(key);
                  }
                });
              }
            }
          }
        } catch (sessionError) {
          // Игнорируем ошибки при проверке сессии
          console.warn('Ошибка при проверке сессии:', sessionError);
        }

        const { data, error } = await supabase
          .from('alphabet_items')
          .select('*')
          .order('letter', { ascending: true })
          .order('order_index', { ascending: true });

        if (error) {
          console.error('Ошибка загрузки терминов из Supabase:', error);
          // Если ошибка связана с JWT, пробуем очистить сессию и повторить запрос
          if (error.code === 'PGRST303' || error.message?.includes('JWT') || error.message?.includes('expired')) {
            await supabase.auth.signOut();
            // Повторяем запрос после очистки сессии
            const { data: retryData, error: retryError } = await supabase
              .from('alphabet_items')
              .select('*')
              .order('letter', { ascending: true })
              .order('order_index', { ascending: true });
            
            if (retryError) {
              console.error('Ошибка после повторной попытки:', retryError);
              setTerms([]);
              setLoading(false);
              return;
            }
            
            // Используем данные из повторной попытки
            const formattedTerms = (retryData || []).map(item => {
              let fullContent = { ru: {}, kz: {} };
              if (item.full_content) {
                if (typeof item.full_content === 'string') {
                  try {
                    fullContent = JSON.parse(item.full_content);
                  } catch (e) {
                    console.warn('Ошибка парсинга full_content для термина', item.id, e);
                    fullContent = { ru: {}, kz: {} };
                  }
                } else if (typeof item.full_content === 'object') {
                  fullContent = item.full_content;
                }
              }
              
              return {
                id: item.id,
                letter: item.letter,
                term: { ru: item.term_ru, kz: item.term_kz },
                image: item.image,
                definition: { ru: item.definition_ru || '', kz: item.definition_kz || '' },
                fullContent: fullContent,
                order_index: item.order_index || 0
              };
            });
            
            // Сортировка для правильного порядка
            formattedTerms.sort((a, b) => {
              // Сначала по букве
              if (a.letter !== b.letter) {
                return a.letter.localeCompare(b.letter);
              }
              
              // Затем по order_index (если он задан и > 0)
              const orderA = a.order_index || 0;
              const orderB = b.order_index || 0;
              
              // Если оба имеют order_index > 0, сортируем по нему
              if (orderA > 0 && orderB > 0) {
                return orderA - orderB;
              }
              
              // Если только один имеет order_index > 0, он идет первым
              if (orderA > 0 && orderB === 0) return -1;
              if (orderA === 0 && orderB > 0) return 1;
              
              // Если оба имеют order_index = 0 или одинаковый, сортируем по алфавиту терминов
              const termA = (a.term.ru || '').toLowerCase();
              const termB = (b.term.ru || '').toLowerCase();
              return termA.localeCompare(termB);
            });
            
            setTerms(formattedTerms);
            setLoading(false);
            return;
          }
          
          setTerms([]);
          setLoading(false);
          return;
        }

        // Преобразуем данные из Supabase в формат компонента
        const formattedTerms = (data || []).map(item => {
          // Парсим full_content если это строка JSON
          let fullContent = { ru: {}, kz: {} };
          if (item.full_content) {
            if (typeof item.full_content === 'string') {
              try {
                fullContent = JSON.parse(item.full_content);
              } catch (e) {
                console.warn('Ошибка парсинга full_content для термина', item.id, e);
                fullContent = { ru: {}, kz: {} };
              }
            } else if (typeof item.full_content === 'object') {
              fullContent = item.full_content;
            }
          }
          
          return {
            id: item.id,
            letter: item.letter,
            term: { ru: item.term_ru, kz: item.term_kz },
            image: item.image,
            definition: { ru: item.definition_ru || '', kz: item.definition_kz || '' },
            fullContent: fullContent,
            order_index: item.order_index || 0
          };
        });

        // Сортировка для правильного порядка
        formattedTerms.sort((a, b) => {
          // Сначала по букве
          if (a.letter !== b.letter) {
            return a.letter.localeCompare(b.letter);
          }
          
          // Затем по order_index (если он задан и > 0)
          const orderA = a.order_index || 0;
          const orderB = b.order_index || 0;
          
          // Если оба имеют order_index > 0, сортируем по нему
          if (orderA > 0 && orderB > 0) {
            return orderA - orderB;
          }
          
          // Если только один имеет order_index > 0, он идет первым
          if (orderA > 0 && orderB === 0) return -1;
          if (orderA === 0 && orderB > 0) return 1;
          
          // Если оба имеют order_index = 0 или одинаковый, сортируем по алфавиту терминов
          const termA = (a.term.ru || '').toLowerCase();
          const termB = (b.term.ru || '').toLowerCase();
          return termA.localeCompare(termB);
        });

        setTerms(formattedTerms);
      } catch (error) {
        console.error('Ошибка при загрузке терминов:', error);
        setTerms([]);
      } finally {
        setLoading(false);
      }
    };

    loadTerms();
  }, []);

  useEffect(() => {
    initScrollAnimations();
    
    // Очистка при размонтировании компонента
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  // Эффект для блокировки скролла при открытии модального окна
  useEffect(() => {
    if (selectedTerm) {
      // На мобильных устройствах не блокируем скролл body, так как модальное окно само прокручивается
      const isMobile = window.innerWidth <= 768;
      if (!isMobile) {
        document.body.style.overflow = 'hidden';
      } else {
        // На мобильных прокручиваем overlay в самый верх при открытии
        setTimeout(() => {
          const overlay = document.querySelector('.modal-overlay');
          if (overlay) {
            overlay.scrollTop = 0;
          }
        }, 100);
      }
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [selectedTerm]);

  // Статические данные удалены - теперь загружаем из Supabase

  const filteredTerms = terms.filter((term) => {
    const currentLang = localStorage.getItem('language') || 'ru';
    
    // Сначала проверяем фильтр по букве
    const matchesLetter = activeLetter === 'all' || term.letter === activeLetter;
    
    // Если не подходит по букве, сразу отбрасываем
    if (!matchesLetter) {
      return false;
    }
    
    // Если поиск пустой, показываем все термины, подходящие по букве
    if (!searchTerm || searchTerm === '') {
      return true;
    }
    
    // Если есть поисковый запрос, проверяем его
    const termText = term.term[currentLang] || term.term.ru;
    const definitionText = term.definition[currentLang] || term.definition.ru;
    const fullContent = term.fullContent[currentLang] || term.fullContent.ru;
    const searchLower = searchTerm.toLowerCase();
    
    // Поиск в основных полях
    let matchesSearch = 
      termText.toLowerCase().includes(searchLower) ||
      definitionText.toLowerCase().includes(searchLower);
    
    // Поиск в fullContent, если он есть
    if (fullContent && typeof fullContent === 'object') {
      const fullContentStr = JSON.stringify(fullContent).toLowerCase();
      matchesSearch = matchesSearch || fullContentStr.includes(searchLower);
    }
    
    return matchesSearch;
  });

  const handleTermClick = (term) => {
    console.log('Клик по термину:', term.term.ru);
    setSelectedTerm(term);
  };

  const closeModal = () => {
    setSelectedTerm(null);
  };

  return (
    <div className="alphabet-page">
      {/* Page Header */}
      <section className="page-header">
        <div className="container">
          <h1>{t({ ru: 'Психологический алфавит', kz: 'Психологиялық әліпби' })}</h1>
          <p>{t({ ru: 'Здесь вы можете ознакомиться с информацией, советами и рекомендациями по связям, психическому здоровью, жизнестойкости и здоровому обучению.', kz: 'Мұнда сіз байланыстар, психикалық денсаулық, өмір сүру қабілеті және дұрыс оқу туралы ақпарат, кеңестер мен ұсыныстармен таныса аласыз.' })}</p>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="search-filter">
        <div className="container">
          <div className="search-box">
            <input
              type="text"
              placeholder={t({ ru: 'Поиск терминов...', kz: 'Терминдерді іздеу...' })}
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
            {searchTerm && (
            <div className="search-results-info">
              <p>{t({ 
                ru: `Найдено результатов: ${filteredTerms.length}`, 
                kz: `Табылған нәтижелер: ${filteredTerms.length}` 
              })}</p>
          </div>
          )}
          <div className="letter-filters">
            {['А', 'Б', 'В', 'Г', 'Д', 'З', 'И', 'К', 'Л', 'М', 'Н', 'О', 'П', 'Р', 'С', 'Т', 'Ч', 'Э'].map((letter) => (
              <button
                key={letter}
                className={activeLetter === letter ? 'active' : ''}
                onClick={() => handleLetterFilter(letter)}
              >
                {letter} ({getLetterCount(letter)})
              </button>
            ))}
            <button
              className={activeLetter === 'all' ? 'active' : ''}
              onClick={() => handleLetterFilter('all')}
            >
              {t({ ru: 'Все', kz: 'Барлығы' })} ({getLetterCount('all')})
            </button>
          </div>
        </div>
      </section>

      {/* Terms Grid */}
      <section className="terms-section">
        <div className="container">
          {searchTerm && (
            <div className="search-results-info">
              <p>{t({ 
                ru: `Найдено результатов: ${filteredTerms.length}`, 
                kz: `Табылған нәтижелер: ${filteredTerms.length}` 
              })}</p>
            </div>
          )}
          {loading ? (
            <div className="loading">
              <p>{t({ ru: 'Загрузка...', kz: 'Жүктелуде...' })}</p>
            </div>
          ) : filteredTerms.length === 0 ? (
            <div className="no-results">
              <p>{t({ 
                ru: 'По вашему запросу ничего не найдено. Попробуйте изменить поисковый запрос.', 
                kz: 'Сұрауыңыз бойынша ештеңе табылмады. Іздеу сұрауын өзгертіп көріңіз.' 
              })}</p>
            </div>
          ) : (
          <div className="terms-grid">
            {filteredTerms.map((term, index) => (
              <div
                key={`${term.letter}-${activeLetter}-${searchTerm}-${index}`}
                className={`term-card animate-on-scroll ${!term.image ? 'term-card-no-image' : ''}`}
                onClick={() => handleTermClick(term)}
              >
                <div className="term-letter">{term.letter}</div>
                {term.image && (
                  <div className="term-image">
                    <img src={term.image} alt={term.term[localStorage.getItem('language') || 'ru']} />
                  </div>
                )}
                <h3>{term.term[localStorage.getItem('language') || 'ru']}</h3>
                <p>{term.definition[localStorage.getItem('language') || 'ru'] || ''}</p>
                <button 
                  className="term-details-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTermClick(term);
                  }}
                >
                  {t({ ru: 'Подробнее', kz: 'Толығырақ' })}
                </button>
              </div>
            ))}
            </div>
          )}
        </div>
      </section>

      {/* Modal для отображения полной информации о термине */}
        {selectedTerm && (() => {
          const currentLang = localStorage.getItem('language') || 'ru';
        // Убеждаемся, что fullContent правильно структурирован
        let content = {};
        if (selectedTerm.fullContent) {
          if (typeof selectedTerm.fullContent === 'string') {
            try {
              content = JSON.parse(selectedTerm.fullContent);
            } catch (e) {
              console.warn('Ошибка парсинга fullContent:', e);
              content = {};
            }
          } else if (typeof selectedTerm.fullContent === 'object') {
            content = selectedTerm.fullContent[currentLang] || selectedTerm.fullContent.ru || selectedTerm.fullContent || {};
          }
        }
        
        return (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={closeModal} aria-label={t({ ru: 'Закрыть', kz: 'Жабу' })}>×</button>
              <div className="term-modal-header">
                <h2>{selectedTerm.term[currentLang] || selectedTerm.term.ru}</h2>
                <p className="term-letter-badge">{selectedTerm.letter}</p>
            </div>
              
              {selectedTerm.image && (
                <div className="term-modal-image">
                  <img src={selectedTerm.image} alt={selectedTerm.term[currentLang] || selectedTerm.term.ru} />
                </div>
              )}

              <div className="term-modal-body">
                {selectedTerm.definition[currentLang] && selectedTerm.definition[currentLang].trim() && (
                  <div className="term-definition-section">
                    <h3>{t({ ru: 'Определение', kz: 'Анықтама' })}</h3>
                    <p>{selectedTerm.definition[currentLang]}</p>
                </div>
              )}
              
              {content.description && (
              <div className="term-description">
                    <p style={{ whiteSpace: 'pre-line' }}>{content.description}</p>
              </div>
              )}

              {content.example && (
                <div className="term-example">
                    <h3>{t({ ru: 'Пример', kz: 'Мысал' })}</h3>
                    <p style={{ whiteSpace: 'pre-line' }}>{content.example}</p>
                </div>
              )}

              {content.explanation && (
              <div className="term-explanation">
                    <h3>{t({ ru: 'Объяснение', kz: 'Түсіндіру' })}</h3>
                  <p style={{ whiteSpace: 'pre-line' }}>{content.explanation}</p>
                </div>
              )}

              {content.whyImportant && (
                <div className="term-why-important">
                    <h3>{t({ ru: 'Почему это важно', kz: 'Бұл неге маңызды' })}</h3>
                  <p style={{ whiteSpace: 'pre-line' }}>{content.whyImportant}</p>
                </div>
              )}

                {content.symptoms && content.symptoms.length > 0 && (
                <div className="term-symptoms">
                    <h3>{t({ ru: 'Симптомы', kz: 'Симптомдар' })}</h3>
                    <ul>
                      {content.symptoms.map((symptom, idx) => (
                        <li key={idx}>{symptom}</li>
                    ))}
                  </ul>
                </div>
              )}

                {content.advice && content.advice.length > 0 && (
                  <div className="term-advice">
                    <h3>{t({ ru: 'Советы', kz: 'Кеңестер' })}</h3>
                    <ul>
                      {content.advice.map((advice, idx) => (
                        <li key={idx}>{advice}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {content.support && (
                  <div className="term-support">
                    <h3>{t({ ru: 'Поддержка', kz: 'Қолдау' })}</h3>
                    <p style={{ whiteSpace: 'pre-line' }}>{content.support}</p>
                  </div>
                )}

              {content.signal && (
                <div className="term-signal">
                  <h3>{t({ ru: 'Апатия может быть сигналом', kz: 'Апатия сигнал бола алады' })}</h3>
                  <p style={{ whiteSpace: 'pre-line' }}>{content.signal}</p>
                </div>
              )}

              {content.longTerm && (
                <div className="term-long-term">
                  <h3>{t({ ru: 'Последствия кибербуллинга', kz: 'Кибербуллингтің салдары' })}</h3>
                  <p style={{ whiteSpace: 'pre-line' }}>{content.longTerm}</p>
                </div>
              )}

              {content.normalChange && (
                <div className="term-normal-change">
                  <h3>{t({ ru: 'Повышайте свою мотивацию к учебе', kz: 'Оқуға деген мотивацияңызды арттырыңыз' })}</h3>
                  <p>{content.normalChange}</p>
                </div>
              )}

                {content.tips && content.tips.length > 0 && (
                <div className="term-tips">
                    <h3>{t({ ru: 'Советы', kz: 'Кеңестер' })}</h3>
                  <ul>
                      {content.tips.map((tip, idx) => (
                        <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              {content.talkAbout && (
                <div className="term-talk-about">
                    <h3>{t({ ru: 'Поговорите с кем-то', kz: 'Біреумен сөйлесіңіз' })}</h3>
                  <p style={{ whiteSpace: 'pre-line' }}>{content.talkAbout}</p>
                </div>
              )}

              {content.podcasts && content.podcasts.length > 0 && (
                <div className="term-resources">
                  <h3>{t({ ru: 'Подкасты:', kz: 'Подкастар:' })}</h3>
                  <ul className="resources-list">
                    {content.podcasts.map((podcast, index) => (
                      <li key={index}>
                        <strong>{podcast.name}</strong>
                        {podcast.description && <p>{podcast.description}</p>}
                          {podcast.link && <p><em>{t({ ru: 'Ссылка:', kz: 'Сілтеме:' })} <a href={podcast.link} target="_blank" rel="noopener noreferrer">{podcast.link}</a></em></p>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {content.books && content.books.length > 0 && (
                <div className="term-resources">
                  <h3>{t({ ru: 'Книги:', kz: 'Кітаптар:' })}</h3>
                  <ul className="resources-list">
                    {content.books.map((book, index) => (
                      <li key={index}>
                        <strong>{book.name}</strong>
                          {book.author && <p><em>{t({ ru: 'Автор:', kz: 'Автор:' })} {book.author}</em></p>}
                        {book.description && <p>{book.description}</p>}
                      </li>
                    ))}
                  </ul>
            </div>
              )}

              {content.articles && content.articles.length > 0 && (
                <div className="term-resources">
                  <h3>{t({ ru: 'Статьи:', kz: 'Мақалалар:' })}</h3>
                  <ul className="resources-list">
                    {content.articles.map((article, index) => (
                      <li key={index}>
                        <strong>{article.name}</strong>
                        {article.description && <p>{article.description}</p>}
                        {article.source && <p><em>{t({ ru: 'Источник:', kz: 'Дереккөз:' })} {article.source}</em></p>}
                      </li>
                    ))}
                  </ul>
        </div>
      )}
            </div>
              
              <div className="modal-footer">
                <button 
                  className="modal-close-btn" 
                  onClick={closeModal}
                >
                  {t({ ru: 'Закрыть', kz: 'Жабу' })}
                </button>
              </div>
          </div>
        </div>
        );
      })()}
    </div>
  );
};

export default Alphabet;
