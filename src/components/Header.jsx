import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Icons } from './Icons';
import { useLanguage } from '../context/LanguageContext';

export default function Header({ onToggleMobileSidebar = () => {} }) {
  const location = useLocation();
  const { t } = useLanguage();

  const path = location.pathname.toLowerCase();
  const isHistory = path.includes('history');
  const isVideoHub = path === '/video' || path === '/thamili-ai-video' || path === '/hub';
  const isPrompt = (path.includes('prompt-to-video') || (path.includes('prompt') && !path.includes('image-to-video'))) && !isVideoHub && !isHistory;
  const isImageToVideo = path.includes('image-to-video');
  const isCharacters = path.includes('characters');

  const getSubBreadcrumb = () => {
    if (isVideoHub) return null;
    if (isHistory) return t('historyBreadcrumb', 'HISTORY');
    if (isPrompt && !isImageToVideo) return t('promptToVideoBreadcrumb');
    if (isImageToVideo) return t('imageToVideoBreadcrumb');
    if (isCharacters) return t('charactersBreadcrumb');
    return t('videoStudioBreadcrumb');
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
          <Link to="/video" className="crumb-main-text">
            {t('headerTitle')}
          </Link>
          {!isVideoHub && (
            <>
              <span className="crumb-divider">/</span>
              <span className="crumb-active-text">{getSubBreadcrumb()}</span>
            </>
          )}
        </div>
      </div>



    </header>
  );
}
