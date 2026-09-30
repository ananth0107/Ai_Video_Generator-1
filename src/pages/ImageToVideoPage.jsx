import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icons } from '../components/Icons';
import DotMatrixWaveCanvas from '../components/DotMatrixWaveCanvas';
import GeneratingModal from '../components/GeneratingModal';
import VideoPlayer from '../components/VideoPlayer';
import SaveVideoModal from '../components/History/SaveVideoModal';
import { saveHistoryItem, deleteHistoryItem, captureCanvasThumbnail, optimizeImageDataUrl } from '../utils/historyStorage';
import { useToast } from '../context/ToastContext';
import { useCharacters } from '../context/CharacterContext';
import { useLanguage } from '../context/LanguageContext';
import { generateImageToVideo } from '../services/videoService';
import { consumeTokens } from '../utils/tokenUsageStorage';

const CAMERA_PRESETS = [
  { id: 'Zoom In', label: 'Zoom In', icon: '🔍', prompt: 'smooth continuous zoom in camera motion focusing on details' },
  { id: 'Zoom Out', label: 'Zoom Out', icon: '🔎', prompt: 'pull back wide camera zoom out revealing surrounding environment' },
  { id: 'Pan Left', label: 'Pan Left', icon: '⬅️', prompt: 'smooth cinematic panning camera movement towards the left' },
  { id: 'Pan Right', label: 'Pan Right', icon: '➡️', prompt: 'slow dramatic camera panning movement towards the right' },
  { id: 'Orbit 360', label: 'Orbit 360', icon: '🔄', prompt: '360 degree rotational orbital dynamic camera sweep around subject' },
  { id: 'Tilt Up', label: 'Tilt Up', icon: '⬆️', prompt: 'cinematic vertical camera tilt upward revealing sky and upper profile' },
  { id: 'Tilt Down', label: 'Tilt Down', icon: '⬇️', prompt: 'vertical camera tilt downwards from above to ground level' },
  { id: 'Dynamic Motion', label: 'Dynamic Motion', icon: '⚡', prompt: 'energetic handheld dynamic camera tracking with natural fluid motion' },
  { id: 'Cinematic Push', label: 'Cinematic Push', icon: '🎬', prompt: 'heavy slow cinematic push-in shot with subtle depth of field blur' },
  { id: 'Subtle Float', label: 'Subtle Float', icon: '🕊️', prompt: 'gentle ethereal hovering floating camera with micro ambient movement' }
];

