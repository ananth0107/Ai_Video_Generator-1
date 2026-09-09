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

export default function PromptToVideoPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const { selectedCharacters } = useCharacters();
  const { t, language } = useLanguage();

  const [promptText, setPromptText] = useState(
    location.state?.presetPrompt ||
      'A golden sunrise over misty mountain peaks with a glowing horizon, volumetric sun rays, and soaring eagles.'
  );
  const [promptAspect, setPromptAspect] = useState(location.state?.presetAspect || '16:9');
  const [promptStyle, setPromptStyle] = useState(location.state?.presetStyle || 'Cinematic');
  const [cameraMotion, setCameraMotion] = useState('Smooth Zoom');
  const [lightingMood, setLightingMood] = useState('Volumetric Sun');
  const [isAiEnhance, setIsAiEnhance] = useState(true);
  const [activeSceneryId, setActiveSceneryId] = useState(location.state?.sceneryId || 'golden-sunrise');

  useEffect(() => {
    if (location.state?.presetPrompt) {
      setPromptText(location.state.presetPrompt);
    }
    if (location.state?.presetAspect) {
      setPromptAspect(location.state.presetAspect);
    }
    if (location.state?.presetStyle) {
      setPromptStyle(location.state.presetStyle);
    }
    if (location.state?.sceneryId) {
      setActiveSceneryId(location.state.sceneryId);
    }
  }, [location.state]);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressStatus, setProgressStatus] = useState('');

  // Generated Video state
  const [generatedVideo, setGeneratedVideo] = useState({
    hasGenerated: true,
    type: 'prompt',
    prompt:
      location.state?.presetPrompt ||
      'A golden sunrise over misty mountain peaks with a glowing horizon, volumetric sun rays, and soaring eagles.',
    aspectRatio: location.state?.presetAspect || '16:9',
    style: location.state?.presetStyle || 'Cinematic',
    sceneryId: location.state?.sceneryId || 'golden-sunrise',
    characters: [],
    aiEnhanced: true,
    isSaved: false
  });

  const previewSectionRef = useRef(null);

  // Build full generation prompt including selected character names
  const getAugmentedPrompt = useCallback(() => {
    let final = promptText.trim() || 'A futuristic cyber city at night with flying vehicles, neon skyways, and volumetric rain lighting.';
    if (selectedCharacters.length > 0) {
      const charNames = selectedCharacters.map((c) => c.name).join(' and ');
      if (!final.toLowerCase().includes(selectedCharacters[0].name.toLowerCase())) {
        final = `Featuring ${charNames}: ${final}`;
      }
    }
    return final;
  }, [promptText, selectedCharacters]);

  const handleGenerate = useCallback(() => {
    const finalPrompt = getAugmentedPrompt();
    const stages = t('genStages');

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
            type: 'prompt',
            prompt: finalPrompt,
            style: promptStyle,
            aspectRatio: promptAspect,
            sceneryId: activeSceneryId,
            characters: selectedCharacters,
            aiEnhanced: isAiEnhance,
            isSaved: false
          }));
          showToast(
            language === 'ta'
              ? '4K HDR வீடியோ வெற்றிகரமாக உருவாக்கப்பட்டது!'
              : 'Video generated successfully in 4K HDR!',
            'Video'
          );
          if (previewSectionRef.current) {
            previewSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 400);
      }
    }, 450);
  }, [getAugmentedPrompt, promptStyle, promptAspect, activeSceneryId, selectedCharacters, isAiEnhance, showToast, t, language]);

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
  const styleOptionsList = [
    { value: 'Cinematic', label: t('styleOptions')?.Cinematic || 'Cinematic' },
    { value: 'Realistic', label: t('styleOptions')?.Realistic || 'Realistic' },
    { value: 'Anime', label: t('styleOptions')?.Anime || 'Anime' },
    { value: '3D Render', label: t('styleOptions')?.['3D Render'] || '3D Render' }
  ];

  const cameraOptionsList = [
    { value: 'Smooth Zoom', label: t('cameraDynamicsOptions')?.['Smooth Zoom'] || 'Smooth Zoom' },
    { value: 'Pan Right', label: t('cameraDynamicsOptions')?.['Pan Right'] || 'Pan Right' },
    { value: 'Drone Orbit', label: t('cameraDynamicsOptions')?.['Drone Orbit'] || 'Drone Orbit' },
    { value: 'Dynamic Flow', label: t('cameraDynamicsOptions')?.['Dynamic Flow'] || 'Dynamic Flow' }
  ];

  const lightingOptionsList = [
    { value: 'Volumetric Sun', label: t('lightingOptions')?.['Volumetric Sun'] || 'Volumetric Sun' },
    { value: 'Cyber Neon', label: t('lightingOptions')?.['Cyber Neon'] || 'Cyber Neon' },
    { value: 'Golden Hour', label: t('lightingOptions')?.['Golden Hour'] || 'Golden Hour' }
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
                <h1 className="main-title">{t('p2vTitle')}</h1>
                <span className="studio-pill-badge">{t('p2vBadge')}</span>
              </div>
              <p className="main-subtitle">{t('p2vSubtitle')}</p>
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
              onClick={() => navigate('/image-to-video')}
              className="tool-btn"
              title="Switch to Image to Video"
            >
              <Icons.Image />
              <span>{t('imageToVideo')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Two-Column Studio Layout */}
      <div className="studio-split-layout">
        {/* LEFT COLUMN: CREATION CONFIGURATOR */}
        <div className="studio-card-panel">
          <div className="creation-card active-card">
            <div className="card-top-accent accent-blue-purple"></div>

            <div className="creation-card-inner">
              {/* 1. Video Description & Prompt Area */}
              <div className="form-group">
                <div className="form-label-row">
                  <label htmlFor="prompt-input" className="form-step-label">
                    <span className="form-step-badge">01</span>
                    <span>{t('step1PromptLabel')}</span>
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
                              : '✨ AI Enhance ON: Auto-optimizing lighting & 4K HDR clarity!'
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

                    <span className="char-counter">{promptText.length}/500</span>
                  </div>
                </div>

                <div className="textarea-wrapper">
                  <textarea
                    id="prompt-input"
                    rows={3.5}
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    placeholder={t('promptPlaceholder')}
                    className="thamili-textarea"
                  />
                </div>
              </div>

              {/* 2. Characters Dropdown & Multi-Select Tags */}
              <div className="form-group">
                <CharacterSelectDropdown
                  badge="02"
                  label={t('stepCharactersLabel')}
                  onOpenLibrary={() => navigate('/characters')}
                />
              </div>

              {/* 3 & 4. Dropdowns Grid: Aspect Ratio & Visual Style */}
              <div className="dropdowns-two-col-grid">
                <DropdownSelect
                  badge="03"
                  label={t('stepAspectRatioLabel')}
                  value={promptAspect}
                  onChange={setPromptAspect}
                  options={aspectOptionsList}
                />

                <DropdownSelect
                  badge="04"
                  label={t('stepVisualStyleLabel')}
                  value={promptStyle}
                  onChange={setPromptStyle}
                  options={styleOptionsList}
                />
              </div>

              {/* 5 & 6. Dropdowns Grid: Camera Dynamics & Atmospheric Lighting */}
              <div className="dropdowns-two-col-grid">
                <DropdownSelect
                  badge="05"
                  label={t('stepCameraDynamicsLabel')}
                  value={cameraMotion}
                  onChange={setCameraMotion}
                  options={cameraOptionsList}
                />

                <DropdownSelect
                  badge="06"
                  label={t('stepAtmosphericLightingLabel')}
                  value={lightingMood}
                  onChange={setLightingMood}
                  options={lightingOptionsList}
                />
              </div>
            </div>

            {/* Main Generate Button Action Area */}
            <div className="generate-action-bar">
              <button
                type="button"
                disabled={isGenerating}
                onClick={handleGenerate}
                className="generate-btn"
                title="Generate AI Video (Ctrl + Enter)"
              >
                <div className="gen-btn-left">
                  <Icons.Sparkles />
                  <span>{t('generate4kVideo')}</span>
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
        videoType="prompt"
        promptSummary={getAugmentedPrompt()}
        onCancel={() => {
          setIsGenerating(false);
          showToast(language === 'ta' ? 'உருவாக்கம் ரத்து செய்யப்பட்டது' : 'Generation cancelled', 'Trash2');
        }}
      />
    </div>
  );
}
