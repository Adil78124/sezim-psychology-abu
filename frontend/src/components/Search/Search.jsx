import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { supabase } from '../../supabaseClient';
import './Search.css';

const Search = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  // Закрытие при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Фокус на input при открытии
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const performSearch = useCallback(async (searchQuery) => {
    setLoading(true);
    try {
      const results = [];

      // Поиск по терминам алфавита
      const { data: alphabetTerms } = await supabase
        .from('alphabet_items')
        .select('id, term_ru, term_kz, letter, definition_ru, definition_kz')
        .or(`term_ru.ilike.%${searchQuery}%,term_kz.ilike.%${searchQuery}%,definition_ru.ilike.%${searchQuery}%,definition_kz.ilike.%${searchQuery}%`)
        .limit(5);

      if (alphabetTerms) {
        alphabetTerms.forEach(term => {
          results.push({
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
        .ilike('title', `%${searchQuery}%`)
        .limit(5);

      if (news) {
        news.forEach(item => {
          results.push({
            type: 'news',
            id: item.id,
            title: item.title,
            subtitle: item.short_content ? item.short_content.substring(0, 100) + '...' : '',
            url: `/news/${item.id}`
          });
        });
      }

      // Поиск по психологам
      const { data: psychologists } = await supabase
        .from('psychologists')
        .select('id, name_ru, name_kz, position_ru, position_kz')
        .or(`name_ru.ilike.%${searchQuery}%,name_kz.ilike.%${searchQuery}%,position_ru.ilike.%${searchQuery}%,position_kz.ilike.%${searchQuery}%`)
        .limit(5);

      if (psychologists) {
        psychologists.forEach(psych => {
          results.push({
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
        .or(`title_ru.ilike.%${searchQuery}%,title_kz.ilike.%${searchQuery}%,goal_ru.ilike.%${searchQuery}%,goal_kz.ilike.%${searchQuery}%`)
        .limit(5);

      if (exercises) {
        exercises.forEach(ex => {
          results.push({
            type: 'exercise',
            id: ex.id,
            title: language === 'kz' ? (ex.title_kz || ex.title_ru) : ex.title_ru,
            subtitle: language === 'kz' ? (ex.goal_kz || ex.goal_ru) : ex.goal_ru,
            url: `/students#exercise-${ex.id}`
          });
        });
      }

      setResults(results);
    } catch (error) {
      console.error('Ошибка поиска:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [language]);

  // Поиск с задержкой (debounce)
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchTimeout = setTimeout(() => {
      performSearch(query.trim());
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query, performSearch]);

  const handleResultClick = (url) => {
    navigate(url);
    setIsOpen(false);
    setQuery('');
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

  return (
    <div className="search-container" ref={searchRef}>
      <button
        className="search-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t({ ru: 'Поиск', kz: 'Іздеу' })}
      >
        🔍
      </button>

      {isOpen && (
        <div className="search-dropdown">
          <div className="search-input-wrapper">
            <input
              ref={inputRef}
              type="text"
              className="search-input"
              placeholder={t({ ru: 'Поиск по сайту...', kz: 'Сайт бойынша іздеу...' })}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {loading && <div className="search-loading">⏳</div>}
          </div>

          {query.trim() && (
            <div className="search-results">
              {results.length === 0 && !loading && (
                <div className="search-no-results">
                  {t({ ru: 'Ничего не найдено', kz: 'Ештеңе табылмады' })}
                </div>
              )}

              {results.length > 0 && (
                <>
                  {results.map((result, index) => (
                    <div
                      key={`${result.type}-${result.id}-${index}`}
                      className="search-result-item"
                      onClick={() => handleResultClick(result.url)}
                    >
                      <div className="search-result-icon">{getTypeIcon(result.type)}</div>
                      <div className="search-result-content">
                        <div className="search-result-title">{result.title}</div>
                        {result.subtitle && (
                          <div className="search-result-subtitle">{result.subtitle}</div>
                        )}
                        <div className="search-result-type">{getTypeLabel(result.type)}</div>
                      </div>
                    </div>
                  ))}
                  <div className="search-more">
                    <button
                      className="search-more-btn"
                      onClick={() => {
                        navigate(`/search?q=${encodeURIComponent(query)}`);
                        setIsOpen(false);
                      }}
                    >
                      {t({ ru: 'Показать все результаты', kz: 'Барлық нәтижелерді көрсету' })}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {!query.trim() && (
            <div className="search-hints">
              <div className="search-hint-title">
                {t({ ru: 'Попробуйте найти:', kz: 'Табуға тырысыңыз:' })}
              </div>
              <div className="search-hint-items">
                <span>🔤 {t({ ru: 'Термины', kz: 'Терминдер' })}</span>
                <span>📰 {t({ ru: 'Новости', kz: 'Жаңалықтар' })}</span>
                <span>👤 {t({ ru: 'Психологов', kz: 'Психологтар' })}</span>
                <span>💪 {t({ ru: 'Упражнения', kz: 'Жаттығулар' })}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;