export default function ImageToVideoPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const { allCharacters, selectedCharacters, toggleSelectCharacter, removeSelectedCharacter, clearSelectedCharacters } = useCharacters();
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
  const [isAiEnhance, setIsAiEnhance] = useState(true);
  const [activeSceneryId, setActiveSceneryId] = useState(location.state?.sceneryId || 'cosmic-nebula');

  // Popover State (+ Symbol Menu)
  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState(false);
  const [plusActiveTab, setPlusActiveTab] = useState('camera'); // 'camera' | 'characters' | 'image'
  const [charSearch, setCharSearch] = useState('');
  const plusMenuRef = useRef(null);

  // Close plus popover on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (plusMenuRef.current && !plusMenuRef.current.contains(e.target)) {
        setIsPlusMenuOpen(false);
      }
    };
    if (isPlusMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isPlusMenuOpen]);

  // Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressStatus, setProgressStatus] = useState('');
  const [generationError, setGenerationError] = useState(null);
  const [hasGenerated, setHasGenerated] = useState(
    Boolean(location.state?.videoItem?.hasGenerated || location.state?.videoItem?.videoUrl)
  );

  // Video Output State
  const [generatedVideo, setGeneratedVideo] = useState({
    hasGenerated: Boolean(location.state?.videoItem?.hasGenerated || location.state?.videoItem?.videoUrl),
    type: 'image',
    prompt: location.state?.presetPrompt || '',
    aspectRatio: location.state?.presetAspect || '16:9',
    style: 'Motion: Smooth',
    uploadedImage: location.state?.presetImage || null,
    sceneryId: location.state?.sceneryId || 'cosmic-nebula',
    characters: [],
    aiEnhanced: true,
    videoUrl: location.state?.videoItem?.videoUrl || null,
    isSaved: false
  });

  // Save to History modal state
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [pendingSaveVideo, setPendingSaveVideo] = useState(null);
  const [defaultSaveName, setDefaultSaveName] = useState('');

  // Page blink refresh state on New Chat
  const [isBlinking, setIsBlinking] = useState(false);

  const isGeneratingRef = useRef(false);
  const currentRequestIdRef = useRef(0);
  const fileInputRef = useRef(null);
  const previewSectionRef = useRef(null);

  const handleNewChat = useCallback((options = { showNotification: true }) => {
    currentRequestIdRef.current++;
    isGeneratingRef.current = false;
    setIsBlinking(true);
    setTimeout(() => setIsBlinking(false), 450);

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
    setIsGenerating(false);
    setProgressPercent(0);
    setProgressStatus('');
    setHasGenerated(false);
    clearSelectedCharacters();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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

    // Clean browser history state so re-renders or back/forward do not reapply old history item
    try {
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch {
      // ignore
    }

    if (options?.showNotification !== false) {
      showToast(
        language === 'ta' ? 'புதிய உரையாடல் தொடங்கப்பட்டது' : 'New session started - inputs cleared',
        'Check'
      );
    }
  }, [clearSelectedCharacters, showToast, language]);

  useEffect(() => {
    if (location.state?.presetImage || location.state?.presetPrompt || location.state?.videoItem) {
      if (location.state.presetImage) {
        setUploadedImage(location.state.presetImage);
        setImageFilename('edited_source_image.png');
      }
      if (location.state.presetPrompt) {
        setMotionPrompt(location.state.presetPrompt);
      }
      if (location.state.presetAspect) {
        setImageAspect(location.state.presetAspect);
      }
      if (location.state.presetMotion) {
        setImageMotion(location.state.presetMotion);
      }
      if (location.state.cameraDirection) {
        setCameraDirection(location.state.cameraDirection);
      }
      if (location.state.lightingAtmosphere) {
        setLightingAtmosphere(location.state.lightingAtmosphere);
      }
      if (location.state.sceneryId) {
        setActiveSceneryId(location.state.sceneryId);
      }
      if (location.state.videoItem) {
        setGeneratedVideo({
          ...location.state.videoItem,
          hasGenerated: true
        });
        setHasGenerated(true);
      }
    } else if (location.state?.newChat) {
      handleNewChat({ showNotification: true });
    }
  }, [location.state, handleNewChat]);

  // Trigger blink on route state navigation
  useEffect(() => {
    if (location.state?.triggerBlink) {
      setIsBlinking(true);
      const timer = setTimeout(() => setIsBlinking(false), 450);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  // Listen for global new-chat trigger from menu dropdown
  useEffect(() => {
    const onNewChatEvent = (e) => {
      if (e?.detail?.target && e.detail.target !== 'image-to-video' && e.detail.target !== 'image') {
        return;
      }
      handleNewChat({ showNotification: true });
    };
    window.addEventListener('new-chat', onNewChatEvent);
    window.addEventListener('new-chat-image', onNewChatEvent);
    return () => {
      window.removeEventListener('new-chat', onNewChatEvent);
      window.removeEventListener('new-chat-image', onNewChatEvent);
    };
  }, [handleNewChat]);

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
          ? 'சரியான படக் கோப்பைத் தேர்ந்தெடுக்கவும் (PNG, JPG, WebP)'
          : 'Please select a valid image file (PNG, JPG, WebP)',
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

  const selectedCharacterIds = selectedCharacters.map((c) => c.id);

  const filteredCharacters = allCharacters.filter(
    (c) =>
      c.name.toLowerCase().includes(charSearch.toLowerCase()) ||
      (c.role && c.role.toLowerCase().includes(charSearch.toLowerCase()))
  );

  const handleToggleCharacter = (char) => {
    toggleSelectCharacter(char.id);
    const isNowSelected = !selectedCharacterIds.includes(char.id);
    showToast(
      isNowSelected
        ? language === 'ta' ? `${char.name} தேர்ந்தெடுக்கப்பட்டது!` : `Selected @${char.name}`
        : language === 'ta' ? `${char.name} நீக்கப்பட்டது` : `Removed @${char.name}`,
      isNowSelected ? 'Check' : 'Trash2'
    );
  };

  const handleRemoveCharacter = (charId, charName) => {
    removeSelectedCharacter(charId);
    showToast(
      language === 'ta' ? `${charName} நீக்கப்பட்டது` : `Removed @${charName}`,
      'Trash2'
    );
  };

  const handleSelectCameraPreset = (preset) => {
    setCameraDirection(preset.id);
    setImageMotion(preset.id);
    showToast(`Camera Motion set to ${preset.label}`, 'Check');
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
      if (fileInputRef.current) fileInputRef.current.click();
      showToast(
        language === 'ta' ? 'முதலில் ஒரு படத்தைப் பதிவேற்றவும்' : 'Please upload an image first',
        'Image'
      );
      return;
    }

    const finalPrompt = getAugmentedPrompt();
    const requestId = ++currentRequestIdRef.current;
    const MIN_ANIMATION_MS = 10000;
    const genStartTime = Date.now();

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

    setProgressPercent(5);
    setProgressStatus(
      language === 'ta'
        ? 'உங்கள் பட பிராம்ட்டை தயார் செய்கிறது...'
        : 'Preparing image animation prompt...'
    );

    const getStageStatus = (pct, lang) => {
      if (pct < 20) {
        return lang === 'ta'
          ? 'காட்சி அமைப்புகள் & மூல படம் பகுப்பாய்வு...'
          : 'Analyzing source keyframes & motion vectors...';
      } else if (pct < 40) {
        return lang === 'ta'
          ? 'முப்பரிமாண ஆழம் & இயக்க பாதைகள் ஒருங்கிணைப்பு...'
          : 'Synthesizing neural 3D depth & camera paths...';
      } else if (pct < 65) {
        return lang === 'ta'
          ? 'ஒளி அமைப்பு & சினிமா கேமரா செயலாக்கப்படுகிறது...'
          : 'Rendering cinematic lighting & camera dynamics...';
      } else if (pct < 85) {
        return lang === 'ta'
          ? '4K தரத்தில் வீடியோ பிரேம்கள் மெருகூட்டப்படுகிறது...'
          : 'Upscaling diffusion frames to 4K ultra-smooth...';
      } else {
        return lang === 'ta'
          ? 'இறுதி வீடியோ தொகுப்பு தயாராகிறது...'
          : 'Finalizing temporal coherence & color grading...';
      }
    };

    // Live progress timer running smoothly over 10+ seconds
    const progressTimer = setInterval(() => {
      if (requestId !== currentRequestIdRef.current) {
        clearInterval(progressTimer);
        return;
      }
      const elapsed = Date.now() - genStartTime;
      if (elapsed < MIN_ANIMATION_MS) {
        const pct = Math.min(96, Math.max(5, Math.floor((elapsed / MIN_ANIMATION_MS) * 96)));
        setProgressPercent(pct);
        setProgressStatus(getStageStatus(pct, language));
      } else {
        setProgressPercent(98);
        setProgressStatus(
          language === 'ta'
            ? 'வீடியோ இறுதி செய்யப்படுகிறது...'
            : 'Polishing final video stream...'
        );
      }
    }, 80);

    let videoResult = null;
    try {
      videoResult = await generateImageToVideo(uploadedImage, finalPrompt, {
        aspectRatio: imageAspect,
        duration: 10,
        onProgress: (pct, msg) => {
          if (msg && pct > 85) setProgressStatus(msg);
        }
      });
    } catch (err) {
      clearInterval(progressTimer);
      if (requestId !== currentRequestIdRef.current) return;
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
    }

    if (requestId !== currentRequestIdRef.current) {
      clearInterval(progressTimer);
      return;
    }

    if (!videoResult || !videoResult.videoUrl) {
      clearInterval(progressTimer);
      setIsGenerating(false);
      isGeneratingRef.current = false;
      const errMsg = 'No video URL received from video service';
      setGenerationError(errMsg);
      showToast(errMsg, 'AlertTriangle');
      return;
    }

    // Ensure the animation lasts AT LEAST 10 seconds total
    const elapsed = Date.now() - genStartTime;
    const remainingTime = Math.max(0, MIN_ANIMATION_MS - elapsed);
    if (remainingTime > 0) {
      await new Promise((resolve) => setTimeout(resolve, remainingTime));
    }

    clearInterval(progressTimer);

    if (requestId !== currentRequestIdRef.current) return;

    setProgressPercent(100);
    setProgressStatus(
      language === 'ta' ? 'வீடியோ முழுமையாக தயாராகிவிட்டது!' : 'Video ready'
    );

    // Give 600ms to enjoy the complete progress visual
    await new Promise((resolve) => setTimeout(resolve, 600));

    if (requestId !== currentRequestIdRef.current) return;

    setIsGenerating(false);
    isGeneratingRef.current = false;

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

    setHasGenerated(true);
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

  const isStudioState = isGenerating || (hasGenerated && !!generatedVideo?.videoUrl);

  // Renders the clean Composer Box with +, Camera Presets, Characters Popover and Generate
  const renderComposerBox = () => (
    <div className="p2v-composer-section i2v-composer-section">
      <div className="form-label-row">
        <label className="form-step-label">
          <span className="form-step-badge" style={{ background: '#f3e8ff', color: '#7e22ce', borderColor: '#e9d5ff' }}>
            <Icons.Video size={13} />
          </span>
          <span>{language === 'ta' ? 'பட அனிமேஷன் & கேமரா இயக்கம்' : 'Image Animation & Motion Prompt'}</span>
        </label>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={() => {
              const next = !isAiEnhance;
              setIsAiEnhance(next);
              showToast(
                next
                  ? language === 'ta'
                    ? 'AI மேம்பாடு இயக்கப்பட்டது'
                    : 'AI Enhance ON: Depth estimation & lighting bloom boosted!'
                  : language === 'ta'
                  ? 'AI மேம்பாடு அணைக்கப்பட்டது'
                  : 'AI Enhance turned OFF',
                'Check'
              );
            }}
            className={`ai-enhance-toggle-btn ${isAiEnhance ? 'active' : ''}`}
            title="Toggle AI Enhance"
            aria-pressed={isAiEnhance}
          >
            <div className="enhance-btn-content">
              <span>{t('aiEnhance', 'AI Enhance')}</span>
            </div>
            <div className={`enhance-switch-track ${isAiEnhance ? 'active' : ''}`}>
              <div className="enhance-switch-thumb"></div>
            </div>
          </button>

          <span className="char-counter">{motionPrompt.length}/500</span>
        </div>
      </div>

      {/* Uploaded Image Preview Card */}
      {uploadedImage && (
        <div className="i2v-composer-image-preview-card">
          <div className="i2v-preview-card-left">
            <div className="i2v-mini-thumb-wrap">
              <img src={uploadedImage} alt="Source" className="i2v-mini-thumb" />
            </div>
            <div className="i2v-preview-meta">
              <span className="i2v-preview-filename">{imageFilename || 'source_image.png'}</span>
              <span className="i2v-preview-ready">
                <Icons.Check size={12} /> {t('imageReadyStatus', 'Image ready for animation')}
              </span>
            </div>
          </div>
          <div className="i2v-preview-card-actions">
            <button
              type="button"
              onClick={() => {
                if (fileInputRef.current) fileInputRef.current.click();
              }}
              className="ctrl-btn-replace"
              title="Change Image"
            >
              {t('change', 'Change')}
            </button>
            <button
              type="button"
              onClick={() => {
                setUploadedImage(null);
                setImageFilename('');
                showToast(language === 'ta' ? 'படம் நீக்கப்பட்டது' : 'Image removed', 'Trash2');
              }}
              className="ctrl-btn-remove"
              title="Remove Image"
            >
              <Icons.Trash2 size={13} />
            </button>
          </div>
        </div>
      )}

      {/* Large Rounded Composer Box */}
      <div className="prompt-composer-box p2v-prompt-box i2v-prompt-box">
        <textarea
          id="motion-input"
          rows={2}
          value={motionPrompt}
          onChange={(e) => setMotionPrompt(e.target.value)}
          placeholder={
            language === 'ta'
              ? 'படத்தின் இயக்கம், கேமரா கோணம் மற்றும் அனிமேஷனை விரிவாக விவரிக்கவும்...'
              : 'Describe the video you want to generate in detail...'
          }
          className="prompt-composer-textarea p2v-composer-textarea"
        />

        {/* Hidden File Input for Image Upload */}
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

        {/* Floating Glass Dock Toolbar */}
        <div className="glass-dock-toolbar">
          <div className="glass-dock-left">
            <div className="composer-plus-wrapper" ref={plusMenuRef}>
              <button
                type="button"
                className={`glass-dock-btn ${isPlusMenuOpen || uploadedImage || selectedCharacters.length > 0 ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPlusMenuOpen((prev) => !prev);
                }}
                title="Camera Prompt, Characters & Image"
                aria-label="Add Camera Prompt, Characters or Image"
                aria-expanded={isPlusMenuOpen}
              >
                <div className="glass-dock-btn-icon">
                  <Icons.Plus size={14} />
                </div>
                <span>{uploadedImage ? (language === 'ta' ? 'அம்சங்கள்' : 'Assets') : (language === 'ta' ? 'படம் சேர்க்க' : 'Add Image')}</span>
              </button>

              {/* + Dropdown Popover */}
              {isPlusMenuOpen && (
                <div className="i2v-plus-popover" onClick={(e) => e.stopPropagation()}>
                  {/* Tabs: Camera & Motion, Characters, Source Image */}
                  <div className="i2v-popover-tabs">
                    <button
                      type="button"
                      className={`i2v-popover-tab-btn ${plusActiveTab === 'camera' ? 'active' : ''}`}
                      onClick={() => setPlusActiveTab('camera')}
                    >
                      <Icons.Video size={13} />
                      <span>{language === 'ta' ? 'கேமரா' : 'Camera'}</span>
                    </button>
                    <button
                      type="button"
                      className={`i2v-popover-tab-btn ${plusActiveTab === 'characters' ? 'active' : ''}`}
                      onClick={() => setPlusActiveTab('characters')}
                    >
                      <Icons.Users size={13} />
                      <span>{language === 'ta' ? 'கதாபாத்திரம்' : 'Characters'}</span>
                      {selectedCharacters.length > 0 && (
                        <span className="i2v-tab-counter">{selectedCharacters.length}</span>
                      )}
                    </button>
                    <button
                      type="button"
                      className={`i2v-popover-tab-btn ${plusActiveTab === 'image' ? 'active' : ''}`}
                      onClick={() => setPlusActiveTab('image')}
                    >
                      <Icons.Image size={13} />
                      <span>{language === 'ta' ? 'படம்' : 'Image'}</span>
                      {uploadedImage && <span className="i2v-tab-dot" />}
                    </button>
                  </div>

                  {/* TAB 1: CAMERA & MOTION PRESETS */}
                  {plusActiveTab === 'camera' && (
                    <div className="i2v-popover-section-body">
                      <div className="i2v-popover-header-row">
                        <span className="i2v-popover-title">
                          {language === 'ta' ? 'கேமரா இயக்கம் & கோணம்' : 'Camera Motion & Direction'}
                        </span>
                        <span className="i2v-popover-badge">{cameraDirection}</span>
                      </div>

                      <div className="camera-presets-grid">
                        {CAMERA_PRESETS.map((preset) => {
                          const isActive = cameraDirection === preset.id;
                          return (
                            <button
                              key={preset.id}
                              type="button"
                              className={`camera-preset-chip ${isActive ? 'active' : ''}`}
                              onClick={() => handleSelectCameraPreset(preset)}
                            >
                              <span>{preset.icon}</span>
                              <span>{preset.label}</span>
                            </button>
                          );
                        })}
                      </div>

                      <div className="popover-divider-line" style={{ margin: '8px 0 6px 0' }} />

                      {/* Lighting Atmosphere Selector */}
                      <div className="i2v-popover-row-inline">
                        <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#64748b' }}>
                          {language === 'ta' ? 'லைட்டிங் சூழல்:' : 'Atmosphere:'}
                        </span>
                        <select
                          value={lightingAtmosphere}
                          onChange={(e) => {
                            setLightingAtmosphere(e.target.value);
                            showToast(`Atmosphere: ${e.target.value}`, 'Check');
                          }}
                          className="i2v-popover-select"
                        >
                          <option value="Golden Hour">🌅 Golden Hour</option>
                          <option value="Volumetric Sunbeams">☀️ Sunbeams</option>
                          <option value="Cyberpunk Neon">🟣 Cyber Neon</option>
                          <option value="Moody Low-Key">🌑 Moody Low-Key</option>
                          <option value="Studio Softbox">💡 Studio Softbox</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: CHARACTERS */}
                  {plusActiveTab === 'characters' && (
                    <div className="i2v-popover-section-body">
                      {/* Top Action: + New Character */}
                      <div className="char-popover-top-action">
                        <button
                          type="button"
                          className="popover-new-char-btn"
                          onClick={() => {
                            setIsPlusMenuOpen(false);
                            navigate('/characters');
                          }}
                        >
                          <div className="new-char-icon-circle">
                            <Icons.Plus size={14} />
                          </div>
                          <span className="new-char-label-text">+ New Character</span>
                        </button>
                      </div>

                      <div className="char-popover-search">
                        <span className="search-icon"><Icons.Search size={14} /></span>
                        <input
                          type="text"
                          placeholder={t('searchCharactersPlaceholder', 'Search characters...')}
                          value={charSearch}
                          onChange={(e) => setCharSearch(e.target.value)}
                          className="char-popover-input"
                          autoFocus
                        />
                        {charSearch && (
                          <button type="button" onClick={() => setCharSearch('')} className="search-clear-btn">
                            <Icons.X size={12} />
                          </button>
                        )}
                      </div>

                      <div className="char-popover-list-body" style={{ maxHeight: '180px' }}>
                        {filteredCharacters.map((char) => {
                          const isSelected = selectedCharacters.some((c) => c.id === char.id);
                          return (
                            <div
                              key={char.id}
                              className={`char-option-item flow-char-row ${isSelected ? 'selected' : ''}`}
                              onClick={() => handleToggleCharacter(char)}
                            >
                              <div className="char-option-left">
                                <div className="char-mini-avatar-wrap">
                                  <img src={char.avatar} alt={char.name} className="char-mini-avatar" />
                                </div>
                                <div className="char-option-details">
                                  <span className="char-option-name">{char.name}</span>
                                  <span className="char-option-role">{char.role || 'Character'}</span>
                                </div>
                              </div>
                              <div className={`char-checkbox-circle ${isSelected ? 'checked' : ''}`}>
                                {isSelected && <Icons.Check size={12} />}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* TAB 3: SOURCE IMAGE UPLOAD */}
                  {plusActiveTab === 'image' && (
                    <div className="i2v-popover-section-body">
                      <div
                        onClick={() => {
                          if (fileInputRef.current) fileInputRef.current.click();
                        }}
                        className="i2v-popover-dropzone"
                      >
                        <Icons.UploadCloud size={24} style={{ color: '#a855f7' }} />
                        <div style={{ textAlign: 'center' }}>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block' }}>
                            {uploadedImage ? (language === 'ta' ? 'புதிய படத்தை மாற்றுக' : 'Change Image') : (language === 'ta' ? 'படத்தை பதிவேற்றுக' : 'Upload Source Image')}
                          </span>
                          <span style={{ fontSize: '10.5px', color: '#94a3b8' }}>PNG, JPG, WebP up to 50MB</span>
                        </div>
                      </div>

                      {uploadedImage && (
                        <div className="i2v-popover-current-img-row">
                          <img src={uploadedImage} alt="Current" className="i2v-popover-current-thumb" />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <span className="i2v-preview-filename">{imageFilename || 'source_image.png'}</span>
                            <span style={{ fontSize: '10.5px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <Icons.Check size={11} /> Ready
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setUploadedImage(null);
                              setImageFilename('');
                            }}
                            className="ctrl-btn-remove"
                          >
                            <Icons.Trash2 size={13} />
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Popover Footer */}
                  <div className="char-popover-footer" style={{ borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                    <span className="selected-summary-text" style={{ fontSize: '11px', color: '#64748b' }}>
                      {cameraDirection} • {selectedCharacters.length} {t('selected', 'selected')}
                    </span>
                    <button
                      type="button"
                      className="popover-done-btn"
                      onClick={() => setIsPlusMenuOpen(false)}
                    >
                      {t('done', 'Done')}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Selected Chips Row next to + Button */}
            <div className="glass-dock-chips-group">
              {/* Image Chip */}
              {uploadedImage && (
                <div
                  className="glass-dock-chip i2v-img-chip"
                  title="Source Image"
                  onClick={() => {
                    if (fileInputRef.current) fileInputRef.current.click();
                  }}
                  style={{ cursor: 'pointer', background: 'rgba(147, 51, 234, 0.16)', borderColor: 'rgba(168, 85, 247, 0.4)' }}
                >
                  <img src={uploadedImage} alt="Image" className="glass-dock-chip-avatar" />
                  <span className="glass-dock-chip-name" style={{ maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {imageFilename || 'Image'}
                  </span>
                  <button
                    type="button"
                    className="glass-dock-chip-remove"
                    onClick={(e) => {
                      e.stopPropagation();
                      setUploadedImage(null);
                      setImageFilename('');
                    }}
                    title="Remove Image"
                  >
                    <Icons.X size={11} />
                  </button>
                </div>
              )}

              {/* Camera Motion Chip */}
              {cameraDirection && (
                <div
                  className="glass-dock-chip i2v-camera-chip"
                  onClick={() => {
                    setIsPlusMenuOpen(true);
                    setPlusActiveTab('camera');
                  }}
                  style={{ cursor: 'pointer', background: 'rgba(16, 185, 129, 0.16)', borderColor: 'rgba(52, 211, 153, 0.4)' }}
                >
                  <span style={{ fontSize: '12px' }}>🎥</span>
                  <span className="glass-dock-chip-name">{cameraDirection}</span>
                  <button
                    type="button"
                    className="glass-dock-chip-remove"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCameraDirection('Zoom In');
                    }}
                    title="Reset Camera"
                  >
                    <Icons.X size={11} />
                  </button>
                </div>
              )}

              {/* Character Chips */}
              {selectedCharacters.map((character) => (
                <div key={character.id} className="glass-dock-chip">
                  <img src={character.avatar} alt={character.name} className="glass-dock-chip-avatar" />
                  <span className="glass-dock-chip-name">@{character.name}</span>
                  <button
                    type="button"
                    className="glass-dock-chip-remove"
                    onClick={() => handleRemoveCharacter(character.id, character.name)}
                    title={`Remove @${character.name}`}
                  >
                    <Icons.X size={11} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Right: Character Count + Generate Button */}
          <div className="glass-dock-right">
            <span className="glass-dock-counter">{motionPrompt.length}/500</span>

            <button
              type="button"
              disabled={isGenerating}
              onClick={() => {
                if (!uploadedImage) {
                  if (fileInputRef.current) fileInputRef.current.click();
                  showToast(
                    language === 'ta' ? 'முதலில் ஒரு படத்தை பதிவேற்றவும்' : 'Please upload or select a source image first',
                    'Image'
                  );
                  return;
                }
                handleGenerate();
              }}
              className={`glass-dock-generate-btn ${hasGenerated ? 'is-regenerate' : ''} ${isGenerating ? 'is-generating' : ''}`}
              title={
                !uploadedImage
                  ? 'Upload Image to Generate'
                  : hasGenerated
                  ? 'Regenerate Video (Ctrl + Enter)'
                  : 'Generate Video (Ctrl + Enter)'
              }
            >
              {hasGenerated && !isGenerating && (
                <Icons.RotateCw size={14} className="regen-icon" />
              )}
              {isGenerating && (
                <Icons.Loader size={14} className="spin-icon" />
              )}
              <span>
                {isGenerating
                  ? language === 'ta'
                    ? 'உருவாக்குகிறது...'
                    : 'Generating...'
                  : !uploadedImage
                  ? language === 'ta'
                    ? 'படம் பதிவேற்றி உருவாக்கு'
                    : 'Upload & Generate'
                  : hasGenerated
                  ? language === 'ta'
                    ? 'மீண்டும் உருவாக்கு'
                    : 'Regenerate'
                  : language === 'ta'
                  ? 'உருவாக்கு'
                  : 'Generate'}
              </span>
              {!isGenerating && !hasGenerated && <Icons.ArrowRight size={14} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`view-container i2v-page-container ${!isStudioState ? 'i2v-initial-state' : 'i2v-studio-state'} ${isBlinking ? 'page-blink-refresh' : ''}`}>
      {isBlinking && <div className="page-refresh-flash-overlay" aria-hidden="true" />}

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
        </div>
      </div>

      {/* STATE 1 — Initial Front Page (Spacious Clean White Screen + Bottom-Centered Composer) */}
      {!isStudioState ? (
        <div className="p2v-initial-workspace i2v-initial-workspace">
          <div className="p2v-initial-spacer" />
          <div className="p2v-initial-composer-wrap">
            {generationError && (
              <div
                className="generation-error-notice"
                style={{
                  marginBottom: '16px',
                  padding: '14px 18px',
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '14px',
                  color: '#b91c1c'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1 }}>
                  <Icons.AlertTriangle style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }} size={20} />
                  <div style={{ fontSize: '13.5px', lineHeight: 1.45 }}>
                    <strong style={{ color: '#b91c1c', display: 'block', marginBottom: '3px', fontWeight: 700 }}>
                      {language === 'ta' ? 'அறிவிப்பு' : 'Generation Notice'}
                    </strong>
                    <span style={{ wordBreak: 'break-word', color: '#1e293b', fontWeight: 500 }}>{generationError}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={isGenerating}
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
                    style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px', display: 'inline-flex', alignItems: 'center' }}
                    title="Dismiss"
                  >
                    <Icons.X size={16} />
                  </button>
                </div>
              </div>
            )}

            {renderComposerBox()}
          </div>
        </div>
      ) : (
        /* STATE 2 — Generated Output Page (Two-Column Studio Layout with Left Input & Right Video Studio) */
        <div className="studio-split-layout p2v-studio-active-layout">
          {/* LEFT COLUMN: Image to Video input/workspace */}
          <div className="studio-card-panel p2v-left-panel">
            <div className="p2v-left-card">
              {generationError && (
                <div
                  className="generation-error-notice"
                  style={{
                    marginBottom: '16px',
                    padding: '14px 18px',
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '14px',
                    color: '#b91c1c'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1 }}>
                    <Icons.AlertTriangle style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }} size={20} />
                    <div style={{ fontSize: '13.5px', lineHeight: 1.45 }}>
                      <strong style={{ color: '#b91c1c', display: 'block', marginBottom: '3px', fontWeight: 700 }}>
                        {language === 'ta' ? 'அறிவிப்பு' : 'Generation Notice'}
                      </strong>
                      <span style={{ wordBreak: 'break-word', color: '#1e293b', fontWeight: 500 }}>{generationError}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    <button
                      type="button"
                      onClick={handleGenerate}
                      disabled={isGenerating}
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
                      style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px', display: 'inline-flex', alignItems: 'center' }}
                      title="Dismiss"
                    >
                      <Icons.X size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* Spacer pushing composer toward bottom-middle of LEFT panel */}
              <div className="p2v-left-spacer" />

              {/* Render Composer */}
              {renderComposerBox()}
            </div>
          </div>

          {/* RIGHT COLUMN: Video Studio / Generated Output Panel with Slide-in animation */}
          <div className="studio-output-panel slide-in-from-right" ref={previewSectionRef}>
            {isGenerating ? (
              <div className="studio-generating-card composer-generating-view">
                <DotMatrixWaveCanvas
                  isGenerating={true}
                  progressPercent={progressPercent}
                  progressStatus={progressStatus}
                  promptSummary={getAugmentedPrompt()}
                  onCancel={() => {
                    currentRequestIdRef.current++;
                    isGeneratingRef.current = false;
                    setIsGenerating(false);
                    setProgressPercent(0);
                    showToast(
                      language === 'ta' ? 'உருவாக்கம் ரத்து செய்யப்பட்டது' : 'Generation cancelled',
                      'Trash2'
                    );
                  }}
                />
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
      )}

      {/* Generating Progress Modal Overlay */}
      <GeneratingModal
        isOpen={isGenerating}
        progressPercent={progressPercent}
        progressStatus={progressStatus}
        videoType="image"
        promptSummary={getAugmentedPrompt()}
        onCancel={() => {
          currentRequestIdRef.current++;
          isGeneratingRef.current = false;
          setIsGenerating(false);
          setProgressPercent(0);
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
