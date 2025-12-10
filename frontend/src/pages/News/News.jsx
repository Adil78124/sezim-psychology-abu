import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { supabase } from '../../supabaseClient';
import './News.css';

const News = () => {
  const { t } = useLanguage();
  const [activeFilter, setActiveFilter] = useState('all');
  const [firestoreNews, setFirestoreNews] = useState([]);

  // Загружаем новости из Supabase
  useEffect(() => {
    const loadNews = async () => {
      // Проверяем, что supabase клиент инициализирован
      if (!supabase || typeof supabase.from !== 'function') {
        console.warn('Supabase клиент не готов, пропускаем загрузку новостей');
        return;
      }

      try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Ошибка загрузки новостей:', error);
        return;
      }
      
        if (data) {
      const newsFromSupabase = data.map(item => ({
        id: `supabase-${item.id}`,
        supabaseId: item.id,
        category: 'news',
        title: { ru: item.title, kz: item.title },
            date: item.created_at ? new Date(item.created_at).toLocaleDateString('ru-RU') : t({ ru: 'Недавно', kz: 'Жақында' }),
        description: { ru: item.short_content || item.content || '', kz: item.short_content || item.content || '' },
        image: item.image_url || '/images/news-1.jpg',
        featured: item.is_main || false,
        link: item.link || null,
      }));
      
      setFirestoreNews(newsFromSupabase);
        }
      } catch (error) {
        console.error('Ошибка при загрузке новостей:', error);
      }
    };

    loadNews();

    // Подписываемся на изменения в таблице news (только если channel доступен)
    let newsSubscription = null;
    if (supabase && typeof supabase.channel === 'function') {
      try {
        newsSubscription = supabase
      .channel('news_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'news' },
        () => {
          loadNews(); // Перезагружаем новости при изменениях
        }
      )
      .subscribe();
      } catch (error) {
        console.warn('Не удалось подписаться на изменения новостей:', error);
      }
    }

    return () => {
      if (newsSubscription && typeof newsSubscription.unsubscribe === 'function') {
        newsSubscription.unsubscribe();
      }
    };
  }, [t]);

  // Используем только новости из Supabase
  const allNews = firestoreNews;

  const filteredNews = allNews.filter(
    (item) => activeFilter === 'all' || item.category === activeFilter
  );

  // Ищем главную новость из Supabase
  const featuredNews = firestoreNews.find((item) => item.featured);
  const regularNews = filteredNews.filter((item) => !item.featured);

  const getCategoryBadge = (category) => {
    const badges = {
      news: { ru: 'Новость', kz: 'Жаңалық' },
      events: { ru: 'Мероприятие', kz: 'Іс-шара' },
      articles: { ru: 'Статья', kz: 'Мақала' },
    };
    return t(badges[category]);
  };

  return (
    <div className="news-page">
      {/* Page Header */}
      <section className="page-header">
        <div className="container">
          <h1>{t({ ru: 'Новости и события', kz: 'Жаңалықтар мен оқиғалар' })}</h1>
          <p>
            {t({
              ru: 'Актуальные публикации, анонсы мероприятий и полезные статьи',
              kz: 'Өзекті жарияланымдар, іс-шаралардың анонстары және пайдалы мақалалар',
            })}
          </p>
        </div>
      </section>

      {/* Filter Section */}
      <section className="news-filter">
        <div className="container">
          <div className="filter-buttons">
            <button
              className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              {t({ ru: 'Все', kz: 'Барлығы' })}
            </button>
            <button
              className={`filter-btn ${activeFilter === 'news' ? 'active' : ''}`}
              onClick={() => setActiveFilter('news')}
            >
              {t({ ru: 'Новости', kz: 'Жаңалықтар' })}
            </button>
            <button
              className={`filter-btn ${activeFilter === 'events' ? 'active' : ''}`}
              onClick={() => setActiveFilter('events')}
            >
              {t({ ru: 'Мероприятия', kz: 'Іс-шаралар' })}
            </button>
            <button
              className={`filter-btn ${activeFilter === 'articles' ? 'active' : ''}`}
              onClick={() => setActiveFilter('articles')}
            >
              {t({ ru: 'Статьи', kz: 'Мақалалар' })}
            </button>
          </div>
        </div>
      </section>

      {/* Featured News */}
      {featuredNews && (activeFilter === 'all' || featuredNews.category === activeFilter) && (
        <section className="featured-news">
          <div className="container">
            <div className="featured-card">
              <div className="featured-image">
                <img src={featuredNews.image} alt={t(featuredNews.title)} />
              </div>
              <div className="featured-content">
                <span className={`news-badge badge-${featuredNews.category}`}>
                  {getCategoryBadge(featuredNews.category)}
                </span>
                <h2>{t(featuredNews.title)}</h2>
                <p className="news-date">{featuredNews.date}</p>
                <p>{t(featuredNews.description)}</p>
                <Link to={`/news/${featuredNews.id}`} className="btn btn-primary">
                  {t({ ru: 'Читать далее', kz: 'Толығырақ оқу' })}
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* News Grid */}
      <section className="news-section">
        <div className="container">
          <div className="news-grid">
            {regularNews.map((item, index) => (
              <article key={index} className="news-card">
                <div className="news-image">
                  <img src={item.image} alt={t(item.title)} />
                </div>
                <div className="news-content">
                  <span className={`news-badge badge-${item.category}`}>
                    {getCategoryBadge(item.category)}
                  </span>
                  <h3>{t(item.title)}</h3>
                  <p className="news-date">{item.date}</p>
                  <p>{t(item.description)}</p>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                    {item.id && (
                      <Link to={`/news/${item.id}`} className="news-link">
                        {t({ ru: 'Подробнее →', kz: 'Толығырақ →' })}
                      </Link>
                    )}
                    {item.link && (
                      <a 
                        href={item.link} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="news-link"
                        style={{ color: '#e1306c' }}
                      >
                        📷 Instagram →
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default News;

