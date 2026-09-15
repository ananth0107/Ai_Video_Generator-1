/**
 * High-Performance Procedural Scene Renderers for 10 Animated Scenery Simulations
 */
import { renderCharacterOnScene } from './characterRenderers';

export function renderSceneryScene(
  ctx,
  width,
  height,
  canvasTime,
  sceneryId = 'golden-sunrise',
  isAiEnhanced = true,
  character = null,
  progress = 0
) {
  switch (sceneryId) {
    case 'aurora-borealis':
      renderAuroraBorealis(ctx, width, height, canvasTime, isAiEnhanced, character, progress);
      break;
    case 'sakura-twilight':
      renderSakuraTwilight(ctx, width, height, canvasTime, isAiEnhanced, character, progress);
      break;
    case 'cyberpunk-city':
      renderCyberpunkCity(ctx, width, height, canvasTime, isAiEnhanced, character, progress);
      break;
    case 'ocean-waves-sunset':
      renderOceanWaves(ctx, width, height, canvasTime, isAiEnhanced, character, progress);
      break;
    case 'cosmic-nebula':
      renderCosmicNebula(ctx, width, height, canvasTime, isAiEnhanced, character, progress);
      break;
    case 'rainforest-waterfall':
      renderRainforestWaterfall(ctx, width, height, canvasTime, isAiEnhanced, character, progress);
      break;
    case 'autumn-forest':
      renderAutumnForest(ctx, width, height, canvasTime, isAiEnhanced, character, progress);
      break;
    case 'desert-starlight':
      renderDesertStarlight(ctx, width, height, canvasTime, isAiEnhanced, character, progress);
      break;
    case 'floating-cloud-city':
      renderFloatingCloudCity(ctx, width, height, canvasTime, isAiEnhanced, character, progress);
      break;
    case 'golden-sunrise':
    default:
      renderGoldenSunrise(ctx, width, height, canvasTime, isAiEnhanced, character, progress);
      break;
  }
}

