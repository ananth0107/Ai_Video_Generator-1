import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icons } from '../components/Icons';
import DotMatrixWaveCanvas from '../components/DotMatrixWaveCanvas';
import TamilParticleOrb from '../components/TamilParticleOrb';
import GeneratingModal from '../components/GeneratingModal';
import VideoPlayer from '../components/VideoPlayer';
import SaveVideoModal from '../components/History/SaveVideoModal';
import CharacterReferencePanel from '../components/CharacterReferencePanel';
import { saveHistoryItem, deleteHistoryItem, captureCanvasThumbnail } from '../utils/historyStorage';
import { useToast } from '../context/ToastContext';
import { useCharacters } from '../context/CharacterContext';
import { useLanguage } from '../context/LanguageContext';
import { generateTextToVideo, enhancePrompt } from '../services/videoService';
import { enhancePromptWithOpenRouter } from '../services/openrouterService';
import { consumeTokens } from '../utils/tokenUsageStorage';

export default function PromptToVideoPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const {
    allCharacters,
    selectedCharacters,
    selectedCharacterIds,
    toggleSelectCharacter,
    removeSelectedCharacter,
    clearSelectedCharacters
  } = useCharacters();
  const { t, language } = useLanguage();

  const [promptText, setPromptText] = useState(
    location.state?.presetPrompt || ''
  );
  const [promptAspect, setPromptAspect] = useState(location.state?.presetAspect || '16:9');
  const [promptStyle, setPromptStyle] = useState(location.state?.presetStyle || 'Cinematic');
  const [cameraMotion, setCameraMotion] = useState('Smooth Zoom');
  const [lightingMood, setLightingMood] = useState('Volumetric Sun');
  const [isAiEnhance, setIsAiEnhance] = useState(true);
  const [isEnhancingPrompt, setIsEnhancingPrompt] = useState(false);
  const [activeSceneryId, setActiveSceneryId] = useState(location.state?.sceneryId || null);
  const [generationResults, setGenerationResults] = useState(null);

  // Modern Characters Reference panel state
  const [isCharPickerOpen, setIsCharPickerOpen] = useState(false);

  const handleToggleCharacter = (character) => {
    toggleSelectCharacter(character.id);
  };

  const handleRemoveCharacter = (charId) => {
    removeSelectedCharacter(charId);
  };

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressStatus, setProgressStatus] = useState('');
  const [generationError, setGenerationError] = useState(null);
  const [hasGenerated, setHasGenerated] = useState(
    Boolean(location.state?.videoItem?.hasGenerated || location.state?.videoItem?.videoUrl)
  );

  // Generated Video state - starts empty until real AI output arrives
  const [generatedVideo, setGeneratedVideo] = useState({
    hasGenerated: Boolean(location.state?.videoItem?.hasGenerated || location.state?.videoItem?.videoUrl),
    type: 'prompt',
    prompt: location.state?.presetPrompt || '',
    aspectRatio: location.state?.presetAspect || '16:9',
    style: location.state?.presetStyle || 'Cinematic',
    sceneryId: null,
    characters: location.state?.presetPrompt && selectedCharacters.length > 0 ? selectedCharacters : [],
    aiEnhanced: true,
    videoUrl: location.state?.videoItem?.videoUrl || null,
    isSaved: false
  });

  const isGeneratingRef = useRef(false);
  const currentRequestIdRef = useRef(0);
  const previewSectionRef = useRef(null);

  // Save to History modal state
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [pendingSaveVideo, setPendingSaveVideo] = useState(null);
  const [defaultSaveName, setDefaultSaveName] = useState('');

  // Page blink refresh state on New Chat
  const [isBlinking, setIsBlinking] = useState(false);

  const handleNewChat = useCallback((options = { showNotification: true }) => {
    currentRequestIdRef.current++;
    isGeneratingRef.current = false;
    setIsBlinking(true);
    setTimeout(() => setIsBlinking(false), 450);

    setPromptText('');
    setPromptAspect('16:9');
    setPromptStyle('Cinematic');
    setCameraMotion('Smooth Zoom');
    setLightingMood('Volumetric Sun');
    setIsAiEnhance(true);
    setIsEnhancingPrompt(false);
    setActiveSceneryId(null);
    setGenerationError(null);
    setGenerationResults(null);
    setIsCharPickerOpen(false);
    setIsGenerating(false);
    setProgressPercent(0);
    setProgressStatus('');
    setHasGenerated(false);
    setGeneratedVideo({
      hasGenerated: false,
      type: 'prompt',
      prompt: '',
      aspectRatio: '16:9',
      style: 'Cinematic',
      sceneryId: null,
      characters: [],
      aiEnhanced: true,
      videoUrl: null,
      isSaved: false
    });
    clearSelectedCharacters();

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
    if (location.state?.presetPrompt || location.state?.videoItem) {
      if (location.state.presetPrompt) {
        setPromptText(location.state.presetPrompt);
      }
      if (location.state.presetAspect) {
        setPromptAspect(location.state.presetAspect);
      }
      if (location.state.presetStyle) {
        setPromptStyle(location.state.presetStyle);
      }
      if (location.state.cameraMotion) {
        setCameraMotion(location.state.cameraMotion);
      }
      if (location.state.lightingMood) {
        setLightingMood(location.state.lightingMood);
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
      if (e?.detail?.target && e.detail.target !== 'prompt-to-video' && e.detail.target !== 'prompt') {
        return;
      }
      handleNewChat({ showNotification: true });
    };
    window.addEventListener('new-chat', onNewChatEvent);
    window.addEventListener('new-chat-prompt', onNewChatEvent);
    return () => {
      window.removeEventListener('new-chat', onNewChatEvent);
      window.removeEventListener('new-chat-prompt', onNewChatEvent);
    };
  }, [handleNewChat]);

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

  // Dedicated handler for one-click AI Prompt Enhancement with OpenRouter
  const handleAiEnhancePrompt = useCallback(async () => {
    if (isEnhancingPrompt || isGenerating) return;

    const rawPrompt = promptText.trim();
    if (!rawPrompt) {
      showToast(
        language === 'ta'
          ? 'மேம்படுத்த முதலில் ஒரு பிராம்ட்டை உள்ளிடவும்'
          : 'Please enter a prompt first to enhance it with AI',
        'Check'
      );
      return;
    }

    setIsEnhancingPrompt(true);
    showToast(
      language === 'ta'
        ? 'OpenRouter AI மூலம் பிராம்ட் மேம்படுத்தப்படுகிறது...'
        : 'Enhancing prompt with OpenRouter cinematic AI...',
      'Check'
    );

    console.log('[OPENROUTER] Enhancing prompt from button click');

    try {
      const result = await enhancePromptWithOpenRouter(rawPrompt, {
        style: promptStyle,
        resolution: '4k',
        aspectRatio: promptAspect,
        characters: selectedCharacters
      });

      if (result.success && result.enhancedPrompt) {
        setPromptText(result.enhancedPrompt);
        showToast(
          language === 'ta'
            ? 'பிராம்ட் சினிமா தரத்தில் மேம்படுத்தப்பட்டது!'
            : 'Prompt enhanced into cinematic 4K video prompt!',
          'Check'
        );
        console.log('[OPENROUTER] Prompt enhancement completed successfully');
      } else {
        const errorMsg = result.error || (language === 'ta' ? 'மேம்படுத்தல் தோல்வியடைந்தது' : 'Prompt enhancement failed');
        showToast(errorMsg, 'AlertTriangle');
      }
    } catch (err) {
      const errMsg = err?.message || 'Failed to enhance prompt';
      console.error('[OPENROUTER] Enhancement error:', errMsg);
      showToast(errMsg, 'AlertTriangle');
    } finally {
      setIsEnhancingPrompt(false);
    }
  }, [promptText, promptStyle, promptAspect, selectedCharacters, isEnhancingPrompt, isGenerating, showToast, language]);

  const handleGenerate = useCallback(async () => {
    // Prevent duplicate clicks
    if (isGeneratingRef.current || isGenerating) return;

    // 1. Validate prompt
    if (!promptText.trim()) {
      showToast(
        language === 'ta' ? 'தயவுசெய்து ஒரு பிராம்ட்டை உள்ளிடவும்' : 'Please enter a valid video prompt',
        'Check'
      );
      return;
    }
    const finalPrompt = getAugmentedPrompt();

    // 2. Increment request ID to uniquely identify this generation call
    const requestId = ++currentRequestIdRef.current;
    const MIN_ANIMATION_MS = 10000;
    const genStartTime = Date.now();

    // 3. Immediately clear previous generated video URL and errors
    isGeneratingRef.current = true;
    setIsGenerating(true);
    setGenerationError(null);
    setGenerationResults(null);
    setHasGenerated(false);
    setGeneratedVideo({
      hasGenerated: false,
      type: 'prompt',
      prompt: finalPrompt,
      aspectRatio: promptAspect,
      style: promptStyle,
      sceneryId: activeSceneryId,
      characters: selectedCharacters.length > 0 ? selectedCharacters : [],
      aiEnhanced: isAiEnhance,
      videoUrl: null,
      isSaved: false
    });

    setProgressPercent(5);
    setProgressStatus(
      language === 'ta' ? 'உங்கள் பிராம்ட்டை தயார் செய்கிறது...' : 'Preparing prompt & neural diffusion...'
    );

    console.log('[VIDEO] Generation started');

    const getStageStatus = (pct, lang) => {
      if (pct < 20) {
        return lang === 'ta' ? 'பிராம்ட் பகுப்பாய்வு & நியூரல் துவக்கம்...' : 'Analyzing prompt semantics & neural context...';
      } else if (pct < 40) {
        return lang === 'ta' ? 'நியூரல் பிரேம்களை உருவாக்குகிறது...' : 'Synthesizing neural video keyframes...';
      } else if (pct < 65) {
        return lang === 'ta' ? 'ஒளி அமைப்பு & சினிமா கேமரா செயலாக்கப்படுகிறது...' : 'Rendering cinematic lighting & camera motion...';
      } else if (pct < 85) {
        return lang === 'ta' ? '4K தரத்தில் பிரேம்கள் மெருகூட்டப்படுகிறது...' : 'Upscaling diffusion frames to 4K ultra-smooth...';
      } else {
        return lang === 'ta' ? 'இறுதி வீடியோ தொகுப்பு தயாராகிறது...' : 'Finalizing temporal coherence & color grading...';
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
          language === 'ta' ? 'வீடியோ இறுதி செய்யப்படுகிறது...' : 'Polishing final video stream...'
        );
      }
    }, 80);

    // Timeout safety handle (4 minutes)
    let isTimedOut = false;
    const timeoutHandle = setTimeout(() => {
      isTimedOut = true;
    }, 240000);

    let apiResponse = null;
    try {
      let enhancedPrompt = finalPrompt;
      if (isAiEnhance) {
        try {
          const enhanceRes = await enhancePromptWithOpenRouter(finalPrompt, {
            style: promptStyle,
            resolution: '4k',
            aspectRatio: promptAspect,
            characters: selectedCharacters
          });

          if (enhanceRes?.success && enhanceRes?.enhancedPrompt) {
            enhancedPrompt = enhanceRes.enhancedPrompt;
            console.log('[OPENROUTER] Prompt enhancement completed');
          }
        } catch (enhanceErr) {
          console.warn('[PromptToVideo] OpenRouter enhance notice:', enhanceErr.message);
        }
      }

      // Check if this request is still active
      if (requestId !== currentRequestIdRef.current) {
        clearInterval(progressTimer);
        clearTimeout(timeoutHandle);
        return;
      }

      console.log('[VIDEO] Request sent to video generation service');

      apiResponse = await generateTextToVideo(finalPrompt, {
        enhancedPrompt,
        resolution: '4k',
        aspectRatio: promptAspect,
        characters: selectedCharacters,
        cameraMotion,
        lightingMood
      });

      // Discard stale responses if a newer request was dispatched
      if (requestId !== currentRequestIdRef.current) {
        clearInterval(progressTimer);
        clearTimeout(timeoutHandle);
        console.log(`[VIDEO] Request #${requestId} response discarded (newer request running)`);
        return;
      }

      if (isTimedOut) {
        clearInterval(progressTimer);
        throw new Error('Video generation timed out after 4 minutes');
      }

      console.log('[VIDEO] Generation completed');
      console.log('[VIDEO] Video URL received');
      console.log('[VIDEO] Returning result to frontend');
      console.log('Video ready');
      console.log('Displaying video');

      const videoUrl = apiResponse?.videoUrl || apiResponse?.results?.gemini?.videoUrl;
      if (!videoUrl) {
        clearInterval(progressTimer);
        const failureReason = apiResponse?.error || apiResponse?.results?.gemini?.error || 'No video URL was returned by video generation service';
        throw new Error(failureReason);
      }

      // Ensure the animation lasts AT LEAST 10 seconds total
      const elapsed = Date.now() - genStartTime;
      const remainingTime = Math.max(0, MIN_ANIMATION_MS - elapsed);
      if (remainingTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, remainingTime));
      }

      clearInterval(progressTimer);
      clearTimeout(timeoutHandle);

      if (requestId !== currentRequestIdRef.current) return;

      setProgressPercent(100);
      setProgressStatus(
        language === 'ta' ? 'வீடியோ தயாராக உள்ளது!' : 'Video ready'
      );

      // Give 600ms to enjoy completion visual
      await new Promise((resolve) => setTimeout(resolve, 600));

      if (requestId !== currentRequestIdRef.current) return;

      const activeChars = selectedCharacters.length > 0 ? selectedCharacters : [];
      const smartTitle = getSmartDefaultTitle(activeChars, promptStyle, finalPrompt);
      const createdAt = new Date().toISOString();

      const videoRecord = {
        id: `vid_${apiResponse?.provider || 'gemini'}_${Date.now()}`,
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
        origName: `gemini_video_${Date.now()}.mp4`,
        source: apiResponse?.source || apiResponse?.provider || 'gemini',
        provider: apiResponse?.provider || 'gemini',
        model: apiResponse?.model || 'gemini-veo-3.1',
        createdAt
      };

      // Display video only when truly generated by current request
      setGeneratedVideo(videoRecord);
      setHasGenerated(true);
      saveHistoryItem(videoRecord);
      setGenerationResults(null);
      setIsGenerating(false);
      isGeneratingRef.current = false;
      setGenerationError(null);

      consumeTokens('gemini', 150);

      const providerDisplayName = (apiResponse?.provider === 'gemini' ? 'Gemini' : 'AI');
      showToast(
        language === 'ta'
          ? `${providerDisplayName} வீடியோ உருவாக்கப்பட்டு வரலாற்றில் சேமிக்கப்பட்டது!`
          : `${providerDisplayName} Video generated & saved to History!`,
        'BookmarkCheck'
      );

      if (previewSectionRef.current) {
        previewSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } catch (err) {
      clearInterval(progressTimer);
      clearTimeout(timeoutHandle);
      if (requestId !== currentRequestIdRef.current) {
        return;
      }
      isGeneratingRef.current = false;
      setIsGenerating(false);
      setProgressPercent(0);
      setProgressStatus('');
      setHasGenerated(false);
      setGenerationResults(null);
      setGeneratedVideo({
        hasGenerated: false,
        type: 'prompt',
        prompt: finalPrompt,
        aspectRatio: promptAspect,
        style: promptStyle,
        sceneryId: activeSceneryId,
        characters: selectedCharacters.length > 0 ? selectedCharacters : [],
        aiEnhanced: isAiEnhance,
        videoUrl: null,
        isSaved: false
      });
      const isQuota = err?.status === 429 || err?.isQuota || (err?.message && (err.message.includes('quota') || err.message.includes('429') || err.message.includes('RESOURCE_EXHAUSTED')));
      const errMsg = isQuota
        ? 'Video generation quota is currently unavailable. Please check your Gemini API project quota/billing.'
        : (err?.message || 'Video generation failed. Please try again.');
      console.error(`[VIDEO] Generation failed: ${errMsg}`);
      setGenerationError(errMsg);
      showToast(errMsg, 'AlertTriangle');
    } finally {
      if (requestId === currentRequestIdRef.current) {
        isGeneratingRef.current = false;
      }
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


  const handleInsertCharacterIntoPrompt = (character) => {
    setPromptText((prev) => {
      const tag = `@${character.name}`;
      if (!prev.trim()) {
        return `${tag} `;
      }
      if (!prev.includes(tag)) {
        return `${prev.trim()} ${tag} `;
      }
      return prev;
    });
    showToast(`Added @${character.name} to prompt`, 'Check');
  };

  // Helper to render prompt composer consistently across State 1 and State 2
  const renderPromptComposer = () => (
    <div className="form-group prompt-composer-section p2v-composer-section">
      <div className="form-label-row">
        <label htmlFor="prompt-input" className="form-step-label">
          <span className="form-step-badge">02</span>
          <span>{t('step1PromptLabel', 'Video Description & Prompt')}</span>
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
                    ? 'AI மேம்பாடு இயக்கப்பட்டது'
                    : 'AI Enhance ON: Auto-optimizing lighting & 4K HDR clarity!'
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

          <span className="char-counter">{promptText.length}/500</span>
        </div>
      </div>

      {/* Floating Glassmorphic Prompt Composer Box */}
      <div className="prompt-composer-box p2v-prompt-box">
        <textarea
          id="prompt-input"
          rows={2}
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          placeholder={
            language === 'ta'
              ? 'நீங்கள் உருவாக்க விரும்பும் வீடியோவை விரிவாக விவரிக்கவும்...'
              : 'Describe the video you want to generate in detail...'
          }
          className="prompt-composer-textarea p2v-composer-textarea"
        />

        {/* Floating Glass Dock Toolbar */}
        <div className="glass-dock-toolbar">
          <div className="glass-dock-left">
            <button
              type="button"
              className={`glass-dock-btn ${isCharPickerOpen || selectedCharacters.length > 0 ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                setIsCharPickerOpen(true);
              }}
              title={language === 'ta' ? 'கதாபாத்திரக் குறிப்புகளைச் சேர்க்க (+)' : 'Add Persona / Reference (+)'}
              aria-label="Add Character References"
              aria-expanded={isCharPickerOpen}
            >
              <div className="glass-dock-btn-icon">
                <Icons.Plus size={14} />
              </div>
              <span>{language === 'ta' ? 'கதாபாத்திரம்' : 'Persona'}</span>
            </button>

            {/* Selected Character Chips inside Floating Dock */}
            {selectedCharacters.length > 0 && (
              <div className="glass-dock-chips-group">
                {selectedCharacters.map((character) => (
                  <div key={character.id} className="glass-dock-chip" title={`Character Reference: ${character.name}`}>
                    <img
                      src={character.avatar}
                      alt={character.name}
                      className="glass-dock-chip-avatar"
                    />
                    <span className="glass-dock-chip-name">{character.name}</span>
                    <button
                      type="button"
                      className="glass-dock-chip-remove"
                      onClick={() => handleRemoveCharacter(character.id)}
                      title={`Remove ${character.name}`}
                    >
                      <Icons.X size={11} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="glass-dock-right">
            <span className="glass-dock-counter">{promptText.length}/500</span>

            <button
              type="button"
              disabled={isGenerating}
              onClick={handleGenerate}
              className={`glass-dock-generate-btn ${hasGenerated ? 'is-regenerate' : ''} ${isGenerating ? 'is-generating' : ''}`}
              title={
                hasGenerated
                  ? language === 'ta'
                    ? 'வீடியோவை மீண்டும் உருவாக்கு (Ctrl + Enter)'
                    : 'Regenerate Video (Ctrl + Enter)'
                  : language === 'ta'
                  ? 'வீடியோ உருவாக்கு (Ctrl + Enter)'
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

  const isStudioState = isGenerating || (hasGenerated && !!generatedVideo?.videoUrl) || (!!generationResults && (generationResults.gemini?.videoUrl || generationResults.fal?.videoUrl));

  return (
    <div className={`view-container p2v-page-container ${!isStudioState ? 'p2v-initial-state' : 'p2v-studio-state'} ${isBlinking ? 'page-blink-refresh' : ''}`}>
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
                <h1 className="main-title">{t('p2vTitle')}</h1>
                <span className="studio-pill-badge">{t('p2vBadge')}</span>
              </div>
              <p className="main-subtitle">{t('p2vSubtitle')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* STATE 1 — Initial Prompt Page (Spacious White Screen + Bottom-Centered Composer) */}
      {!isStudioState ? (
        <div className="p2v-initial-workspace">
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

            {renderPromptComposer()}
          </div>
        </div>
      ) : (
        /* STATE 2 — Generated Output Page (Two-Column Studio Layout with Left Input & Right Video Studio) */
        <div className="studio-split-layout p2v-studio-active-layout">
          {/* LEFT COLUMN: Prompt to Video input/workspace */}
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

              {/* Spacer pushing prompt composer toward bottom-middle of LEFT panel */}
              <div className="p2v-left-spacer" />

              {/* Render Prompt Composer */}
              {renderPromptComposer()}
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
                  promptSummary={promptText}
                  onCancel={() => {
                    currentRequestIdRef.current++;
                    isGeneratingRef.current = false;
                    setIsGenerating(false);
                    showToast(
                      language === 'ta' ? 'உருவாக்கம் ரத்து செய்யப்பட்டது' : 'Generation cancelled',
                      'Trash2'
                    );
                  }}
                />
              </div>
            ) : (
              <div className="output-revealed-wrap" key={generatedVideo.videoUrl || generatedVideo.id}>
                <VideoPlayer
                  video={generatedVideo}
                  onRegenerate={handleGenerate}
                  onSaveToggle={handleSaveToggle}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Save to History Modal Dialog */}
      {/* Modern Google Flow Inspired Character Reference Panel */}
      <CharacterReferencePanel
        isOpen={isCharPickerOpen}
        onClose={() => setIsCharPickerOpen(false)}
        onConfirmAddToPrompt={() => {
          setIsCharPickerOpen(false);
          if (selectedCharacters.length > 0) {
            showToast(
              language === 'ta'
                ? 'கதாபாத்திரக் குறிப்புகள் பிராம்ட்டில் சேர்க்கப்பட்டன'
                : 'Character references active in prompt',
              'Check'
            );
          }
        }}
      />

      <SaveVideoModal
        isOpen={isSaveModalOpen}
        defaultName={defaultSaveName}
        onSave={handleConfirmSave}
        onCancel={handleCancelSave}
      />
    </div>
  );
}

