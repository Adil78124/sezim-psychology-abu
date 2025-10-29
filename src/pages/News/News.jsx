import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { supabase } from '../../supabaseClient';
import './News.css';

const News = () => {
  const { t } = useLanguage();
  const [activeFilter, setActiveFilter] = useState('all');
  const [firestoreNews, setFirestoreNews] = useState([]);

  const newsData = [
    {
      id: 1,
      category: 'events',
      title: {
        ru: 'Неделя психологии 6-10 октября',
        kz: 'Психология аптасы 6-10 қазан',
      },
      date: '6 октября 2025',
      description: {
        ru: 'Приглашаем всех студентов на Неделю психологии! Вас ждут квесты, мастер-классы, тренинги, психологический кинотеатр и многое другое. Участвуйте, развивайтесь, получайте призы!',
        kz: 'Барлық студенттерді Психология аптасына шақырамыз! Сізді квесттер, шеберлік сабақтары, тренингтер, психологиялық кинотеатр және т.б. күтеді. Қатысыңыз, дамыңыз, сыйлықтар алыңыз!',
      },
      image: '/images/Новость Неделя психологии.jpeg',
      featured: true,
      link: null,
    },
    {
      id: 2,
      category: 'news',
      title: { 
        ru: 'Адаптационный тренинг для студентов 1 курса', 
        kz: '1 курс студенттеріне арналған бейімдеу тренингі' 
      },
      date: '16 сентября 2024',
      description: {
        ru: '16 сентября для наших первокурсников гуманитарного факультета прошел адаптационный тренинг в формате квеста "Приключение первокурсника". Студенты познакомились с факультетом и завели новые знакомства.',
        kz: '16 қыркүйекте гуманитарлық факультет бірінші курс студенттері үшін "Бірінші курс студентінің оқиғасы" квесті форматында бейімдеу тренингі өтті. Студенттер факультетпен танысты және жаңа танысты.',
      },
      image: '/images/Новость Адаптационный тренинг для студентов 1 курса.jpeg',
      link: 'https://www.instagram.com/share/BBv0goq2XR',
    },
    {
      id: 3,
      category: 'news',
      title: { 
        ru: 'Тренинг для первокурсников кафедры Педагогики и психологии', 
        kz: 'Педагогика және психология кафедрасының бірінші курс студенттеріне арналған тренинг' 
      },
      date: '20 сентября 2024',
      description: {
        ru: 'На кафедре Педагогики и психологии прошёл тренинг для студентов первого курса под руководством преподавателя Базарбаевой Махаббат Саяткызы. Мероприятие было направлено на сплочение группы и развитие коммуникативных навыков.',
        kz: 'Педагогика және психология кафедрасында Базарбаева Махаббат Саяткызының жетекшілігімен бірінші курс студенттеріне арналған тренинг өтті. Іс-шара топты біріктіруге және коммуникативтік дағдыларды дамытуға бағытталды.',
      },
      image: '/images/Новость Тренинг для первокурсников кафедры Педагогики и психологии.jpeg',
      link: 'https://www.instagram.com/share/BAPf82AWCw',
    },
    {
      id: 4,
      category: 'events',
      title: { 
        ru: 'Психологический кинотеатр для студентов общежитий', 
        kz: 'Жатақхана студенттеріне арналған психологиялық кинотеатр' 
      },
      date: '25 сентября 2024',
      description: {
        ru: 'Приглашаем студентов общежитий на просмотр психологических фильмов: "Душа", "Головоломка", "Не волнуйся, он далеко не уйдет", "Я - Сэм". После просмотра - обсуждение с психологом.',
        kz: 'Жатақхана студенттерін психологиялық фильмдерді көруге шақырамыз: "Жан", "Басқатырғыш", "Уайымдама, ол алысқа кетпейді", "Мен - Сэм". Көрүден кейін - психологпен талқылау.',
      },
      image: '/images/news-3.jpg',
      link: null,
    },
    {
      id: 5,
      category: 'news',
      title: { 
        ru: 'Тренинг для студентов в общежитии', 
        kz: 'Жатақханадағы студенттерге арналған тренинг' 
      },
      date: '5 октября 2024',
      description: {
        ru: 'В общежитии прошел психологический тренинг для студентов. Участники освоили техники управления стрессом, эмоциональной регуляции и эффективной коммуникации.',
        kz: 'Жатақханада студенттерге арналған психологиялық тренинг өтті. Қатысушылар стрессті басқару, эмоционалды реттеу және тиімді қарым-қатынас жасау әдістерін меңгерді.',
      },
      image: '/images/news-4.jpg',
      link: null,
    },
    {
      id: 6,
      category: 'articles',
      title: { 
        ru: 'Открытые занятия по психологии для студентов', 
        kz: 'Студенттерге арналған ашық психология сабақтары' 
      },
      date: '10 октября 2024',
      description: {
        ru: 'Приглашаем всех желающих студентов на открытые занятия по психологии. Обсуждаем актуальные темы: стресс-менеджмент, эмоциональный интеллект, лидерские качества.',
        kz: 'Барлық қалаушы студенттерді психология бойынша ашық сабақтарға шақырамыз. Өзекті тақырыптарды талқылаймыз: стресс-менеджмент, эмоционалды интеллект, көшбасшылық қасиеттер.',
      },
      image: '/images/news-5.jpg',
      link: null,
    },
  ];

  // Загружаем новости из Supabase
  useEffect(() => {
    const loadNews = async () => {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Ошибка загрузки новостей:', error);
        return;
      }
      
      const newsFromSupabase = data.map(item => ({
        id: `supabase-${item.id}`,
        supabaseId: item.id,
        category: 'news',
        title: { ru: item.title, kz: item.title },
        date: item.created_at ? new Date(item.created_at).toLocaleDateString('ru-RU') : 'Недавно',
        description: { ru: item.short_content || item.content || '', kz: item.short_content || item.content || '' },
        image: item.image_url || '/images/news-1.jpg',
        featured: false,
        link: item.link || null,
      }));
      
      setFirestoreNews(newsFromSupabase);
    };

    loadNews();

    // Подписываемся на изменения в таблице news
    const newsSubscription = supabase
      .channel('news_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'news' },
        () => {
          loadNews(); // Перезагружаем новости при изменениях
        }
      )
      .subscribe();

    return () => newsSubscription.unsubscribe();
  }, []);

  // Объединяем статические новости с новостями из Firestore
  const allNews = [...firestoreNews, ...newsData];

  const filteredNews = allNews.filter(
    (item) => activeFilter === 'all' || item.category === activeFilter
  );

  const featuredNews = newsData.find((item) => item.featured);
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

