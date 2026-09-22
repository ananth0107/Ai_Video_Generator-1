import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icons } from '../components/Icons';
import GeneratingModal from '../components/GeneratingModal';
import VideoPlayer from '../components/VideoPlayer';
import CharacterSelectDropdown from '../components/CharacterSelectDropdown';
import SaveVideoModal from '../components/History/SaveVideoModal';
import { saveHistoryItem, deleteHistoryItem, captureCanvasThumbnail, optimizeImageDataUrl } from '../utils/historyStorage';
import { useToast } from '../context/ToastContext';
import { useCharacters } from '../context/CharacterContext';
import { useLanguage } from '../context/LanguageContext';
import { generateImageToVideo } from '../services/videoService';
import { consumeTokens } from '../utils/tokenUsageStorage';

export default function ImageToVideoPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const { selectedCharacters, clearSelectedCharacters } = useCharacters();
  const { t, language } = useLanguage();

  const [uploadedImage, setUploadedImage] = useState(
    location.state?.presetImage || null
  );
  const [imageFilename, setImageFilename] = useState(
    location.state?.presetImage ? 'character_portrait.png' : ''
  );
  const [motionPrompt, setMotionPrompt] = useState(
    location.state?.presetPrompt || ''
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
      setImageFilename('edited_source_image.png');
    }
    if (location.state?.presetPrompt) {
      setMotionPrompt(location.state.presetPrompt);
    }
    if (location.state?.presetAspect) {
      setImageAspect(location.state.presetAspect);
    }
    if (location.state?.presetMotion) {
      setImageMotion(location.state.presetMotion);
    }
    if (location.state?.cameraDirection) {
      setCameraDirection(location.state.cameraDirection);
    }
    if (location.state?.lightingAtmosphere) {
      setLightingAtmosphere(location.state.lightingAtmosphere);
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

  // Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressStatus, setProgressStatus] = useState('');
  const [generationError, setGenerationError] = useState(null);

  // Video Output State
  const [generatedVideo, setGeneratedVideo] = useState({
    hasGenerated: false,
    type: 'image',
    prompt: location.state?.presetPrompt || '',
    aspectRatio: location.state?.presetAspect || '16:9',
    style: 'Motion: Smooth',
    uploadedImage: location.state?.presetImage || null,
    sceneryId: location.state?.sceneryId || 'cosmic-nebula',
    characters: [],
    aiEnhanced: true,
    videoUrl: null,
    isSaved: false
  });

  // Save to History modal state
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [pendingSaveVideo, setPendingSaveVideo] = useState(null);
  const [defaultSaveName, setDefaultSaveName] = useState('');

  const isGeneratingRef = useRef(false);
  const fileInputRef = useRef(null);
  const previewSectionRef = useRef(null);

  const handleNewChat = useCallback(() => {
    setUploadedImage(null);
    setImageFilename('');
    setMotionPrompt('');
    setImageMotion('Smooth');
    setCameraDirection('Zoom In');
    setLightingAtmosphere('Golden Hour');
    setImageAspect('16:9');
    setIsAiEnhance(true);
    setActiveSceneryId('cosmic-nebula');
    setGenerationError(null);
    clearSelectedCharacters();
    setGeneratedVideo({
      hasGenerated: false,
      type: 'image',
      prompt: '',
      aspectRatio: '16:9',
      style: 'Motion: Smooth',
      uploadedImage: null,
      sceneryId: 'cosmic-nebula',
      characters: [],
      aiEnhanced: true,
      videoUrl: null,
      isSaved: false
    });
    showToast(
      language === 'ta' ? 'புதிய உரையாடல் தொடங்கப்பட்டது' : 'New session started - inputs cleared',
      'Sparkles'
    );
  }, [clearSelectedCharacters, showToast, language]);

  function getSmartDefaultTitle(chars, motion, prompt, filename) {
    if (chars && chars.length > 0) {
      return `${chars[0].name} - ${motion}`;
    }
    if (filename && filename !== 'source_image.png' && filename !== 'character_portrait.png' && filename !== 'thamili-logo.png') {
      const cleanName = filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      return `${cleanName} (${motion})`;
    }
    if (prompt) {
      const clean = prompt.replace(/^Featuring [^:]+:\s*/i, '').trim();
      const words = clean.split(/\s+/).slice(0, 4).join(' ');
      if (words.length > 3) {
        return `${words} (${motion})`;
      }
    }
    return `THAMILI Motion - ${motion}`;
  }

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
    let final = motionPrompt.trim() || 'The subject in the image comes to life with fluid realistic action';
    if (selectedCharacters.length > 0) {
      const charNames = selectedCharacters.map((c) => c.name).join(' and ');
      if (!final.toLowerCase().includes(selectedCharacters[0].name.toLowerCase())) {
        final = `Featuring ${charNames}: ${final}`;
      }
    }
    return final;
  }, [motionPrompt, selectedCharacters]);

  const handleGenerate = useCallback(async () => {
    if (isGeneratingRef.current || isGenerating) return;

    if (!uploadedImage) {
      showToast(
        language === 'ta' ? 'முதலில் ஒரு படத்தைப் பதிவேற்றவும்' : 'Please upload an image first',
        'Image'
      );
      return;
    }

    const finalPrompt = getAugmentedPrompt();

    isGeneratingRef.current = true;
    setIsGenerating(true);
    setGenerationError(null);
    setGeneratedVideo({
      hasGenerated: false,
      type: 'image',
      prompt: finalPrompt,
      aspectRatio: imageAspect,
      style: `Motion: ${imageMotion}`,
      motion: imageMotion,
      cameraDirection,
      cameraMotion: cameraDirection,
      lightingAtmosphere,
      lightingMood: lightingAtmosphere,
      uploadedImage: uploadedImage,
      sceneryId: activeSceneryId,
      characters: selectedCharacters,
      aiEnhanced: isAiEnhance,
      videoUrl: null,
      isSaved: false
    });

    setProgressPercent(15);
    setProgressStatus(
      language === 'ta'
        ? 'உங்கள் பிராம்ட்டை தயார் செய்கிறது...'
        : 'Preparing your prompt...'
    );

    // Live progress pulse timer
    let currentPct = 15;
    const progressTimer = setInterval(() => {
      currentPct = Math.min(94, currentPct + 3);
      setProgressPercent(currentPct);
      if (currentPct >= 80) {
        setProgressStatus(
          language === 'ta'
            ? 'கிட்டத்தட்ட தயாராகிவிட்டது...'
            : 'Almost ready...'
        );
      } else if (currentPct >= 50) {
        setProgressStatus(
          language === 'ta'
            ? 'வீடியோ செயலாக்கப்படுகிறது...'
            : 'Processing video...'
        );
      } else if (currentPct >= 25) {
        setProgressStatus(
          language === 'ta'
            ? 'வீடியோ உருவாக்கப்படுகிறது...'
            : 'Generating video...'
        );
      }
    }, 1100);

    let videoResult = null;
    try {
      videoResult = await generateImageToVideo(uploadedImage, finalPrompt, {
        aspectRatio: imageAspect,
        duration: 2,
        onProgress: (pct, msg) => {
          setProgressPercent((prev) => Math.max(prev, pct));
          if (msg) setProgressStatus(msg);
        }
      });
    } catch (err) {
      clearInterval(progressTimer);
      isGeneratingRef.current = false;
      setIsGenerating(false);
      setProgressPercent(0);
      setProgressStatus('');

      setGeneratedVideo({
        hasGenerated: false,
        type: 'image',
        prompt: finalPrompt,
        aspectRatio: imageAspect,
        style: `Motion: ${imageMotion}`,
        motion: imageMotion,
        cameraDirection,
        cameraMotion: cameraDirection,
        lightingAtmosphere,
        lightingMood: lightingAtmosphere,
        uploadedImage: uploadedImage,
        sceneryId: activeSceneryId,
        characters: selectedCharacters,
        aiEnhanced: isAiEnhance,
        videoUrl: null,
        isSaved: false
      });

      console.error('[ImageToVideoPage Error]', err);
      const isQuota = err?.status === 429 || err?.isQuota || (err?.message && (err.message.includes('quota') || err.message.includes('429') || err.message.includes('RESOURCE_EXHAUSTED')));
      const errMsg = isQuota
        ? 'Video generation quota is currently unavailable. Please check your Gemini API project quota/billing.'
        : (err?.body?.detail || err?.message || 'Image-to-video generation failed. Please try again.');

      setGenerationError(errMsg);
      showToast(errMsg, 'AlertTriangle');
      return;
    } finally {
      clearInterval(progressTimer);
      isGeneratingRef.current = false;
    }

    if (!videoResult || !videoResult.videoUrl) {
      setIsGenerating(false);
      isGeneratingRef.current = false;
      const errMsg = 'No video URL received from video service';
      setGenerationError(errMsg);
      showToast(errMsg, 'AlertTriangle');
      return;
    }

    setProgressPercent(100);
    setProgressStatus(
      language === 'ta' ? 'வீடியோ தயாராக உள்ளது!' : 'Video ready'
    );

    setTimeout(async () => {
      setIsGenerating(false);

      const canvas = previewSectionRef.current?.querySelector('canvas');
      const thumb = canvas ? captureCanvasThumbnail(canvas) : uploadedImage;
      const optimizedImg = await optimizeImageDataUrl(uploadedImage);

      const smartTitle = getSmartDefaultTitle(selectedCharacters, imageMotion, finalPrompt, imageFilename);
      const videoId = `vid_gemini_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

      const newVideoRecord = {
        id: videoId,
        hasGenerated: true,
        type: 'image',
        name: smartTitle,
        prompt: finalPrompt,
        style: `Motion: ${imageMotion}`,
        motion: imageMotion,
        aspectRatio: imageAspect,
        cameraDirection,
        cameraMotion: cameraDirection,
        lightingAtmosphere,
        lightingMood: lightingAtmosphere,
        uploadedImage: optimizedImg || uploadedImage,
        thumbnail: thumb,
        sceneryId: activeSceneryId,
        characters: selectedCharacters,
        aiEnhanced: isAiEnhance,
        isSaved: true,
        videoUrl: videoResult.videoUrl,
        origName: videoResult.origName,
        source: videoResult.source || 'gemini',
        provider: videoResult.provider || 'gemini',
        createdAt: new Date().toISOString()
      };

      // Save to history immediately upon generation!
      saveHistoryItem(newVideoRecord);
      consumeTokens('gemini', 100);

      setGeneratedVideo(newVideoRecord);
      showToast(
        language === 'ta'
          ? 'AI வீடியோ வெற்றிகரமாக உருவாக்கப்பட்டு வரலாற்றில் சேமிக்கப்பட்டது!'
          : 'AI Video generated & saved to History!',
        'BookmarkCheck'
      );

      if (previewSectionRef.current) {
        previewSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      // Open SaveVideoModal so user can rename if desired
      setTimeout(() => {
        setPendingSaveVideo(newVideoRecord);
        setDefaultSaveName(smartTitle);
        setIsSaveModalOpen(true);
      }, 450);
    }, 400);
  }, [uploadedImage, getAugmentedPrompt, imageMotion, cameraDirection, lightingAtmosphere, imageAspect, activeSceneryId, selectedCharacters, isAiEnhance, imageFilename, showToast, language]);

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
    const finalThumb = pendingSaveVideo.thumbnail || captureCanvasThumbnail(canvas) || uploadedImage;
    const itemToSave = {
      ...pendingSaveVideo,
      name: customName,
      thumbnail: finalThumb,
      isSaved: true
    };
    saveHistoryItem(itemToSave);
    setGeneratedVideo((prev) => ({ ...prev, ...itemToSave, isSaved: true }));
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
      const thumb = captureCanvasThumbnail(canvas) || generatedVideo.thumbnail || uploadedImage;
      const smartTitle = generatedVideo.name || getSmartDefaultTitle(
        generatedVideo.characters?.length > 0 ? generatedVideo.characters : selectedCharacters,
        imageMotion,
        generatedVideo.prompt,
        imageFilename
      );
      const videoRecord = {
        ...generatedVideo,
        id: generatedVideo.id || `vid_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        name: smartTitle,
        cameraDirection,
        cameraMotion: cameraDirection,
        lightingAtmosphere,
        lightingMood: lightingAtmosphere,
        thumbnail: thumb,
        createdAt: generatedVideo.createdAt || new Date().toISOString()
      };
      setPendingSaveVideo(videoRecord);
      setDefaultSaveName(smartTitle);
      setIsSaveModalOpen(true);
    }
  };

  const handleSelectCharacter = (character) => {
    setMotionPrompt((prev) => {
      const tag = `@${character.name}`;
      if (!prev.trim()) {
        return `${tag} `;
      }
      if (!prev.includes(tag)) {
        return `${prev.trim()} ${tag} `;
      }
      return prev;
    });
    if (!uploadedImage && character.avatar) {
      setUploadedImage(character.avatar);
      setImageFilename(`${character.name.toLowerCase().replace(/\s+/g, '_')}_portrait.png`);
      showToast(`Set ${character.name}'s portrait as source & added @${character.name}`, 'Sparkles');
    } else {
      showToast(`Added @${character.name} to prompt`, 'Sparkles');
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
                <h1 className="main-title">{t('i2vTitle')}</h1>
                <span className="studio-pill-badge badge-purple">{t('i2vBadge')}</span>
              </div>
              <p className="main-subtitle">{t('i2vSubtitle')}</p>
            </div>
          </div>

          <div className="heading-actions-right">
            <button
              type="button"
              onClick={handleNewChat}
              className="tool-btn new-chat-btn"
              title={language === 'ta' ? 'புதிய உரையாடல் (உள்ளீடுகளை மீட்டமைக்க)' : 'New Chat (Clear current session inputs)'}
            >
              <Icons.Plus size={15} />
              <span>{t('newChat', 'New Chat')}</span>
            </button>
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
              {generationError && (
                <div
                  className="generation-error-notice"
                  style={{
                    marginBottom: '16px',
                    padding: '14px 18px',
                    background: 'rgba(239, 68, 68, 0.12)',
                    border: '1px solid rgba(239, 68, 68, 0.35)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '14px',
                    color: '#fecaca'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1 }}>
                    <Icons.AlertTriangle style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }} size={20} />
                    <div style={{ fontSize: '13.5px', lineHeight: 1.45 }}>
                      <strong style={{ color: '#f87171', display: 'block', marginBottom: '3px', fontWeight: 700 }}>
                        {language === 'ta' ? 'அறிவிப்பு' : 'Generation Notice'}
                      </strong>
                      <span style={{ wordBreak: 'break-word', color: '#fecaca', fontWeight: 500 }}>{generationError}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    <button
                      type="button"
                      onClick={handleGenerate}
                      disabled={isGenerating || !uploadedImage}
                      className="tool-btn"
                      style={{
                        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                        borderColor: '#dc2626',
                        color: '#ffffff',
                        fontWeight: 600,
                        fontSize: '12.5px',
                        padding: '6px 14px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(239, 68, 68, 0.25)'
                      }}
                    >
                      <Icons.RotateCw size={13} /> {language === 'ta' ? 'மீண்டும் முயற்சி' : 'Retry'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setGenerationError(null)}
                      style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px', display: 'inline-flex', alignItems: 'center' }}
                      title="Dismiss"
                    >
                      <Icons.X size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* 1. Source Image Upload & Preview Box */}
              <div className="form-group form-group-compact">
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
                  onDragLeave={() => setIsDragOver(false)}
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
              <div className="form-group form-group-compact">
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
                    rows={2}
                    value={motionPrompt}
                    onChange={(e) => setMotionPrompt(e.target.value)}
                    placeholder={t('motionPromptPlaceholder')}
                    className="thamili-textarea"
                  />
                </div>
              </div>

              {/* 3. Characters Dropdown & Multi-Select Tags */}
              <div className="form-group">
                <CharacterSelectDropdown
                  badge="03"
                  label={t('stepCharactersLabel')}
                  onOpenLibrary={() => navigate('/characters')}
                  onSelectCharacter={handleSelectCharacter}
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
                title="Generate Video (Ctrl + Enter)"
              >
                <div className="gen-btn-left">
                  <Icons.Sparkles />
                  <span>
                    {isGenerating
                      ? (language === 'ta' ? 'உருவாக்கப்படுகிறது...' : 'Generating...')
                      : generatedVideo?.videoUrl
                      ? (language === 'ta' ? 'புதிய வீடியோவை உருவாக்கவும்' : 'Generate New Video')
                      : t('animateImageToVideo', 'Generate')}
                  </span>
                </div>
                <div className="gen-btn-right">
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
