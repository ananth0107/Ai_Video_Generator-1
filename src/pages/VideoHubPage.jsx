import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from '../components/Icons';
import { useCharacters } from '../context/CharacterContext';

export default function VideoHubPage() {
  const navigate = useNavigate();
  const { allCharacters, customCharacters } = useCharacters();

  return (
    <div className="hub-page-container">
      {/* Page Heading & Hero Section */}
      <div className="hub-heading-section">
        <div className="hub-header-top-row">
          <div className="hub-title-row">
            <h1 className="hub-main-title">THAMILI AI Video Studio</h1>
            <span className="studio-version-badge">
              <Icons.Sparkles />
              <span>Studio v2.5 Ultra</span>
            </span>
          </div>
          <div className="hub-stats-row">
            <span className="hub-stat-item">✨ 4K HDR Diffusion</span>
            <span className="hub-stat-sep">•</span>
            <span className="hub-stat-item">⚡ 60 FPS Keyframes</span>
            <span className="hub-stat-sep">•</span>
            <span className="hub-stat-item">👥 {allCharacters.length} Characters ({customCharacters.length} Custom)</span>
          </div>
        </div>
        <p className="hub-subtitle-text">
          Generate cinematic AI videos from text prompts, animate artwork with realistic physics, or create persistent AI character personas.
        </p>
      </div>

      {/* Main Studio Cards Grid (3-Card Layout: Prompt, Image, Characters) */}
      <div className="hub-feature-cards-grid">
        {/* Card 1: Prompt to Video */}
        <div
          onClick={() => navigate('/prompt-to-video')}
          className="feature-card prompt-card"
          role="button"
          tabIndex={0}
        >
          <div className="feature-card-inner-top">
            <div className="feature-card-header">
              <div className="feature-icon-circle icon-blue">
                <Icons.Sparkles />
              </div>
              <div className="feature-header-text">
                <div className="feature-title-row">
                  <h2 className="feature-title">Prompt to Video</h2>
                  <span className="feature-badge badge-blue">Text-to-Video</span>
                </div>
                <p className="feature-desc">
                  Transform natural text prompts into stunning 4K cinematic video sequences with custom camera motions and lighting.
                </p>
              </div>
            </div>

            <div className="feature-checklist">
              <div className="check-item">
                <span className="check-icon">✓</span>
                <span>Spatial Vector Prompt Synthesis with AI Enhancer</span>
              </div>
              <div className="check-item">
                <span className="check-icon">✓</span>
                <span>Cinematic, Realistic, 3D Render & Anime Visual Styles</span>
              </div>
              <div className="check-item">
                <span className="check-icon">✓</span>
                <span>Multi-aspect ratios: 16:9 Landscape, 9:16 Shorts, 1:1</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigate('/prompt-to-video');
            }}
            className="feature-action-btn btn-blue-purple"
          >
            <span>Open Prompt to Video</span>
            <Icons.ArrowRight />
          </button>
        </div>

        {/* Card 2: Image to Video */}
        <div
          onClick={() => navigate('/image-to-video')}
          className="feature-card image-card"
          role="button"
          tabIndex={0}
        >
          <div className="feature-card-inner-top">
            <div className="feature-card-header">
              <div className="feature-icon-circle icon-purple">
                <Icons.Image />
              </div>
              <div className="feature-header-text">
                <div className="feature-title-row">
                  <h2 className="feature-title">Image to Video</h2>
                  <span className="feature-badge badge-pink">Image-to-Video</span>
                </div>
                <p className="feature-desc">
                  Bring still photos, concept art, and product shots to life with neural fluid dynamics and realistic depth motion.
                </p>
              </div>
            </div>

            <div className="feature-checklist">
              <div className="check-item">
                <span className="check-icon">✓</span>
                <span>Drag & Drop PNG, JPG, SVG with Sample Presets</span>
              </div>
              <div className="check-item">
                <span className="check-icon">✓</span>
                <span>Intelligent Camera Pan, Tilt, Zoom, and Orbit Dynamics</span>
              </div>
              <div className="check-item">
                <span className="check-icon">✓</span>
                <span>Subtle, Smooth, Dynamic & Fast Motion Controls</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigate('/image-to-video');
            }}
            className="feature-action-btn btn-purple-pink"
          >
            <span>Open Image to Video</span>
            <Icons.ArrowRight />
          </button>
        </div>

        {/* Card 3: AI Characters Studio */}
        <div
          onClick={() => navigate('/characters')}
          className="feature-card character-feature-card"
          role="button"
          tabIndex={0}
        >
          <div className="feature-card-inner-top">
            <div className="feature-card-header">
              <div className="feature-icon-circle icon-emerald">
                <Icons.Users />
              </div>
              <div className="feature-header-text">
                <div className="feature-title-row">
                  <h2 className="feature-title">AI Characters Studio</h2>
                  <span className="feature-badge badge-emerald">New Submenu</span>
                </div>
                <p className="feature-desc">
                  Create and save custom AI character personas with image uploads, backstories, and one-click video integration.
                </p>
              </div>
            </div>

            <div className="feature-checklist">
              <div className="check-item">
                <span className="check-icon">✓</span>
                <span>10 Master Default AI Characters with Lore & Prompts</span>
              </div>
              <div className="check-item">
                <span className="check-icon">✓</span>
                <span>Upload Custom Image Portrait to Create New Characters</span>
              </div>
              <div className="check-item">
                <span className="check-icon">✓</span>
                <span>Save to Library & Use Instantly in Video Studios</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigate('/characters');
            }}
            className="feature-action-btn btn-emerald-cyan"
          >
            <span>Open Characters Studio</span>
            <Icons.ArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
}
