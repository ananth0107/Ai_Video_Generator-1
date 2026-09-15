import React, { useState, useEffect, useRef } from 'react';
import { Icons } from '../Icons';
import { useLanguage } from '../../context/LanguageContext';

function SaveVideoDialog({ defaultName = '', onSave, onCancel }) {
  const { t } = useLanguage();
  const [videoName, setVideoName] = useState(defaultName || 'Untitled Video');
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = videoName.trim();
    if (!trimmed) {
      setError(t('videoNameRequired', 'Please enter a video name'));
      if (inputRef.current) inputRef.current.focus();
      return;
    }
    setError('');
    onSave(trimmed);
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="modal-content save-video-modal-content"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="save-video-title"
      >
        <div className="modal-top-accent"></div>

        <div className="save-modal-header-box">
          <div className="modal-icon-badge" style={{ background: '#eef2ff', color: '#6366f1' }}>
            <Icons.Bookmark />
          </div>
          <div>
            <h3 id="save-video-title" className="modal-heading">
              {t('saveVideoModalTitle', 'Save Video to History')}
            </h3>
            <p className="modal-subheading">
              Give your generated video a name to easily find and replay it later.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="save-video-form">
          <div className="modal-field-group" style={{ textAlign: 'left', width: '100%' }}>
            <label htmlFor="save-video-name-input" className="modal-field-label">
              <span>{t('videoNameLabel', 'Video Name')} *</span>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>{videoName.length}/100</span>
            </label>
            <input
              ref={inputRef}
              id="save-video-name-input"
              type="text"
              maxLength={100}
              placeholder={t('videoNamePlaceholder', 'Enter a name for your video...')}
              value={videoName}
              onChange={(e) => {
                setVideoName(e.target.value);
                if (error) setError('');
              }}
              className={`modal-text-input ${error ? 'input-error' : ''}`}
            />
            {error && (
              <span className="form-error-msg" style={{ fontSize: '12px', color: '#ef4444', marginTop: '2px' }}>
                {error}
              </span>
            )}
          </div>

          <div className="save-modal-actions-row">
            <button
              type="button"
              onClick={onCancel}
              className="tool-btn"
              style={{ padding: '9px 18px', fontSize: '13.5px' }}
            >
              {t('cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              className="generate-btn"
              style={{ width: 'auto', padding: '9px 22px', fontSize: '13.5px' }}
            >
              <Icons.Check />
              <span>{t('save', 'Save')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SaveVideoModal({ isOpen, defaultName, onSave, onCancel }) {
  if (!isOpen) return null;
  return (
    <SaveVideoDialog
      defaultName={defaultName}
      onSave={onSave}
      onCancel={onCancel}
    />
  );
}
