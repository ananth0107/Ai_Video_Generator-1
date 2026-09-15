import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from '../components/Icons';
import { useToast } from '../context/ToastContext';
import { generateTextToImage } from '../services/falAiService';

export default function ImageGenPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [prompt, setPrompt] = useState('Cyberpunk street samurai under neon rain in Tokyo 2099, octane render 8k');
  const [style, setStyle] = useState('Photorealistic');
  const [isGenerating, setIsGenerating] = useState(false);

  const [galleryImages, setGalleryImages] = useState([
    {
      title: 'Neon Samurai',
      url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><defs><linearGradient id="g3" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%230f172a"/><stop offset="50%" stop-color="%234f46e5"/><stop offset="100%" stop-color="%23ec4899"/></linearGradient></defs><rect width="400" height="400" fill="url(%23g3)"/><circle cx="200" cy="180" r="70" fill="%231e1b4b" stroke="%2338bdf8" stroke-width="4"/><path d="M160 220 L240 220 L220 300 L180 300 Z" fill="%23020617"/><text x="200" y="360" fill="white" font-family="sans-serif" font-weight="bold" font-size="16" text-anchor="middle">NEON SAMURAI</text></svg>'
    },
    {
      title: 'Cosmic Nebula',
      url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><defs><radialGradient id="g4" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="%23f43f5e"/><stop offset="40%" stop-color="%238b5cf6"/><stop offset="100%" stop-color="%23020617"/></radialGradient></defs><rect width="400" height="400" fill="url(%23g4)"/><circle cx="140" cy="120" r="15" fill="%23ffffff" opacity="0.8"/><circle cx="280" cy="240" r="25" fill="%2338bdf8" opacity="0.6"/><text x="200" y="360" fill="white" font-family="sans-serif" font-weight="bold" font-size="16" text-anchor="middle">COSMIC NEBULA</text></svg>'
    }
  ]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    showToast('Generating AI Image with Fal.ai FLUX...', 'Sparkles');

    try {
      const fullPrompt = `${prompt.trim()}, ${style} style, ultra detailed 8k`;
      const imageUrl = await generateTextToImage(fullPrompt);

      const newImage = {
        title: prompt.slice(0, 24) + '...',
        url: imageUrl,
        isAiGenerated: true
      };

      setGalleryImages((prev) => [newImage, ...prev]);
      showToast('✨ Fal.ai FLUX Image generated successfully!', 'Check');
    } catch (err) {
      console.error('Image generation error:', err);
      showToast('Image generation notice: check Fal.ai Key / Balance in Settings', 'Trash2');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnimateToVideo = (img) => {
    navigate('/image-to-video', {
      state: {
        presetImage: img.url,
        presetPrompt: `Cinematic motion of ${img.title}, camera push-in smoothly, 4k ultra realistic`
      }
    });
  };

  return (
    <div className="view-container">
      <div className="page-heading">
        <div className="heading-row">
          <h1 className="main-title">AI Image Studio</h1>
          <span className="version-badge"><Icons.Sparkles /> Fal.ai FLUX & SDXL</span>
        </div>
        <p className="main-subtitle">Generate photorealistic images and digital artwork from text prompts.</p>
      </div>

      <div className="creation-card active-card" style={{ cursor: 'default' }}>
        <div className="card-top-accent accent-blue-purple"></div>

        <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <div className="form-label-row">
              <label>Image Prompt</label>
              <div style={{ display: 'flex', gap: '6px' }}>
                {['Photorealistic', 'Anime', '3D Render', 'Concept Art'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStyle(s)}
                    className={`pill-btn ${style === s ? 'active' : ''}`}
                    style={{ padding: '4px 10px', fontSize: '11px' }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the image in detail..."
              className="thamili-textarea"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="submit"
              disabled={isGenerating}
              className="generate-btn"
              style={{ width: 'auto', marginTop: 0, padding: '10px 24px', opacity: isGenerating ? 0.7 : 1 }}
            >
              <Icons.Sparkles />
              <span>{isGenerating ? 'Generating Image...' : 'Generate Image'}</span>
            </button>
          </div>
        </form>

        {/* Gallery with 1-click Animate to Video button */}
        <div style={{ marginTop: '28px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '14px' }}>
            Generated Creations Gallery
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '18px' }}>
            {galleryImages.map((img, idx) => (
              <div key={idx} className="creation-card" style={{ padding: '16px' }}>
                <img
                  src={img.url}
                  alt={img.title}
                  style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: '14px', background: '#0f172a' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>{img.title}</span>
                  <button
                    type="button"
                    onClick={() => handleAnimateToVideo(img)}
                    className="tool-btn"
                    style={{ padding: '6px 12px', fontSize: '11px', background: '#eef2ff', color: '#4f46e5', borderColor: '#c7d2fe' }}
                  >
                    <Icons.Video /> Animate to Video
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
