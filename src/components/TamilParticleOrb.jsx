import React, { useEffect, useRef, useState } from 'react';
import { Icons } from './Icons';
import { useLanguage } from '../context/LanguageContext';

const TAMIL_GLYPHS = [
  'அ', 'ஆ', 'இ', 'ஈ', 'உ', 'ஊ', 'எ', 'ஏ', 'ஐ', 'ஒ', 'ஓ', 'ஔ',
  'க', 'ச', 'த', 'ப', 'ம', 'ய', 'ர', 'ல', 'வ', 'ழ', 'ள', 'ற', 'ன',
  'ஞ', 'ண', 'தமிழி', 'த்', 'ம்', 'ழ்', 'வி', 'வ', 'தி'
];

const GLOW_COLORS = [
  { text: '#38bdf8', glow: 'rgba(56, 189, 248, 0.8)', rgb: '56, 189, 248' },   // Neon Sky Cyan
  { text: '#818cf8', glow: 'rgba(129, 140, 248, 0.8)', rgb: '129, 140, 248' }, // Electric Indigo
  { text: '#c084fc', glow: 'rgba(192, 132, 252, 0.8)', rgb: '192, 132, 252' }, // Radiant Violet
  { text: '#60a5fa', glow: 'rgba(96, 165, 250, 0.8)', rgb: '96, 165, 250' },   // Bright Blue
  { text: '#fbbf24', glow: 'rgba(251, 191, 36, 0.7)', rgb: '251, 191, 36' },   // Golden Amber
  { text: '#ffffff', glow: 'rgba(255, 255, 255, 0.9)', rgb: '255, 255, 255' }  // Starlight White
];

