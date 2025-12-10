import { useParams, Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { storiesData } from '../../data/storiesData';
import './StoryDetail.css';

const StoryDetail = () => {
  const { t } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();

  const allStories = storiesData;

  const story = allStories.find((item) => item.id === parseInt(id));

  if (!story) {
    return (
      <div className="story-detail-page">
        <div className="container">
          <div className="story-not-found">
            <h1>{t({ ru: 'История не найдена', kz: 'Оқиға табылмады' })}</h1>
            <Link to="/stories" className="btn btn-primary">
              {t({ ru: 'Вернуться к историям', kz: 'Оқиғаларға оралу' })}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Другие истории для секции "Посмотрите ещё другие истории"
  const otherStories = allStories.filter((s) => s.id !== story.id);

  return (
    <div className="story-detail-page">
      <div className="container">
        {/* Breadcrumbs */}
        <div className="breadcrumbs">
          <Link to="/">{t({ ru: 'Главная', kz: 'Басты бет' })}</Link>
          <span>/</span>
          <Link to="/stories">{t({ ru: 'Мотивирующие истории', kz: 'Жігерлендіретін оқиғалар' })}</Link>
          <span>/</span>
          <span>{t(story.name)}</span>
        </div>

        {/* Story Header */}
        <article className="story-detail">
          <div className="story-detail-header">
            <h1>{t(story.name)}</h1>
            {story.quote && (
              <p className="story-quote">{t(story.quote)}</p>
            )}
          </div>

          {/* Story Content */}
          {story.fullStory && (
            <div className="story-detail-content">
              <p>{t(story.fullStory)}</p>
            </div>
          )}

          {/* Video Placeholder */}
          <div className="story-video">
            <div className="video-placeholder">
              <div className="video-placeholder-icon">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 5V19L19 12L8 5Z" fill="currentColor"/>
                </svg>
              </div>
              <p className="video-placeholder-text">
                {t({ ru: 'Видео будет добавлено позже', kz: 'Бейне кейінірек қосылады' })}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="story-detail-actions">
            <button onClick={() => navigate(-1)} className="btn btn-secondary">
              ← {t({ ru: 'Назад', kz: 'Артқа' })}
            </button>
          </div>
        </article>

        {/* More Stories Section */}
        {otherStories.length > 0 && (
          <section className="more-stories">
            <h2>{t({ ru: 'Посмотрите ещё другие истории', kz: 'Тағы басқа оқиғаларды көріңіз' })}</h2>
            <div className="more-stories-grid">
              {otherStories.map((otherStory) => {
                const colors = otherStory.gender === 'female' 
                  ? ['#FFB6C1', '#FFC0CB', '#FFD1DC', '#FFE4E1', '#F0E6F6']
                  : ['#87CEEB', '#B0E0E6', '#ADD8E6', '#AFEEEE', '#E0F6FF'];
                const bgColor = colors[otherStory.id % colors.length];

                return (
                  <div
                    key={otherStory.id}
                    className="more-story-card"
                    onClick={() => navigate(`/stories/${otherStory.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="more-story-avatar" style={{ backgroundColor: bgColor }}>
                      <span className="avatar-icon">
                        {otherStory.gender === 'female' ? '👩' : '👨'}
                      </span>
                    </div>
                    <div className="more-story-info">
                      <h3>{t(otherStory.name)}</h3>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default StoryDetail;

