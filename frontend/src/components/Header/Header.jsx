import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import Search from '../Search/Search';
import './Header.css';

const Header = () => {
  const { language, toggleLanguage, t } = useLanguage();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const navLinks = [
    { path: '/', label: { ru: 'Главная', kz: 'Басты бет' } },
    { path: '/psychologists', label: { ru: 'Психологи', kz: 'Психологтар' } },
    { path: '/alphabet', label: { ru: 'Психологический алфавит', kz: 'Психологиялық әліпби' } },
    { path: '/students', label: { ru: 'Студентам', kz: 'Студенттерге' } },
    { path: '/survey', label: { ru: 'Опросник', kz: 'Сауалнама' } },
    { path: '/news', label: { ru: 'Новости', kz: 'Жаңалықтар' } },
    { path: '/contacts', label: { ru: 'Контакты', kz: 'Байланыс' } },
  ];

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className={`header ${language === 'kz' ? 'lang-kz' : ''}`}>
      <div className="container">
        <div className="header-content">
          <div className="logo">
            <Link to="/">
              <h1>Sezim.abu</h1>
            </Link>
          </div>
          <nav className="nav">
            <ul className={`nav-list ${mobileMenuOpen ? 'active' : ''}`}>
              {navLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className={`nav-link ${isActive(link.path)}`}
                    onClick={closeMobileMenu}
                  >
                    {t(link.label)}
                  </Link>
                </li>
              ))}
            </ul>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Search />
              <div className="language-switcher">
                <button
                  className={`lang-btn ${language === 'ru' ? 'active' : ''}`}
                  onClick={() => toggleLanguage('ru')}
                >
                  RU
                </button>
                <button
                  className={`lang-btn ${language === 'kz' ? 'active' : ''}`}
                  onClick={() => toggleLanguage('kz')}
                >
                  KZ
                </button>
              </div>
            </div>
            <button
              className={`mobile-menu-toggle ${mobileMenuOpen ? 'active' : ''}`}
              onClick={handleMobileMenuToggle}
              aria-label={t({ ru: 'Меню', kz: 'Мәзір' })}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;