export default function TamilParticleOrb({
  progressPercent = 0,
  progressStatus = '',
  onCancel = null,
  promptSummary = ''
}) {
  const { language, t } = useLanguage();
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const animFrameIdRef = useRef(null);

  // Smooth lerped percentage for display
  const [displayPercent, setDisplayPercent] = useState(progressPercent || 0);

  // Smoothly interpolate display percentage
  useEffect(() => {
    let animId;
    const target = Math.max(0, Math.min(100, Math.round(progressPercent)));
    
    const step = () => {
      setDisplayPercent((prev) => {
        const diff = target - prev;
        if (Math.abs(diff) < 0.5) return target;
        return prev + diff * 0.12;
      });
      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [progressPercent]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 480);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 420);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      const dpr = window.devicePixelRatio || 1;
      width = canvas.parentElement.clientWidth;
      height = canvas.parentElement.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Particle pool setup
    const particleCount = Math.min(52, Math.max(34, Math.floor(width / 11)));
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      const colorScheme = GLOW_COLORS[Math.floor(Math.random() * GLOW_COLORS.length)];
      const char = TAMIL_GLYPHS[Math.floor(Math.random() * TAMIL_GLYPHS.length)];
      const isBrand = char === 'தமிழி';
      const angle = Math.random() * Math.PI * 2;
      const baseRadius = Math.random() * 110 + (isBrand ? 60 : 45);

      particles.push({
        char,
        isBrand,
        angle,
        baseRadius,
        currentRadius: baseRadius,
        orbitSpeed: (Math.random() * 0.012 + 0.004) * (Math.random() > 0.45 ? 1 : -1),
        radialPhase: Math.random() * Math.PI * 2,
        radialAmp: Math.random() * 26 + 12,
        radialSpeed: Math.random() * 0.02 + 0.01,
        z: Math.random() * 2 - 1, // -1 to 1 depth
        zSpeed: Math.random() * 0.015 + 0.005,
        fontSize: isBrand ? 18 : Math.floor(Math.random() * 14 + 12),
        color: colorScheme,
        opacity: Math.random() * 0.5 + 0.3,
        baseOpacity: Math.random() * 0.4 + 0.5,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() * 0.01 - 0.005) * 0.8
      });
    }

    let time = 0;

    const render = () => {
      time += 0.016;
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // 1. Futuristic Radial Ambient Nebula Glow
      const ambientGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        15,
        centerX,
        centerY,
        Math.min(width, height) * 0.48
      );
      ambientGrad.addColorStop(0, 'rgba(56, 189, 248, 0.12)');
      ambientGrad.addColorStop(0.35, 'rgba(99, 102, 241, 0.09)');
      ambientGrad.addColorStop(0.7, 'rgba(168, 85, 247, 0.04)');
      ambientGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
      ctx.fillStyle = ambientGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Subtle Rotating Concentric Orbit Ring
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(time * 0.25);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.18)';
      ctx.lineWidth = 1;
      ctx.setLineDash([8, 14]);
      ctx.beginPath();
      ctx.arc(0, 0, 78 + Math.sin(time * 1.5) * 3, 0, Math.PI * 2);
      ctx.stroke();

      // Outer secondary orbit ring
      ctx.rotate(-time * 0.4);
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.14)';
      ctx.setLineDash([4, 18]);
      ctx.beginPath();
      ctx.arc(0, 0, 135 + Math.cos(time * 1.2) * 4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // 3. Render and Update Tamil Character Particles
      // Sort by z-index for realistic depth overlapping
      particles.sort((a, b) => a.z - b.z);

      particles.forEach((p) => {
        // Update orbital physics
        p.angle += p.orbitSpeed;
        p.radialPhase += p.radialSpeed;
        p.z += p.zSpeed;
        if (p.z > 1) {
          p.z = -1;
          p.angle = Math.random() * Math.PI * 2;
        }

        p.rotation += p.rotationSpeed;

        // Inward and outward organic pulsation
        const pulse = Math.sin(p.radialPhase) * p.radialAmp;
        const r = p.baseRadius + pulse;

        // 3D elliptical projection
        const depthScale = 0.75 + (p.z + 1) * 0.28; // 0.75 to 1.31
        const x = centerX + Math.cos(p.angle) * r * (1 + p.z * 0.15);
        const y = centerY + Math.sin(p.angle) * (r * 0.72) * depthScale;

        // Calculate opacity with smooth fade at boundaries
        const fade = Math.sin(((p.z + 1) / 2) * Math.PI);
        const currentOpacity = Math.max(0.15, Math.min(0.95, p.baseOpacity * fade));

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(p.rotation);

        const currentFontSize = Math.round(p.fontSize * depthScale);
        ctx.font = `bold ${currentFontSize}px 'Noto Sans Tamil', 'Plus Jakarta Sans', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Soft bloom / glow
        ctx.shadowColor = p.color.glow;
        ctx.shadowBlur = Math.round(12 * depthScale);
        ctx.fillStyle = `rgba(${p.color.rgb}, ${currentOpacity})`;

        ctx.fillText(p.char, 0, 0);

        // Core highlight for extra luminescence
        if (p.z > 0.2) {
          ctx.shadowBlur = 4;
          ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity * 0.7})`;
          ctx.fillText(p.char, 0, 0);
        }

        ctx.restore();
      });

      // 4. Center Glowing Crosshair & Precision Reticle
      ctx.save();
      ctx.translate(centerX, centerY);

      // Center crosshair micro-ticks
      const tickSize = 7;
      const tickDist = 44;
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([]);

      // Top tick
      ctx.beginPath();
      ctx.moveTo(0, -tickDist);
      ctx.lineTo(0, -tickDist - tickSize);
      ctx.stroke();

      // Bottom tick
      ctx.beginPath();
      ctx.moveTo(0, tickDist);
      ctx.lineTo(0, tickDist + tickSize);
      ctx.stroke();

      // Left tick
      ctx.beginPath();
      ctx.moveTo(-tickDist, 0);
      ctx.lineTo(-tickDist - tickSize, 0);
      ctx.stroke();

      // Right tick
      ctx.beginPath();
      ctx.moveTo(tickDist, 0);
      ctx.lineTo(tickDist + tickSize, 0);
      ctx.stroke();

      // Glowing Center Point
      const corePulse = Math.sin(time * 4) * 0.5 + 0.5;
      const centerGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 18);
      centerGrad.addColorStop(0, `rgba(255, 255, 255, ${0.9 * corePulse + 0.1})`);
      centerGrad.addColorStop(0.3, `rgba(56, 189, 248, ${0.6 * corePulse + 0.3})`);
      centerGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = centerGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 18, 0, Math.PI * 2);
      ctx.fill();

      // Center tiny pinpoint
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const roundedPct = Math.round(displayPercent);

  return (
    <div className="tamil-particle-orb-container" ref={containerRef}>
      {/* Background ambient particle canvas */}
      <canvas ref={canvasRef} className="tamil-orb-canvas" />

      {/* Futuristic Center HUD Content */}
      <div className="tamil-orb-hud">
        {/* Glowing Percentage Counter in center */}
        <div className="tamil-orb-pct-wrapper">
          <div className="tamil-orb-pct-glow-ring">
            <span className="tamil-orb-pct-number">{roundedPct}%</span>
          </div>
        </div>

        {/* AI Video Generation Titles & Dynamic Status */}
        <div className="tamil-orb-status-group">
          <h3 className="tamil-orb-main-title">
            {language === 'ta' ? 'வீடியோ உருவாக்கப்படுகிறது...' : 'Generating video...'}
          </h3>
          <p className="tamil-orb-subtitle">
            {progressStatus || (
              language === 'ta'
                ? 'நியூரல் பிரேம்களை ஒருங்கிணைக்கிறது...'
                : 'Synthesizing neural keyframes and diffusion motion...'
            )}
          </p>
        </div>

        {/* Shimmering Linear Progress Bar */}
        <div className="tamil-orb-progress-bar-wrap">
          <div className="tamil-orb-progress-track">
            <div
              className="tamil-orb-progress-fill"
              style={{ width: `${Math.max(6, Math.min(100, displayPercent))}%` }}
            >
              <div className="tamil-orb-progress-shimmer" />
            </div>
          </div>
          <div className="tamil-orb-progress-meta">
            <span className="tamil-orb-brand-tag">
              <span className="tamil-orb-pulse-dot" />
              THAMILI AI Neural Studio
            </span>
            <span className="tamil-orb-pct-badge">{roundedPct}%</span>
          </div>
        </div>

        {/* Optional Prompt Preview */}
        {promptSummary && (
          <div className="tamil-orb-prompt-summary">
            "{promptSummary}"
          </div>
        )}

        {/* Cancel Button */}
        {onCancel && roundedPct < 100 && (
          <button
            type="button"
            onClick={onCancel}
            className="tamil-orb-cancel-btn"
            title={language === 'ta' ? 'உருவாக்கத்தை ரத்து செய்' : 'Cancel Generation'}
          >
            <Icons.X size={13} />
            <span>{t('cancel', 'Cancel')}</span>
          </button>
        )}
      </div>
    </div>
  );
}
