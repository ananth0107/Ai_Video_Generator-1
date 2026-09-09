import React, { useState, useRef } from 'react';
import { referenceCards } from '../data/marketplaceData';
import { Icons } from '../components/Icons';
import ThamiliBrandLogo from '../components/ThamiliBrandLogo';
import CreatorMarketplaceSection from '../components/CreatorMarketplaceSection';
import { useToast } from '../context/ToastContext';
import { useVideo } from '../context/VideoContext';

export default function CleanStudioPage({ activeView = 'images', onSelectView = () => {} }) {
  const { showToast } = useToast();
  const { setGeneratedVideo, currentVideo, clearCurrentVideo } = useVideo();

  // Main Prompt Input State
  const [promptText, setPromptText] = useState('');
  const [selectedModel, setSelectedModel] = useState('Flash');
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [attachedImage, setAttachedImage] = useState(null);

  // Modals / Drawers State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isCreditsModalOpen, setIsCreditsModalOpen] = useState(false);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);

  // Video/Image Player Controls
  const [isPlaying, setIsPlaying] = useState(true);
  const promptInputRef = useRef(null);
  const fileInputRef = useRef(null);

  // Sample Gallery / History Items
  const [galleryCreations, setGalleryCreations] = useState([
    {
      id: 'gal-1',
      title: 'Ancestral Courtyard Dawn',
      prompt: 'Traditional Tamil Chettinad ancestral courtyard with teak wood pillars and morning golden light',
      model: 'Flash',
      date: 'Just now',
      image: referenceCards[0].image
    },
    {
      id: 'gal-2',
      title: 'Madurai Temple Street',
      prompt: 'Vibrant Madurai Meenakshi temple street bazaar under golden twilight',
      model: 'Ultra 4K',
      date: '10m ago',
      image: referenceCards[1].image
    },
    {
      id: 'gal-3',
      title: 'Pongal Harvest Feast',
      prompt: 'Tamil Pongal harvest festival celebration with decorated earthenware pot',
      model: 'Flash',
      date: '1h ago',
      image: referenceCards[2].image
    },
    {
      id: 'gal-4',
      title: 'Deepam Temple Glow',
      prompt: 'Terracotta clay oil lamps illuminating temple corridors during Karthigai Deepam',
      model: 'Cinematic',
      date: '2h ago',
      image: referenceCards[3].image
    }
  ]);

  // Handle Loading Reference Card Prompt
  const handleSelectReference = (card) => {
    if (card.isActionCard) {
      onSelectView('marketplace');
      showToast('Opened Creator Marketplace styles & templates', 'Sparkles');
      return;
    }

    setPromptText(card.prompt);
    showToast(`Loaded "${card.title}" prompt!`, 'Sparkles');
    if (promptInputRef.current) {
      promptInputRef.current.focus();
    }
  };

  // Handle Model Selection
  const handleSelectModel = (model) => {
    setSelectedModel(model);
    setIsModelDropdownOpen(false);
    showToast(`Switched model to ${model}`, 'Zap');
  };

  // Handle Image Attachment
  const handleFileUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachedImage(event.target.result);
        setIsUploadModalOpen(false);
        showToast(`Reference image "${file.name}" attached!`, 'Image');
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Generate Action
  const handleGenerate = (e) => {
    if (e) e.preventDefault();
    if (!promptText.trim()) {
      showToast('Please enter a description for your image', 'Sparkles');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(10);
    showToast(`Generating with ${selectedModel} Diffusion Engine...`, 'Sparkles');

    const interval = setInterval(() => {
      setGenerationProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 25;
      });
    }, 280);

    setTimeout(() => {
      clearInterval(interval);
      setIsGenerating(false);
      setGenerationProgress(100);

      const newCreation = {
        id: `gen_${Date.now()}`,
        title: promptText.slice(0, 36) + (promptText.length > 36 ? '...' : ''),
        prompt: promptText,
        model: selectedModel,
        date: 'Just now',
        image: attachedImage || referenceCards[Math.floor(Math.random() * 5)].image,
        aspectRatio: '16:9'
      };

      setGeneratedVideo(newCreation);
      setGalleryCreations((prev) => [newCreation, ...prev]);
      showToast('✨ Masterpiece generated in 4K HDR!', 'Sparkles');

      const previewEl = document.getElementById('generation-output-section');
      if (previewEl) previewEl.scrollIntoView({ behavior: 'smooth' });
    }, 1400);
  };

  return (
    <div className="clean-studio-viewport">
      {/* 1. Common Hero Header (Present in both Image 1 & Image 2) */}
      <div className="clean-hero-container">
        {/* Large Centered Thamili Brand Logo */}
        <div className="clean-hero-brand" style={{ marginBottom: '16px' }}>
          <ThamiliBrandLogo height={72} />
        </div>

        {/* Hero Headings */}
        <h1 className="clean-hero-title">
          Create images with <span className="brand-gradient-text">Thamili AI</span>
        </h1>
        <p className="clean-hero-subtitle">
          Try a template or describe an idea in chat.
        </p>

        {/* VIEW 1: Images Creation Center (Image 1) */}
        {activeView === 'images' && (
          <>
            {/* The Signature Prompt Card */}
            <form onSubmit={handleGenerate} className="clean-prompt-card">
              {/* Top Textarea */}
              <div className="prompt-input-area">
                <textarea
                  ref={promptInputRef}
                  rows={3}
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder="Describe your image"
                  className="clean-prompt-textarea"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleGenerate();
                    }
                  }}
                />

                {/* Attached Thumbnail Badge */}
                {attachedImage && (
                  <div className="prompt-attached-chip">
                    <img src={attachedImage} alt="Ref preview" className="attached-thumb" />
                    <span>Reference attached</span>
                    <button
                      type="button"
                      onClick={() => setAttachedImage(null)}
                      className="remove-attach-btn"
                      title="Remove image"
                    >
                      <Icons.X />
                    </button>
                  </div>
                )}
              </div>

              {/* Bottom Controls Row inside Box */}
              <div className="prompt-card-bottom-row">
                {/* Left '+' Attachment Button */}
                <div className="prompt-bottom-left">
                  <button
                    type="button"
                    className="clean-plus-circle-btn"
                    onClick={() => setIsUploadModalOpen(true)}
                    title="Attach Reference Image"
                    aria-label="Attach file"
                  >
                    <Icons.Plus />
                  </button>
                </div>

                {/* Right: Model Selector & Generate Button */}
                <div className="prompt-bottom-right">
                  {/* Model Dropdown Pill */}
                  <div className="model-dropdown-container">
                    <button
                      type="button"
                      className="clean-model-pill-btn"
                      onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                    >
                      <span className="model-bolt-icon">⚡</span>
                      <span className="model-name-text">{selectedModel}</span>
                      <span className={`model-chevron ${isModelDropdownOpen ? 'open' : ''}`}>
                        <Icons.ChevronDown />
                      </span>
                    </button>

                    {isModelDropdownOpen && (
                      <div className="clean-model-dropdown-popover">
                        <button
                          type="button"
                          className={`model-option ${selectedModel === 'Flash' ? 'active' : ''}`}
                          onClick={() => handleSelectModel('Flash')}
                        >
                          <div className="option-title-row">
                            <strong>⚡ Flash</strong>
                            <span className="option-speed-badge">Fast (0.8s)</span>
                          </div>
                          <p className="option-desc">Instant real-time diffusion</p>
                        </button>

                        <button
                          type="button"
                          className={`model-option ${selectedModel === 'Ultra 4K' ? 'active' : ''}`}
                          onClick={() => handleSelectModel('Ultra 4K')}
                        >
                          <div className="option-title-row">
                            <strong>✨ Ultra 4K</strong>
                            <span className="option-speed-badge">SDXL + Flux</span>
                          </div>
                          <p className="option-desc">Hyper-detailed textures & lighting</p>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Generate Button (Purple Gradient Pill) */}
                  <button
                    type="submit"
                    className={`clean-generate-action-btn ${isGenerating ? 'loading' : ''}`}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <span className="btn-spinner"></span>
                        <span>Synthesizing ({generationProgress}%)...</span>
                      </>
                    ) : (
                      <>
                        <Icons.Sparkles />
                        <span>Generate</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>

            {/* Reference Inspiration Cards Row (Image 1) */}
            <div className="clean-reference-cards-row">
              {referenceCards.map((card) => (
                <div
                  key={card.id}
                  className={`clean-ref-card ${card.isActionCard ? 'action-card-gradient' : ''}`}
                  onClick={() => handleSelectReference(card)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="ref-card-thumb-wrapper">
                    <img src={card.image} alt={card.title} className="ref-card-img" />
                    <div className="ref-card-overlay"></div>

                    <div className="ref-card-badge">
                      <span>{card.badge}</span>
                    </div>

                    <div className="ref-card-title-box">
                      <span className="ref-title-text">{card.title}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Gallery & Folders Pill Button (Image 1) */}
            <div className="gallery-folders-pill-wrapper">
              <button
                type="button"
                className="gallery-folders-pill-btn"
                onClick={() => setIsGalleryOpen(true)}
              >
                <span className="gallery-stack-icon">
                  <Icons.Layers />
                </span>
                <span className="gallery-pill-label">Gallery & Folders</span>
                <span className="gallery-pill-badge">{galleryCreations.length}</span>
              </button>
            </div>
          </>
        )}

        {/* VIEW 2: Creator Marketplace Section (Image 2) */}
        {activeView === 'marketplace' && (
          <CreatorMarketplaceSection
            onSelectPrompt={(prompt) => {
              setPromptText(prompt);
              onSelectView('images');
              if (promptInputRef.current) promptInputRef.current.focus();
            }}
            onOpenSellModal={() => setIsSellModalOpen(true)}
          />
        )}
      </div>

      {/* 2. Generated Output & Video Player Showcase (Dynamic) */}
      {currentVideo && (
        <section className="generation-output-showcase" id="generation-output-section">
          <div className="output-header-bar">
            <div className="output-title-group">
              <span className="output-badge-ready">✨ Generated 4K Output</span>
              <h2 className="output-prompt-title">"{currentVideo.prompt}"</h2>
            </div>
            <div className="output-actions-group">
              <button
                type="button"
                className="output-btn-secondary"
                onClick={() => {
                  setPromptText(currentVideo.prompt);
                  onSelectView('images');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  showToast('Prompt loaded for remixing!', 'Sparkles');
                }}
              >
                <Icons.RefreshCw />
                <span>Remix Prompt</span>
              </button>
              <button
                type="button"
                className="output-btn-primary"
                onClick={() => showToast('Masterpiece downloaded in 4K UHD!', 'Download')}
              >
                <Icons.Download />
                <span>Download Asset</span>
              </button>
              <button
                type="button"
                className="output-close-btn"
                onClick={clearCurrentVideo}
                title="Dismiss preview"
              >
                <Icons.X />
              </button>
            </div>
          </div>

          {/* Interactive Player Visualizer */}
          <div className="output-player-container">
            <div className="output-canvas-frame">
              <img
                src={currentVideo.image}
                alt="Generated AI Creation"
                className={`output-display-image ${isPlaying ? 'animating-pan' : ''}`}
              />
              <div className="player-gradient-overlay"></div>

              {/* Floating Status Badges */}
              <div className="player-top-hud">
                <div className="hud-badge hud-model">
                  <Icons.Sparkles />
                  <span>{currentVideo.model || 'Thamili Neural Diffusion'}</span>
                </div>
                <div className="hud-badge hud-res">4K UHD • 60 FPS</div>
              </div>

              {/* Center Play/Pause Trigger */}
              <button
                type="button"
                className="player-center-toggle-btn"
                onClick={() => setIsPlaying(!isPlaying)}
                aria-label="Toggle Playback"
              >
                {isPlaying ? <Icons.Pause /> : <Icons.Play />}
              </button>

              {/* Bottom Player Controls Bar */}
              <div className="player-bottom-hud">
                <button
                  type="button"
                  className="hud-play-btn"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? <Icons.Pause /> : <Icons.Play />}
                </button>
                <span className="hud-timecode">00:04 / 00:08</span>
                <div className="hud-timeline-track">
                  <div className="hud-timeline-fill" style={{ width: isPlaying ? '60%' : '25%' }}></div>
                </div>
                <button
                  type="button"
                  className="hud-tool-btn"
                  onClick={() => showToast('Audio track synced', 'Music')}
                  title="Audio track"
                >
                  <Icons.Music />
                </button>
                <button
                  type="button"
                  className="hud-tool-btn"
                  onClick={() => showToast('Entered Fullscreen View', 'Maximize')}
                  title="Fullscreen"
                >
                  <Icons.Maximize />
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* MODAL: Upload Reference Image (+) */}
      {isUploadModalOpen && (
        <div className="clean-modal-backdrop" onClick={() => setIsUploadModalOpen(false)}>
          <div className="clean-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-top-bar">
              <div className="modal-title-row">
                <Icons.Upload />
                <h3>Upload Reference Image</h3>
              </div>
              <button
                type="button"
                className="modal-close-icon-btn"
                onClick={() => setIsUploadModalOpen(false)}
              >
                <Icons.X />
              </button>
            </div>

            <div
              className="modal-dropzone"
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              <div className="dropzone-icon-box">
                <Icons.Image />
              </div>
              <h4>Click or drag & drop reference image</h4>
              <p>Supports PNG, JPG, WEBP up to 50MB</p>
              <button type="button" className="dropzone-select-btn">
                Browse Computer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Gallery & Folders Drawer */}
      {isGalleryOpen && (
        <div className="clean-modal-backdrop" onClick={() => setIsGalleryOpen(false)}>
          <div className="clean-gallery-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="modal-top-bar">
              <div className="modal-title-row">
                <Icons.Layers />
                <h3>Gallery & Folders ({galleryCreations.length})</h3>
              </div>
              <button
                type="button"
                className="modal-close-icon-btn"
                onClick={() => setIsGalleryOpen(false)}
              >
                <Icons.X />
              </button>
            </div>

            <div className="gallery-drawer-grid">
              {galleryCreations.map((item) => (
                <div key={item.id} className="gallery-drawer-card">
                  <img src={item.image} alt={item.title} className="gallery-card-img" />
                  <div className="gallery-card-info">
                    <strong>{item.title}</strong>
                    <p>{item.prompt}</p>
                    <div className="gallery-card-actions">
                      <button
                        type="button"
                        className="drawer-use-btn"
                        onClick={() => {
                          setPromptText(item.prompt);
                          setIsGalleryOpen(false);
                          showToast('Loaded prompt from gallery!', 'Sparkles');
                        }}
                      >
                        Use Prompt
                      </button>
                      <span className="gallery-date-badge">{item.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Upgrade to Pro */}
      {isUpgradeModalOpen && (
        <div className="clean-modal-backdrop" onClick={() => setIsUpgradeModalOpen(false)}>
          <div className="clean-modal-box pro-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-top-bar">
              <div className="modal-title-row">
                <span className="sparkle-gold">✨</span>
                <h3>Upgrade to Thamili Pro</h3>
              </div>
              <button
                type="button"
                className="modal-close-icon-btn"
                onClick={() => setIsUpgradeModalOpen(false)}
              >
                <Icons.X />
              </button>
            </div>

            <div className="pro-modal-body">
              <p className="pro-modal-lead">
                Supercharge your studio with unlimited 4K diffusion, 60 FPS video animations, and 1,000 monthly credits.
              </p>

              <div className="pro-pricing-cards-row">
                <div className="pricing-card standard">
                  <h4>Creator Starter</h4>
                  <div className="price-tag">$19<span>/mo</span></div>
                  <ul className="perks-list">
                    <li>✓ 500 Fast AI Credits</li>
                    <li>✓ 1080p Full HD Video</li>
                    <li>✓ Standard Support</li>
                  </ul>
                  <button
                    type="button"
                    className="pricing-choose-btn"
                    onClick={() => {
                      showToast('Subscribed to Creator Starter!', 'Sparkles');
                      setIsUpgradeModalOpen(false);
                    }}
                  >
                    Select Plan
                  </button>
                </div>

                <div className="pricing-card featured">
                  <div className="popular-badge">MOST POPULAR</div>
                  <h4>Studio Pro Ultra</h4>
                  <div className="price-tag">$49<span>/mo</span></div>
                  <ul className="perks-list">
                    <li>✓ Unlimited 4K HDR Diffusion</li>
                    <li>✓ 60 FPS Neural Video Studio</li>
                    <li>✓ Custom Character Lore Engine</li>
                    <li>✓ Commercial Marketplace License</li>
                  </ul>
                  <button
                    type="button"
                    className="pricing-choose-btn gradient-btn"
                    onClick={() => {
                      showToast('Welcome to Thamili Studio Pro Ultra!', 'Sparkles');
                      setIsUpgradeModalOpen(false);
                    }}
                  >
                    Upgrade Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Sell Artwork in Marketplace */}
      {isSellModalOpen && (
        <div className="clean-modal-backdrop" onClick={() => setIsSellModalOpen(false)}>
          <div className="clean-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-top-bar">
              <div className="modal-title-row">
                <Icons.Plus />
                <h3>Sell Your Artwork on Marketplace</h3>
              </div>
              <button
                type="button"
                className="modal-close-icon-btn"
                onClick={() => setIsSellModalOpen(false)}
              >
                <Icons.X />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                showToast('Artwork submitted for verification! Creators earn 80% royalty.', 'Sparkles');
                setIsSellModalOpen(false);
              }}
              className="sell-artwork-form"
            >
              <div className="form-group-clean">
                <label>Artwork Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cyberpunk Madurai Gopuram 2099"
                  className="clean-input"
                />
              </div>

              <div className="form-group-clean">
                <label>Category</label>
                <select className="clean-select">
                  <option>Tamil Culture & Festivals</option>
                  <option>Sci-Fi & Concept Art</option>
                  <option>Architecture</option>
                  <option>Nature & Landscape</option>
                </select>
              </div>

              <div className="form-group-clean">
                <label>Price in Credits</label>
                <input
                  type="number"
                  defaultValue={25}
                  min={5}
                  max={200}
                  className="clean-input"
                />
              </div>

              <div className="form-group-clean">
                <label>Prompt & Synthesis Parameters</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Enter the prompt used to create this masterpiece..."
                  className="clean-textarea"
                />
              </div>

              <button type="submit" className="clean-submit-btn">
                Publish to Creator Marketplace
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add Credits */}
      {isCreditsModalOpen && (
        <div className="clean-modal-backdrop" onClick={() => setIsCreditsModalOpen(false)}>
          <div className="clean-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-top-bar">
              <div className="modal-title-row">
                <span className="coin-dot">🪙</span>
                <h3>Add AI Studio Credits</h3>
              </div>
              <button
                type="button"
                className="modal-close-icon-btn"
                onClick={() => setIsCreditsModalOpen(false)}
              >
                <Icons.X />
              </button>
            </div>

            <div className="credits-modal-body">
              <p>Current Balance: <strong>250 Credits</strong></p>
              <div className="credit-packs-grid">
                {[
                  { amount: 100, price: '$5' },
                  { amount: 500, price: '$20', popular: true },
                  { amount: 1500, price: '$50' }
                ].map((pack) => (
                  <div key={pack.amount} className={`credit-pack-card ${pack.popular ? 'pack-popular' : ''}`}>
                    <div className="pack-amount">🪙 {pack.amount} Credits</div>
                    <div className="pack-price">{pack.price}</div>
                    <button
                      type="button"
                      className="pack-buy-btn"
                      onClick={() => {
                        showToast(`Added ${pack.amount} credits to your account!`, 'Sparkles');
                        setIsCreditsModalOpen(false);
                      }}
                    >
                      Top Up
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
