import React from 'react';
import { Icons } from './Icons';
import { useLanguage } from '../context/LanguageContext';

export default function GeneratingModal({
  isOpen,
  progressPercent,
  progressStatus,
  videoType,
  promptSummary,
  onCancel
}) {
  const { t, language } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={(e) => e.stopPropagation()}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-top-accent"></div>

        <div className="modal-spinner-ring">
          <div className="spinner-pulse">
            <Icons.Loader />
          </div>
        </div>

        <div>
          <h3 className="modal-title">
            {language === 'ta' ? 'வீடியோ உருவாக்கப்படுகிறது...' : 'Generating Video...'}
          </h3>
          <p className="modal-subtitle">
            {progressStatus || (language === 'ta' ? 'நியூரல் பிரேம்களை ஒருங்கிணைக்கிறது...' : 'Synthesizing neural keyframes and diffusion motion...')}
          </p>
        </div>

        <div className="modal-progress-wrap">
          <div className="modal-progress-track">
            <div
              className="modal-progress-fill"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px', fontWeight: '700', color: '#6366f1', marginTop: '2px' }}>
            <span>0%</span>
            <span className="modal-percent-text">{progressPercent}%</span>
            <span>100%</span>
          </div>
        </div>

        {promptSummary && (
          <div style={{
            background: 'var(--color-bg-subtle)',
            border: '1px solid var(--color-border)',
            borderRadius: '12px',
            padding: '10px 14px',
            width: '100%',
            textAlign: 'left',
            fontSize: '13px',
            color: 'var(--color-text-body)',
            fontStyle: 'italic',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            "{promptSummary}"
          </div>
        )}

        {onCancel && progressPercent < 100 && (
          <button
            type="button"
            onClick={onCancel}
            className="tool-btn"
            style={{
              fontSize: '13px',
              padding: '8px 18px',
              color: 'var(--color-text-muted)',
              borderColor: 'var(--color-border)',
              marginTop: '6px'
            }}
          >
            {t('cancel')}
          </button>
        )}
      </div>
    </div>
  );
}
