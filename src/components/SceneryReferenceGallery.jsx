import React from 'react';
import { animatedSceneries } from '../data/animatedSceneries';
import { Icons } from './Icons';

export default function SceneryReferenceGallery({
  onSelectScenery,
  activeSceneryId = 'golden-sunrise',
  title = 'Animated Scenery References'
}) {
  return (
    <div className="scenery-gallery-section">
      <div className="scenery-gallery-header">
        <div className="scenery-header-left">
          <div className="scenery-header-icon">
            <Icons.Film />
          </div>
          <div className="scenery-header-text-col">
            <div className="scenery-title-inline-group">
              <h3 className="scenery-gallery-title">{title}</h3>
              <span className="scenery-count-badge">10 Presets</span>
            </div>
            <p className="scenery-gallery-subtitle">
              Click any scenery to load instant 4K animated video simulation & prompt
            </p>
          </div>
        </div>
        <div className="scenery-header-badge">
          <Icons.Sparkles />
          <span>Click any scene to use as reference</span>
        </div>
      </div>

      {/* 10 Reference Videos Fitted Perfectly to Screen (5x2 Grid) */}
      <div className="scenery-fitted-grid">
        {animatedSceneries.map((scenery) => {
          const isActive = activeSceneryId === scenery.id;
          return (
            <div
              key={scenery.id}
              className={`scenery-mini-card ${isActive ? 'active-scenery' : ''}`}
              onClick={() => onSelectScenery && onSelectScenery(scenery)}
              role="button"
              tabIndex={0}
              title={`Load Reference: ${scenery.title} (${scenery.style})`}
            >
              {/* Left Gradient Thumbnail Tile */}
              <div
                className="scenery-mini-thumb"
                style={{ background: scenery.thumbGradient }}
              >
                <div className="scenery-mini-thumb-overlay"></div>
                <span className="scenery-mini-icon">{scenery.icon}</span>
                {isActive && (
                  <div className="scenery-mini-active-dot" title="Active Preset">
                    <Icons.Check />
                  </div>
                )}
              </div>

              {/* Right Details Column */}
              <div className="scenery-mini-content">
                <div className="scenery-mini-top-row">
                  <h4 className="scenery-mini-title">{scenery.title}</h4>
                </div>
                <div className="scenery-mini-meta">
                  <span className="scenery-mini-tag">{scenery.tag || scenery.category}</span>
                  <span className="scenery-mini-style">{scenery.style}</span>
                </div>
              </div>

              {/* Active Indicator Tag */}
              {isActive && (
                <div className="scenery-mini-active-pill">
                  <Icons.Check />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
