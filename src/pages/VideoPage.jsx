import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from '../components/Icons';
import ThamiliBrandLogo from '../components/ThamiliBrandLogo';
import { useLanguage } from '../context/LanguageContext';

export default function VideoPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handlePromptToVideo = () => {
    navigate('/prompt-to-video', { replace: true, state: { triggerBlink: true, newChat: Date.now() } });
    window.dispatchEvent(new CustomEvent('new-chat', { detail: { target: 'prompt-to-video' } }));
    window.dispatchEvent(new CustomEvent('new-chat-prompt'));
  };

  const handleImageToVideo = () => {
    navigate('/image-to-video', { replace: true, state: { triggerBlink: true, newChat: Date.now() } });
    window.dispatchEvent(new CustomEvent('new-chat', { detail: { target: 'image-to-video' } }));
    window.dispatchEvent(new CustomEvent('new-chat-image'));
  };

  return (
    <div className="thamili-video-hub-container">
      {/* Ambient Cosmic Studio Backdrop Glows */}
      <div className="hub-ambient-glow hub-glow-left" aria-hidden="true" />
      <div className="hub-ambient-glow hub-glow-right" aria-hidden="true" />

      {/* CENTER STAGE: Big Thamili Logo + One Line Description */}
      <div className="hub-center-hero-brand">
        <div className="hub-brand-logo-frame">
          <ThamiliBrandLogo height={110} alt="தமிழி THAMILI AI" />
        </div>
        <p className="hub-hero-tagline">
          {t('createVideoTagline', 'Create video with Thamili AI')}
        </p>
      </div>

      {/* UNIFIED RECTANGULAR SELECTOR BAR (Positioned higher below logo) */}
      <div className="hub-bottom-bar-wrapper">
        <div className="hub-unified-dock-bar" role="group" aria-label="Select Video Generation Mode">
          {/* OPTION 1: Prompt to Video */}
          <button
            type="button"
            className="hub-dock-item-btn hub-dock-prompt-item"
            onClick={handlePromptToVideo}
            aria-label="Select Prompt to Video"
          >
            <div className="hub-dock-icon-box hub-icon-blue">
              <Icons.Film />
              <span className="hub-dock-sub-icon"><Icons.Video /></span>
            </div>
            <div className="hub-dock-text-col">
              <span className="hub-dock-title">
                {t('p2vCardHubTitle', 'Prompt to Video')}
              </span>
              <span className="hub-dock-badge hub-badge-blue">Text-to-Video</span>
            </div>
          </button>

          {/* VERTICAL DIVIDER */}
          <div className="hub-dock-bar-divider" aria-hidden="true" />

          {/* OPTION 2: Image to Video */}
          <button
            type="button"
            className="hub-dock-item-btn hub-dock-image-item"
            onClick={handleImageToVideo}
            aria-label="Select Image to Video"
          >
            <div className="hub-dock-icon-box hub-icon-purple">
              <Icons.Image />
              <span className="hub-dock-sub-icon"><Icons.Film /></span>
            </div>
            <div className="hub-dock-text-col">
              <span className="hub-dock-title">
                {t('i2vCardHubTitle', 'Image to Video')}
              </span>
              <span className="hub-dock-badge hub-badge-pink">Image-to-Video</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
