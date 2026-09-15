import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from '../Icons';
import VideoPlayer from '../VideoPlayer';
import { useLanguage } from '../../context/LanguageContext';
import { isImageVideo } from '../../utils/historyStorage';

export default function HistoryPlayerModal({
  isOpen,
  videoItem,
  onClose
}) {
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !videoItem) return null;

  const isImage = isImageVideo(videoItem);
  const sourceImageSrc = videoItem.uploadedImage || (isImage ? videoItem.thumbnail : null);

  const playerVideoData = {
    ...videoItem,
    hasGenerated: true
  };

  const handleEditInStudio = () => {
    onClose();
    if (isImage) {
      navigate('/image-to-video', {
        state: {
          presetImage: videoItem.uploadedImage || videoItem.thumbnail,
          presetPrompt: videoItem.prompt,
          sceneryId: videoItem.sceneryId
        }
      });
    } else {
      navigate('/prompt-to-video', {
        state: {
          presetPrompt: videoItem.prompt,
          presetStyle: videoItem.style,
          sceneryId: videoItem.sceneryId
        }
      });
    }
  };

  return (
    <div className="modal-overlay history-player-overlay" onClick={onClose}>
      <div
        className="history-player-modal-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="history-modal-video-title"
      >
        {/* Header with Title and Close Button */}
        <div className="history-player-modal-header">
          <div className="history-player-title-box">
            <div className="modal-icon-badge" style={{ width: '36px', height: '36px', background: isImage ? '#fdf2f8' : '#eef2ff', color: isImage ? '#ec4899' : '#6366f1' }}>
              {isImage ? <Icons.Image /> : <Icons.Video />}
            </div>
            <div>
              <h2 id="history-modal-video-title" className="history-player-modal-title">
                {videoItem.name}
              </h2>
              <span className="history-player-modal-subtitle">
                {isImage ? t('imageToVideo', 'Image to Video') : t('promptToVideo', 'Prompt to Video')} • Saved Generation • {new Date(videoItem.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="modal-close-btn"
            title="Close video (Esc)"
            aria-label="Close video preview"
          >
            <Icons.X />
          </button>
        </div>

        {/* Video Player Frame */}
        <div className="history-player-modal-body">
          <VideoPlayer
            video={playerVideoData}
            onRegenerate={null}
          />
        </div>

        {/* Video Generation Details Footer */}
        <div className="history-player-modal-details">
          <div className="history-details-grid">
            <div className="history-detail-item">
              <span className="history-detail-label">{t('stepAspectRatioLabel', 'Aspect Ratio')}</span>
              <strong className="history-detail-value">{videoItem.aspectRatio || '16:9'}</strong>
            </div>

            <div className="history-detail-item">
              <span className="history-detail-label">{t('stepVisualStyleLabel', 'Visual Style')}</span>
              <strong className="history-detail-value">{videoItem.style || (isImage ? 'Image Motion' : 'Cinematic')}</strong>
            </div>

            {(videoItem.cameraMotion || videoItem.cameraDirection) && (
              <div className="history-detail-item">
                <span className="history-detail-label">
                  {isImage
                    ? t('stepCameraVectorLabel', 'Camera Vector')
                    : t('stepCameraDynamicsLabel', 'Camera Dynamics')}
                </span>
                <strong className="history-detail-value">
                  {videoItem.cameraMotion || videoItem.cameraDirection}
                </strong>
              </div>
            )}

            {(videoItem.lightingMood || videoItem.lightingAtmosphere) && (
              <div className="history-detail-item">
                <span className="history-detail-label">{t('stepAtmosphericLightingLabel', 'Atmospheric Lighting')}</span>
                <strong className="history-detail-value">
                  {videoItem.lightingMood || videoItem.lightingAtmosphere}
                </strong>
              </div>
            )}

            {videoItem.characters && videoItem.characters.length > 0 && (
              <div className="history-detail-item">
                <span className="history-detail-label">{t('characters', 'Characters')}</span>
                <strong className="history-detail-value">
                  {videoItem.characters.map((c) => c.name).join(', ')}
                </strong>
              </div>
            )}
          </div>

          {/* If Image-to-Video: Show the edited/source image */}
          {isImage && sourceImageSrc && (
            <div className="history-modal-source-section">
              <div className="history-modal-source-header">
                <span className="history-detail-label">
                  <Icons.Image /> {t('sourceEditedImage', 'Source / Edited Image')}
                </span>
                <button
                  type="button"
                  className="history-modal-reuse-btn"
                  onClick={handleEditInStudio}
                >
                  <Icons.Edit />
                  <span>{t('editInStudio', 'Edit in Studio')}</span>
                </button>
              </div>
              <div className="history-modal-source-card">
                <img
                  src={sourceImageSrc}
                  alt="Original source / edited image"
                  className="history-modal-source-img"
                />
              </div>
            </div>
          )}

          {/* Prompt Section */}
          <div className="history-detail-prompt-box">
            <span className="history-detail-label">
              {isImage ? (
                <><Icons.Image /> {t('step1PromptLabel', 'Motion Description')}</>
              ) : (
                <><Icons.Sparkles /> {t('typedPrompt', 'Typed Prompt')}</>
              )}
            </span>
            <p className="history-detail-prompt-text">"{videoItem.prompt || 'No description provided.'}"</p>
          </div>
        </div>
      </div>
    </div>
  );
}
