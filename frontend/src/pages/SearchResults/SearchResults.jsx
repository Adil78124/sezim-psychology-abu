import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { supabase } from '../../supabaseClient';
import './SearchResults.css';

const SearchResults = () => {
  const { t, language } = useLanguage();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    if (query.trim()) {
      performSearch(query.trim());
    }
  }, [query, language]);

  const performSearch = async (searchQuery) => {
    setLoading(true);
    try {
      const allResults = [];

      // Поиск по терминам алфавита
      const { data: alphabetTerms } = await supabase
        .from('alphabet_items')
        .select('id, term_ru, term_kz, letter, definition_ru, definition_kz')
        .or(`term_ru.ilike.%${searchQuery}%,term_kz.ilike.%${searchQuery}%,definition_ru.ilike.%${searchQuery}%,definition_kz.ilike.%${searchQuery}%`);

      if (alphabetTerms) {
        alphabetTerms.forEach(term => {
          allResults.push({
            type: 'alphabet',
            id: term.id,
            title: language === 'kz' ? (term.term_kz || term.term_ru) : term.term_ru,
            subtitle: language === 'kz' ? (term.definition_kz || term.definition_ru) : (term.definition_ru || ''),
            letter: term.letter,
            url: `/alphabet?letter=${term.letter}&highlight=${term.id}`
          });
        });
      }

      // Поиск по новостям
      const { data: news } = await supabase
        .from('news')
        .select('id, title, short_content, created_at')
        .ilike('title', `%${searchQuery}%`);

      if (news) {
        news.forEach(item => {
          allResults.push({
            type: 'news',
            id: item.id,
            title: item.title,
            subtitle: item.short_content ? item.short_content.substring(0, 150) + '...' : '',
            date: item.created_at,
            url: `/news/${item.id}`
          });
        });
      }

      // Поиск по психологам
      const { data: psychologists } = await supabase
        .from('psychologists')
        .select('id, name_ru, name_kz, position_ru, position_kz')
        .or(`name_ru.ilike.%${searchQuery}%,name_kz.ilike.%${searchQuery}%,position_ru.ilike.%${searchQuery}%,position_kz.ilike.%${searchQuery}%`);

      if (psychologists) {
        psychologists.forEach(psych => {
          allResults.push({
            type: 'psychologist',
            id: psych.id,
            title: language === 'kz' ? (psych.name_kz || psych.name_ru) : psych.name_ru,
            subtitle: language === 'kz' ? (psych.position_kz || psych.position_ru) : psych.position_ru,
            url: `/psychologists#psych-${psych.id}`
          });
        });
      }

      // Поиск по упражнениям
      const { data: exercises } = await supabase
        .from('exercises')
        .select('id, title_ru, title_kz, goal_ru, goal_kz')
        .or(`title_ru.ilike.%${searchQuery}%,title_kz.ilike.%${searchQuery}%,goal_ru.ilike.%${searchQuery}%,goal_kz.ilike.%${searchQuery}%`);

      if (exercises) {
        exercises.forEach(ex => {
          allResults.push({
            type: 'exercise',
            id: ex.id,
            title: language === 'kz' ? (ex.title_kz || ex.title_ru) : ex.title_ru,
            subtitle: language === 'kz' ? (ex.goal_kz || ex.goal_ru) : ex.goal_ru,
            url: `/students#exercise-${ex.id}`
          });
        });
      }

      setResults(allResults);
    } catch (error) {
      console.error('Ошибка поиска:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type) => {
    const labels = {
      alphabet: { ru: 'Алфавит', kz: 'Әліпби' },
      news: { ru: 'Новость', kz: 'Жаңалық' },
      psychologist: { ru: 'Психолог', kz: 'Психолог' },
      exercise: { ru: 'Упражнение', kz: 'Жаттығу' }
    };
    return labels[type] ? t(labels[type]) : type;
  };

  const getTypeIcon = (type) => {
    const icons = {
      alphabet: '🔤',
      news: '📰',
      psychologist: '👤',
      exercise: '💪'
    };
    return icons[type] || '📄';
  };

  const filteredResults = activeFilter === 'all' 
    ? results 
    : results.filter(r => r.type === activeFilter);

  const resultCounts = {
    all: results.length,
    alphabet: results.filter(r => r.type === 'alphabet').length,
    news: results.filter(r => r.type === 'news').length,
    psychologist: results.filter(r => r.type === 'psychologist').length,
    exercise: results.filter(r => r.type === 'exercise').length
  };

  return (
    <div className="search-results-page">
      <div className="container">
        <div className="search-results-header">
          <h1>{t({ ru: 'Результаты поиска', kz: 'Іздеу нәтижелері' })}</h1>
          {query && (
            <p className="search-query">
              {t({ ru: 'По запросу:', kz: 'Сұрау бойынша:' })} <strong>"{query}"</strong>
            </p>
          )}
        </div>

        {loading ? (
          <div className="search-loading">
            <p>{t({ ru: 'Поиск...', kz: 'Іздеу...' })}</p>
          </div>
        ) : (
          <>
            {results.length > 0 && (
              <div className="search-filters">
                <button
                  className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setActiveFilter('all')}
                >
                  {t({ ru: 'Все', kz: 'Барлығы' })} ({resultCounts.all})
                </button>
                {resultCounts.alphabet > 0 && (
                  <button
                    className={`filter-btn ${activeFilter === 'alphabet' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('alphabet')}
                  >
                    🔤 {t({ ru: 'Алфавит', kz: 'Әліпби' })} ({resultCounts.alphabet})
                  </button>
                )}
                {resultCounts.news > 0 && (
                  <button
                    className={`filter-btn ${activeFilter === 'news' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('news')}
                  >
                    📰 {t({ ru: 'Новости', kz: 'Жаңалықтар' })} ({resultCounts.news})
                  </button>
                )}
                {resultCounts.psychologist > 0 && (
                  <button
                    className={`filter-btn ${activeFilter === 'psychologist' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('psychologist')}
                  >
                    👤 {t({ ru: 'Психологи', kz: 'Психологтар' })} ({resultCounts.psychologist})
                  </button>
                )}
                {resultCounts.exercise > 0 && (
                  <button
                    className={`filter-btn ${activeFilter === 'exercise' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('exercise')}
                  >
                    💪 {t({ ru: 'Упражнения', kz: 'Жаттығулар' })} ({resultCounts.exercise})
                  </button>
                )}
              </div>
            )}

            {filteredResults.length === 0 && !loading && (
              <div className="search-no-results">
                <p>{t({ ru: 'Ничего не найдено', kz: 'Ештеңе табылмады' })}</p>
                <Link to="/" className="btn btn-primary">
                  {t({ ru: 'Вернуться на главную', kz: 'Басты бетке оралу' })}
                </Link>
              </div>
            )}

            {filteredResults.length > 0 && (
              <div className="search-results-list">
                {filteredResults.map((result, index) => (
                  <Link
                    key={`${result.type}-${result.id}-${index}`}
                    to={result.url}
                    className="search-result-card"
                  >
                    <div className="result-icon">{getTypeIcon(result.type)}</div>
                    <div className="result-content">
                      <h3 className="result-title">{result.title}</h3>
                      {result.subtitle && (
                        <p className="result-subtitle">{result.subtitle}</p>
                      )}
                      <div className="result-meta">
                        <span className="result-type">{getTypeLabel(result.type)}</span>
                        {result.date && (
                          <span className="result-date">
                            {new Date(result.date).toLocaleDateString(language === 'kz' ? 'kk-KZ' : 'ru-RU')}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchResults;

