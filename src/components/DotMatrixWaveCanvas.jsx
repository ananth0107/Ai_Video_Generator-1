import React, { useRef, useState, useEffect } from 'react';
import './DotMatrixWaveCanvas.css';

// =========================================================================
// 3D TAMIL GLYPH NEURAL SPHERE GENERATION ANIMATION
// =========================================================================
export const TAMIL_MATRIX_GLYPHS = [
  'அ', 'ஆ', 'இ', 'ஈ', 'உ', 'ஊ', 'எ', 'ஏ', 'ஐ', 'ஒ', 'ஓ', 'ஔ', 'ஃ',
  'க', 'ங', 'ச', 'ஞ', 'ட', 'ண', 'த', 'ந', 'ப', 'ம', 'ய', 'ர', 'ல',
  'வ', 'ழ', 'ள', 'ற', 'ன', 'தி', 'மி', 'ழி', 'தை', 'மெ', 'ழீ', 'ஸ்ரீ',
  'சா', 'சு', 'தா', 'து', 'நா', 'பா', 'மா', 'மு', 'யா', 'ரா', 'வா', 'ழா',
  'கா', 'கி', 'சீ', 'தீ', 'நீ', 'பீ', 'மீ', 'லீ', 'வீ', 'ழூ', 'றோ', 'னோ'
];

// 340 Fibonacci 3D Sphere Surface Nodes
export const SPHERE_NODE_COUNT = 340;
export const GOLDEN_RATIO_PHI = Math.PI * (3 - Math.sqrt(5)); // ~2.3999632

export const SPHERE_BASE_NODES = Array.from({ length: SPHERE_NODE_COUNT }, (_, i) => {
  const y = 1 - (i / (SPHERE_NODE_COUNT - 1)) * 2; // from +1 (north pole) to -1 (south pole)
  const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
  const theta = GOLDEN_RATIO_PHI * i;
  const x = Math.cos(theta) * radiusAtY;
  const z = Math.sin(theta) * radiusAtY;
  const glyph = TAMIL_MATRIX_GLYPHS[i % TAMIL_MATRIX_GLYPHS.length];
  return { x, y, z, theta, glyph, index: i };
});

