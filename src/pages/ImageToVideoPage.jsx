import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icons } from '../components/Icons';
import GeneratingModal from '../components/GeneratingModal';
import VideoPlayer from '../components/VideoPlayer';
import DropdownSelect from '../components/DropdownSelect';
import CharacterSelectDropdown from '../components/CharacterSelectDropdown';
import { useToast } from '../context/ToastContext';
import { useCharacters } from '../context/CharacterContext';
import { useLanguage } from '../context/LanguageContext';

const defaultSourceImage =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><defs><linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%230f172a"/><stop offset="50%" stop-color="%234f46e5"/><stop offset="100%" stop-color="%23ec4899"/></linearGradient></defs><rect width="600" height="400" fill="url(%23g1)"/><circle cx="300" cy="200" r="90" fill="none" stroke="%2338bdf8" stroke-width="8"/><circle cx="300" cy="200" r="60" fill="none" stroke="%23ec4899" stroke-width="6"/><text x="300" y="208" fill="white" font-family="sans-serif" font-weight="bold" font-size="22" text-anchor="middle">THAMILI AI</text></svg>';

export default function ImageToVideoPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const { selectedCharacters } = useCharacters();
  const { t, language } = useLanguage();

  const [uploadedImage, setUploadedImage] = useState(
    location.state?.presetImage || defaultSourceImage
  );
  const [imageFilename, setImageFilename] = useState(
    location.state?.presetImage ? 'character_portrait.png' : 'Thamili_Portal.svg'
  );
  const [motionPrompt, setMotionPrompt] = useState(
    location.state?.presetPrompt || 'Slowly zoom toward the glowing neural portal while lights sweep smoothly.'
  );
  const [imageMotion, setImageMotion] = useState('Smooth');
  const [cameraDirection, setCameraDirection] = useState('Zoom In');
  const [lightingAtmosphere, setLightingAtmosphere] = useState('Golden Hour');
  const [imageAspect, setImageAspect] = useState('16:9');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isAiEnhance, setIsAiEnhance] = useState(true);
  const [activeSceneryId, setActiveSceneryId] = useState(location.state?.sceneryId || 'cosmic-nebula');

  useEffect(() => {
    if (location.state?.presetImage) {
      setUploadedImage(location.state.presetImage);
      setImageFilename('character_portrait.png');
    }
    if (location.state?.presetPrompt) {
      setMotionPrompt(location.state.presetPrompt);
    }
    if (location.state?.sceneryId) {
      setActiveSceneryId(location.state.sceneryId);
    }
  }, [location.state]);

  // Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressStatus, setProgressStatus] = useState('');

  // Video Output State
  const [generatedVideo, setGeneratedVideo] = useState({
    hasGenerated: true,
    type: 'image',
    prompt:
      location.state?.presetPrompt ||
      'Slowly zoom toward the glowing neural portal while lights sweep smoothly.',
    aspectRatio: '16:9',
    style: 'Motion: Smooth',
    uploadedImage: location.state?.presetImage || defaultSourceImage,
    sceneryId: location.state?.sceneryId || 'cosmic-nebula',
    characters: [],
    aiEnhanced: true,
    isSaved: false
  });

  const fileInputRef = useRef(null);
  const previewSectionRef = useRef(null);

  const handleFileUpload = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      showToast(
        language === 'ta'
          ? 'சரியான படக் கோப்பைத் தேர்ந்தெடுக்கவும் (PNG, JPG, SVG)'
          : 'Please select a valid image file (PNG, JPG, SVG)',
        'Settings'
      );
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target.result);
      setImageFilename(file.name);
      showToast(
        language === 'ta' ? 'படம் வெற்றிகரமாக பதிவேற்றப்பட்டது!' : 'Image uploaded successfully!',
        'Check'
      );
    };
    reader.readAsDataURL(file);
  };

  const getAugmentedPrompt = useCallback(() => {
    let final = motionPrompt.trim() || 'Slowly zoom toward the subject while the background moves naturally.';
    if (selectedCharacters.length > 0) {
      const charNames = selectedCharacters.map((c) => c.name).join(' and ');
      if (!final.toLowerCase().includes(selectedCharacters[0].name.toLowerCase())) {
        final = `Featuring ${charNames}: ${final}`;
      }
    }
    return final;
  }, [motionPrompt, selectedCharacters]);

  const handleGenerate = useCallback(() => {
    if (!uploadedImage) {
      showToast(
        language === 'ta' ? 'முதலில் ஒரு படத்தைப் பதிவேற்றவும்' : 'Please upload an image first',
        'Image'
      );
      return;
    }

    const finalPrompt = getAugmentedPrompt();
    const stages = t('genStagesImage');

    setIsGenerating(true);
    setProgressPercent(5);
    setProgressStatus(stages[0].text);

    let stageIdx = 0;
    const interval = setInterval(() => {
      stageIdx++;
      if (stageIdx < stages.length) {
        setProgressPercent(stages[stageIdx].percent);
        setProgressStatus(stages[stageIdx].text);
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setIsGenerating(false);
          setGeneratedVideo((prev) => ({
            ...prev,
            hasGenerated: true,
            type: 'image',
            prompt: finalPrompt,
            style: `Motion: ${imageMotion}`,
            aspectRatio: imageAspect,
            uploadedImage: uploadedImage,
            sceneryId: activeSceneryId,
            characters: selectedCharacters,
            aiEnhanced: isAiEnhance,
            isSaved: false
          }));
          showToast(
            language === 'ta'
              ? 'படம் 4K வீடியோவாக வெற்றிகரமாக அனிமேட் செய்யப்பட்டது!'
              : 'Image animated into 4K video successfully!',
            'Video'
          );
          if (previewSectionRef.current) {
            previewSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 400);
      }
    }, 450);
  }, [uploadedImage, getAugmentedPrompt, imageMotion, imageAspect, activeSceneryId, selectedCharacters, isAiEnhance, showToast, t, language]);

  // Keyboard shortcut: Ctrl+Enter or Cmd+Enter to generate
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!isGenerating) {
          handleGenerate();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleGenerate, isGenerating]);

  const handleSaveToggle = () => {
    const next = !generatedVideo.isSaved;
    setGeneratedVideo((prev) => ({ ...prev, isSaved: next }));
    showToast(
      next
        ? language === 'ta'
          ? 'வீடியோ உங்கள் நூலகத்தில் சேமிக்கப்பட்டது!'
          : 'Video saved to your library!'
        : language === 'ta'
        ? 'வீடியோ நூலகத்திலிருந்து நீக்கப்பட்டது'
        : 'Video removed from library',
      next ? 'BookmarkCheck' : 'Bookmark'
    );
  };

  // Dropdown options
  const motionOptionsList = [
    { value: 'Subtle', label: t('motionIntensityOptions')?.Subtle || 'Subtle' },
    { value: 'Smooth', label: t('motionIntensityOptions')?.Smooth || 'Smooth' },
    { value: 'Dynamic', label: t('motionIntensityOptions')?.Dynamic || 'Dynamic' },
    { value: 'Fast', label: t('motionIntensityOptions')?.Fast || 'Fast' }
  ];

  const cameraVectorOptionsList = [
    { value: 'Zoom In', label: t('cameraVectorOptions')?.['Zoom In'] || 'Zoom In' },
    { value: 'Pan Left', label: t('cameraVectorOptions')?.['Pan Left'] || 'Pan Left' },
    { value: 'Tilt Up', label: t('cameraVectorOptions')?.['Tilt Up'] || 'Tilt Up' },
    { value: 'Orbit 360', label: t('cameraVectorOptions')?.['Orbit 360'] || 'Orbit 360' }
  ];

  const lightingAtmosphereList = [
    { value: 'Golden Hour', label: t('lightingOptions')?.['Golden Hour'] || 'Golden Hour' },
    { value: 'Cyber Neon', label: t('lightingOptions')?.['Cyber Neon'] || 'Cyber Neon' },
    { value: 'Ethereal Fog', label: t('lightingOptions')?.['Ethereal Fog'] || 'Ethereal Fog' },
    { value: 'Natural Day', label: t('lightingOptions')?.['Natural Day'] || 'Natural Day' }
  ];

  const aspectOptionsList = [
    { value: '16:9', label: '16:9', desc: language === 'ta' ? 'கிடைமட்டம் (Landscape)' : 'Landscape' },
    { value: '9:16', label: '9:16', desc: language === 'ta' ? 'செங்குத்து (Portrait)' : 'Portrait' },
    { value: '1:1', label: '1:1', desc: language === 'ta' ? 'சதுரம் (Square)' : 'Square' }
  ];

  return (
    <div className="view-container">
      {/* Studio Header Row */}
      <div className="page-heading">
        <div className="page-heading-inner">
          <div className="heading-row">
            <button
              type="button"
              onClick={() => navigate('/characters')}
              className="icon-btn"
              title="Characters Library"
            >
              <Icons.ArrowLeft />
            </button>
            <div className="heading-text-group">
              <div className="heading-title-row">
                <h1 className="main-title">{t('i2vTitle')}</h1>
                <span className="studio-pill-badge badge-purple">{t('i2vBadge')}</span>
              </div>
              <p className="main-subtitle">{t('i2vSubtitle')}</p>
            </div>
          </div>

          <div className="heading-actions-right">
            <button
              type="button"
              onClick={() => navigate('/characters')}
              className="tool-btn"
              title="Browse Characters Library"
            >
              <Icons.Users />
              <span>{t('characters')}</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/prompt-to-video')}
              className="tool-btn"
              title="Switch to Prompt to Video"
            >
              <Icons.Sparkles />
              <span>{t('promptToVideo')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Two-Column Studio Layout */}
      <div className="studio-split-layout">
        {/* LEFT COLUMN: CREATION CONFIGURATOR */}
        <div className="studio-card-panel">
          <div className="creation-card active-card">
            <div className="card-top-accent accent-purple-pink"></div>

            <div className="creation-card-inner">
              {/* 1 & 2. Source Image & Motion Prompt Side-by-Side */}
              <div className="image-motion-split-grid">
                {/* 1. Source Image Upload & Preview Box */}
                <div className="form-group">
                  <div className="form-label-row">
                    <label className="form-step-label">
                      <span className="form-step-badge badge-purple">01</span>
                      <span>{t('stepSourceImageLabel')}</span>
                    </label>
                    <div className="label-controls-right">
                      <button
                        type="button"
                        onClick={() => {
                          const next = !isAiEnhance;
                          setIsAiEnhance(next);
                          showToast(
                            next
                              ? language === 'ta'
                                ? '✨ AI மேம்பாடு இயக்கப்பட்டது'
                                : '✨ AI Enhance ON: Depth estimation & lighting bloom boosted!'
                              : language === 'ta'
                              ? 'AI மேம்பாடு அணைக்கப்பட்டது'
                              : 'AI Enhance turned OFF',
                            'Sparkles'
                          );
                        }}
                        className={`ai-enhance-toggle-btn ${isAiEnhance ? 'active' : ''}`}
                        title="Toggle AI Enhance"
                        aria-pressed={isAiEnhance}
                      >
                        <div className="enhance-btn-content">
                          <Icons.Sparkles />
                          <span>{t('aiEnhance')}</span>
                        </div>
                        <div className={`enhance-switch-track ${isAiEnhance ? 'active' : ''}`}>
                          <div className="enhance-switch-thumb"></div>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div
                    onClick={() => {
                      if (fileInputRef.current) fileInputRef.current.click();
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragOver(true);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      setIsDragOver(false);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragOver(false);
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handleFileUpload(e.dataTransfer.files[0]);
                      }
                    }}
                    className={`dropzone ${isDragOver ? 'drag-over' : ''} ${uploadedImage ? 'has-file' : ''}`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileUpload(e.target.files[0]);
                        }
                      }}
                      style={{ display: 'none' }}
                    />

                    {!uploadedImage ? (
                      <div className="dropzone-empty-row">
                        <div className="dropzone-icon icon-purple">
                          <Icons.UploadCloud />
                        </div>
                        <div className="dropzone-text-group">
                          <p className="dropzone-text">
                            {t('dragDropText')} <span>{t('browseFiles')}</span>
                          </p>
                          <span className="dropzone-subtext">{t('dragDropSub')}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="uploaded-preview-row">
                        <div className="uploaded-info-left">
                          <div className="preview-thumb-wrap">
                            <img src={uploadedImage} alt="Uploaded source" className="preview-thumb-img" />
                          </div>
                          <div className="uploaded-meta-group">
                            <p className="uploaded-filename">{imageFilename || 'source_image.png'}</p>
                            <span className="uploaded-status">
                              <Icons.Check /> {t('imageReadyStatus')}
                            </span>
                          </div>
                        </div>
                        <div className="uploaded-actions-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (fileInputRef.current) fileInputRef.current.click();
                            }}
                            className="ctrl-btn-replace"
                            title="Replace image"
                          >
                            {t('change')}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setUploadedImage(null);
                              setImageFilename('');
                              showToast(
                                language === 'ta' ? 'படம் நீக்கப்பட்டது' : 'Image removed',
                                'Trash2'
                              );
                            }}
                            className="ctrl-btn-remove"
                            title="Remove image"
                          >
                            <Icons.Trash2 />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Motion Description & Camera Prompt */}
                <div className="form-group">
                  <div className="form-label-row">
                    <label htmlFor="motion-input" className="form-step-label">
                      <span className="form-step-badge badge-purple">02</span>
                      <span>{t('stepMotionPromptLabel')}</span>
                    </label>
                    <span className="char-counter">{motionPrompt.length}/500</span>
                  </div>

                  <div className="textarea-wrapper">
                    <textarea
                      id="motion-input"
                      rows={3.5}
                      value={motionPrompt}
                      onChange={(e) => setMotionPrompt(e.target.value)}
                      placeholder={t('motionPromptPlaceholder')}
                      className="thamili-textarea"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Characters Dropdown & Multi-Select Tags */}
              <div className="form-group">
                <CharacterSelectDropdown
                  badge="03"
                  label={t('stepCharactersLabel')}
                  onOpenLibrary={() => navigate('/characters')}
                />
              </div>

              {/* 4 & 5. Dropdowns Grid: Motion Intensity & Camera Vector */}
              <div className="dropdowns-two-col-grid">
                <DropdownSelect
                  badge="04"
                  label={t('stepMotionIntensityLabel')}
                  value={imageMotion}
                  onChange={setImageMotion}
                  options={motionOptionsList}
                />

                <DropdownSelect
                  badge="05"
                  label={t('stepCameraVectorLabel')}
                  value={cameraDirection}
                  onChange={setCameraDirection}
                  options={cameraVectorOptionsList}
                />
              </div>

              {/* 6 & 7. Dropdowns Grid: Atmospheric Lighting & Aspect Ratio */}
              <div className="dropdowns-two-col-grid">
                <DropdownSelect
                  badge="06"
                  label={t('stepAtmosphericLightingLabel')}
                  value={lightingAtmosphere}
                  onChange={setLightingAtmosphere}
                  options={lightingAtmosphereList}
                />

                <DropdownSelect
                  badge="07"
                  label={t('stepAspectRatioLabel')}
                  value={imageAspect}
                  onChange={setImageAspect}
                  options={aspectOptionsList}
                />
              </div>
            </div>

            {/* Main Generate Button Action Area */}
            <div className="generate-action-bar">
              <button
                type="button"
                disabled={isGenerating || !uploadedImage}
                onClick={handleGenerate}
                className="generate-btn btn-purple-gradient"
                title="Animate Image to Video (Ctrl + Enter)"
              >
                <div className="gen-btn-left">
                  <Icons.Sparkles />
                  <span>{t('animateImageToVideo')}</span>
                </div>
                <div className="gen-btn-right">
                  <span className="shortcut-tag">Ctrl + ↵</span>
                  <Icons.ArrowRight />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: OUTPUT PREVIEW & NEURAL PLAYER */}
        <div className="studio-output-panel" ref={previewSectionRef}>
          <VideoPlayer
            video={generatedVideo}
            onRegenerate={handleGenerate}
            onSaveToggle={handleSaveToggle}
          />
        </div>
      </div>

      {/* Generating Progress Modal Overlay */}
      <GeneratingModal
        isOpen={isGenerating}
        progressPercent={progressPercent}
        progressStatus={progressStatus}
        videoType="image"
        promptSummary={getAugmentedPrompt()}
        onCancel={() => {
          setIsGenerating(false);
          showToast(language === 'ta' ? 'உருவாக்கம் ரத்து செய்யப்பட்டது' : 'Generation cancelled', 'Trash2');
        }}
      />
    </div>
  );
}
