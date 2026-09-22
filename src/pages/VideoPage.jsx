import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from '../components/Icons';
import { useLanguage } from '../context/LanguageContext';

export default function VideoPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="thamili-video-hub-container">
      {/* Ambient Cosmic Studio Backdrop Glows */}
      <div className="hub-ambient-glow hub-glow-left" aria-hidden="true" />
      <div className="hub-ambient-glow hub-glow-right" aria-hidden="true" />

      {/* 2. TWO MAIN GENERATION CARDS */}
      <section className="hub-cards-section" aria-label="Video Generation Studios">
        <div className="hub-cards-grid">
          {/* CARD 1: Prompt to Video */}
          <div
            className="hub-gen-card hub-prompt-card"
            onClick={() => navigate('/prompt-to-video')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigate('/prompt-to-video');
              }
            }}
            aria-label="Open Prompt to Video Studio"
          >
            <div className="hub-card-top-accent hub-accent-blue-purple" />
            <div className="hub-card-body">
              <div className="hub-card-icon-wrapper hub-icon-blue">
                <Icons.Sparkles />
                <span className="hub-icon-sub-badge"><Icons.Video /></span>
              </div>

              <div className="hub-card-content">
                <div className="hub-card-title-row">
                  <h2 className="hub-card-title">
                    {t('p2vCardHubTitle', 'Prompt to Video')}
                  </h2>
                  <span className="hub-pill-badge hub-badge-blue">Text-to-Video</span>
                </div>

                <p className="hub-card-desc">
                  {t('p2vCardHubDesc', 'Turn your text ideas into cinematic AI-generated videos.')}
                </p>

                <div className="hub-card-micro-tags">
                  <span className="hub-micro-tag">✨ Spatial Prompt AI</span>
                  <span className="hub-micro-tag">🎥 Camera Director</span>
                  <span className="hub-micro-tag">🌟 4K HDR</span>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 2: Image to Video */}
          <div
            className="hub-gen-card hub-image-card"
            onClick={() => navigate('/image-to-video')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigate('/image-to-video');
              }
            }}
            aria-label="Open Image to Video Studio"
          >
            <div className="hub-card-top-accent hub-accent-purple-pink" />
            <div className="hub-card-body">
              <div className="hub-card-icon-wrapper hub-icon-purple">
                <Icons.Image />
                <span className="hub-icon-sub-badge"><Icons.Film /></span>
              </div>

              <div className="hub-card-content">
                <div className="hub-card-title-row">
                  <h2 className="hub-card-title">
                    {t('i2vCardHubTitle', 'Image to Video')}
                  </h2>
                  <span className="hub-pill-badge hub-badge-pink">Image-to-Video</span>
                </div>

                <p className="hub-card-desc">
                  {t('i2vCardHubDesc', 'Bring your images to life with smooth AI-generated motion.')}
                </p>

                <div className="hub-card-micro-tags">
                  <span className="hub-micro-tag">🖼️ Photo to 60fps</span>
                  <span className="hub-micro-tag">🔄 Pan & Orbit</span>
                  <span className="hub-micro-tag">⚡ Neural Fluid</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
