import { useLanguage } from '../../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { storiesData } from '../../data/storiesData';
import './Stories.css';

const Stories = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const stories = storiesData;

  return (
    <div className="stories">
      <div className="page-header">
        <div className="container">
          <h1>{t({ ru: 'Мотивирующие истории', kz: 'Жігерлендіретін оқиғалар' })}</h1>
          <p>
            {t({
              ru: 'Ты не один. Вдохновляйся рассказами других студентов о уязвимости и сомнениях — и, главное, о силе взаимной поддержки и связи.',
              kz: 'Сен жалғыз емессің. Басқа студенттердің әлсіздік пен күмән туралы әңгімелерінен шабыт ал — және, ең бастысы, өзара қолдау мен байланыс күші туралы.',
            })}
          </p>
        </div>
      </div>

      <div className="container">
        <div className="stories-content">
          <div className="stories-grid">
            {stories.map((story) => {
              const colors = story.gender === 'female' 
                ? ['#FFB6C1', '#FFC0CB', '#FFD1DC', '#FFE4E1', '#F0E6F6']
                : ['#87CEEB', '#B0E0E6', '#ADD8E6', '#AFEEEE', '#E0F6FF'];
              const bgColor = colors[story.id % colors.length];
              
              return (
                <div 
                  key={story.id} 
                  className="story-card"
                  onClick={() => navigate(`/stories/${story.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="story-avatar" style={{ backgroundColor: bgColor }}>
                    <span className="avatar-icon">
                      {story.gender === 'female' ? '👩' : '👨'}
                    </span>
                  </div>
                  <div className="story-info">
                    <h3 className="story-name">{t(story.name)}</h3>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stories;

