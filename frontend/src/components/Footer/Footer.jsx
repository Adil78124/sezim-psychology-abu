import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import './Footer.css';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Sezim.abu</h3>
            <p>{t({ ru: 'Центр психологической поддержки студентов', kz: 'Студенттерге психологиялық қолдау орталығы' })}</p>
            <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
              {t({ 
                ru: 'Alikhan Bokeikhan University', 
                kz: 'Alikhan Bokeikhan University' 
              })}
            </p>
          </div>
          <div className="footer-section">
            <h4>{t({ ru: 'Навигация', kz: 'Навигация' })}</h4>
            <ul>
              <li><Link to="/">{t({ ru: 'Главная', kz: 'Басты бет' })}</Link></li>
              <li><Link to="/psychologists">{t({ ru: 'Психологи', kz: 'Психологтар' })}</Link></li>
              <li><Link to="/students">{t({ ru: 'Студентам', kz: 'Студенттерге' })}</Link></li>
              <li><Link to="/contacts">{t({ ru: 'Контакты', kz: 'Байланыс' })}</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>{t({ ru: 'Контакты', kz: 'Байланыс' })}</h4>
            <p>
              <a href="tel:+77056250389" style={{ color: 'inherit', textDecoration: 'none' }}>
                📞 +7 (705) 625-03-89
              </a>
            </p>
            <p>
              <a 
                href="https://www.instagram.com/pp_gumfac_bokeikhan?igsh=ZmN1cnhqMnl5ZGoy" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: 'inherit', textDecoration: 'none' }}
              >
                📷 Instagram
              </a>
            </p>
            <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', lineHeight: '1.6' }}>
              {t({ ru: '🆘 Телефоны доверия:', kz: '🆘 Сенім телефондары:' })}<br/>
              <a href="tel:1307" style={{ color: 'var(--primary-blue)', fontWeight: 'bold', textDecoration: 'none' }}>1307</a> - 
              {t({ ru: ' Анонимный телефон доверия регионального центра психологической поддержки', kz: ' Аймақтық психологиялық қолдау орталығының анонимді сенім телефоны' })}<br/>
              <a href="tel:111" style={{ color: 'var(--primary-blue)', fontWeight: 'bold', textDecoration: 'none' }}>111</a> - 
              {t({ ru: ' Круглосуточный контакт-центр по защите прав детей, семьи и женщин', kz: ' Балалардың, отбасының және әйелдердің құқықтарын қорғау жөніндегі тәуліктік байланыс орталығы' })}
            </p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>
            &copy; 2025 Sezim.abu.{' '}
            <span>{t({ ru: 'Все права защищены.', kz: 'Барлық құқықтар қорғалған.' })}</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

