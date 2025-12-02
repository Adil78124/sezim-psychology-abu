import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { supabase } from '../../supabaseClient';
import './NewsDetail.css';

const NewsDetail = () => {
  const { t } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);

  // Загружаем новость из Supabase
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const loadNews = async () => {
      setLoading(true);
      
      // Извлекаем ID - может быть "supabase-{id}" или просто числовой ID
      let supabaseId = null;
      if (id && id.startsWith('supabase-')) {
        supabaseId = id.replace('supabase-', '');
      } else if (id && !isNaN(parseInt(id))) {
        // Если ID числовой, пробуем использовать напрямую
        supabaseId = parseInt(id);
      }
      
      if (supabaseId) {
        const { data, error } = await supabase
          .from('news')
          .select('*')
          .eq('id', supabaseId)
          .single();
        
        if (error) {
          console.error('Ошибка загрузки новости:', error);
          setNews(null);
        } else if (data) {
          // Преобразуем данные из Supabase в формат компонента
          const shortText = data.short_content || data.content || '';
          const fullText = data.full_content || data.content || '';
          setNews({
            id: `supabase-${data.id}`,
            supabaseId: data.id,
            category: 'news',
            title: { ru: data.title, kz: data.title },
            date: data.created_at ? new Date(data.created_at).toLocaleDateString('ru-RU') : t({ ru: 'Недавно', kz: 'Жақында' }),
            description: { ru: shortText.substring(0, 200) || '', kz: shortText.substring(0, 200) || '' },
            fullContent: { ru: fullText, kz: fullText },
            image: data.image_url || '/images/news-1.jpg',
            featured: false,
            link: data.link || null,
          });
        }
      } else {
        // Если ID не распознан, новость не найдена
        setNews(null);
      }
      
      setLoading(false);
    };

    loadNews();
  }, [id]);

  const getCategoryBadge = (category) => {
    const badges = {
      news: { ru: 'Новость', kz: 'Жаңалық' },
      events: { ru: 'Мероприятие', kz: 'Іс-шара' },
      articles: { ru: 'Статья', kz: 'Мақала' },
    };
    return t(badges[category] || { ru: 'Новость', kz: 'Жаңалық' });
  };

  if (loading) {
    return (
      <div className="news-detail-page">
        <div className="container">
          <div className="news-loading">
            <div className="loading-spinner"></div>
            <p>{t({ ru: 'Загрузка...', kz: 'Жүктелуде...' })}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="news-detail-page">
        <div className="container">
          <div className="news-not-found">
            <h1>{t({ ru: 'Новость не найдена', kz: 'Жаңалық табылмады' })}</h1>
            <Link to="/news" className="btn btn-primary">
              {t({ ru: 'Вернуться к новостям', kz: 'Жаңалықтарға оралу' })}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="news-detail-page">
      <div className="container">
        {/* Breadcrumbs */}
        <div className="breadcrumbs">
          <Link to="/">{t({ ru: 'Главная', kz: 'Басты бет' })}</Link>
          <span>/</span>
          <Link to="/news">{t({ ru: 'Новости', kz: 'Жаңалықтар' })}</Link>
          <span>/</span>
          <span>{t(news.title)}</span>
        </div>

        {/* News Detail */}
        <div className="news-detail-header">
          <div className="news-detail-meta">
            <span className="news-category-badge">{getCategoryBadge(news.category)}</span>
            <span className="news-date">{news.date}</span>
          </div>
          <h1 className="news-detail-title">{t(news.title)}</h1>
          {news.image && (
            <div className="news-detail-image">
              <img src={news.image} alt={t(news.title)} />
            </div>
          )}
        </div>

        <div className="news-detail-content">
          {news.fullContent && typeof t(news.fullContent) === 'string' && t(news.fullContent).includes('<') ? (
            <div dangerouslySetInnerHTML={{ __html: t(news.fullContent) }} />
          ) : (
            <div style={{ whiteSpace: 'pre-wrap' }}>{t(news.fullContent || news.description)}</div>
          )}
        </div>

        {news.link && (
          <div className="news-detail-link">
            <a href={news.link} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              {t({ ru: 'Подробнее', kz: 'Толығырақ' })}
            </a>
          </div>
        )}

        <div className="news-detail-actions">
          <button onClick={() => navigate(-1)} className="btn btn-secondary">
            {t({ ru: 'Назад', kz: 'Артқа' })}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewsDetail;
