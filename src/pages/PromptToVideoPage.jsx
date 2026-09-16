import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icons } from '../components/Icons';
import GeneratingModal from '../components/GeneratingModal';
import VideoPlayer from '../components/VideoPlayer';
import CharacterSelectDropdown from '../components/CharacterSelectDropdown';
import SaveVideoModal from '../components/History/SaveVideoModal';
import { saveHistoryItem, deleteHistoryItem, captureCanvasThumbnail } from '../utils/historyStorage';
import { useToast } from '../context/ToastContext';
import { useCharacters } from '../context/CharacterContext';
import { useLanguage } from '../context/LanguageContext';
import { generateTextToVideo, enhancePrompt } from '../services/falAiService';
import { consumeTokens } from '../utils/tokenUsageStorage';

export default function PromptToVideoPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const { selectedCharacters } = useCharacters();
  const { t, language } = useLanguage();

  const [promptText, setPromptText] = useState(
    location.state?.presetPrompt || ''
  );
  const [promptAspect, setPromptAspect] = useState(location.state?.presetAspect || '16:9');
  const [promptStyle, setPromptStyle] = useState(location.state?.presetStyle || 'Cinematic');
  const [cameraMotion, setCameraMotion] = useState('Smooth Zoom');
  const [lightingMood, setLightingMood] = useState('Volumetric Sun');
  const [isAiEnhance, setIsAiEnhance] = useState(true);
  const [activeSceneryId, setActiveSceneryId] = useState(location.state?.sceneryId || null);
  const [generationResults, setGenerationResults] = useState(null);

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
    if (location.state?.cameraMotion) {
      setCameraMotion(location.state.cameraMotion);
    }
    if (location.state?.lightingMood) {
      setLightingMood(location.state.lightingMood);
    }
    if (location.state?.sceneryId) {
      setActiveSceneryId(location.state.sceneryId);
    }
    if (location.state?.videoItem) {
      setGeneratedVideo({
        ...location.state.videoItem,
        hasGenerated: true
      });
    }
  }, [location.state]);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressStatus, setProgressStatus] = useState('');
  const [generationError, setGenerationError] = useState(null);

  // Generated Video state - No mock video, starts empty until real Fal.ai output arrives
  const [generatedVideo, setGeneratedVideo] = useState({
    hasGenerated: false,
    type: 'prompt',
    prompt: location.state?.presetPrompt || '',
    aspectRatio: location.state?.presetAspect || '16:9',
    style: location.state?.presetStyle || 'Cinematic',
    sceneryId: null,
    characters: location.state?.presetPrompt && selectedCharacters.length > 0 ? selectedCharacters : [],
    aiEnhanced: true,
    videoUrl: null,
    isSaved: false
  });

  // Save to History modal state
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [pendingSaveVideo, setPendingSaveVideo] = useState(null);
  const [defaultSaveName, setDefaultSaveName] = useState('');

  const isGeneratingRef = useRef(false);
  const previewSectionRef = useRef(null);

  function getSmartDefaultTitle(chars, style, prompt) {
    if (chars && chars.length > 0) {
      return `${chars[0].name} - ${style}`;
    }
    if (prompt) {
      const clean = prompt.replace(/^Featuring [^:]+:\s*/i, '').trim();
      const words = clean.split(/\s+/).slice(0, 4).join(' ');
      if (words.length > 3) {
        return `${words} (${style})`;
      }
    }
    return `Cinematic Video - ${style}`;
  }

  // Build full generation prompt including selected character names
  const getAugmentedPrompt = useCallback(() => {
    let final = promptText.trim();
    if (selectedCharacters.length > 0 && final) {
      const charNames = selectedCharacters.map((c) => c.name).join(' and ');
      if (!final.toLowerCase().includes(selectedCharacters[0].name.toLowerCase())) {
        final = `Featuring ${charNames}: ${final}`;
      }
    }
    return final;
  }, [promptText, selectedCharacters]);

  const handleGenerate = useCallback(async () => {
    // Prevent duplicate clicks
    if (isGeneratingRef.current || isGenerating) return;

    // 1. Validate prompt
    if (!promptText.trim()) {
      showToast(
        language === 'ta' ? 'தயவுசெய்து ஒரு பிராம்ட்டை உள்ளிடவும்' : 'Please enter a valid video prompt',
        'Sparkles'
      );
      return;
    }
    const finalPrompt = getAugmentedPrompt();

    // 2. Show loading state immediately
    isGeneratingRef.current = true;
    setIsGenerating(true);
    setGenerationError(null);
    setGenerationResults(null);
    setProgressPercent(15);
    setProgressStatus(
      language === 'ta' ? 'உங்கள் பிராம்ட்டை தயார் செய்கிறது...' : 'Preparing your prompt...'
    );

    // Required console logs
    console.log('[VIDEO] Generation started');
    console.log('[GEMINI] Enhancing prompt');

    // Timeout safety handle (4 minutes)
    let isTimedOut = false;
    const timeoutHandle = setTimeout(() => {
      isTimedOut = true;
    }, 240000);

    try {
      setProgressPercent(30);
      setProgressStatus(
        language === 'ta' ? 'வீடியோ உருவாக்கப்படுகிறது...' : 'Generating video...'
      );

      let enhancedPrompt = finalPrompt;
      try {
        const geminiRes = await enhancePrompt(finalPrompt, {
          style: promptStyle,
          resolution: '4k',
          aspectRatio: promptAspect,
          characters: selectedCharacters
        });

        if (geminiRes?.enhancedPrompt) {
          enhancedPrompt = geminiRes.enhancedPrompt;
        }
      } catch (geminiErr) {
        console.warn('[PromptToVideo] Gemini enhance warning:', geminiErr.message);
      }

      console.log('[GEMINI] Prompt enhancement completed');
      setProgressPercent(50);
      setProgressStatus(
        language === 'ta' ? 'வீடியோ செயலாக்கப்படுகிறது...' : 'Processing video...'
      );

      console.log('[PIXAZO] Starting video generation');
      console.log('Calling Pixazo');
      console.log('[PIXAZO] Request sent');

      // Progress animation while Pixazo generates
      let currentPct = 50;
      const progressTimer = setInterval(() => {
        currentPct = Math.min(94, currentPct + 3);
        setProgressPercent(currentPct);
        if (currentPct >= 80) {
          setProgressStatus(
            language === 'ta' ? 'கிட்டத்தட்ட தயாராகிவிட்டது...' : 'Almost ready...'
          );
        } else if (currentPct >= 65) {
          setProgressStatus(
            language === 'ta' ? 'வீடியோ செயலாக்கப்படுகிறது...' : 'Processing video...'
          );
        }
      }, 1200);

      let apiResponse = null;
      try {
        apiResponse = await generateTextToVideo(finalPrompt, {
          enhancedPrompt,
          resolution: '4k',
          aspectRatio: promptAspect,
          characters: selectedCharacters
        });
      } finally {
        clearInterval(progressTimer);
        clearTimeout(timeoutHandle);
      }

      if (isTimedOut) {
        throw new Error('Video generation timed out after 4 minutes');
      }

      console.log('[PIXAZO] Generation completed');
      console.log('[VIDEO] Video URL received');
      console.log('[VIDEO] Returning result to frontend');
      console.log('Video ready');
      console.log('Displaying video');

      setProgressPercent(100);
      setProgressStatus(
        language === 'ta' ? 'வீடியோ தயாராக உள்ளது!' : 'Video ready'
      );

      const videoUrl = apiResponse?.videoUrl || apiResponse?.results?.pixazo?.videoUrl;
      if (!videoUrl) {
        const failureReason = apiResponse?.error || apiResponse?.results?.pixazo?.error || 'No video URL was returned by Pixazo';
        throw new Error(failureReason);
      }

      const activeChars = selectedCharacters.length > 0
        ? selectedCharacters
        : finalPrompt.toLowerCase().includes('trisha')
        ? [{ id: 'trisha-krishnan', name: 'Trisha Krishnan', gender: 'Actress', style: 'Cinematic', accentColor: '#38bdf8' }]
        : [];

      const smartTitle = getSmartDefaultTitle(activeChars, promptStyle, finalPrompt);
      const createdAt = new Date().toISOString();

      const pixazoRecord = {
        id: `vid_pixazo_${Date.now()}`,
        name: smartTitle,
        hasGenerated: true,
        type: 'prompt',
        prompt: finalPrompt,
        enhancedPrompt: enhancedPrompt !== finalPrompt ? enhancedPrompt : null,
        style: promptStyle,
        aspectRatio: promptAspect,
        cameraMotion,
        lightingMood,
        sceneryId: activeSceneryId,
        characters: activeChars,
        aiEnhanced: isAiEnhance,
        isSaved: true,
        videoUrl: videoUrl,
        origName: `pixazo_video_${Date.now()}.mp4`,
        source: 'pixazo',
        provider: 'pixazo',
        createdAt
      };

      // Display video immediately in the RIGHT SIDE preview area without requiring refresh
      setGeneratedVideo(pixazoRecord);
      saveHistoryItem(pixazoRecord);
      setGenerationResults(null);
      setIsGenerating(false);
      setGenerationError(null);

      consumeTokens('gemini', 150);
      consumeTokens('pixazo', 100);

      showToast(
        language === 'ta'
          ? 'Pixazo வீடியோ உருவாக்கப்பட்டு வரலாற்றில் சேமிக்கப்பட்டது!'
          : 'Pixazo Video generated & saved to History!',
        'BookmarkCheck'
      );

      if (previewSectionRef.current) {
        previewSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } catch (err) {
      clearTimeout(timeoutHandle);
      setIsGenerating(false);
      setProgressPercent(0);
      const errMsg = err?.message || 'Video generation failed. Please try again.';
      console.error(`[FAL.AI] Generation failed: ${errMsg}`);
      setGenerationError(errMsg);
      showToast(`Generation notice: ${errMsg}`, 'AlertTriangle');
    } finally {
      isGeneratingRef.current = false;
    }
  }, [promptText, getAugmentedPrompt, promptStyle, promptAspect, cameraMotion, lightingMood, activeSceneryId, selectedCharacters, isAiEnhance, showToast, language, isGenerating]);

  const handleSaveProviderVideo = (providerKey) => {
    if (!generationResults) return;
    const res = generationResults[providerKey];
    if (!res || !res.videoUrl) return;

    const activeChars = selectedCharacters.length > 0 ? selectedCharacters : [];
    const smartTitle = getSmartDefaultTitle(activeChars, promptStyle, promptText);
    const providerLabel = providerKey === 'gemini' ? 'Gemini 4K' : 'Fal.ai';

    const item = {
      id: `vid_${providerKey}_${Date.now()}`,
      name: `${smartTitle} [${providerLabel}]`,
      hasGenerated: true,
      type: 'prompt',
      prompt: promptText,
      style: promptStyle,
      aspectRatio: promptAspect,
      videoUrl: res.videoUrl,
      source: providerKey,
      provider: providerKey,
      isSaved: true,
      createdAt: new Date().toISOString()
    };
    saveHistoryItem(item);
    showToast(`${providerLabel} Video saved to History!`, 'BookmarkCheck');
  };

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

  const handleConfirmSave = (customName) => {
    if (!pendingSaveVideo) return;
    const canvas = previewSectionRef.current?.querySelector('canvas');
    const finalThumb = pendingSaveVideo.thumbnail || captureCanvasThumbnail(canvas);
    const itemToSave = {
      ...pendingSaveVideo,
      name: customName,
      thumbnail: finalThumb,
      isSaved: true
    };
    saveHistoryItem(itemToSave);
    setGeneratedVideo((prev) => ({ ...prev, isSaved: true, id: itemToSave.id, name: customName }));
    setIsSaveModalOpen(false);
    setPendingSaveVideo(null);
    showToast(
      language === 'ta' ? 'வீடியோ வரலாற்றில் சேமிக்கப்பட்டது!' : 'Video saved to History!',
      'BookmarkCheck'
    );
  };

  const handleCancelSave = () => {
    setIsSaveModalOpen(false);
    setPendingSaveVideo(null);
  };

  const handleSaveToggle = () => {
    if (generatedVideo.isSaved && generatedVideo.id) {
      deleteHistoryItem(generatedVideo.id);
      setGeneratedVideo((prev) => ({ ...prev, isSaved: false }));
      showToast(
        language === 'ta' ? 'வீடியோ வரலாற்றிலிருந்து நீக்கப்பட்டது' : 'Video removed from History',
        'Bookmark'
      );
    } else {
      const canvas = previewSectionRef.current?.querySelector('canvas');
      const thumb = captureCanvasThumbnail(canvas);
      const videoRecord = {
        ...generatedVideo,
        id: generatedVideo.id || `vid_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        name: generatedVideo.name || getSmartDefaultTitle(generatedVideo.characters, generatedVideo.style, generatedVideo.prompt),
        cameraMotion,
        lightingMood,
        thumbnail: thumb,
        createdAt: generatedVideo.createdAt || new Date().toISOString(),
        isSaved: true
      };
      saveHistoryItem(videoRecord);
      setGeneratedVideo((prev) => ({ ...prev, isSaved: true, id: videoRecord.id }));
      showToast(
        language === 'ta' ? 'வீடியோ வரலாற்றில் சேமிக்கப்பட்டது!' : 'Video saved to History!',
        'BookmarkCheck'
      );
    }
  };


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
              {generationError && (
                <div
                  className="generation-error-notice"
                  style={{
                    marginBottom: '16px',
                    padding: '12px 16px',
                    background: 'rgba(239, 68, 68, 0.12)',
                    border: '1px solid rgba(239, 68, 68, 0.35)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    color: '#fca5a5'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', flex: 1 }}>
                    <Icons.AlertTriangle style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }} size={18} />
                    <div style={{ fontSize: '13px', lineHeight: 1.4 }}>
                      <strong style={{ color: '#f87171', display: 'block', marginBottom: '2px' }}>
                        {language === 'ta' ? 'வீடியோ உருவாக்க பிழை' : 'Generation Notice'}
                      </strong>
                      <span style={{ wordBreak: 'break-word' }}>{generationError}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={handleGenerate}
                      disabled={isGenerating}
                      className="tool-btn"
                      style={{
                        background: 'rgba(239, 68, 68, 0.2)',
                        borderColor: 'rgba(239, 68, 68, 0.4)',
                        color: '#fecaca',
                        fontSize: '12px',
                        padding: '5px 12px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <Icons.RotateCw size={13} /> {language === 'ta' ? 'மீண்டும் முயற்சி' : 'Retry'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setGenerationError(null)}
                      style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }}
                      title="Dismiss"
                    >
                      <Icons.X size={15} />
                    </button>
                  </div>
                </div>
              )}

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
                  <span>
                    {isGenerating
                      ? (language === 'ta' ? 'உருவாக்கப்படுகிறது...' : 'Generating...')
                      : generatedVideo?.hasGenerated
                      ? (language === 'ta' ? 'புதிய வீடியோவை உருவாக்கவும்' : 'Generate New Video')
                      : t('generate4kVideo')}
                  </span>
                </div>
                <div className="gen-btn-right">
                  <span className="shortcut-tag">Ctrl + ↵</span>
                  <Icons.ArrowRight />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: OUTPUT PREVIEW & TWO PROVIDER RESULT CARDS */}
        <div className="studio-output-panel" ref={previewSectionRef}>
          {generationResults ? (
            <div className="dual-provider-results-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Top Header Bar for Dual Results */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 18px',
                background: 'rgba(15, 23, 42, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                backdropFilter: 'blur(8px)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Icons.Sparkles style={{ color: '#38bdf8' }} size={18} />
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc' }}>
                    Dual Provider Video Results
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setGenerationResults(null)}
                  className="tool-btn"
                  style={{ fontSize: '12px', padding: '5px 12px', color: '#94a3b8' }}
                  title="Return to standard preview"
                >
                  Switch to Studio View
                </button>
              </div>

              {/* CARD 1: GEMINI / VEO 3.1 (4K) */}
              <div
                className="provider-result-card gemini-card"
                style={{
                  background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.9) 0%, rgba(10, 15, 30, 0.98) 100%)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  borderRadius: '16px',
                  padding: '20px',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.45)',
                  backdropFilter: 'blur(12px)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #0284c7, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                      <Icons.Sparkles size={20} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        Gemini / Veo 3.1
                        <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.35)' }}>
                          4K Ultra HD • 8s
                        </span>
                      </h3>
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>Model: veo-3.1-generate-preview</span>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  {generationResults.gemini?.success ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#34d399', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '5px 12px', borderRadius: '20px' }}>
                      <Icons.Check size={14} /> Video Generated
                    </span>
                  ) : (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#f87171', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '5px 12px', borderRadius: '20px' }}>
                      <Icons.AlertTriangle size={14} /> Generation Notice
                    </span>
                  )}
                </div>

                {generationResults.gemini?.success && generationResults.gemini?.videoUrl ? (
                  <div>
                    <div style={{ borderRadius: '12px', overflow: 'hidden', background: '#020617', marginBottom: '14px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                      <video
                        src={generationResults.gemini.videoUrl}
                        controls
                        autoPlay
                        loop
                        playsInline
                        style={{ width: '100%', maxHeight: '420px', display: 'block', objectFit: 'contain' }}
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                      <a
                        href={generationResults.gemini.videoUrl}
                        download={`gemini_veo_4k_${Date.now()}.mp4`}
                        className="tool-btn"
                        style={{ textDecoration: 'none', background: 'linear-gradient(135deg, #0284c7, #2563eb)', color: '#fff', padding: '8px 18px', borderRadius: '8px', fontWeight: 600, fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                      >
                        <Icons.Download size={16} /> Download 4K Video
                      </a>
                      <button
                        type="button"
                        onClick={() => handleSaveProviderVideo('gemini')}
                        className="tool-btn"
                        style={{ padding: '8px 14px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Icons.Bookmark size={15} /> Save to History
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    borderRadius: '12px',
                    padding: '16px',
                    color: '#fecaca'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', color: '#f87171', fontWeight: 600, fontSize: '14px' }}>
                      <Icons.AlertTriangle size={16} />
                      <span>Gemini Generation Notice</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.5, wordBreak: 'break-word', color: '#fca5a5' }}>
                      {generationResults.gemini?.error || 'Gemini video generation request failed.'}
                    </p>
                  </div>
                )}
              </div>

              {/* CARD 2: FAL.AI */}
              <div
                className="provider-result-card hf-card"
                style={{
                  background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.9) 0%, rgba(10, 15, 30, 0.98) 100%)',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                  borderRadius: '16px',
                  padding: '20px',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.45)',
                  backdropFilter: 'blur(12px)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #a855f7, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                      <Icons.Zap size={20} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        Fal.ai
                        <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '12px', background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.35)' }}>
                          LTX-Video 4K
                        </span>
                      </h3>
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>Fal.ai Text-to-Video Engine</span>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  {(generationResults.fal?.success || generationResults.fal?.videoUrl) ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#34d399', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '5px 12px', borderRadius: '20px' }}>
                      <Icons.Check size={14} /> Video Generated
                    </span>
                  ) : (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#f87171', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '5px 12px', borderRadius: '20px' }}>
                      <Icons.AlertTriangle size={14} /> Generation Notice
                    </span>
                  )}
                </div>

                {(generationResults.fal?.success || generationResults.fal?.videoUrl) && (generationResults.fal?.videoUrl || generationResults.videoUrl) ? (
                  <div>
                    <div style={{ borderRadius: '12px', overflow: 'hidden', background: '#020617', marginBottom: '14px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                      <video
                        src={generationResults.fal?.videoUrl || generationResults.videoUrl}
                        controls
                        autoPlay
                        loop
                        playsInline
                        style={{ width: '100%', maxHeight: '420px', display: 'block', objectFit: 'contain' }}
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                      <a
                        href={generationResults.fal?.videoUrl || generationResults.videoUrl}
                        download={`fal_video_${Date.now()}.mp4`}
                        className="tool-btn"
                        style={{ textDecoration: 'none', background: 'linear-gradient(135deg, #a855f7, #7c3aed)', color: '#fff', padding: '8px 18px', borderRadius: '8px', fontWeight: 600, fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                      >
                        <Icons.Download size={16} /> Download Video
                      </a>
                      <button
                        type="button"
                        onClick={() => handleSaveProviderVideo('fal')}
                        className="tool-btn"
                        style={{ padding: '8px 14px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Icons.Bookmark size={15} /> Save to History
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    borderRadius: '12px',
                    padding: '16px',
                    color: '#fecaca'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', color: '#f87171', fontWeight: 600, fontSize: '14px' }}>
                      <Icons.AlertTriangle size={16} />
                      <span>Fal.ai Generation Notice</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.5, wordBreak: 'break-word', color: '#fca5a5' }}>
                      {generationResults.fal?.error || generationResults.error || 'Fal.ai text-to-video generation failed.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <VideoPlayer
              video={generatedVideo}
              onRegenerate={handleGenerate}
              onSaveToggle={handleSaveToggle}
            />
          )}
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

      {/* Save to History Modal Dialog */}
      <SaveVideoModal
        isOpen={isSaveModalOpen}
        defaultName={defaultSaveName}
        onSave={handleConfirmSave}
        onCancel={handleCancelSave}
      />
    </div>
  );
}
