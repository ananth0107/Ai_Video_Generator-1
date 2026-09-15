import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from '../Icons';
import HistoryMenu from './HistoryMenu';
import { animatedSceneries } from '../../data/animatedSceneries';
import { isImageVideo } from '../../utils/historyStorage';
import { useLanguage } from '../../context/LanguageContext';

function formatDate(isoString) {
  if (!isoString) return 'Recently';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return 'Recently';
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return 'Recently';
  }
}

export default function HistoryCard({
  item,
  onOpen,
  onEditName,
  onDelete
}) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const isImage = isImageVideo(item);

  // Scenery fallback gradient if thumbnail not available
  const scenery = animatedSceneries.find((s) => s.id === item.sceneryId);
  const fallbackGradient = scenery?.thumbGradient || 'linear-gradient(135deg, #1e1b4b, #3b82f6, #ec4899)';

  const primaryChar = item.characters && item.characters.length > 0 ? item.characters[0] : null;
  const sourceImageSrc = item.uploadedImage || (isImage ? item.thumbnail : null);

  const handleEditInStudio = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (isImage) {
      navigate('/image-to-video', {
        state: {
          presetImage: item.uploadedImage || item.thumbnail,
          presetPrompt: item.prompt,
          presetAspect: item.aspectRatio,
          presetMotion: item.motion || item.style,
          cameraDirection: item.cameraDirection || item.cameraMotion,
          lightingAtmosphere: item.lightingAtmosphere || item.lightingMood,
          sceneryId: item.sceneryId,
          selectedCharacters: item.characters,
          videoItem: item
        }
      });
    } else {
      navigate('/prompt-to-video', {
        state: {
          presetPrompt: item.prompt,
          presetAspect: item.aspectRatio,
          presetStyle: item.style,
          cameraMotion: item.cameraMotion,
          lightingMood: item.lightingMood,
          sceneryId: item.sceneryId,
          selectedCharacters: item.characters,
          videoItem: item
        }
      });
    }
  };

  return (
    <div
      className={`history-card creation-card ${isImage ? 'history-card-image-type' : 'history-card-prompt-type'}`}
      onClick={(e) => handleEditInStudio(e)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleEditInStudio(e);
        }
      }}
      title={`Click to edit "${item.name}" in Studio`}
    >
      {/* Card Thumbnail Area */}
      <div className="history-card-thumb-wrap">
        {item.thumbnail ? (
          <img
            src={item.thumbnail}
            alt={item.name}
            className="history-card-thumb-img"
            loading="lazy"
          />
        ) : (
          <div
            className="history-card-thumb-fallback"
            style={{ background: fallbackGradient }}
          >
            <span className="thumb-scenery-icon">{scenery?.icon || '🎬'}</span>
          </div>
        )}

        {/* Hover Play Glow Indicator */}
        <div
          className="history-thumb-play-overlay"
          onClick={(e) => {
            e.stopPropagation();
            onOpen(item);
          }}
          title="Play video preview"
        >
          <div className="thumb-play-icon-glow">
            <Icons.Play />
          </div>
        </div>

        {/* Top Badges over Thumbnail */}
        <div className="history-thumb-top-bar">
          <span className="history-badge-ratio">{item.aspectRatio || '16:9'}</span>
          {isImage ? (
            <span className="history-badge-type-image" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Icons.Image />
              <span>{item.motion || item.style || 'Image Motion'}</span>
            </span>
          ) : (
            <span className="history-badge-type-prompt" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Icons.Sparkles />
              <span>{item.style || 'Prompt to Video'}</span>
            </span>
          )}
        </div>

        {/* Bottom Duration Badge */}
        <div className="history-thumb-bottom-bar">
          <span className="history-badge-duration">
            <Icons.Video /> 10s
          </span>
          {primaryChar && (
            <span className="history-badge-char" title={`Character: ${primaryChar.name}`}>
              <Icons.User /> {primaryChar.name}
            </span>
          )}
        </div>
      </div>

      {/* Card Body Content */}
      <div className="history-card-body">
        <div className="history-card-header-row">
          <h3 className="history-card-title" title={item.name}>
            {item.name}
          </h3>

          {/* Three-Dot Menu (stops click propagation so it does not trigger onOpen) */}
          <HistoryMenu
            onEditName={() => onEditName(item)}
            onDelete={() => onDelete(item)}
          />
        </div>

        <div className="history-card-date-row">
          <span className="history-date-text">
            Generated {formatDate(item.createdAt)}
          </span>
          <span className="history-type-chip">
            {isImage ? (
              <><Icons.Image /> {t('imageToVideo', 'Image to Video')}</>
            ) : (
              <><Icons.Sparkles /> {t('promptToVideo', 'Prompt to Video')}</>
            )}
          </span>
        </div>

        {/* For Image to Video: Display the Source / Edited Image */}
        {isImage && sourceImageSrc && (
          <div className="history-source-img-preview-card" onClick={(e) => e.stopPropagation()}>
            <div className="history-source-img-badge-row">
              <span className="history-source-label">
                <Icons.Image />
                <span>{t('sourceEditedImage', 'Source / Edited Image')}</span>
              </span>
              <button
                type="button"
                className="history-card-reuse-btn"
                onClick={handleEditInStudio}
                title="Edit this image in studio"
              >
                <Icons.Edit />
                <span>{t('editInStudio', 'Edit in Studio')}</span>
              </button>
            </div>
            <div className="history-source-img-thumb-wrap">
              <img
                src={sourceImageSrc}
                alt="Source / Edited Image"
                className="history-source-img-thumb"
              />
            </div>
          </div>
        )}

        {/* For Prompt to Video or motion prompt: Display typed prompt prominently */}
        <div className="history-card-prompt-container">
          <span className="history-prompt-mini-label">
            {isImage ? <Icons.Image /> : <Icons.Sparkles />}
            <span>{isImage ? t('step1PromptLabel', 'Motion Description') : t('typedPrompt', 'Typed Prompt')}</span>
          </span>
          <p className="history-card-prompt-quote" title={item.prompt}>
            "{item.prompt || 'No description provided.'}"
          </p>
        </div>

        {/* Card Footer Actions Row */}
        <div className="history-card-footer-row">
          <button
            type="button"
            className="history-card-edit-action-btn"
            onClick={handleEditInStudio}
            title="Open and edit this video in Studio"
          >
            <Icons.Edit />
            <span>{t('editInStudio', 'Edit in Studio')}</span>
          </button>

          <span
            className="history-play-action-text"
            onClick={(e) => {
              e.stopPropagation();
              onOpen(item);
            }}
            title="Play video"
          >
            <Icons.Play />
            <span>{t('playVideo', 'Play')}</span>
          </span>

          <span className="history-engine-chip">4K HDR</span>
        </div>
      </div>
    </div>
  );
}