export function DotMatrixWaveCanvas({
  step = 0,
  isGenerating = true,
  startTime = null,
  progressPercent = null,
  progressStatus = '',
  promptSummary = '',
  onCancel = null
}) {
  const canvasRef = useRef(null);
  const [progress, setProgress] = useState(1);

  // Interactive physics pointer state
  const pointerRef = useRef({
    x: -999,
    y: -999,
    lastX: -999,
    lastY: -999,
    vx: 0,
    vy: 0,
    speed: 0,
    isInside: false,
    collapseFactor: 1.0,
    targetCollapse: 1.0,
    lastTime: 0,
    clickSplash: 0
  });

  // Dynamic particle physics array (340 nodes)
  const particlesRef = useRef(
    SPHERE_BASE_NODES.map((node) => ({
      ...node,
      offX: 0,
      offY: 0,
      offZ: 0,
      vx: 0,
      vy: 0,
      vz: 0,
      screenX: 0,
      screenY: 0,
      splashEnergy: 0
    }))
  );

  useEffect(() => {
    if (progressPercent !== null && progressPercent !== undefined) {
      setProgress(Math.round(progressPercent));
      return;
    }

    if (!isGenerating) {
      setProgress(100);
      return;
    }
    const initialStart = startTime || Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - initialStart;
      let p = Math.round(98 * (1 - Math.exp(-elapsed / 8500)));
      if (p < 1) p = 1;
      if (p > 98) p = 98;
      setProgress(p);
    }, 120);
    return () => clearInterval(timer);
  }, [isGenerating, startTime, progressPercent]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;
    let animId;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let width = canvas.offsetWidth || 440;
    let height = canvas.offsetHeight || 440;

    const updateDimensions = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const w = Math.round(rect.width || canvas.offsetWidth || 440);
      const h = Math.round(rect.height || canvas.offsetHeight || 440);
      if (w > 0 && h > 0 && (w !== width || h !== height || canvas.width !== Math.floor(w * dpr))) {
        width = w;
        height = h;
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
      }
    };

    updateDimensions();

    // Pointer Event Listeners for Hover Collapse & Kinetic Splash
    const handlePointerMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const now = performance.now();
      const ptr = pointerRef.current;
      const curX = e.clientX - rect.left;
      const curY = e.clientY - rect.top;

      if (ptr.lastX !== -999 && ptr.lastTime > 0) {
        const dt = Math.max(1, now - ptr.lastTime);
        const dx = curX - ptr.lastX;
        const dy = curY - ptr.lastY;
        const instantSpeed = Math.hypot(dx, dy) / (dt / 16.6);
        ptr.vx = dx * 0.5;
        ptr.vy = dy * 0.5;
        ptr.speed = Math.min(instantSpeed, 50);
      }

      ptr.x = curX;
      ptr.y = curY;
      ptr.lastX = curX;
      ptr.lastY = curY;
      ptr.lastTime = now;
      ptr.isInside = true;
      ptr.targetCollapse = 0.72;
    };

    const handlePointerEnter = (e) => {
      const rect = canvas.getBoundingClientRect();
      const ptr = pointerRef.current;
      ptr.isInside = true;
      ptr.targetCollapse = 0.68;
      ptr.x = e.clientX - rect.left;
      ptr.y = e.clientY - rect.top;
      ptr.lastX = ptr.x;
      ptr.lastY = ptr.y;
      ptr.lastTime = performance.now();
    };

    const handlePointerLeave = () => {
      const ptr = pointerRef.current;
      ptr.isInside = false;
      ptr.targetCollapse = 1.0;
      ptr.speed = 0;
      ptr.x = -999;
      ptr.y = -999;
      ptr.lastX = -999;
      ptr.lastY = -999;
    };

    const handlePointerDown = (e) => {
      const rect = canvas.getBoundingClientRect();
      const ptr = pointerRef.current;
      ptr.clickSplash = 1.0;
      ptr.x = e.clientX - rect.left;
      ptr.y = e.clientY - rect.top;

      // Supernova click impulse: fling letters outward radially
      const particles = particlesRef.current;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const dx = p.screenX - ptr.x;
        const dy = p.screenY - ptr.y;
        const dist = Math.max(12, Math.hypot(dx, dy));
        const force = Math.min(38, (320 / dist) * 16);
        p.vx += (dx / dist) * force + (Math.random() - 0.5) * 8;
        p.vy += (dy / dist) * force + (Math.random() - 0.5) * 8;
        p.vz += (Math.random() - 0.5) * force * 0.8;
        p.splashEnergy = 1.0;
      }
    };

    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerenter', handlePointerEnter);
    canvas.addEventListener('pointerleave', handlePointerLeave);
    canvas.addEventListener('pointerdown', handlePointerDown);

    let time = 0;

    const render = () => {
      try {
        updateDimensions();
        if (width <= 0 || height <= 0) {
          animId = requestAnimationFrame(render);
          return;
        }

        time += 0.018;

        ctx.clearRect(0, 0, width, height);

        const centerX = width * 0.5;
        const centerY = height * 0.46;
        const baseRadius = Math.max(30, Math.min(width, height) * 0.38);

        const ptr = pointerRef.current;

        // Hover collapse physics
        ptr.collapseFactor += (ptr.targetCollapse - ptr.collapseFactor) * 0.08;
        ptr.clickSplash *= 0.92;
        ptr.speed *= 0.88;

        const isFastMovement = ptr.isInside && ptr.speed > 3.2;
        const splashRadius = Math.min(width, height) * 0.48;
        const particles = particlesRef.current;

        // 1. Kinetic Splash & Physics Integration Loop
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];

          if (isFastMovement) {
            const dx = p.screenX - ptr.x;
            const dy = p.screenY - ptr.y;
            const dist = Math.hypot(dx, dy);

            if (dist < splashRadius) {
              const proximity = 1 - dist / splashRadius;
              const impulse = proximity * Math.min(ptr.speed * 2.2, 42);
              const pushX = (ptr.vx * 0.75 + (dist > 0 ? (dx / dist) * 12 : 0)) * proximity;
              const pushY = (ptr.vy * 0.75 + (dist > 0 ? (dy / dist) * 12 : 0)) * proximity;
              p.vx += pushX * 0.45;
              p.vy += pushY * 0.45;
              p.vz += (Math.random() - 0.5) * impulse * 0.4;
              p.splashEnergy = Math.min(1.0, p.splashEnergy + proximity * 0.8);
            }
          }

          if (ptr.isInside && !isFastMovement && ptr.x > 0) {
            const dx = ptr.x - p.screenX;
            const dy = ptr.y - p.screenY;
            const dist = Math.hypot(dx, dy);
            if (dist < 140 && dist > 15) {
              const pull = (1 - dist / 140) * 0.35;
              p.vx += (dx / dist) * pull;
              p.vy += (dy / dist) * pull;
            }
          }

          const springK = 0.042;
          const damping = 0.87;

          p.vx += -springK * p.offX;
          p.vy += -springK * p.offY;
          p.vz += -springK * p.offZ;

          p.vx *= damping;
          p.vy *= damping;
          p.vz *= damping;

          p.offX += p.vx;
          p.offY += p.vy;
          p.offZ += p.vz;

          p.splashEnergy *= 0.94;
        }

        // 2. Pure Transparent Canvas Background (Zero Dark/Black Tints)

        // 3. 3D Rotation Math
        const rotY = time * 0.42;
        const rotX = 0.26 + Math.sin(time * 0.3) * 0.12;
        const rotZ = Math.cos(time * 0.2) * 0.06;

        const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
        const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
        const cosZ = Math.cos(rotZ), sinZ = Math.sin(rotZ);

        // 4. Project 3D Nodes
        const projectedNodes = [];
        const boundMargin = 16;
        const minX = boundMargin;
        const maxX = width - boundMargin;
        const minY = boundMargin;
        const maxY = height - boundMargin;

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];

          const x1 = p.x * cosY - p.z * sinY;
          const z1 = p.x * sinY + p.z * cosY;

          const y2 = p.y * cosX - z1 * sinX;
          const z2 = p.y * sinX + z1 * cosX;

          const x3 = x1 * cosZ - y2 * sinZ;
          const y3 = x1 * sinZ + y2 * cosZ;

          const wave = Math.sin(p.theta * 2.5 - time * 3.0) * 0.065 +
                       Math.cos(p.y * 3.5 + time * 2.0) * 0.035;
          const dynamicRadius = baseRadius * ptr.collapseFactor * (1 + wave + Math.sin(time * 0.9) * 0.02);

          const fov = 380;
          const zDistance = fov - (z2 * dynamicRadius + p.offZ) * 0.45;
          const scale = fov / Math.max(10, zDistance);

          let px = centerX + (x3 * dynamicRadius + p.offX) * scale;
          let py = centerY + (y3 * dynamicRadius + p.offY) * scale;

          if (px < minX) {
            px = minX;
            p.vx = Math.abs(p.vx) * 0.7;
            p.offX = (minX - centerX) / scale - x3 * dynamicRadius;
          } else if (px > maxX) {
            px = maxX;
            p.vx = -Math.abs(p.vx) * 0.7;
            p.offX = (maxX - centerX) / scale - x3 * dynamicRadius;
          }

          if (py < minY) {
            py = minY;
            p.vy = Math.abs(p.vy) * 0.7;
            p.offY = (minY - centerY) / scale - y3 * dynamicRadius;
          } else if (py > maxY) {
            py = maxY;
            p.vy = -Math.abs(p.vy) * 0.7;
            p.offY = (maxY - centerY) / scale - y3 * dynamicRadius;
          }

          p.screenX = px;
          p.screenY = py;

          const depthNorm = Math.max(0, Math.min(1, (z2 + 1) * 0.5));

          projectedNodes.push({
            px,
            py,
            z: z2,
            theta: p.theta,
            depthNorm,
            scale,
            glyph: p.glyph,
            splashEnergy: p.splashEnergy,
            index: i
          });
        }

        // 5. Sort Back-to-Front
        projectedNodes.sort((a, b) => a.z - b.z);

        // 6. Draw Synaptic Filaments
        ctx.lineWidth = 0.75;
        for (let i = 0; i < projectedNodes.length; i++) {
          const p1 = projectedNodes[i];
          if (p1.z < 0.16 && p1.splashEnergy < 0.2) continue;

          for (let j = i + 1; j < projectedNodes.length; j++) {
            const p2 = projectedNodes[j];
            if (p2.z < 0.16 && p2.splashEnergy < 0.2) continue;

            const dx = p1.px - p2.px;
            const dy = p1.py - p2.py;
            const dist = Math.hypot(dx, dy);

            if (dist < 40) {
              const lineAlpha = (1 - dist / 40) * 0.26 * Math.min(p1.depthNorm, p2.depthNorm);
              ctx.beginPath();
              ctx.moveTo(p1.px, p1.py);
              ctx.lineTo(p2.px, p2.py);
              ctx.strokeStyle = p1.depthNorm > 0.75 || p1.splashEnergy > 0.3
                ? `rgba(244, 63, 94, ${lineAlpha})`
                : `rgba(59, 130, 246, ${lineAlpha})`;
              ctx.stroke();
            }
          }
        }

        // 7. Draw Characters
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        for (let i = 0; i < projectedNodes.length; i++) {
          const p = projectedNodes[i];
          const isFront = p.z > 0;
          const isSplashing = p.splashEnergy > 0.15;

          if (isFront || isSplashing) {
            const sizeBonus = isSplashing ? p.splashEnergy * 4 : 0;
            const fontSize = Math.max(8.5, Math.round((9.2 + p.depthNorm * 3.8 + sizeBonus) * p.scale));
            const isApex = p.depthNorm > 0.80 || isSplashing;

            ctx.font = `${isApex ? '750' : '650'} ${fontSize}px "Noto Sans Tamil", system-ui, -apple-system, sans-serif`;

            if (isApex) {
              ctx.fillStyle = isSplashing ? '#ffffff' : '#ff2a85';
              ctx.shadowColor = isSplashing ? '#ff2a85' : '#ff65a3';
              ctx.shadowBlur = isSplashing ? 12 : 8;
              ctx.fillText(p.glyph, p.px, p.py);
              ctx.shadowBlur = 0;
            } else if (p.depthNorm > 0.52) {
              const colorShift = Math.sin(p.theta * 2.0 + time * 1.5);
              if (colorShift > 0.05) {
                const alpha = Math.min(1, 0.85 + p.depthNorm * 0.15 + (isSplashing ? 0.15 : 0));
                ctx.fillStyle = `rgba(244, 63, 94, ${alpha})`;
                ctx.shadowColor = 'rgba(244, 63, 94, 0.45)';
                ctx.shadowBlur = 4;
                ctx.fillText(p.glyph, p.px, p.py);
                ctx.shadowBlur = 0;
              } else {
                const alpha = Math.min(1, 0.82 + p.depthNorm * 0.18 + (isSplashing ? 0.15 : 0));
                ctx.fillStyle = `rgba(59, 130, 246, ${alpha})`;
                ctx.shadowColor = 'rgba(59, 130, 246, 0.4)';
                ctx.shadowBlur = 4;
                ctx.fillText(p.glyph, p.px, p.py);
                ctx.shadowBlur = 0;
              }
            } else {
              const alpha = 0.65 + p.depthNorm * 0.25;
              ctx.fillStyle = `rgba(37, 99, 235, ${alpha})`;
              ctx.fillText(p.glyph, p.px, p.py);
            }
          } else {
            const fontSize = Math.max(6.8, Math.round((7.2 + p.depthNorm * 2.2) * p.scale));
            ctx.font = `500 ${fontSize}px "Noto Sans Tamil", system-ui, -apple-system, sans-serif`;
            const alpha = 0.14 + p.depthNorm * 0.28;
            ctx.fillStyle = `rgba(37, 99, 235, ${alpha})`;
            ctx.fillText(p.glyph, p.px, p.py);
          }
        }
      } catch (e) {
        console.error('Error in 3D Tamil Sphere render loop:', e);
      }

      animId = requestAnimationFrame(render);
    };

    render();

    window.addEventListener('resize', updateDimensions);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', updateDimensions);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerenter', handlePointerEnter);
      canvas.removeEventListener('pointerleave', handlePointerLeave);
      canvas.removeEventListener('pointerdown', handlePointerDown);
    };
  }, []);

  return (
    <div className="dot-matrix-wave-wrapper">
      <canvas
        ref={canvasRef}
        className="dot-matrix-wave-canvas"
        style={{ cursor: 'default', touchAction: 'none' }}
      />

      {/* Dynamic Status / Prompt HUD Header */}
      {(progressStatus || promptSummary) && (
        <div className="dot-matrix-info-overlay">
          {progressStatus && (
            <div className="dot-matrix-status-text">
              <span className="dot-matrix-live-dot" />
              <span>{progressStatus}</span>
            </div>
          )}
          {promptSummary && (
            <div className="dot-matrix-prompt-chip" title={promptSummary}>
              "{promptSummary}"
            </div>
          )}
        </div>
      )}

      {/* Glassmorphism Progress Badge */}
      <div className="dot-matrix-progress-badge" title="Generation progress">
        <span>{progress}%</span>
      </div>

      {/* Cancel Button */}
      {onCancel && progress < 100 && (
        <button
          type="button"
          onClick={onCancel}
          className="dot-matrix-cancel-btn"
          title="Cancel Generation"
        >
          Cancel
        </button>
      )}
    </div>
  );
}

export default DotMatrixWaveCanvas;
