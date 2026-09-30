import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from './Icons';
import { getTokenUsage, addTokens } from '../utils/tokenUsageStorage';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';

export default function UserProfileMenu({ onCloseSidebar = () => {} }) {
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();
  const { theme, setTheme, isDark } = useTheme();
  const { showToast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [usage, setUsage] = useState(() => getTokenUsage());
  const menuRef = useRef(null);

  // Sync token usage state whenever updated
  useEffect(() => {
    const handleUpdate = () => {
      setUsage(getTokenUsage());
    };
    window.addEventListener('tokens-updated', handleUpdate);
    return () => window.removeEventListener('tokens-updated', handleUpdate);
  }, []);

  // Close popup on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  const remainingTokens = Math.max(0, usage.totalAllowance - usage.usedTokens);
  const usedPercent = Math.min(100, Math.round((usage.usedTokens / usage.totalAllowance) * 100));

  const handleOpenSettings = () => {
    setIsOpen(false);
    onCloseSidebar();
    navigate('/settings');
    showToast(
      language === 'ta' ? 'அமைப்புகள் திரை திறக்கப்படுகிறது...' : 'Opening Studio Settings...',
      'Settings'
    );
  };

  const handleAddTokens = (e) => {
    e.stopPropagation();
    addTokens(10000);
    showToast(
      language === 'ta' ? '+10,000 டோக்கன்கள் வெற்றிகரமாக சேர்க்கப்பட்டன!' : '+10,000 Tokens added to your balance!',
      'Check'
    );
  };

  const handleSelectLanguage = (newLang, e) => {
    if (e) e.stopPropagation();
    if (language === newLang) return;
    setLanguage(newLang);
    showToast(
      newLang === 'ta' ? 'மொழி தமிழுக்கு மாற்றப்பட்டது' : 'Language set to English',
      'Globe'
    );
  };

  const handleSelectTheme = (newTheme, e) => {
    if (e) e.stopPropagation();
    if (theme === newTheme) return;
    setTheme(newTheme);
    showToast(
      newTheme === 'dark' ? 'Dark Studio Mode activated' : 'Platinum Light Mode activated',
      newTheme === 'dark' ? 'Moon' : 'Sun'
    );
  };

  const handleSignIn = (e) => {
    if (e) e.stopPropagation();
    setIsOpen(false);
    showToast(
      language === 'ta' ? 'உள்நுழைவு திரை திறக்கப்பட்டது' : 'Sign In modal opened',
      'LogIn'
    );
  };

  const userInitials = (usage.userName || 'User')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="sidebar-user-profile-wrapper" ref={menuRef}>
      {/* POPUP / MODAL: TOKEN USAGE & SETTINGS */}
      {isOpen && (
        <div className="user-profile-token-modal" onClick={(e) => e.stopPropagation()}>
          {/* Top Profile Header */}
          <div className="profile-popover-header">
            <div className="profile-popover-user-info">
              <div className="profile-popover-avatar">
                {userInitials}
              </div>
              <div className="profile-popover-meta">
                <span className="profile-popover-name">{usage.userName}</span>
                <span className="profile-popover-email">{usage.userEmail}</span>
              </div>
            </div>
            <button
              type="button"
              className="profile-header-signin-btn"
              onClick={handleSignIn}
              title={language === 'ta' ? 'உள்நுழைக' : 'Sign In'}
            >
              <Icons.LogIn size={13} />
              <span>{language === 'ta' ? 'உள்நுழைக' : 'Sign In'}</span>
            </button>
          </div>

          {/* Token Usage Section */}
          <div className="profile-token-box">
            <div className="profile-token-box-header">
              <span className="profile-token-title">
                <Icons.Coins size={15} />
                <span>{language === 'ta' ? 'டோக்கன் இருப்பு' : 'Tokens Balance'}</span>
              </span>
              <span className="profile-token-remaining">
                {remainingTokens.toLocaleString()} {language === 'ta' ? 'மீதம்' : 'left'}
              </span>
            </div>

            <div className="profile-progress-bar-wrap">
              <div
                className="profile-progress-fill"
                style={{ width: `${usedPercent}%` }}
              />
            </div>

            <div className="profile-token-footer-counts">
              <span>{usage.usedTokens.toLocaleString()} used ({usedPercent}%)</span>
              <span>{usage.totalAllowance.toLocaleString()} max</span>
            </div>

            <button
              type="button"
              className="profile-add-tokens-btn"
              onClick={handleAddTokens}
              title="Add 10,000 tokens"
            >
              <Icons.Zap size={13} />
              <span>{language === 'ta' ? '+10,000 டோக்கன்கள் சேர்' : '+ Add 10,000 Tokens'}</span>
            </button>
          </div>

          {/* Quick Controls: Theme & Language Toggles */}
          <div className="profile-toggles-container">
            {/* Theme Mode Toggle Row */}
            <div className="profile-toggle-item-row">
              <div className="profile-toggle-item-left">
                {isDark ? <Icons.Moon size={14} /> : <Icons.Sun size={14} />}
                <span>{language === 'ta' ? 'தோற்றம் (Theme)' : 'Theme'}</span>
              </div>

              <div className="profile-segmented-pill-group">
                <button
                  type="button"
                  className={`profile-segment-option-btn ${theme === 'dark' ? 'active' : ''}`}
                  onClick={(e) => handleSelectTheme('dark', e)}
                  title="Dark Studio Mode"
                >
                  <span>🌙</span>
                  <span>Dark</span>
                </button>
                <button
                  type="button"
                  className={`profile-segment-option-btn ${theme === 'light' ? 'active' : ''}`}
                  onClick={(e) => handleSelectTheme('light', e)}
                  title="Light Platinum Mode"
                >
                  <span>☀️</span>
                  <span>Light</span>
                </button>
              </div>
            </div>

            {/* Language Toggle Row */}
            <div className="profile-toggle-item-row">
              <div className="profile-toggle-item-left">
                <Icons.Globe size={14} />
                <span>{language === 'ta' ? 'மொழி (Language)' : 'Language'}</span>
              </div>

              <div className="profile-segmented-pill-group">
                <button
                  type="button"
                  className={`profile-segment-option-btn ${language === 'en' ? 'active' : ''}`}
                  onClick={(e) => handleSelectLanguage('en', e)}
                  title="English"
                >
                  <span>🇬🇧</span>
                  <span>EN</span>
                </button>
                <button
                  type="button"
                  className={`profile-segment-option-btn ${language === 'ta' ? 'active' : ''}`}
                  onClick={(e) => handleSelectLanguage('ta', e)}
                  title="தமிழ் (Tamil)"
                >
                  <span>🇮🇳</span>
                  <span>தமிழ்</span>
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons: Sign In & Studio Settings */}
          <div className="profile-actions-column">
            <button
              type="button"
              className="profile-action-nav-btn profile-signin-action-btn"
              onClick={handleSignIn}
            >
              <div className="profile-action-nav-left">
                <Icons.LogIn size={15} />
                <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                  <span className="profile-action-nav-title">
                    {language === 'ta' ? 'உள்நுழைக' : 'Sign In / Switch Account'}
                  </span>
                  <span className="profile-action-nav-sub">
                    {language === 'ta' ? 'கணக்கில் உள்நுழையவும்' : 'Log in to sync your videos'}
                  </span>
                </div>
              </div>
              <Icons.ArrowRight size={13} style={{ color: 'var(--color-text-muted)' }} />
            </button>

            <button
              type="button"
              className="profile-action-nav-btn"
              onClick={handleOpenSettings}
            >
              <div className="profile-action-nav-left">
                <Icons.Settings size={15} />
                <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                  <span className="profile-action-nav-title">
                    {language === 'ta' ? 'அமைப்புகள்' : 'Studio Settings'}
                  </span>
                  <span className="profile-action-nav-sub">
                    {language === 'ta' ? 'API சாவிகள் & விருப்பங்கள்' : 'API Keys & Preferences'}
                  </span>
                </div>
              </div>
              <Icons.ArrowRight size={13} style={{ color: 'var(--color-text-muted)' }} />
            </button>
          </div>
        </div>
      )}

      {/* TRIGGER BAR: PROFILE BUTTON IN SIDEBAR */}
      <button
        type="button"
        className={`sidebar-user-profile-btn ${isOpen ? 'active-profile' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        title="View Profile, Theme and Language Controls"
      >
        <div className="profile-btn-left">
          <div className="profile-avatar-bubble">
            {userInitials}
            <span className="profile-avatar-status-dot" title="Active" />
          </div>

          <div className="profile-btn-text">
            <span className="profile-user-name">{usage.userName}</span>
            <span className="profile-token-badge">
              <span>⚡</span>
              <span>{(remainingTokens / 1000).toFixed(1)}k tokens</span>
            </span>
          </div>
        </div>

        <span className="profile-chevron-icon">
          <Icons.ChevronUp size={14} />
        </span>
      </button>
    </div>
  );
}
