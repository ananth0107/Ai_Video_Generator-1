import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from '../components/Icons';
import VideoPlayer from '../components/VideoPlayer';
import { useVideo } from '../context/VideoContext';
import { useToast } from '../context/ToastContext';

export default function GeneratedOutputPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { currentVideo, toggleSaveVideo } = useVideo();

  const handleSaveToggle = () => {
    if (!currentVideo) return;
    toggleSaveVideo(currentVideo.id);
    const willBeSaved = !currentVideo.isSaved;
    showToast(
      willBeSaved ? 'Video saved to your collection!' : 'Video removed from collection',
      willBeSaved ? 'BookmarkCheck' : 'Bookmark'
    );
  };

  // If no video has been generated yet
  if (!currentVideo || !currentVideo.hasGenerated) {
    return (
      <div className="view-container" style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
        <div className="page-heading" style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div className="heading-row" style={{ justifyContent: 'center' }}>
            <h1 className="main-title">Generated Video Output</h1>
            <span className="version-badge">
              <Icons.Sparkles /> Studio v2.0
            </span>
          </div>
          <p className="main-subtitle">
            Your generated AI videos will appear here with high-definition playback, timeline controls, and export tools.
          </p>
        </div>

        {/* Empty State Card */}
        <div className="output-empty-container">
          <div className="output-empty-icon-box">
            <Icons.Video />
          </div>
          <h2 className="output-empty-title">No Video Generated Yet</h2>
          <p className="output-empty-desc">
            To view a generated video, go to <strong>Prompt to Video</strong> or <strong>Image to Video</strong>,
            configure your settings, and click the <strong>Generate Video</strong> button.
          </p>

          <div className="output-empty-actions">
            <button
              type="button"
              onClick={() => navigate('/prompt-to-video')}
              className="generate-btn"
              style={{ width: 'auto', padding: '12px 24px', fontSize: '14px' }}
            >
              <Icons.Sparkles />
              <span>Create with Prompt to Video</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/image-to-video')}
              className="tool-btn"
              style={{ padding: '12px 24px', fontSize: '14px' }}
            >
              <Icons.Image />
              <span>Create with Image to Video</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isPromptType = currentVideo.type === 'prompt';

  return (
    <div className="view-container" style={{ maxWidth: '1400px' }}>
      {/* Top Header Row with Navigation & Actions */}
      <div className="page-heading">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div className="heading-row">
            <button
              type="button"
              onClick={() => navigate(isPromptType ? '/prompt-to-video' : '/image-to-video')}
              className="icon-btn"
              title="Back to Studio"
              style={{ marginRight: '4px' }}
            >
              <Icons.ArrowLeft />
            </button>
            <h1 className="main-title">Generated Video Output</h1>
            <span className="version-badge">
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
              Ready
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={() => navigate(isPromptType ? '/prompt-to-video' : '/image-to-video')}
              className="tool-btn"
              style={{ fontSize: '13px', padding: '8px 16px' }}
            >
              <Icons.RotateCw />
              <span>Create Another Video</span>
            </button>

            <button
              type="button"
              onClick={() => navigate(isPromptType ? '/image-to-video' : '/prompt-to-video')}
              className="tool-btn"
              style={{ fontSize: '13px', padding: '8px 16px' }}
            >
              {isPromptType ? <Icons.Image /> : <Icons.Sparkles />}
              <span>{isPromptType ? 'Switch to Image to Video' : 'Switch to Prompt to Video'}</span>
            </button>
          </div>
        </div>

        <p className="main-subtitle">
          Interactive real-time playback, scrubbing, speed controls, and high-definition video export.
        </p>
      </div>

      {/* Main Output Layout: Large Video Player + Side Metadata Panel */}
      <div className="output-view-grid">
        {/* Main Video Player Container */}
        <div className="output-player-container">
          <VideoPlayer
            video={currentVideo}
            onRegenerate={() => navigate(isPromptType ? '/prompt-to-video' : '/image-to-video')}
            onSaveToggle={handleSaveToggle}
          />
        </div>

        {/* Video Generation Details Card */}
        <div className="output-meta-sidebar">
          <div className="output-meta-card">
            <h3 className="meta-card-title">Generation Details</h3>

            <div className="meta-item">
              <span className="meta-item-label">Generation Mode</span>
              <span className="meta-item-value">
                {isPromptType ? 'Prompt to Video' : 'Image to Video'}
              </span>
            </div>

            <div className="meta-item">
              <span className="meta-item-label">Aspect Ratio</span>
              <span className="meta-item-value">{currentVideo.aspectRatio || '16:9'}</span>
            </div>

            <div className="meta-item">
              <span className="meta-item-label">Style / Motion</span>
              <span className="meta-item-value">{currentVideo.style || 'Cinematic'}</span>
            </div>

            <div className="meta-item">
              <span className="meta-item-label">Duration</span>
              <span className="meta-item-value">{currentVideo.duration || 10} seconds</span>
            </div>

            <div className="meta-item">
              <span className="meta-item-label">Engine</span>
              <span className="meta-item-value">THAMILI Neural Diffusion v2.0</span>
            </div>

            <div className="meta-prompt-box">
              <span className="meta-item-label">{isPromptType ? 'Prompt Text' : 'Motion Description'}</span>
              <p className="meta-prompt-content">"{currentVideo.prompt}"</p>
            </div>

            <div className="meta-actions-stack">
              <button
                type="button"
                onClick={() => navigate(isPromptType ? '/prompt-to-video' : '/image-to-video')}
                className="generate-btn"
                style={{ width: '100%', fontSize: '13px', padding: '10px 16px' }}
              >
                <span>Edit & Regenerate</span>
                <Icons.ArrowRight />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