// 1. Golden Mountain Sunrise
function renderGoldenSunrise(ctx, width, height, canvasTime, isAiEnhanced, character = null, progress = 0) {
  const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
  skyGrad.addColorStop(0, '#0f172a');
  skyGrad.addColorStop(0.35, '#1e1b4b');
  skyGrad.addColorStop(0.65, '#4c1d95');
  skyGrad.addColorStop(0.85, '#be185d');
  skyGrad.addColorStop(1, '#f59e0b');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, width, height);

  const sunY = height * 0.58 - Math.sin(canvasTime * 0.5) * 20;
  const sunX = width * 0.65;
  const sunRadius = 64;

  const sunHalo = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 260);
  sunHalo.addColorStop(0, 'rgba(251, 191, 36, 0.6)');
  sunHalo.addColorStop(0.4, 'rgba(244, 63, 94, 0.25)');
  sunHalo.addColorStop(1, 'rgba(244, 63, 94, 0)');
  ctx.fillStyle = sunHalo;
  ctx.beginPath();
  ctx.arc(sunX, sunY, 260, 0, Math.PI * 2);
  ctx.fill();

  const sunCore = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunRadius);
  sunCore.addColorStop(0, '#fffbeb');
  sunCore.addColorStop(0.7, '#fbbf24');
  sunCore.addColorStop(1, '#f97316');
  ctx.fillStyle = sunCore;
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
  ctx.fill();

  if (isAiEnhanced) {
    ctx.save();
    for (let a = 0; a < 8; a++) {
      const angle = (a * Math.PI / 4) + canvasTime * 0.06;
      const rayGrad = ctx.createLinearGradient(sunX, sunY, sunX + Math.cos(angle) * 520, sunY + Math.sin(angle) * 520);
      rayGrad.addColorStop(0, 'rgba(253, 224, 71, 0.22)');
      rayGrad.addColorStop(0.5, 'rgba(244, 114, 182, 0.08)');
      rayGrad.addColorStop(1, 'rgba(244, 114, 182, 0)');
      ctx.fillStyle = rayGrad;
      ctx.beginPath();
      ctx.moveTo(sunX, sunY);
      ctx.lineTo(sunX + Math.cos(angle - 0.16) * 580, sunY + Math.sin(angle - 0.16) * 580);
      ctx.lineTo(sunX + Math.cos(angle + 0.16) * 580, sunY + Math.sin(angle + 0.16) * 580);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  // Mountain Layer 1 (Back Ridge)
  ctx.fillStyle = 'rgba(46, 16, 101, 0.75)';
  ctx.beginPath();
  ctx.moveTo(0, height);
  ctx.lineTo(0, height * 0.62);
  for (let x = 0; x <= width; x += 120) {
    const my = height * 0.62 - Math.sin(x * 0.004 + 1) * 90 - Math.cos(x * 0.008) * 40;
    ctx.lineTo(x, my);
  }
  ctx.lineTo(width, height);
  ctx.closePath();
  ctx.fill();

  // Mountain Layer 2 (Mid Ridge)
  ctx.fillStyle = 'rgba(24, 9, 66, 0.9)';
  ctx.beginPath();
  ctx.moveTo(0, height);
  ctx.lineTo(0, height * 0.74);
  for (let x = 0; x <= width; x += 80) {
    const hy = height * 0.74 - Math.sin(x * 0.006 + canvasTime * 0.1) * 60 - Math.cos(x * 0.012) * 25;
    ctx.lineTo(x, hy);
  }
  ctx.lineTo(width, height);
  ctx.closePath();
  ctx.fill();

  // Promontory Mountain Peak Crest where character stands
  ctx.save();
  const rockGrad = ctx.createLinearGradient(width * 0.32, height * 0.70, width * 0.48, height * 0.82);
  rockGrad.addColorStop(0, '#1c0f2b');
  rockGrad.addColorStop(0.5, '#0d0718');
  rockGrad.addColorStop(1, '#05020a');
  ctx.fillStyle = rockGrad;
  ctx.beginPath();
  ctx.moveTo(width * 0.30, height * 0.82);
  ctx.lineTo(width * 0.36, height * 0.745);
  ctx.lineTo(width * 0.42, height * 0.735); // Ledge summit
  ctx.lineTo(width * 0.46, height * 0.755);
  ctx.lineTo(width * 0.52, height * 0.83);
  ctx.lineTo(width * 0.30, height * 0.83);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Integrated Character Layer (Natural Subject Integration)
  if (character) {
    renderCharacterOnScene(ctx, width, height, canvasTime, progress, character, isAiEnhanced, {
      sunX,
      sunY,
      sceneryId: 'golden-sunrise'
    });
  }

  // Mountain Layer 3 (Foreground Rock Ridge)
  const fgGrad = ctx.createLinearGradient(0, height * 0.8, 0, height);
  fgGrad.addColorStop(0, '#090514');
  fgGrad.addColorStop(1, '#020108');
  ctx.fillStyle = fgGrad;
  ctx.beginPath();
  ctx.moveTo(0, height);
  ctx.lineTo(0, height * 0.84);
  for (let x = 0; x <= width; x += 60) {
    const fy = height * 0.84 - Math.sin(x * 0.008 + 2) * 35;
    ctx.lineTo(x, fy);
  }
  ctx.lineTo(width, height);
  ctx.closePath();
  ctx.fill();

  // Volumetric Dawn Valley Mist & Clouds (Passing across foreground and character)
  ctx.save();
  for (let m = 0; m < 3; m++) {
    const mistY = height * 0.72 + m * 38;
    const mistX = (canvasTime * 14 * (m + 1) + m * 360) % (width + 500) - 250;
    const mistGrad = ctx.createRadialGradient(mistX, mistY, 20, mistX, mistY, 240);
    mistGrad.addColorStop(0, 'rgba(254, 215, 170, 0.12)');
    mistGrad.addColorStop(0.5, 'rgba(244, 114, 182, 0.06)');
    mistGrad.addColorStop(1, 'rgba(244, 114, 182, 0)');
    ctx.fillStyle = mistGrad;
    ctx.beginPath();
    ctx.ellipse(mistX, mistY, 280, 42, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Soaring Eagles Gliding in the Dawn Sky
  const birds = [
    { bx: (canvasTime * 45 + 150) % (width + 100) - 50, by: height * 0.30 + Math.sin(canvasTime) * 12, s: 1.3 },
    { bx: (canvasTime * 45 + 90) % (width + 100) - 50, by: height * 0.35 + Math.sin(canvasTime + 1) * 10, s: 0.95 },
    { bx: (canvasTime * 45 + 240) % (width + 100) - 50, by: height * 0.26 + Math.sin(canvasTime + 2) * 14, s: 1.1 }
  ];
  birds.forEach((b) => {
    ctx.save();
    ctx.translate(b.bx, b.by);
    ctx.scale(b.s, b.s);
    const wing = Math.sin(canvasTime * 6) * 5;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-10, -wing);
    ctx.quadraticCurveTo(-4, 0, 0, 2);
    ctx.quadraticCurveTo(4, 0, 10, -wing);
    ctx.stroke();
    ctx.restore();
  });
}

// 2. Ethereal Aurora Borealis
function renderAuroraBorealis(ctx, width, height, canvasTime, isAiEnhanced) {
  const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
  skyGrad.addColorStop(0, '#010912');
  skyGrad.addColorStop(0.5, '#021814');
  skyGrad.addColorStop(0.8, '#062822');
  skyGrad.addColorStop(1, '#0a382e');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, width, height);

  // Waving Aurora Curtains
  for (let c = 0; c < 3; c++) {
    const offset = c * 0.8;
    const auroraGrad = ctx.createLinearGradient(0, height * 0.1, 0, height * 0.65);
    if (c === 0) {
      auroraGrad.addColorStop(0, 'rgba(52, 211, 153, 0)');
      auroraGrad.addColorStop(0.5, 'rgba(16, 185, 129, 0.45)');
      auroraGrad.addColorStop(1, 'rgba(5, 150, 105, 0)');
    } else if (c === 1) {
      auroraGrad.addColorStop(0, 'rgba(192, 132, 252, 0)');
      auroraGrad.addColorStop(0.5, 'rgba(168, 85, 247, 0.35)');
      auroraGrad.addColorStop(1, 'rgba(126, 34, 206, 0)');
    } else {
      auroraGrad.addColorStop(0, 'rgba(56, 189, 248, 0)');
      auroraGrad.addColorStop(0.5, 'rgba(45, 212, 191, 0.38)');
      auroraGrad.addColorStop(1, 'rgba(13, 148, 136, 0)');
    }

    ctx.fillStyle = auroraGrad;
    ctx.beginPath();
    ctx.moveTo(0, height * 0.2);
    for (let x = 0; x <= width; x += 40) {
      const y = height * (0.28 + c * 0.08) + Math.sin(x * 0.005 + canvasTime * 0.8 + offset) * 75 + Math.cos(x * 0.01 - canvasTime * 0.5) * 35;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(width, height * 0.65);
    ctx.lineTo(0, height * 0.65);
    ctx.closePath();
    ctx.fill();
  }

  // Snowy Mountain Silhouettes & Glacial Water
  ctx.fillStyle = '#02100d';
  ctx.beginPath();
  ctx.moveTo(0, height);
  ctx.lineTo(0, height * 0.65);
  for (let x = 0; x <= width; x += 100) {
    const my = height * 0.65 - Math.abs(Math.sin(x * 0.006 + 0.5)) * 120;
    ctx.lineTo(x, my);
  }
  ctx.lineTo(width, height);
  ctx.closePath();
  ctx.fill();

  // Lake Reflection
  const lakeGrad = ctx.createLinearGradient(0, height * 0.72, 0, height);
  lakeGrad.addColorStop(0, 'rgba(5, 150, 105, 0.25)');
  lakeGrad.addColorStop(1, '#010b08');
  ctx.fillStyle = lakeGrad;
  ctx.fillRect(0, height * 0.72, width, height * 0.28);
}

// 3. Cherry Blossom Twilight
function renderSakuraTwilight(ctx, width, height, canvasTime, isAiEnhanced) {
  const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
  skyGrad.addColorStop(0, '#1e1035');
  skyGrad.addColorStop(0.5, '#4a154b');
  skyGrad.addColorStop(0.85, '#9d174d');
  skyGrad.addColorStop(1, '#f472b6');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, width, height);

  // Crescent Moon
  const moonX = width * 0.78, moonY = height * 0.25;
  ctx.fillStyle = '#fff1f2';
  ctx.beginPath();
  ctx.arc(moonX, moonY, 34, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2d0f3e';
  ctx.beginPath();
  ctx.arc(moonX + 12, moonY - 6, 28, 0, Math.PI * 2);
  ctx.fill();

  // Japanese Shrine Pagoda Silhouette
  ctx.fillStyle = '#10061e';
  const px = width * 0.18, py = height * 0.52;
  ctx.fillRect(px - 18, py, 36, 120);
  ctx.fillRect(px - 45, py + 30, 90, 8);
  ctx.fillRect(px - 38, py + 70, 76, 8);
  ctx.fillRect(px - 55, py + 110, 110, 10);
  // Pagoda Spire Roofs
  ctx.beginPath();
  ctx.moveTo(px, py - 40);
  ctx.lineTo(px + 40, py);
  ctx.lineTo(px - 40, py);
  ctx.closePath();
  ctx.fill();

  // Lotus River Base
  ctx.fillStyle = '#0f041b';
  ctx.fillRect(0, height * 0.78, width, height * 0.22);

  // Drifting Sakura Petals
  for (let i = 0; i < 40; i++) {
    const seed = i * 47;
    const speed = 1.2 + (seed % 3) * 0.6;
    const px = (seed * 19 + canvasTime * speed * 35) % (width + 80) - 40;
    const py = (seed * 31 + canvasTime * speed * 25 + Math.sin(canvasTime + seed) * 30) % (height + 40) - 20;
    const rot = canvasTime * 2 + seed;

    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(rot);
    ctx.fillStyle = i % 2 === 0 ? '#fbcfe8' : '#f472b6';
    ctx.beginPath();
    ctx.ellipse(0, 0, 6, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// 4. Neon Cyberpunk Metropolis
function renderCyberpunkCity(ctx, width, height, canvasTime, isAiEnhanced) {
  ctx.fillStyle = '#060814';
  ctx.fillRect(0, 0, width, height);

  // Cyber Sky Neon Fog
  const fog = ctx.createLinearGradient(0, height * 0.4, 0, height);
  fog.addColorStop(0, 'rgba(124, 58, 237, 0.2)');
  fog.addColorStop(0.5, 'rgba(236, 72, 153, 0.25)');
  fog.addColorStop(1, 'rgba(6, 182, 212, 0.35)');
  ctx.fillStyle = fog;
  ctx.fillRect(0, height * 0.3, width, height * 0.7);

  // Skyscraper Grid
  const buildingWidths = [90, 120, 80, 140, 100, 110, 130, 95, 150, 105, 120];
  let curX = 0;
  buildingWidths.forEach((bw, bIdx) => {
    const bh = 220 + (bIdx % 4) * 90 + Math.sin(bIdx * 3) * 40;
    const by = height - bh - 60;
    ctx.fillStyle = '#0b0f24';
    ctx.fillRect(curX, by, bw - 10, bh);
    ctx.strokeStyle = '#1e293b';
    ctx.strokeRect(curX, by, bw - 10, bh);

    // Glowing Windows
    for (let wy = by + 20; wy < height - 70; wy += 22) {
      for (let wx = curX + 12; wx < curX + bw - 24; wx += 16) {
        if ((wx + wy + Math.floor(canvasTime * 0.5)) % 5 === 0) {
          ctx.fillStyle = (bIdx % 2 === 0) ? 'rgba(56, 189, 248, 0.8)' : 'rgba(244, 114, 182, 0.8)';
          ctx.fillRect(wx, wy, 8, 12);
        }
      }
    }
    curX += bw;
  });

  // Flying Neon Hovercars with Trails
  const vehicles = [
    { x: (canvasTime * 140) % (width + 300) - 150, y: height * 0.45, color: '#38bdf8' },
    { x: width - ((canvasTime * 160) % (width + 300) - 150), y: height * 0.52, color: '#f43f5e' },
    { x: (canvasTime * 190 + 300) % (width + 300) - 150, y: height * 0.38, color: '#a855f7' }
  ];
  vehicles.forEach((v) => {
    const tailGrad = ctx.createLinearGradient(v.x - 70, v.y, v.x + 20, v.y);
    tailGrad.addColorStop(0, 'rgba(0,0,0,0)');
    tailGrad.addColorStop(1, v.color);
    ctx.fillStyle = tailGrad;
    ctx.fillRect(v.x - 70, v.y - 2, 70, 4);

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(v.x, v.y, 4, 0, Math.PI * 2);
    ctx.fill();
  });
}

// 5. Tropical Ocean Sunset Waves
function renderOceanWaves(ctx, width, height, canvasTime, isAiEnhanced) {
  const skyGrad = ctx.createLinearGradient(0, 0, 0, height * 0.6);
  skyGrad.addColorStop(0, '#0c2340');
  skyGrad.addColorStop(0.4, '#c2410c');
  skyGrad.addColorStop(0.7, '#ea580c');
  skyGrad.addColorStop(1, '#fde047');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, width, height * 0.6);

  // Sunset Sun on Horizon
  const sunX = width * 0.5, sunY = height * 0.52;
  const sunGrad = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 90);
  sunGrad.addColorStop(0, '#fffbeb');
  sunGrad.addColorStop(0.6, '#f97316');
  sunGrad.addColorStop(1, 'rgba(234, 88, 12, 0)');
  ctx.fillStyle = sunGrad;
  ctx.beginPath();
  ctx.arc(sunX, sunY, 90, 0, Math.PI * 2);
  ctx.fill();

  // Multi-layered Ocean Swells
  const waveLayers = [
    { y: height * 0.58, color: '#0369a1', amp: 14, freq: 0.008, speed: 1.2 },
    { y: height * 0.68, color: '#0284c7', amp: 18, freq: 0.006, speed: 1.5 },
    { y: height * 0.78, color: '#0ea5e9', amp: 22, freq: 0.005, speed: 1.8 },
    { y: height * 0.88, color: '#38bdf8', amp: 26, freq: 0.004, speed: 2.1 }
  ];

  waveLayers.forEach((w) => {
    ctx.fillStyle = w.color;
    ctx.beginPath();
    ctx.moveTo(0, height);
    ctx.lineTo(0, w.y);
    for (let x = 0; x <= width; x += 30) {
      const wy = w.y + Math.sin(x * w.freq + canvasTime * w.speed) * w.amp;
      ctx.lineTo(x, wy);
    }
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fill();

    // White Foam Crest
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, w.y + Math.sin(canvasTime * w.speed) * w.amp);
    for (let x = 0; x <= width; x += 30) {
      const wy = w.y + Math.sin(x * w.freq + canvasTime * w.speed) * w.amp;
      ctx.lineTo(x, wy);
    }
    ctx.stroke();
  });
}

// 6. Deep Cosmic Nebula Portal
function renderCosmicNebula(ctx, width, height, canvasTime, isAiEnhanced) {
  ctx.fillStyle = '#030014';
  ctx.fillRect(0, 0, width, height);

  const cx = width / 2, cy = height / 2;

  // Swirling Galaxy Spiral Nebula
  for (let ring = 0; ring < 4; ring++) {
    const r = 90 + ring * 65;
    const nebulaGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, r + 40);
    if (ring === 0) {
      nebulaGrad.addColorStop(0, '#ffffff');
      nebulaGrad.addColorStop(0.4, '#a855f7');
      nebulaGrad.addColorStop(1, 'rgba(76, 29, 149, 0)');
    } else if (ring === 1) {
      nebulaGrad.addColorStop(0, '#38bdf8');
      nebulaGrad.addColorStop(0.6, '#ec4899');
      nebulaGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
    } else {
      nebulaGrad.addColorStop(0, '#818cf8');
      nebulaGrad.addColorStop(0.7, '#4c1d95');
      nebulaGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    }

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(canvasTime * 0.15 * (ring % 2 === 0 ? 1 : -1));
    ctx.fillStyle = nebulaGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, r + 30, r * 0.65, ring * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// 7. Misty Rainforest Waterfall
function renderRainforestWaterfall(ctx, width, height, canvasTime, isAiEnhanced) {
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  bgGrad.addColorStop(0, '#022c22');
  bgGrad.addColorStop(0.6, '#064e3b');
  bgGrad.addColorStop(1, '#065f46');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Jungle Cliff Cliffs
  ctx.fillStyle = '#021812';
  ctx.fillRect(0, 0, width * 0.38, height);
  ctx.fillRect(width * 0.62, 0, width * 0.38, height);

  // Central Waterfall Stream
  const wfX = width * 0.38, wfW = width * 0.24;
  const waterGrad = ctx.createLinearGradient(wfX, 0, wfX + wfW, 0);
  waterGrad.addColorStop(0, '#34d399');
  waterGrad.addColorStop(0.5, '#e0f2fe');
  waterGrad.addColorStop(1, '#38bdf8');
  ctx.fillStyle = waterGrad;
  ctx.fillRect(wfX, 0, wfW, height);

  // Waterfall Flow Lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.lineWidth = 2;
  for (let l = 0; l < 8; l++) {
    const lx = wfX + 12 + l * (wfW / 8.5);
    const offset = (canvasTime * 300 + l * 40) % height;
    ctx.beginPath();
    ctx.moveTo(lx, offset);
    ctx.lineTo(lx, offset + 120);
    ctx.stroke();
  }

  // Mist Cloud Base
  const mistGrad = ctx.createRadialGradient(width / 2, height * 0.88, 20, width / 2, height * 0.88, 220);
  mistGrad.addColorStop(0, 'rgba(240, 253, 250, 0.7)');
  mistGrad.addColorStop(0.7, 'rgba(167, 243, 208, 0.3)');
  mistGrad.addColorStop(1, 'rgba(6, 78, 59, 0)');
  ctx.fillStyle = mistGrad;
  ctx.beginPath();
  ctx.arc(width / 2, height * 0.88, 220, 0, Math.PI * 2);
  ctx.fill();
}

// 8. Enchanted Autumn Birch Forest
function renderAutumnForest(ctx, width, height, canvasTime, isAiEnhanced) {
  const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
  skyGrad.addColorStop(0, '#451a03');
  skyGrad.addColorStop(0.5, '#9a3412');
  skyGrad.addColorStop(0.85, '#ea580c');
  skyGrad.addColorStop(1, '#fde68a');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, width, height);

  // Sunbeams
  ctx.save();
  const beamGrad = ctx.createLinearGradient(0, 0, width, height);
  beamGrad.addColorStop(0, 'rgba(254, 240, 138, 0.25)');
  beamGrad.addColorStop(0.6, 'rgba(251, 146, 60, 0.12)');
  beamGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = beamGrad;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();

  // Birch Tree Trunks
  const treePositions = [100, 240, 390, 560, 720, 890, 1050, 1180];
  treePositions.forEach((tx, idx) => {
    ctx.fillStyle = '#fef3c7';
    ctx.fillRect(tx, height * 0.2, 28, height * 0.8);
    // Dark Birch Marks
    ctx.fillStyle = '#292524';
    for (let m = 0; m < 5; m++) {
      ctx.fillRect(tx, height * 0.3 + m * 80 + (idx * 20) % 40, 16, 6);
    }
  });

  // Falling Autumn Leaves
  for (let i = 0; i < 35; i++) {
    const seed = i * 37;
    const speed = 1.1 + (seed % 3) * 0.5;
    const lx = (seed * 23 + canvasTime * speed * 28) % (width + 60) - 30;
    const ly = (seed * 41 + canvasTime * speed * 38 + Math.sin(canvasTime * 2 + seed) * 20) % (height + 30) - 15;
    ctx.save();
    ctx.translate(lx, ly);
    ctx.rotate(canvasTime * 2 + seed);
    ctx.fillStyle = ['#fbbf24', '#f97316', '#dc2626', '#b45309'][i % 4];
    ctx.beginPath();
    ctx.ellipse(0, 0, 8, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// 9. Sahara Dunes & Starlit Sky
function renderDesertStarlight(ctx, width, height, canvasTime, isAiEnhanced) {
  const skyGrad = ctx.createLinearGradient(0, 0, 0, height * 0.65);
  skyGrad.addColorStop(0, '#020617');
  skyGrad.addColorStop(0.5, '#1e1b4b');
  skyGrad.addColorStop(0.85, '#431407');
  skyGrad.addColorStop(1, '#d97706');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, width, height * 0.65);

  // Dune 1 (Distant)
  ctx.fillStyle = '#92400e';
  ctx.beginPath();
  ctx.moveTo(0, height);
  ctx.lineTo(0, height * 0.6);
  ctx.quadraticCurveTo(width * 0.4, height * 0.52, width, height * 0.68);
  ctx.lineTo(width, height);
  ctx.closePath();
  ctx.fill();

  // Dune 2 (Midground with Crest)
  ctx.fillStyle = '#b45309';
  ctx.beginPath();
  ctx.moveTo(0, height);
  ctx.lineTo(0, height * 0.72);
  ctx.quadraticCurveTo(width * 0.6, height * 0.62, width, height * 0.78);
  ctx.lineTo(width, height);
  ctx.closePath();
  ctx.fill();

  // Dune 3 (Foreground)
  ctx.fillStyle = '#d97706';
  ctx.beginPath();
  ctx.moveTo(0, height);
  ctx.lineTo(0, height * 0.82);
  ctx.quadraticCurveTo(width * 0.35, height * 0.74, width, height * 0.86);
  ctx.lineTo(width, height);
  ctx.closePath();
  ctx.fill();

  // Warm Crest Rim
  ctx.strokeStyle = '#fde047';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(0, height * 0.82);
  ctx.quadraticCurveTo(width * 0.35, height * 0.74, width, height * 0.86);
  ctx.stroke();
}

// 10. Floating Cloud Haven Oasis
function renderFloatingCloudCity(ctx, width, height, canvasTime, isAiEnhanced) {
  const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
  skyGrad.addColorStop(0, '#1e3a8a');
  skyGrad.addColorStop(0.4, '#3b82f6');
  skyGrad.addColorStop(0.75, '#93c5fd');
  skyGrad.addColorStop(1, '#fef08a');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, width, height);

  // Floating Sky Islands
  const islands = [
    { x: width * 0.28, y: height * 0.42, w: 140, h: 45 },
    { x: width * 0.68, y: height * 0.36, w: 180, h: 55 },
    { x: width * 0.5, y: height * 0.56, w: 220, h: 65 }
  ];

  islands.forEach((isl) => {
    // Castle / Spire on top
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(isl.x - 20, isl.y - 45, 40, 45);
    ctx.beginPath();
    ctx.moveTo(isl.x - 30, isl.y - 45);
    ctx.lineTo(isl.x, isl.y - 85);
    ctx.lineTo(isl.x + 30, isl.y - 45);
    ctx.closePath();
    ctx.fill();

    // Island Rock Base
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.moveTo(isl.x - isl.w / 2, isl.y);
    ctx.lineTo(isl.x + isl.w / 2, isl.y);
    ctx.lineTo(isl.x, isl.y + isl.h);
    ctx.closePath();
    ctx.fill();

    // Grass Top
    ctx.fillStyle = '#10b981';
    ctx.fillRect(isl.x - isl.w / 2, isl.y - 6, isl.w, 6);
  });

  // Sea of Clouds at Bottom
  for (let c = 0; c < 8; c++) {
    const cx = (c * 180 + canvasTime * 20) % (width + 200) - 100;
    const cy = height * 0.82 + Math.sin(c + canvasTime * 0.5) * 15;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.beginPath();
    ctx.arc(cx, cy, 110, 0, Math.PI * 2);
    ctx.fill();
  }
}
