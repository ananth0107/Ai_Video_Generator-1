import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Icons } from './Icons';
import ThamiliBrandLogo from './ThamiliBrandLogo';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

export default function Header({ onToggleMobileSidebar = () => {} }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme, isDark } = useTheme();

  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const langMenuRef = useRef(null);

  // Close language dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target)) {
        setIsLangMenuOpen(false);
      }
    };
    if (isLangMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isLangMenuOpen]);

  const path = location.pathname.toLowerCase();
  const isHistory = path.includes('history');
  const isPrompt = (path.includes('prompt') || path === '/' || path === '/video') && !isHistory;
  const isImageToVideo = path.includes('image-to-video');
  const isCharacters = path.includes('characters');

  const getSubBreadcrumb = () => {
    if (isHistory) return t('historyBreadcrumb', 'HISTORY');
    if (isPrompt && !isImageToVideo) return t('promptToVideoBreadcrumb');
    if (isImageToVideo) return t('imageToVideoBreadcrumb');
    if (isCharacters) return t('charactersBreadcrumb');
    return t('videoStudioBreadcrumb');
  };

  const handleLanguageSelect = (langCode) => {
    setLanguage(langCode);
    setIsLangMenuOpen(false);
    showToast(
      langCode === 'ta'
        ? 'மொழி தமிழுக்கு மாற்றப்பட்டது!'
        : 'Language switched to English!',
      'Globe'
    );
  };

  const handleThemeToggle = () => {
    toggleTheme();
    const nextTheme = isDark ? 'Platinum Light' : 'Dark Luxury Studio';
    showToast(
      language === 'ta'
        ? `தீம் மாற்றப்பட்டது: ${isDark ? 'வெண்மை' : 'இருள்'}`
        : `Switched to ${nextTheme} Mode`,
      isDark ? 'Sun' : 'Moon'
    );
  };

  return (
    <header className="thamili-top-header">
      {/* 1. LEFT COLUMN: Mobile Toggle & Breadcrumbs */}
      <div className="header-left-col">
        <button
          type="button"
          className="header-mobile-toggle"
          onClick={onToggleMobileSidebar}
          aria-label="Open Sidebar"
        >
          <Icons.Menu />
        </button>

        <div className="header-breadcrumbs">
          <Link to="/prompt-to-video" className="crumb-main-text">
            {t('headerTitle')}
          </Link>
          <span className="crumb-divider">/</span>
          <span className="crumb-active-text">{getSubBreadcrumb()}</span>
        </div>
      </div>

      {/* 2. CENTER COLUMN: MATHEMATICALLY CENTERED THAMILI LOGO (ONLY LOGO, NO TEXT) */}
      <div className="header-center-col">
        <Link to="/prompt-to-video" className="header-center-logo-link" title="THAMILI AI">
          <ThamiliBrandLogo height={46} />
        </Link>
      </div>

      {/* 3. RIGHT COLUMN: Theme, Language Switcher, Sign In, Get Started */}
      <div className="header-right-col">
        {/* Theme Toggle Button */}
        <button
          type="button"
          className="header-icon-tool-btn theme-toggle-btn"
          onClick={handleThemeToggle}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Studio Mode'}
          aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Studio Mode'}
        >
          {isDark ? <Icons.Sun /> : <Icons.Moon />}
        </button>

        {/* Language Switcher Dropdown */}
        <div className="header-lang-switcher-wrap" ref={langMenuRef}>
          <button
            type="button"
            className={`header-lang-btn ${isLangMenuOpen ? 'open' : ''}`}
            onClick={() => setIsLangMenuOpen((prev) => !prev)}
            title={t('langSwitchTitle')}
            aria-expanded={isLangMenuOpen}
          >
            <span className="lang-globe-icon">🌐</span>
            <span className="lang-active-label">{language === 'ta' ? 'தமிழ்' : 'English'}</span>
            <span className={`lang-chevron ${isLangMenuOpen ? 'open' : ''}`}>
              <Icons.ChevronDown />
            </span>
          </button>

          {isLangMenuOpen && (
            <div className="header-lang-dropdown-menu">
              <button
                type="button"
                className={`lang-option-btn ${language === 'en' ? 'active' : ''}`}
                onClick={() => handleLanguageSelect('en')}
              >
                <span className="lang-flag">🇬🇧</span>
                <span className="lang-opt-name">English</span>
                {language === 'en' && <span className="lang-check"><Icons.Check /></span>}
              </button>

              <button
                type="button"
                className={`lang-option-btn ${language === 'ta' ? 'active' : ''}`}
                onClick={() => handleLanguageSelect('ta')}
              >
                <span className="lang-flag">🇮🇳</span>
                <span className="lang-opt-name">தமிழ் Tamil</span>
                {language === 'ta' && <span className="lang-check"><Icons.Check /></span>}
              </button>
            </div>
          )}
        </div>

        {/* Sign In */}
        <button
          type="button"
          className="header-signin-btn"
          onClick={() =>
            showToast(
              language === 'ta' ? 'உள்நுழைவு திரை திறக்கப்பட்டது' : 'Sign In modal opened',
              'Sparkles'
            )
          }
        >
          {t('signIn')}
        </button>

        {/* Get Started Button */}
        <button
          type="button"
          className="header-getstarted-btn"
          onClick={() => navigate('/prompt-to-video')}
        >
          {t('getStarted')}
        </button>
      </div>
    </header>
  );
}
