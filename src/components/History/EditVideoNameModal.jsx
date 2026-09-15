import React, { useState, useEffect, useRef } from 'react';
import { Icons } from '../Icons';
import { useLanguage } from '../../context/LanguageContext';

function EditVideoDialog({ currentName = '', onSave, onCancel }) {
  const { t } = useLanguage();
  const [name, setName] = useState(currentName);
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
    const trimmed = name.trim();
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
        aria-labelledby="edit-video-title"
      >
        <div className="modal-top-accent"></div>

        <div className="save-modal-header-box">
          <div className="modal-icon-badge" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
            <Icons.Edit />
          </div>
          <div>
            <h3 id="edit-video-title" className="modal-heading">
              {t('renameVideoTitle', 'Rename Video')}
            </h3>
            <p className="modal-subheading">
              Update the name of this saved video in your History.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="save-video-form">
          <div className="modal-field-group" style={{ textAlign: 'left', width: '100%' }}>
            <label htmlFor="edit-video-name-input" className="modal-field-label">
              <span>{t('videoNameLabel', 'Video Name')} *</span>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>{name.length}/100</span>
            </label>
            <input
              ref={inputRef}
              id="edit-video-name-input"
              type="text"
              maxLength={100}
              placeholder={t('videoNamePlaceholder', 'Enter video name...')}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
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
              <span>{t('renameBtn', 'Rename')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EditVideoNameModal({ isOpen, currentName, onSave, onCancel }) {
  if (!isOpen) return null;
  return (
    <EditVideoDialog
      currentName={currentName}
      onSave={onSave}
      onCancel={onCancel}
    />
  );
}
