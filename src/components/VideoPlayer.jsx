import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Icons } from './Icons';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { renderSceneryScene } from '../utils/sceneryRenderers';

function getSceneryId(video) {
  if (video.sceneryId) return video.sceneryId;
  const p = (video.prompt || '').toLowerCase();
  if (p.includes('aurora') || p.includes('arctic') || p.includes('fjord')) return 'aurora-borealis';
  if (p.includes('sakura') || p.includes('blossom') || p.includes('pagoda') || p.includes('japan') || p.includes('shrine')) return 'sakura-twilight';
  if (p.includes('cyber') || p.includes('neon') || p.includes('metropolis') || p.includes('megalopolis') || p.includes('hover') || p.includes('city') || p.includes('rain')) return 'cyberpunk-city';
  if (p.includes('ocean') || p.includes('wave') || p.includes('beach') || p.includes('sea') || p.includes('tropical')) return 'ocean-waves-sunset';
  if (p.includes('cosmic') || p.includes('galaxy') || p.includes('nebula') || p.includes('space') || p.includes('interstellar') || p.includes('portal')) return 'cosmic-nebula';
  if (p.includes('waterfall') || p.includes('rainforest') || p.includes('jungle') || p.includes('moss')) return 'rainforest-waterfall';
  if (p.includes('autumn') || p.includes('birch') || p.includes('forest') || p.includes('creek') || p.includes('leaves') || p.includes('amber')) return 'autumn-forest';
  if (p.includes('desert') || p.includes('dune') || p.includes('sahara') || p.includes('sand')) return 'desert-starlight';
  if (p.includes('cloud') || p.includes('floating') || p.includes('spire') || p.includes('haven') || p.includes('oasis')) return 'floating-cloud-city';
  return 'golden-sunrise';
}

