import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Icons } from './Icons';
import ThamiliBrandLogo from './ThamiliBrandLogo';
import { useLanguage } from '../context/LanguageContext';

export default function Sidebar({ isMobileOpen = false, onCloseMobile = () => {} }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isVideoOpen, setIsVideoOpen] = useState(true);
  const [showProCard, setShowProCard] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowProCard(false);
    }, 15000); // Disappears after 15 seconds

    return () => clearTimeout(timer);
  }, []);

  const path = location.pathname.toLowerCase();
  const isPromptToVideo =
    path.includes('prompt-to-video') || path.includes('prompt') || path === '/' || path === '/video';
  const isImageToVideo = path.includes('image-to-video');
  const isCharacters = path.includes('characters');

  const handleNav = (targetPath) => {
    navigate(targetPath);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="sidebar-mobile-backdrop"
          onClick={onCloseMobile}
          aria-label="Close navigation"
        />
      )}

      <aside className={`thamili-sidebar-nav ${isMobileOpen ? 'mobile-open' : ''}`}>
        {/* Brand Header */}
        <div className="sidebar-brand-top">
          <Link to="/prompt-to-video" onClick={onCloseMobile} className="sidebar-brand-link" title="THAMILI AI">
            <ThamiliBrandLogo height={42} />
          </Link>

          <button
            type="button"
            className="sidebar-close-btn"
            onClick={onCloseMobile}
            aria-label="Close sidebar"
          >
            <Icons.X />
          </button>
        </div>

        {/* Navigation List - Clean Tree with AI Video & Characters */}
        <div className="sidebar-scrollable-menu">
          <div className="nav-items-group">
            {/* AI Video Parent Group */}
            <div className="nav-group-block">
              <button
                type="button"
                className={`nav-item-btn video-parent-btn ${!isCharacters ? 'active-parent' : ''}`}
                onClick={() => setIsVideoOpen(!isVideoOpen)}
              >
                <div className="nav-btn-left">
                  <span className="sidebar-item-icon"><Icons.Video /></span>
                  <span className="sidebar-item-text">{t('aiVideo')}</span>
                </div>
                <span className={`nav-arrow ${isVideoOpen ? 'expanded' : ''}`}>
                  <Icons.ChevronDown />
                </span>
              </button>

              {isVideoOpen && (
                <div className="nav-sub-items">
                  <button
                    type="button"
                    className={`sub-nav-item ${isPromptToVideo && !isImageToVideo && !isCharacters ? 'active-sub' : ''}`}
                    onClick={() => handleNav('/prompt-to-video')}
                  >
                    <span className="sidebar-item-icon"><Icons.Sparkles /></span>
                    <span className="sidebar-item-text">{t('promptToVideo')}</span>
                  </button>

                  <button
                    type="button"
                    className={`sub-nav-item ${isImageToVideo ? 'active-sub' : ''}`}
                    onClick={() => handleNav('/image-to-video')}
                  >
                    <span className="sidebar-item-icon"><Icons.Image /></span>
                    <span className="sidebar-item-text">{t('imageToVideo')}</span>
                  </button>

                  <button
                    type="button"
                    className={`sub-nav-item ${isCharacters ? 'active-sub' : ''}`}
                    onClick={() => handleNav('/characters')}
                  >
                    <span className="sidebar-item-icon"><Icons.Users /></span>
                    <span className="sidebar-item-text">{t('characters')}</span>
                    <span className="nav-pill-tag">10</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Upgrade to Pro Card at Bottom (disappears after 15 seconds) */}
        {showProCard && (
          <div className="sidebar-bottom-card-wrap">
            <div className="upgrade-pro-box">
              <div className="pro-box-header">
                <span className="pro-title">{t('upgradeToPro')}</span>
                <span className="pro-sparkle">✨</span>
              </div>
              <p className="pro-sub">{t('proPerkDesc')}</p>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
