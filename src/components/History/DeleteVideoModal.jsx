import React, { useEffect } from 'react';
import { Icons } from '../Icons';
import { useLanguage } from '../../context/LanguageContext';

export default function DeleteVideoModal({
  isOpen,
  videoName = '',
  onConfirm,
  onCancel
}) {
  const { t } = useLanguage();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="modal-content delete-video-modal-content"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-video-title"
      >
        <div className="modal-top-accent" style={{ background: 'linear-gradient(90deg, #ef4444, #f43f5e)' }}></div>

        <div className="save-modal-header-box">
          <div className="modal-icon-badge" style={{ background: '#fef2f2', color: '#ef4444' }}>
            <Icons.Trash2 />
          </div>
          <div>
            <h3 id="delete-video-title" className="modal-heading" style={{ color: '#0f172a' }}>
              {t('deleteVideoTitle', 'Delete Video?')}
            </h3>
            <p className="modal-subheading">
              {t('deleteVideoConfirm', 'Are you sure you want to delete this video from History?')}
            </p>
          </div>
        </div>

        {videoName && (
          <div className="delete-target-preview">
            <span style={{ fontSize: '12px', color: '#64748b' }}>Video:</span>
            <strong style={{ fontSize: '13.5px', color: '#1e293b' }}>"{videoName}"</strong>
          </div>
        )}

        <div className="save-modal-actions-row" style={{ marginTop: '8px', width: '100%', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            type="button"
            onClick={onCancel}
            className="tool-btn"
            style={{ padding: '9px 18px', fontSize: '13.5px' }}
          >
            {t('cancel', 'Cancel')}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="btn-danger-confirm"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 20px',
              borderRadius: '12px',
              border: 'none',
              background: '#ef4444',
              color: '#ffffff',
              fontSize: '13.5px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'background 0.15s ease'
            }}
          >
            <Icons.Trash2 />
            <span>{t('delete', 'Delete')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
