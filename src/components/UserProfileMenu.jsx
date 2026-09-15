import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from './Icons';
import { getTokenUsage, addTokens } from '../utils/tokenUsageStorage';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';

export default function UserProfileMenu({ onCloseSidebar = () => {} }) {
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();
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

  const handleToggleLanguage = (e) => {
    e.stopPropagation();
    const nextLang = language === 'ta' ? 'en' : 'ta';
    setLanguage(nextLang);
    showToast(
      nextLang === 'ta' ? 'மொழி தமிழுக்கு மாற்றப்பட்டது' : 'Language changed to English',
      'Globe'
    );
  };

  return (
    <div className="sidebar-user-profile-wrapper" ref={menuRef} style={{ position: 'relative', width: '100%' }}>
      {/* POPUP / MODAL: TOKEN USAGE & SETTINGS */}
      {isOpen && (
        <div
          className="user-profile-token-modal"
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 10px)',
            left: '0',
            width: '290px',
            background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.98) 0%, rgba(10, 15, 30, 0.99) 100%)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            borderRadius: '16px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.75), 0 0 20px rgba(56, 189, 248, 0.15)',
            backdropFilter: 'blur(20px)',
            zIndex: 100,
            overflow: 'hidden',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            color: '#f8fafc',
            animation: 'fadeInUp 0.2s ease-out'
          }}
        >
          {/* Top Profile Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #0284c7 0%, #6366f1 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '14px',
                  color: '#ffffff',
                  boxShadow: '0 4px 12px rgba(2, 132, 199, 0.35)',
                  position: 'relative'
                }}
              >
                JK
                <span
                  style={{
                    position: 'absolute',
                    bottom: '-2px',
                    right: '-2px',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: '#22c55e',
                    border: '2px solid #0f172a'
                  }}
                  title="Active"
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <strong style={{ fontSize: '14px', color: '#f8fafc', fontWeight: 700 }}>
                  {usage.userName}
                </strong>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>{usage.userEmail}</span>
              </div>
            </div>

            <span
              style={{
                fontSize: '10px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                padding: '3px 8px',
                borderRadius: '12px',
                background: 'rgba(56, 189, 248, 0.15)',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.3)'
              }}
            >
              PRO
            </span>
          </div>

          {/* 1. USAGE FOR TOKENS SECTION */}
          <div
            className="token-usage-section"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Icons.Coins size={16} />
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#f8fafc' }}>
                  {language === 'ta' ? 'டோக்கன் பயன்பாடு' : 'Usage for Tokens'}
                </span>
              </div>
              <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 600 }}>
                {remainingTokens.toLocaleString()} {language === 'ta' ? 'மீதம்' : 'left'}
              </span>
            </div>

            {/* Visual Token Progress Bar */}
            <div>
              <div
                style={{
                  width: '100%',
                  height: '8px',
                  borderRadius: '4px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  overflow: 'hidden',
                  position: 'relative'
                }}
              >
                <div
                  style={{
                    width: `${usedPercent}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #38bdf8 0%, #818cf8 100%)',
                    borderRadius: '4px',
                    transition: 'width 0.4s ease'
                  }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b', marginTop: '4px' }}>
                <span>{usage.usedTokens.toLocaleString()} used ({usedPercent}%)</span>
                <span>{usage.totalAllowance.toLocaleString()} max</span>
              </div>
            </div>

            {/* Provider Breakdown List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', color: '#94a3b8', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#38bdf8' }} />
                  Google Gemini (Veo 4K):
                </span>
                <strong style={{ color: '#e2e8f0' }}>{usage.geminiTokens.toLocaleString()}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                  Pixazo (T2V/I2V):
                </span>
                <strong style={{ color: '#e2e8f0' }}>{usage.hfUnits.toLocaleString()}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#a855f7' }} />
                  Prompt Enhancer:
                </span>
                <strong style={{ color: '#e2e8f0' }}>{usage.promptTokens.toLocaleString()}</strong>
              </div>
            </div>

            {/* Add Tokens Quick Button */}
            <button
              type="button"
              onClick={handleAddTokens}
              style={{
                background: 'rgba(56, 189, 248, 0.12)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                borderRadius: '8px',
                padding: '6px 10px',
                color: '#38bdf8',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.2s ease'
              }}
              title="Add 10,000 tokens"
            >
              <Icons.Sparkles size={14} />
              <span>{language === 'ta' ? '+10,000 டோக்கன்களைச் சேர்க்கவும்' : '+ Add 10,000 Tokens'}</span>
            </button>
          </div>

          {/* 2. SETTING SECTION (athulaye setting irukanum) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button
              type="button"
              onClick={handleOpenSettings}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: '#f8fafc',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#38bdf8';
                e.currentTarget.style.background = 'rgba(56, 189, 248, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#38bdf8' }}><Icons.Settings /></span>
                <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700 }}>
                    {language === 'ta' ? 'அமைப்புகள்' : 'Studio Settings'}
                  </span>
                  <span style={{ fontSize: '10px', color: '#94a3b8' }}>
                    {language === 'ta' ? 'API சாவிகள் & விருப்பத்தேர்வுகள்' : 'API Keys & Workspace Preferences'}
                  </span>
                </div>
              </div>
              <Icons.ArrowRight size={14} />
            </button>

            {/* Quick Language Toggle */}
            <button
              type="button"
              onClick={handleToggleLanguage}
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '8px',
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: '#94a3b8',
                fontSize: '11px',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Icons.Globe size={14} />
                <span>{language === 'ta' ? 'மொழி மாற்று (Language)' : 'Language'}</span>
              </div>
              <strong style={{ color: '#38bdf8' }}>{language === 'ta' ? 'தமிழ்' : 'English'}</strong>
            </button>
          </div>
        </div>
      )}

      {/* TRIGGER BAR: PROFILE BUTTON UNDER MENU BAR */}
      <button
        type="button"
        className={`sidebar-user-profile-btn ${isOpen ? 'active-profile' : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 12px',
          borderRadius: '12px',
          background: isOpen
            ? 'linear-gradient(135deg, rgba(2, 132, 199, 0.2) 0%, rgba(99, 102, 241, 0.2) 100%)'
            : 'rgba(255, 255, 255, 0.04)',
          border: isOpen ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          outline: 'none',
          boxShadow: isOpen ? '0 4px 16px rgba(56, 189, 248, 0.15)' : 'none'
        }}
        onMouseEnter={(e) => {
          if (!isOpen) {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
            e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.3)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
          }
        }}
        title="View Token Usage and Settings"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Avatar with Status Dot */}
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #0284c7 0%, #6366f1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '12px',
              position: 'relative',
              boxShadow: '0 2px 8px rgba(2, 132, 199, 0.3)'
            }}
          >
            JK
            <span
              style={{
                position: 'absolute',
                bottom: '-2px',
                right: '-2px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#22c55e',
                border: '1.5px solid #0f172a'
              }}
            />
          </div>

          {/* User & Token Info */}
          <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc', lineHeight: 1.2 }}>
              {usage.userName}
            </span>
            <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>⚡</span>
              <span>{(remainingTokens / 1000).toFixed(1)}k tokens</span>
            </span>
          </div>
        </div>

        {/* Expand / Collapse Chevron */}
        <span style={{ color: isOpen ? '#38bdf8' : '#94a3b8', display: 'flex', alignItems: 'center', transition: 'transform 0.2s ease' }}>
          {isOpen ? <Icons.ChevronDown /> : <Icons.ChevronUp />}
        </span>
      </button>
    </div>
  );
}
