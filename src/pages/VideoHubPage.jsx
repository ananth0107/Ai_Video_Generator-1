import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from '../components/Icons';

export default function VideoHubPage() {
  const navigate = useNavigate();

  return (
    <div className="view-container">
      {/* Page Header */}
      <div className="page-heading">
        <div className="heading-row">
          <h1 className="main-title">AI Video Studio</h1>
          <span className="version-badge">
            <Icons.Sparkles /> Studio v2.0
          </span>
        </div>
        <p className="main-subtitle">
          Choose a mode below to generate ultra-realistic AI videos with cinematic lighting and camera dynamics.
        </p>
      </div>

      {/* TWO LARGE ACTION CARDS WITH DIRECT ROUTE NAVIGATION */}
      <div className="cards-grid">
        {/* CARD 1 — PROMPT TO VIDEO */}
        <div
          onClick={() => navigate('/prompt-to-video')}
          className="creation-card"
          role="button"
          tabIndex={0}
        >
          <div className="card-top-accent accent-blue-purple"></div>

          <div>
            <div className="card-header">
              <div className="card-icon-box icon-box-blue">
                <Icons.Sparkles />
              </div>
              <div>
                <h2 className="card-title">Prompt to Video</h2>
                <p className="card-desc">
                  Turn your ideas and text prompts into stunning 4K/HD video sequences.
                </p>
              </div>
            </div>

            <div className="card-features-list">
              <div className="feature-item">
                <span className="check-bullet"><Icons.Check /></span>
                <span>Exact 5s, 10s & 15s HD video clips</span>
              </div>
              <div className="feature-item">
                <span className="check-bullet"><Icons.Check /></span>
                <span>Cinematic, Realistic, 3D & Anime visual styles</span>
              </div>
              <div className="feature-item">
                <span className="check-bullet"><Icons.Check /></span>
                <span>Multi-aspect ratio support (16:9, 9:16, 1:1)</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigate('/prompt-to-video');
            }}
            className="generate-btn"
            style={{ marginTop: '24px' }}
          >
            <span>Open Prompt to Video</span>
            <Icons.ArrowRight />
          </button>
        </div>

        {/* CARD 2 — IMAGE TO VIDEO */}
        <div
          onClick={() => navigate('/image-to-video')}
          className="creation-card"
          role="button"
          tabIndex={0}
        >
          <div className="card-top-accent accent-purple-pink"></div>

          <div>
            <div className="card-header">
              <div className="card-icon-box icon-box-purple">
                <Icons.Image />
              </div>
              <div>
                <h2 className="card-title">Image to Video</h2>
                <p className="card-desc">
                  Bring still photos, concept art, and product shots to life with realistic motion.
                </p>
              </div>
            </div>

            <div className="card-features-list">
              <div className="feature-item">
                <span className="check-bullet"><Icons.Check /></span>
                <span>Drag & drop PNG, JPG or sample assets</span>
              </div>
              <div className="feature-item">
                <span className="check-bullet"><Icons.Check /></span>
                <span>Intelligent camera pan, tilt, zoom & speed controls</span>
              </div>
              <div className="feature-item">
                <span className="check-bullet"><Icons.Check /></span>
                <span>Instant playback & direct WebM/PNG export</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigate('/image-to-video');
            }}
            className="generate-btn"
            style={{ marginTop: '24px', background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #ec4899 100%)' }}
          >
            <span>Open Image to Video</span>
            <Icons.ArrowRight />
          </button>
        </div>
      </div>

      {/* QUICK TEMPLATES & PRESETS */}
      <div className="hub-showcase-section">
        <div className="template-grid">
          {[
            {
              title: 'Futuristic Cyber City',
              desc: 'Flying vehicles zooming through neon skyways in heavy rain',
              type: 'Prompt to Video',
              route: '/prompt-to-video'
            },
            {
              title: 'Alpine Peak Sunrise',
              desc: 'Drone swoop over snowcapped summits bathed in golden sunlight',
              type: 'Prompt to Video',
              route: '/prompt-to-video'
            },
            {
              title: 'Fluid Portal Animation',
              desc: 'Transform your artwork with glowing particles and depth sweep',
              type: 'Image to Video',
              route: '/image-to-video'
            }
          ].map((item, idx) => (
            <div
              key={idx}
              className="template-card"
              onClick={() => navigate(item.route)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="template-tag">{item.type}</span>
                <Icons.Sparkles />
              </div>
              <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>
                {item.title}
              </h4>
              <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.4 }}>
                {item.desc}
              </p>
              <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '600', color: '#4f46e5' }}>
                <span>Try Template</span>
                <Icons.ArrowRight />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
