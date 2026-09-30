import React from 'react';
import { Icons } from './Icons';
import { useLanguage } from '../context/LanguageContext';
import DotMatrixWaveCanvas from './DotMatrixWaveCanvas';

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
      <div
        className="modal-content generating-modal-futuristic"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-top-accent" />

        <div style={{ position: 'relative', width: '100%', height: '420px', minHeight: '380px' }}>
          <DotMatrixWaveCanvas
            isGenerating={true}
            progressPercent={progressPercent}
            progressStatus={
              progressStatus ||
              (language === 'ta'
                ? 'நியூரல் பிரேம்களை ஒருங்கிணைக்கிறது...'
                : 'Synthesizing neural keyframes and diffusion motion...')
            }
            promptSummary={promptSummary}
            onCancel={onCancel}
          />
        </div>
      </div>
    </div>
  );
}