export default function VideoPlayer({
  video,
  onRegenerate,
  onSaveToggle
}) {
  const { showToast } = useToast();
  const { t, language } = useLanguage();

  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackProgress, setPlaybackProgress] = useState(30); // 0 to 100%
  const [playbackSpeed, setPlaybackSpeed] = useState(1); // 0.5, 1, 1.5, 2
  const [isMuted, setIsMuted] = useState(true);
  const [isLooping, setIsLooping] = useState(true);

  // Download popup toggle state
  const [isDownloadPopupOpen, setIsDownloadPopupOpen] = useState(false);

  // Video Export state
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  // Refs
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const scrubberWrapRef = useRef(null);
  const isScrubbingRef = useRef(false);
  const playerContainerRef = useRef(null);
  const downloadPopupRef = useRef(null);
  const imageObjRef = useRef(null);

  useEffect(() => {
    if (video?.videoUrl) {
      console.log('[Frontend] VideoPlayer assigned src:', video.videoUrl);
    }
  }, [video?.videoUrl]);

  // Synchronize HTML5 video element state when video.videoUrl exists
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid || !video.videoUrl) return;

    if (isPlaying) {
      vid.play().catch(() => {});
    } else {
      vid.pause();
    }
  }, [isPlaying, video.videoUrl]);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid || !video.videoUrl) return;
    vid.playbackRate = playbackSpeed;
  }, [playbackSpeed, video.videoUrl]);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid || !video.videoUrl) return;
    vid.muted = isMuted;
  }, [isMuted, video.videoUrl]);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid || !video.videoUrl) return;
    vid.loop = isLooping;
  }, [isLooping, video.videoUrl]);

  // Close download popup on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (downloadPopupRef.current && !downloadPopupRef.current.contains(e.target)) {
        setIsDownloadPopupOpen(false);
      }
    };
    if (isDownloadPopupOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isDownloadPopupOpen]);

  // Load image if it's image-to-video
  useEffect(() => {
    const source = video.uploadedImage || video.thumbnail;
    if (video.type === 'image' && source) {
      const img = new Image();
      img.src = source;
      imageObjRef.current = img;
    }
  }, [video]);

  // Spacebar toggle playback
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'INPUT') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Real-time Canvas Neural Video Simulation
  useEffect(() => {
    if (video.videoUrl) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = 1280;
    const height = 720;
    canvas.width = width;
    canvas.height = height;

    const particles = [];
    for (let i = 0; i < 90; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        speed: 0.8 + Math.random() * 2.2,
        size: 1 + Math.random() * 2.5,
        alpha: 0.3 + Math.random() * 0.7,
        color: ['#60a5fa', '#a78bfa', '#f472b6', '#38bdf8', '#34d399'][Math.floor(Math.random() * 5)]
      });
    }

    let animationFrameId;
    let lastTime = performance.now();

    function drawScene(now) {
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      if (isPlaying && !isScrubbingRef.current && delta > 0 && delta < 0.3) {
        setPlaybackProgress((prev) => {
          const step = delta * playbackSpeed * 10;
          let next = prev + step;
          if (next >= 100) {
            if (isLooping) {
              return 0;
            } else {
              setIsPlaying(false);
              return 100;
            }
          }
          return next;
        });
      }

      const canvasTime = (playbackProgress / 100) * 12;
      ctx.clearRect(0, 0, width, height);

      // RENDER IMAGE-TO-VIDEO ANIMATION
      if (video.type === 'image' && imageObjRef.current && imageObjRef.current.complete) {
        const img = imageObjRef.current;
        const norm = playbackProgress / 100;
        // Never force zoom; maintain stable framing unless explicitly requested
        const promptLower = (video.prompt || '').toLowerCase();
        const hasExplicitZoom = promptLower.includes('zoom in') || promptLower.includes('dolly in');
        const scale = hasExplicitZoom ? 1.0 + Math.sin(norm * Math.PI) * 0.08 : 1.0;
        const panX = 0;
        const panY = 0;

        ctx.save();
        ctx.translate(width / 2 + panX, height / 2 + panY);
        ctx.scale(scale, scale);

        const imgRatio = img.width / img.height;
        const canvasRatio = width / height;
        let dw, dh;
        if (imgRatio > canvasRatio) {
          dh = height;
          dw = height * imgRatio;
        } else {
          dw = width;
          dh = width / imgRatio;
        }
        ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
        ctx.restore();

        // Cinematic lighting sweep
        const sweepX = norm * (width + 600) - 300;
        const sweepGrad = ctx.createLinearGradient(sweepX - 160, 0, sweepX + 160, height);
        sweepGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        sweepGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.14)');
        sweepGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = sweepGrad;
        ctx.fillRect(0, 0, width, height);

        // Vignette
        const vigGrad = ctx.createRadialGradient(width / 2, height / 2, height * 0.35, width / 2, height / 2, width * 0.7);
        vigGrad.addColorStop(0, 'transparent');
        vigGrad.addColorStop(1, 'rgba(2, 6, 23, 0.65)');
        ctx.fillStyle = vigGrad;
        ctx.fillRect(0, 0, width, height);
      } else {
        // RENDER DYNAMIC ANIMATED SCENERY & CHARACTER INTEGRATION
        const sceneryId = getSceneryId(video);
        const normProgress = Math.max(0, Math.min(1, playbackProgress / 100));

        // Detect active character from selected characters array or prompt text
        const promptLower = (video.prompt || '').toLowerCase();
        let activeCharacter = (video.characters && video.characters.length > 0) ? video.characters[0] : null;
        if (!activeCharacter) {
          if (promptLower.includes('trisha')) {
            activeCharacter = { id: 'trisha-krishnan', name: 'Trisha Krishnan', gender: 'Actress', style: 'Cinematic' };
          } else if (promptLower.includes('rajini')) {
            activeCharacter = { id: 'rajinikanth', name: 'Rajinikanth', gender: 'Actor', style: 'Cinematic' };
          } else if (promptLower.includes('vijay')) {
            activeCharacter = { id: 'vijay', name: 'Vijay', gender: 'Actor', style: 'Cinematic' };
          } else if (promptLower.includes('nayanthara')) {
            activeCharacter = { id: 'nayanthara', name: 'Nayanthara', gender: 'Actress', style: 'Cinematic' };
          }
        }

        if (activeCharacter) {
          // CAMERA PERSPECTIVE: Default to stable, locked-off framing unless user explicitly requested camera movement
          const wideCenterX = width * 0.50;
          const wideCenterY = height * 0.50;
          const targetFocusX = width * 0.40;
          const targetFocusY = height * 0.735 - 130;

          const isExplicitZoom = promptLower.includes('zoom in') || promptLower.includes('dolly in') || promptLower.includes('push in');
          let cameraScale = 1.0;
          let cameraFocusX = wideCenterX;
          let cameraFocusY = wideCenterY;

          if (isExplicitZoom) {
            // Only apply zoom when user explicitly asked for zoom
            const t = Math.min(1, normProgress / 0.85);
            const smoothT = t * t * (3 - 2 * t);
            cameraScale = 1.0 + (1.5 - 1.0) * smoothT;
            cameraFocusX = wideCenterX + (targetFocusX - wideCenterX) * smoothT;
            cameraFocusY = wideCenterY + (targetFocusY - wideCenterY) * smoothT;
          } else {
            // Stable locked-off camera showing subject and actions without zooming
            cameraScale = 1.0;
            cameraFocusX = wideCenterX;
            cameraFocusY = wideCenterY;
          }

          ctx.save();
          ctx.translate(width / 2, height / 2);
          ctx.scale(cameraScale, cameraScale);
          ctx.translate(-cameraFocusX, -cameraFocusY);

          // Render scenery with embedded character and progress
          renderSceneryScene(ctx, width, height, canvasTime, sceneryId, video.aiEnhanced, activeCharacter, normProgress);

          // Floating Ambient Light Stars & Sparkles inside camera space
          particles.forEach((p) => {
            const py = (p.y - canvasTime * p.speed * 30 + height) % height;
            const px = (p.x + Math.sin(canvasTime * 0.8 + py * 0.02) * 15) % width;

            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.alpha * (0.5 + Math.sin(canvasTime * 2 + p.speed) * 0.5);
            ctx.beginPath();
            ctx.arc(px, py, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
          });

          ctx.restore();

          // Screen-space Anamorphic Golden Lens Bloom in Medium Close-Up
          if (normProgress > 0.35) {
            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            const flareIntensity = Math.min(1, (normProgress - 0.35) / 0.45) * 0.22;
            const flareGrad = ctx.createLinearGradient(0, height * 0.35, width, height * 0.65);
            flareGrad.addColorStop(0, 'rgba(251, 191, 36, 0)');
            flareGrad.addColorStop(0.5, `rgba(251, 191, 36, ${flareIntensity})`);
            flareGrad.addColorStop(1, 'rgba(244, 63, 94, 0)');
            ctx.fillStyle = flareGrad;
            ctx.fillRect(0, 0, width, height);
            ctx.restore();
          }

          // Subtle Cinematic Edge Vignette
          const vigGrad = ctx.createRadialGradient(width / 2, height / 2, height * 0.42, width / 2, height / 2, width * 0.76);
          vigGrad.addColorStop(0, 'transparent');
          vigGrad.addColorStop(1, 'rgba(2, 4, 12, 0.45)');
          ctx.fillStyle = vigGrad;
          ctx.fillRect(0, 0, width, height);
        } else {
          // Standard panoramic scenery without character
          renderSceneryScene(ctx, width, height, canvasTime, sceneryId, video.aiEnhanced, null, normProgress);

          // Floating Ambient Light Stars & Sparkles
          particles.forEach((p) => {
            const py = (p.y - canvasTime * p.speed * 30 + height) % height;
            const px = (p.x + Math.sin(canvasTime * 0.8 + py * 0.02) * 15) % width;

            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.alpha * (0.5 + Math.sin(canvasTime * 2 + p.speed) * 0.5);
            ctx.beginPath();
            ctx.arc(px, py, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
          });
        }
      }

      // Camera HUD overlays
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      const bracketSize = 24;
      const margin = 32;

      ctx.beginPath();
      ctx.moveTo(margin, margin + bracketSize);
      ctx.lineTo(margin, margin);
      ctx.lineTo(margin + bracketSize, margin);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(width - margin - bracketSize, margin);
      ctx.lineTo(width - margin, margin);
      ctx.lineTo(width - margin, margin + bracketSize);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(margin, height - margin - bracketSize);
      ctx.lineTo(margin, height - margin);
      ctx.lineTo(margin + bracketSize, height - margin);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(width - margin - bracketSize, height - margin);
      ctx.lineTo(width - margin, height - margin);
      ctx.lineTo(width - margin, height - margin - bracketSize);
      ctx.stroke();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.font = '700 13px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('THAMILI 4K NEURAL ENGINE', width - margin - 190, margin + 20);

      // Real-time camera shot badge
      const normProgressForBadge = Math.max(0, Math.min(1, playbackProgress / 100));
      const promptLowerForBadge = (video.prompt || '').toLowerCase();
      const hasCharForBadge = (video.characters && video.characters.length > 0) || promptLowerForBadge.includes('trisha');
      if (hasCharForBadge) {
        const charName = (video.characters && video.characters[0]?.name) || 'TRISHA KRISHNAN';
        const shotType = normProgressForBadge <= 0.28
          ? 'WIDE ESTABLISHING SHOT'
          : normProgressForBadge < 0.72
          ? 'CINEMATIC DOLLY TRANSITION'
          : 'MEDIUM CLOSE-UP';
        ctx.fillStyle = '#fbbf24';
        ctx.font = '700 12px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(`SUBJECT: ${charName.toUpperCase()} • ${shotType}`, width - margin - 400, height - margin - 12);
      }

      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.font = '600 13px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('THAMILI AI VIDEO STUDIO', margin + 10, height - margin - 12);

      animationFrameId = requestAnimationFrame(drawScene);
    }

    animationFrameId = requestAnimationFrame(drawScene);
    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, playbackProgress, playbackSpeed, isLooping, video]);

  // Handle timeupdate from HTML5 video element
  const handleVideoTimeUpdate = () => {
    if (isScrubbingRef.current || !videoRef.current) return;
    const dur = videoRef.current.duration;
    if (dur > 0) {
      setPlaybackProgress((videoRef.current.currentTime / dur) * 100);
    }
  };

  // Scrubbing & Seeking
  const handleScrubberSeek = useCallback((e) => {
    if (!scrubberWrapRef.current) return;
    const rect = scrubberWrapRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clickX = clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    setPlaybackProgress(ratio * 100);

    if (videoRef.current && video.videoUrl && videoRef.current.duration) {
      videoRef.current.currentTime = ratio * videoRef.current.duration;
    }
  }, [video.videoUrl]);

  const handleScrubberMouseDown = (e) => {
    isScrubbingRef.current = true;
    handleScrubberSeek(e);

    const onMouseMove = (moveEvent) => {
      if (isScrubbingRef.current) handleScrubberSeek(moveEvent);
    };
    const onMouseUp = () => {
      isScrubbingRef.current = false;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleStepProgress = (deltaPercent) => {
    setPlaybackProgress((prev) => {
      const next = Math.max(0, Math.min(100, prev + deltaPercent));
      if (videoRef.current && video.videoUrl && videoRef.current.duration) {
        videoRef.current.currentTime = (next / 100) * videoRef.current.duration;
      }
      return next;
    });
  };

  const toggleSpeed = () => {
    const speeds = [0.5, 1, 1.5, 2];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    setPlaybackSpeed(nextSpeed);
    showToast(`Speed: ${nextSpeed}x`, 'Play');
  };

  // Export Video Handler (MP4 / WebM / PNG)
  const handleExport = (format = 'mp4') => {
    setIsDownloadPopupOpen(false);

    // Direct 1-click MP4 download for real Fal.ai generated videos
    if (format === 'mp4' && video.videoUrl) {
      try {
        const link = document.createElement('a');
        link.href = video.videoUrl;
        link.download = video.origName || `THAMILI_AI_Video_${Date.now()}.mp4`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          if (document.body.contains(link)) document.body.removeChild(link);
        }, 500);
        showToast(
          language === 'ta'
            ? 'MP4 வீடியோ வெற்றிகரமாக பதிவிறக்கப்பட்டது!'
            : 'MP4 video downloaded successfully!',
          'Check'
        );
      } catch (_e) {
        window.open(video.videoUrl, '_blank');
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      if (video.videoUrl) {
        window.open(video.videoUrl, '_blank');
      }
      return;
    }

    if (format === 'png') {
      try {
        const link = document.createElement('a');
        link.download = `THAMILI_Frame_${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        showToast(
          language === 'ta' ? 'ஸ்னாப்ஷாட் PNG பதிவிறக்கப்பட்டது!' : 'Snapshot PNG downloaded!',
          'Check'
        );
      } catch (_err) {
        showToast(
          language === 'ta' ? 'ஸ்னாப்ஷாட் சேமிக்க முடியவில்லை' : 'Failed to save snapshot',
          'Trash2'
        );
      }
      return;
    }

    try {
      setIsExporting(true);
      setExportProgress(10);
      showToast(
        language === 'ta'
          ? `${format.toUpperCase()} வீடியோ ஏற்றுமதி செய்யப்படுகிறது...`
          : `Exporting ${format.toUpperCase()} video...`,
        'Download'
      );

      const stream = canvas.captureStream(30);
      const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';
      const recorder = new MediaRecorder(stream, { mimeType: mime });
      const chunks = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `THAMILI_Video_${Date.now()}.${format === 'mp4' ? 'mp4' : 'webm'}`;
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }, 1000);
        setIsExporting(false);
        setExportProgress(100);
        showToast(
          language === 'ta'
            ? `வீடியோ (${format.toUpperCase()}) வெற்றிகரமாக பதிவிறக்கப்பட்டது!`
            : `Video (${format.toUpperCase()}) downloaded!`,
          'Check'
        );
      };

      setPlaybackProgress(0);
      setPlaybackSpeed(1);
      setIsPlaying(true);
      recorder.start();

      const startTime = performance.now();
      const totalMs = 3800;

      const progressInterval = setInterval(() => {
        const elapsed = performance.now() - startTime;
        const pct = Math.min(100, Math.round((elapsed / totalMs) * 100));
        setExportProgress(pct);

        if (elapsed >= totalMs) {
          clearInterval(progressInterval);
          if (recorder.state !== 'inactive') recorder.stop();
        }
      }, 100);
    } catch (err) {
      console.error('Export error:', err);
      setIsExporting(false);
      showToast('Snapshot saved as PNG', 'Download');
      const link = document.createElement('a');
      link.download = `THAMILI_Video_${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  const handleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().catch(() => {
        showToast('Fullscreen not supported on this browser', 'Maximize');
      });
    } else {
      document.exitFullscreen();
    }
  };

  if (!video) return null;

  const aspectClass =
    video.aspectRatio === '9:16'
      ? 'aspect-9-16'
      : video.aspectRatio === '1:1'
      ? 'aspect-1-1'
      : 'aspect-16-9';

  return (
    <div className="video-player-card">
      {/* Header Info */}
      <div className="player-card-header">
        <div className="player-header-top">
          <div className="player-title-box">
            <h2 className="player-title">{t('generatedVideoOutput')}</h2>
            <span className={`player-ready-badge ${video.videoUrl ? 'ready' : ''}`}>
              <span className="ready-dot"></span>
              {video.videoUrl ? t('ready') : 'Awaiting Generation'}
            </span>
          </div>
          {video.prompt && video.prompt.trim().length > 0 && (
            <div className="player-tags-group">
              {video.aspectRatio && <span className="player-tag tag-ratio">{video.aspectRatio}</span>}
              {video.style && <span className="player-tag tag-style">{video.style}</span>}
              {(video.source === 'pixazo' || video.provider === 'pixazo') && (
                <span className="player-tag tag-hf-badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', borderColor: 'rgba(16, 185, 129, 0.35)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Icons.Zap />
                  <span>Pixazo 4K Video</span>
                </span>
              )}
              {(video.source === 'gemini' || video.provider === 'gemini') && (
                <span className="player-tag tag-hf-badge" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.35)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Icons.Sparkles />
                  <span>Gemini Veo 4K</span>
                </span>
              )}
              {(video.source === 'fal.ai' || video.provider === 'fal.ai' || video.source === 'fal' || video.provider === 'fal') && (
                <span className="player-tag tag-hf-badge" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', borderColor: 'rgba(168, 85, 247, 0.35)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Icons.Zap />
                  <span>Fal.ai 4K Video</span>
                </span>
              )}
              {(video.source === 'huggingface' || video.provider === 'huggingface') && (
                <span className="player-tag tag-hf-badge" style={{ background: 'rgba(234, 179, 8, 0.15)', color: '#fbbf24', borderColor: 'rgba(234, 179, 8, 0.35)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Icons.Zap />
                  <span>Hugging Face Video</span>
                </span>
              )}
              {video.aiEnhanced && (
                <span className="player-tag tag-ai-enhanced" title="AI 4K HDR Quality Enhanced">
                  <Icons.Sparkles />
                  <span>{t('hdrEnhancedTag')}</span>
                </span>
              )}
            </div>
          )}
        </div>
        {video.prompt && video.prompt.trim().length > 0 && (
          <p className="player-prompt-quote">"{video.prompt}"</p>
        )}
        {video.enhancedPrompt && video.enhancedPrompt !== video.prompt && (
          <div style={{ margin: '6px 0 10px', padding: '8px 12px', background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.22)', borderRadius: '8px', fontSize: '12px', color: '#bae6fd', lineHeight: 1.4 }}>
            <span style={{ fontWeight: 600, color: '#38bdf8', display: 'inline-flex', alignItems: 'center', gap: '4px', marginRight: '6px' }}>
              <Icons.Sparkles size={12} /> Gemini 4K Enhanced:
            </span>
            <span>"{video.enhancedPrompt}"</span>
          </div>
        )}
      </div>

      {/* Main Video Frame */}
      <div
        ref={playerContainerRef}
        className={`video-display-frame ${aspectClass}`}
      >
        {video.videoUrl ? (
          <video
            key={video.videoUrl}
            ref={videoRef}
            src={video.videoUrl}
            onClick={() => setIsPlaying((prev) => !prev)}
            onTimeUpdate={handleVideoTimeUpdate}
            onEnded={() => {
              if (!isLooping) setIsPlaying(false);
            }}
            className="canvas-player"
            playsInline
            autoPlay
            controls
            style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#020617' }}
            title="Click to play/pause (Space)"
          />
        ) : video.type === 'image' && video.uploadedImage ? (
          <canvas
            ref={canvasRef}
            onClick={() => setIsPlaying((prev) => !prev)}
            className="canvas-player"
            title="Click to play/pause (Space)"
          />
        ) : (
          <div
            className="no-video-placeholder"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
              minHeight: '340px',
              background: '#090d16',
              color: '#94a3b8',
              textAlign: 'center',
              padding: '24px'
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'rgba(56, 189, 248, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '14px',
                color: '#38bdf8'
              }}
            >
              <Icons.Video style={{ width: '28px', height: '28px' }} />
            </div>
            <strong style={{ fontSize: '16px', color: '#f1f5f9', marginBottom: '6px' }}>
              No Video Generated Yet
            </strong>
            <p style={{ fontSize: '13px', maxWidth: '360px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
              Enter your prompt on the left and click <strong>"Generate 4K Video"</strong> to generate real AI videos with Gemini & Pixazo.
            </p>
          </div>
        )}

        {/* Top-Left HUD Badge */}
        <div className="video-hud-live-tag">
          {video.videoUrl ? (
            <>
              <span className="live-ping"></span>
              <span>{(video.provider === 'pixazo' || video.source === 'pixazo') ? 'Pixazo 4K Stream' : video.provider === 'fal.ai' ? 'Fal.ai Stream' : video.provider === 'huggingface' ? 'Hugging Face Stream' : 'Gemini 4K Stream'}</span>
            </>
          ) : (
            <span style={{ color: '#94a3b8' }}>Video Studio</span>
          )}
        </div>

        {/* TOP-RIGHT CORNER: DOWNLOAD TOGGLE POPUP BUTTON */}
        <div className="video-download-corner-wrap" ref={downloadPopupRef}>
          <button
            type="button"
            onClick={() => setIsDownloadPopupOpen((prev) => !prev)}
            className={`video-download-toggle-btn ${isDownloadPopupOpen ? 'open' : ''}`}
            title="Download Video Options"
          >
            <Icons.Download />
            <span>{t('download')}</span>
            <Icons.ChevronDown />
          </button>

          {/* Download Dropdown Popup */}
          {isDownloadPopupOpen && (
            <div className="video-download-popup-menu">
              <div className="download-popup-header">
                <span>{t('exportOptions')}</span>
              </div>
              <button
                type="button"
                onClick={() => handleExport('mp4')}
                className="popup-menu-item"
              >
                <div className="menu-item-icon">
                  <Icons.Film />
                </div>
                <div className="menu-item-text">
                  <strong>{t('downloadMp4')}</strong>
                  <span>{t('downloadMp4Sub')}</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleExport('webm')}
                className="popup-menu-item"
              >
                <div className="menu-item-icon">
                  <Icons.Video />
                </div>
                <div className="menu-item-text">
                  <strong>{t('downloadWebM')}</strong>
                  <span>{t('downloadWebMSub')}</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleExport('png')}
                className="popup-menu-item"
              >
                <div className="menu-item-icon">
                  <Icons.Image />
                </div>
                <div className="menu-item-text">
                  <strong>{t('downloadPng')}</strong>
                  <span>{t('downloadPngSub')}</span>
                </div>
              </button>

              <div className="popup-menu-divider"></div>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  showToast(
                    language === 'ta'
                      ? 'வீடியோ இணைப்பு நகலெடுக்கப்பட்டது!'
                      : 'Share link copied to clipboard!',
                    'Share2'
                  );
                  setIsDownloadPopupOpen(false);
                }}
                className="popup-menu-item"
              >
                <div className="menu-item-icon">
                  <Icons.Share2 />
                </div>
                <div className="menu-item-text">
                  <strong>{t('copyLink')}</strong>
                  <span>{language === 'ta' ? 'உடனடி பகிர்வு' : 'Share instant playback'}</span>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Center Play Button Overlay (when paused) */}
        {!isPlaying && !isExporting && (
          <div
            onClick={() => setIsPlaying(true)}
            className="video-center-play-overlay"
            title="Play video"
          >
            <div className="play-circle-glow">
              <Icons.Play />
            </div>
          </div>
        )}

        {/* Export Progress Modal Overlay inside Video Frame */}
        {isExporting && (
          <div className="video-export-overlay">
            <div className="export-spinner-box">
              <div className="export-spinner-icon">
                <Icons.Loader />
              </div>
              <h4>{t('renderingVideo')}</h4>
              <div className="export-progress-track">
                <div
                  className="export-progress-fill"
                  style={{ width: `${exportProgress}%` }}
                ></div>
              </div>
              <span className="export-pct-text">{exportProgress}%</span>
            </div>
          </div>
        )}

        {/* Bottom Video Controls Overlay */}
        <div className="video-controls-overlay">
          {/* Interactive Scrub Bar */}
          <div
            ref={scrubberWrapRef}
            className="video-scrubber-area"
            onMouseDown={handleScrubberMouseDown}
            onTouchStart={handleScrubberSeek}
            onTouchMove={handleScrubberSeek}
            title="Click or drag to scrub playback"
          >
            <div className="video-scrubber-track">
              <div
                className="video-scrubber-fill"
                style={{ width: `${playbackProgress}%` }}
              >
                <div className="scrubber-thumb"></div>
              </div>
            </div>
          </div>

          {/* Bottom Buttons Row */}
          <div className="video-controls-bar">
            <div className="controls-left-group">
              <button
                type="button"
                onClick={() => setIsPlaying((prev) => !prev)}
                className="ctrl-icon-btn"
                title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
              >
                {isPlaying ? <Icons.Pause /> : <Icons.Play />}
              </button>

              <button
                type="button"
                onClick={() => handleStepProgress(-5)}
                className="ctrl-icon-btn"
                title="Step Back 5s"
              >
                <Icons.SkipBack />
              </button>

              <button
                type="button"
                onClick={() => handleStepProgress(5)}
                className="ctrl-icon-btn"
                title="Step Forward 5s"
              >
                <Icons.SkipForward />
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMuted((prev) => !prev);
                  showToast(
                    isMuted
                      ? language === 'ta'
                        ? 'ஒலி இயக்கப்பட்டது'
                        : 'Audio unmuted'
                      : language === 'ta'
                      ? 'ஒலி முடக்கப்பட்டது'
                      : 'Muted',
                    'Volume2'
                  );
                }}
                className="ctrl-icon-btn"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <Icons.VolumeX /> : <Icons.Volume2 />}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsLooping((prev) => !prev);
                  showToast(
                    isLooping
                      ? language === 'ta'
                        ? 'தொடர் சுழற்சி அணைக்கப்பட்டது'
                        : 'Looping disabled'
                      : language === 'ta'
                      ? 'தொடர் சுழற்சி இயக்கப்பட்டது'
                      : 'Looping enabled',
                    'Repeat'
                  );
                }}
                className={`ctrl-icon-btn ${isLooping ? 'active' : ''}`}
                title="Toggle Loop"
              >
                <Icons.Repeat />
              </button>
            </div>

            <div className="controls-right-group">
              <button
                type="button"
                onClick={toggleSpeed}
                className="speed-toggle-btn"
                title="Change Playback Speed"
              >
                {playbackSpeed}x
              </button>

              <button
                type="button"
                onClick={handleFullscreen}
                className="ctrl-icon-btn"
                title="Fullscreen"
              >
                <Icons.Maximize />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Actions Row */}
      <div className="player-card-footer">
        <div className="player-actions-left">
          {onRegenerate && (
            <button
              type="button"
              onClick={onRegenerate}
              className="player-footer-btn"
            >
              <Icons.RotateCw />
              <span>{t('regenerate')}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onSaveToggle}
            className={`player-footer-btn ${video.isSaved ? 'saved' : ''}`}
          >
            {video.isSaved ? <Icons.BookmarkCheck /> : <Icons.Bookmark />}
            <span>{video.isSaved ? t('saved') : t('save')}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              showToast(
                language === 'ta'
                  ? 'பகிர்வு இணைப்பு நகலெடுக்கப்பட்டது!'
                  : 'Share link copied to clipboard!',
                'Share2'
              );
            }}
            className="player-footer-btn"
          >
            <Icons.Share2 />
            <span>{t('share')}</span>
          </button>
        </div>

        <div className="player-engine-tag">
          <span>{t('neuralEngineTag')}</span>
        </div>
      </div>
    </div>
  );
}
