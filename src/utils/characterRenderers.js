/**
 * High-Fidelity Professional Character Rendering & Physics Engine
 * Naturally integrates Google Flow professional characters into 4K neural video scenes
 * with environment lighting, wind physics, realistic posture, and temporal consistency.
 */

/**
 * Render character integrated seamlessly into the scene
 * @param {CanvasRenderingContext2D} ctx 
 * @param {number} width Canvas width
 * @param {number} height Canvas height
 * @param {number} canvasTime Continuous animation time in seconds
 * @param {number} progress Playback progress from 0.0 to 1.0
 * @param {object} character Selected character object
 * @param {boolean} isAiEnhanced Whether AI 4K clarity enhancement is active
 * @param {object} environment Environment context (sunX, sunY, sceneryId)
 */
export function renderCharacterOnScene(
  ctx,
  width,
  height,
  canvasTime,
  progress,
  character,
  isAiEnhanced = true,
  environment = {}
) {
  if (!character) return;

  const charId = (character.id || '').toLowerCase();
  const charName = (character.name || '').toLowerCase();

  // Position character on the foreground focal anchor
  const baseX = width * 0.40;
  const baseY = height * 0.735;

  const sunX = environment.sunX ?? width * 0.65;
  const sunY = environment.sunY ?? height * 0.58;

  ctx.save();

  // Natural subtle breathing motion (~0.25 Hz human resting rate)
  const breathCycle = Math.sin(canvasTime * 1.6);
  const breathY = breathCycle * 1.5;
  const breathScale = 1.0 + breathCycle * 0.005;

  // Mountain / environmental wind oscillation
  const windGust = Math.sin(canvasTime * 0.8) * 0.3 + 0.7;

  // Ground contact shadow
  renderGroundContactShadow(ctx, baseX, baseY, sunX, sunY);

  if (charId.includes('alex') || charName.includes('alex') || charId.includes('executive')) {
    renderExecutiveAlex(ctx, baseX, baseY, canvasTime, progress, breathY, breathScale, windGust, sunX, sunY, isAiEnhanced);
  } else if (charId.includes('marcus') || charName.includes('marcus') || charId.includes('chen')) {
    renderTechArchitectMarcus(ctx, baseX, baseY, canvasTime, progress, breathY, breathScale, windGust, sunX, sunY, isAiEnhanced);
  } else if (charId.includes('sophia') || charName.includes('sophia') || charId.includes('reyes')) {
    renderNewsAnchorSophia(ctx, baseX, baseY, canvasTime, progress, breathY, breathScale, windGust, sunX, sunY, isAiEnhanced);
  } else if (charId.includes('kaelen') || charName.includes('kaelen') || charId.includes('mercer')) {
    renderCyberpunkKael(ctx, baseX, baseY, canvasTime, progress, breathY, breathScale, windGust, sunX, sunY, isAiEnhanced);
  } else if (charId.includes('amara') || charName.includes('amara') || charId.includes('brooks')) {
    renderSciFiCommanderAmara(ctx, baseX, baseY, canvasTime, progress, breathY, breathScale, windGust, sunX, sunY, isAiEnhanced);
  } else if (charId.includes('julian') || charName.includes('julian') || charId.includes('laurent')) {
    renderHighFashionJulian(ctx, baseX, baseY, canvasTime, progress, breathY, breathScale, windGust, sunX, sunY, isAiEnhanced);
  } else if (charId.includes('maya') || charName.includes('maya') || charId.includes('lin')) {
    renderWellnessMaya(ctx, baseX, baseY, canvasTime, progress, breathY, breathScale, windGust, sunX, sunY, isAiEnhanced);
  } else if (charId.includes('leo') || charName.includes('leo') || charId.includes('sterling')) {
    renderExplorerLeo(ctx, baseX, baseY, canvasTime, progress, breathY, breathScale, windGust, sunX, sunY, isAiEnhanced);
  } else if (charId.includes('elena') || charName.includes('elena') || charId.includes('rostova')) {
    renderScientistElena(ctx, baseX, baseY, canvasTime, progress, breathY, breathScale, windGust, sunX, sunY, isAiEnhanced);
  } else if (charId.includes('tariq') || charName.includes('tariq') || charId.includes('mansour')) {
    renderAthleteTariq(ctx, baseX, baseY, canvasTime, progress, breathY, breathScale, windGust, sunX, sunY, isAiEnhanced);
  } else {
    // Universal character renderer for custom or imported characters
    renderUniversalCharacter(ctx, baseX, baseY, canvasTime, progress, character, breathY, breathScale, windGust, sunX, sunY, isAiEnhanced);
  }

  ctx.restore();
}

/**
 * Realistic Ground Contact Shadow
 */
function renderGroundContactShadow(ctx, x, y, sunX, sunY) {
  ctx.save();
  const shadowLength = 70;
  const shadowAngle = Math.atan2(y - sunY, x - sunX);
  const shadowX = x + Math.cos(shadowAngle) * 35;
  const shadowY = y + 14;

  const shadowGrad = ctx.createRadialGradient(shadowX, shadowY, 5, shadowX, shadowY, shadowLength);
  shadowGrad.addColorStop(0, 'rgba(3, 1, 10, 0.75)');
  shadowGrad.addColorStop(0.5, 'rgba(8, 4, 20, 0.4)');
  shadowGrad.addColorStop(1, 'rgba(15, 9, 30, 0)');

  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.ellipse(shadowX, shadowY, shadowLength, 16, 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * 1. Alex Vance - Global Executive & Keynote Speaker
 */
function renderExecutiveAlex(ctx, x, y, canvasTime, _progress, breathY, breathScale, windGust, _sunX, _sunY, isAiEnhanced) {
  ctx.save();
  ctx.translate(x, y + breathY);
  ctx.scale(breathScale, breathScale);

  const windPhase = canvasTime * 3.2;
  const jacketWave = Math.sin(windPhase) * 6 * windGust;

  // Tailored navy suit jacket
  const jacketGrad = ctx.createLinearGradient(-30, -130, 35, 15);
  jacketGrad.addColorStop(0, '#1e3a8a');
  jacketGrad.addColorStop(0.6, '#0f172a');
  jacketGrad.addColorStop(1, '#020617');
  ctx.fillStyle = jacketGrad;

  ctx.beginPath();
  ctx.moveTo(-24, -128);
  ctx.lineTo(-32 + jacketWave, 10);
  ctx.lineTo(32 + jacketWave * 0.6, 10);
  ctx.lineTo(24, -128);
  ctx.closePath();
  ctx.fill();

  // Crisp white dress shirt & blue silk tie
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.moveTo(-10, -128);
  ctx.lineTo(0, -85);
  ctx.lineTo(10, -128);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#2563eb';
  ctx.beginPath();
  ctx.moveTo(-3, -124);
  ctx.lineTo(3, -124);
  ctx.lineTo(2, -75);
  ctx.lineTo(-2, -75);
  ctx.closePath();
  ctx.fill();

  // Head & Neck
  ctx.fillStyle = '#fcd5b8';
  ctx.beginPath();
  ctx.ellipse(0, -156, 16, 20, 0, 0, Math.PI * 2);
  ctx.fill();

  // Modern clean-cut executive hair
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.moveTo(-16, -158);
  ctx.quadraticCurveTo(-22, -184, 0, -184);
  ctx.quadraticCurveTo(22, -182, 16, -158);
  ctx.quadraticCurveTo(0, -168, -16, -158);
  ctx.fill();

  // Golden sunrise rim light
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.strokeStyle = 'rgba(251, 191, 36, 0.8)';
  ctx.lineWidth = isAiEnhanced ? 3 : 2;
  ctx.beginPath();
  ctx.moveTo(14, -180);
  ctx.lineTo(20, -156);
  ctx.lineTo(24, -128);
  ctx.lineTo(32 + jacketWave * 0.6, 10);
  ctx.stroke();
  ctx.restore();

  ctx.restore();
}

/**
 * 2. Marcus Chen - AI Architect & Tech Innovator
 */
function renderTechArchitectMarcus(ctx, x, y, canvasTime, _progress, breathY, breathScale, windGust, _sunX, _sunY, isAiEnhanced) {
  ctx.save();
  ctx.translate(x, y + breathY);
  ctx.scale(breathScale, breathScale);

  const windPhase = canvasTime * 3.0;
  const clothWave = Math.sin(windPhase) * 5 * windGust;

  // Minimalist black turtleneck
  const turtleGrad = ctx.createLinearGradient(-30, -130, 35, 15);
  turtleGrad.addColorStop(0, '#18181b');
  turtleGrad.addColorStop(1, '#09090b');
  ctx.fillStyle = turtleGrad;

  ctx.beginPath();
  ctx.moveTo(-22, -126);
  ctx.lineTo(-28 + clothWave, 10);
  ctx.lineTo(28 + clothWave * 0.6, 10);
  ctx.lineTo(22, -126);
  ctx.closePath();
  ctx.fill();

  // Turtleneck collar
  ctx.fillStyle = '#27272a';
  ctx.beginPath();
  ctx.roundRect(-10, -136, 20, 14, 4);
  ctx.fill();

  // Head & Neck
  ctx.fillStyle = '#fed7aa';
  ctx.beginPath();
  ctx.ellipse(0, -156, 15, 19, 0, 0, Math.PI * 2);
  ctx.fill();

  // Sleek styled dark hair
  ctx.fillStyle = '#09090b';
  ctx.beginPath();
  ctx.moveTo(-15, -158);
  ctx.quadraticCurveTo(-20, -182, 0, -182);
  ctx.quadraticCurveTo(20, -180, 15, -158);
  ctx.quadraticCurveTo(0, -168, -15, -158);
  ctx.fill();

  // Modern smart frames with subtle cyan glow
  ctx.strokeStyle = '#22d3ee';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.roundRect(-12, -160, 10, 6, 2);
  ctx.roundRect(2, -160, 10, 6, 2);
  ctx.stroke();

  // Cyan rim light from futuristic interface
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.strokeStyle = 'rgba(34, 211, 238, 0.75)';
  ctx.lineWidth = isAiEnhanced ? 2.5 : 1.8;
  ctx.beginPath();
  ctx.moveTo(12, -178);
  ctx.lineTo(18, -154);
  ctx.lineTo(22, -126);
  ctx.lineTo(28 + clothWave * 0.6, 10);
  ctx.stroke();
  ctx.restore();

  ctx.restore();
}

/**
 * 3. Sophia Reyes - Broadcast News Anchor & Media Host
 */
function renderNewsAnchorSophia(ctx, x, y, canvasTime, _progress, breathY, breathScale, windGust, _sunX, _sunY, isAiEnhanced) {
  ctx.save();
  ctx.translate(x, y + breathY);
  ctx.scale(breathScale, breathScale);

  const windPhase = canvasTime * 3.4;
  const hairSway = Math.sin(windPhase) * 8 * windGust;

  // Flowing back hair
  ctx.fillStyle = '#18181b';
  ctx.beginPath();
  ctx.ellipse(0, -150, 20, 24, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tailored ruby-red blazer
  const coatGrad = ctx.createLinearGradient(-30, -120, 35, 15);
  coatGrad.addColorStop(0, '#dc2626');
  coatGrad.addColorStop(0.7, '#991b1b');
  coatGrad.addColorStop(1, '#450a0a');
  ctx.fillStyle = coatGrad;

  ctx.beginPath();
  ctx.moveTo(-22, -124);
  ctx.bezierCurveTo(-26, -50, -32, -15, -34, 10);
  ctx.bezierCurveTo(-15, 12, 15, 12, 34, 10);
  ctx.bezierCurveTo(32, -15, 26, -50, 22, -124);
  ctx.closePath();
  ctx.fill();

  // White inner silk top
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(-10, -124);
  ctx.lineTo(0, -88);
  ctx.lineTo(10, -124);
  ctx.closePath();
  ctx.fill();

  // Broadcast lapel microphone pin
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(8, -105, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Head & Neck
  ctx.fillStyle = '#fcd5ce';
  ctx.beginPath();
  ctx.ellipse(0, -154, 15, 19, 0, 0, Math.PI * 2);
  ctx.fill();

  // Sophisticated medium-length hair
  ctx.fillStyle = '#18181b';
  ctx.beginPath();
  ctx.moveTo(-15, -165);
  ctx.quadraticCurveTo(-22, -186, 0, -184);
  ctx.quadraticCurveTo(22, -186, 15, -165);
  ctx.quadraticCurveTo(0, -172, -15, -165);
  ctx.fill();

  // Waving hair strands on side
  ctx.strokeStyle = '#18181b';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-14, -160);
  ctx.quadraticCurveTo(-22 + hairSway * 0.4, -130, -18 + hairSway, -95);
  ctx.stroke();

  // Studio rim light
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.strokeStyle = 'rgba(254, 240, 138, 0.85)';
  ctx.lineWidth = isAiEnhanced ? 2.5 : 1.8;
  ctx.beginPath();
  ctx.moveTo(12, -180);
  ctx.lineTo(18, -154);
  ctx.lineTo(22, -124);
  ctx.lineTo(34, 10);
  ctx.stroke();
  ctx.restore();

  ctx.restore();
}

/**
 * 4. Kaelen Mercer - Cybernetic Detective
 */
function renderCyberpunkKael(ctx, x, y, canvasTime, _progress, breathY, breathScale, windGust, _sunX, _sunY, isAiEnhanced) {
  ctx.save();
  ctx.translate(x, y + breathY);
  ctx.scale(breathScale, breathScale);

  const windPhase = canvasTime * 3.5;
  const coatWave = Math.sin(windPhase) * 11 * windGust;

  // Dark high-collar tactical coat
  const coatGrad = ctx.createLinearGradient(-35, -130, 45, 15);
  coatGrad.addColorStop(0, '#0f0a1e');
  coatGrad.addColorStop(0.7, '#1e1b4b');
  coatGrad.addColorStop(1, '#020617');
  ctx.fillStyle = coatGrad;

  ctx.beginPath();
  ctx.moveTo(-24, -130);
  ctx.lineTo(-36 + coatWave, 10);
  ctx.lineTo(36 + coatWave * 0.7, 10);
  ctx.lineTo(24, -130);
  ctx.closePath();
  ctx.fill();

  // High standing collar
  ctx.fillStyle = '#1e1b4b';
  ctx.beginPath();
  ctx.moveTo(-16, -140);
  ctx.lineTo(-12, -125);
  ctx.lineTo(12, -125);
  ctx.lineTo(16, -140);
  ctx.closePath();
  ctx.fill();

  // Neon violet fiber optic accent line
  ctx.strokeStyle = '#c084fc';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(-14, -138);
  ctx.lineTo(0, -115);
  ctx.lineTo(14, -138);
  ctx.stroke();

  // Head & Neck
  ctx.fillStyle = '#fed7aa';
  ctx.beginPath();
  ctx.ellipse(0, -156, 15, 19, 0, 0, Math.PI * 2);
  ctx.fill();

  // Undercut hairstyle
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.moveTo(-16, -160);
  ctx.quadraticCurveTo(-22, -184, 2, -184);
  ctx.quadraticCurveTo(20, -180, 16, -160);
  ctx.fill();

  // Cybernetic neon violet rim glow
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.strokeStyle = 'rgba(192, 132, 252, 0.85)';
  ctx.lineWidth = isAiEnhanced ? 3 : 2;
  ctx.beginPath();
  ctx.moveTo(14, -180);
  ctx.lineTo(20, -154);
  ctx.lineTo(24, -130);
  ctx.lineTo(36 + coatWave * 0.7, 10);
  ctx.stroke();
  ctx.restore();

  ctx.restore();
}

/**
 * 5. Commander Amara Brooks - Deep Space Mission Commander
 */
function renderSciFiCommanderAmara(ctx, x, y, canvasTime, _progress, breathY, breathScale, windGust, _sunX, _sunY, isAiEnhanced) {
  ctx.save();
  ctx.translate(x, y + breathY);
  ctx.scale(breathScale, breathScale);

  const suitWave = Math.sin(canvasTime * 2.8) * 4 * windGust;

  // Pressurized flight suit
  const suitGrad = ctx.createLinearGradient(-30, -130, 35, 15);
  suitGrad.addColorStop(0, '#f1f5f9');
  suitGrad.addColorStop(0.7, '#cbd5e1');
  suitGrad.addColorStop(1, '#64748b');
  ctx.fillStyle = suitGrad;

  ctx.beginPath();
  ctx.moveTo(-24, -126);
  ctx.lineTo(-30 + suitWave, 10);
  ctx.lineTo(30 + suitWave * 0.6, 10);
  ctx.lineTo(24, -126);
  ctx.closePath();
  ctx.fill();

  // Command telemetry center patch
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(0, -95, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Head & Neck
  ctx.fillStyle = '#dfa06e';
  ctx.beginPath();
  ctx.ellipse(0, -154, 15, 19, 0, 0, Math.PI * 2);
  ctx.fill();

  // Clean pulled back astronaut hair
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.arc(0, -168, 15, 0, Math.PI * 2);
  ctx.fill();

  // Solar amber rim light from orbital viewport
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.9)';
  ctx.lineWidth = isAiEnhanced ? 3 : 2;
  ctx.beginPath();
  ctx.moveTo(12, -180);
  ctx.lineTo(18, -154);
  ctx.lineTo(24, -126);
  ctx.lineTo(30 + suitWave * 0.6, 10);
  ctx.stroke();
  ctx.restore();

  ctx.restore();
}

/**
 * 6. Julian Laurent - Haute Couture Creative Director
 */
function renderHighFashionJulian(ctx, x, y, canvasTime, _progress, breathY, breathScale, windGust, _sunX, _sunY, isAiEnhanced) {
  ctx.save();
  ctx.translate(x, y + breathY);
  ctx.scale(breathScale, breathScale);

  const windPhase = canvasTime * 3.4;
  const scarfWave = Math.sin(windPhase) * 12 * windGust;

  // Structured charcoal overcoat
  ctx.fillStyle = '#18181b';
  ctx.beginPath();
  ctx.moveTo(-25, -128);
  ctx.lineTo(-35, 10);
  ctx.lineTo(35, 10);
  ctx.lineTo(25, -128);
  ctx.closePath();
  ctx.fill();

  // Sculpted flowing magenta silk scarf
  const scarfGrad = ctx.createLinearGradient(-15, -130, 40 + scarfWave, -50);
  scarfGrad.addColorStop(0, '#db2777');
  scarfGrad.addColorStop(1, '#831843');
  ctx.fillStyle = scarfGrad;

  ctx.beginPath();
  ctx.moveTo(-12, -130);
  ctx.quadraticCurveTo(15, -115, 25 + scarfWave * 0.5, -90);
  ctx.quadraticCurveTo(40 + scarfWave, -60, 45 + scarfWave, -40);
  ctx.quadraticCurveTo(30 + scarfWave * 0.6, -55, 15, -85);
  ctx.closePath();
  ctx.fill();

  // Head & Neck
  ctx.fillStyle = '#fed7aa';
  ctx.beginPath();
  ctx.ellipse(0, -156, 15, 19, 0, 0, Math.PI * 2);
  ctx.fill();

  // Avant-garde styled hair
  ctx.fillStyle = '#18181b';
  ctx.beginPath();
  ctx.moveTo(-16, -160);
  ctx.quadraticCurveTo(-24, -188, 0, -186);
  ctx.quadraticCurveTo(22, -184, 16, -160);
  ctx.fill();

  // Magenta editorial rim lighting
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.strokeStyle = 'rgba(244, 63, 94, 0.8)';
  ctx.lineWidth = isAiEnhanced ? 2.5 : 1.8;
  ctx.beginPath();
  ctx.moveTo(14, -182);
  ctx.lineTo(20, -156);
  ctx.lineTo(25, -128);
  ctx.lineTo(35, 10);
  ctx.stroke();
  ctx.restore();

  ctx.restore();
}

/**
 * 7. Maya Lin - Mindfulness Guide & Wellness Host
 */
function renderWellnessMaya(ctx, x, y, canvasTime, _progress, breathY, breathScale, windGust, _sunX, _sunY, isAiEnhanced) {
  ctx.save();
  ctx.translate(x, y + breathY);
  ctx.scale(breathScale, breathScale);

  const windPhase = canvasTime * 3.6;
  const linenWave = Math.sin(windPhase) * 10 * windGust;
  const hairFlutter = Math.sin(windPhase + 1.2) * 8 * windGust;

  // Organic draped linen wrap
  const linenGrad = ctx.createLinearGradient(-35, -120, 35, 15);
  linenGrad.addColorStop(0, '#fef3c7');
  linenGrad.addColorStop(0.7, '#d1fae5');
  linenGrad.addColorStop(1, '#a7f3d0');
  ctx.fillStyle = linenGrad;

  ctx.beginPath();
  ctx.moveTo(-22, -90);
  ctx.bezierCurveTo(-26, -50, -36 + linenWave * 0.3, -15, -38 + linenWave, 10);
  ctx.bezierCurveTo(-15, 12, 25, 12, 36 + linenWave * 0.6, 10);
  ctx.bezierCurveTo(32, -20, 24, -55, 20, -90);
  ctx.closePath();
  ctx.fill();

  // Head & Neck
  ctx.fillStyle = '#fed7aa';
  ctx.beginPath();
  ctx.ellipse(0, -154, 15, 19, 0, 0, Math.PI * 2);
  ctx.fill();

  // Natural waving hair
  ctx.fillStyle = '#1c1917';
  ctx.beginPath();
  ctx.moveTo(-16, -165);
  ctx.quadraticCurveTo(-22, -186, 0, -186);
  ctx.quadraticCurveTo(22, -186, 16, -165);
  ctx.fill();

  // Cascading hair strands reacting to breeze
  ctx.strokeStyle = '#1c1917';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-12, -160);
  ctx.quadraticCurveTo(-24 + hairFlutter * 0.5, -135, -20 + hairFlutter, -90);
  ctx.stroke();

  // Soft emerald / golden sunrise rim light
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.strokeStyle = 'rgba(52, 211, 153, 0.85)';
  ctx.lineWidth = isAiEnhanced ? 2.5 : 1.8;
  ctx.beginPath();
  ctx.moveTo(12, -182);
  ctx.lineTo(18, -154);
  ctx.lineTo(22, -90);
  ctx.lineTo(36 + linenWave * 0.6, 10);
  ctx.stroke();
  ctx.restore();

  ctx.restore();
}

/**
 * 8. Leo Sterling - Expedition Cinematographer
 */
function renderExplorerLeo(ctx, x, y, canvasTime, _progress, breathY, breathScale, windGust, _sunX, _sunY, isAiEnhanced) {
  ctx.save();
  ctx.translate(x, y + breathY);
  ctx.scale(breathScale, breathScale);

  const windPhase = canvasTime * 3.2;
  const parkaWave = Math.sin(windPhase) * 7 * windGust;

  // Weathered utility parka
  const parkaGrad = ctx.createLinearGradient(-30, -130, 35, 15);
  parkaGrad.addColorStop(0, '#3f3f46');
  parkaGrad.addColorStop(1, '#1c1917');
  ctx.fillStyle = parkaGrad;

  ctx.beginPath();
  ctx.moveTo(-24, -126);
  ctx.lineTo(-32 + parkaWave, 10);
  ctx.lineTo(32 + parkaWave * 0.6, 10);
  ctx.lineTo(24, -126);
  ctx.closePath();
  ctx.fill();

  // Camera shoulder strap
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(-20, -120);
  ctx.lineTo(20, -60);
  ctx.stroke();

  // Head & Neck
  ctx.fillStyle = '#e2b17a';
  ctx.beginPath();
  ctx.ellipse(0, -154, 15, 19, 0, 0, Math.PI * 2);
  ctx.fill();

  // Rugged styled hair
  ctx.fillStyle = '#44403c';
  ctx.beginPath();
  ctx.moveTo(-16, -158);
  ctx.quadraticCurveTo(-22, -182, 0, -182);
  ctx.quadraticCurveTo(22, -180, 16, -158);
  ctx.fill();

  // Golden alpine hour rim light
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.strokeStyle = 'rgba(251, 191, 36, 0.85)';
  ctx.lineWidth = isAiEnhanced ? 2.5 : 1.8;
  ctx.beginPath();
  ctx.moveTo(14, -180);
  ctx.lineTo(20, -154);
  ctx.lineTo(24, -126);
  ctx.lineTo(32 + parkaWave * 0.6, 10);
  ctx.stroke();
  ctx.restore();

  ctx.restore();
}

/**
 * 9. Dr. Elena Rostova - Bio-Tech Pioneer
 */
function renderScientistElena(ctx, x, y, canvasTime, _progress, breathY, breathScale, windGust, _sunX, _sunY, isAiEnhanced) {
  ctx.save();
  ctx.translate(x, y + breathY);
  ctx.scale(breathScale, breathScale);

  const labWave = Math.sin(canvasTime * 2.8) * 4 * windGust;

  // Sterile white lab coat
  const coatGrad = ctx.createLinearGradient(-30, -130, 35, 15);
  coatGrad.addColorStop(0, '#ffffff');
  coatGrad.addColorStop(1, '#e2e8f0');
  ctx.fillStyle = coatGrad;

  ctx.beginPath();
  ctx.moveTo(-22, -126);
  ctx.lineTo(-28 + labWave, 10);
  ctx.lineTo(28 + labWave * 0.6, 10);
  ctx.lineTo(22, -126);
  ctx.closePath();
  ctx.fill();

  // Blue inner shirt
  ctx.fillStyle = '#0284c7';
  ctx.beginPath();
  ctx.moveTo(-8, -126);
  ctx.lineTo(0, -90);
  ctx.lineTo(8, -126);
  ctx.closePath();
  ctx.fill();

  // Head & Neck
  ctx.fillStyle = '#fcd5ce';
  ctx.beginPath();
  ctx.ellipse(0, -154, 15, 19, 0, 0, Math.PI * 2);
  ctx.fill();

  // Elegant dark ponytail / hair
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(0, -168, 15, 0, Math.PI * 2);
  ctx.fill();

  // Clean sky blue lab rim light
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
  ctx.lineWidth = isAiEnhanced ? 2.5 : 1.8;
  ctx.beginPath();
  ctx.moveTo(12, -180);
  ctx.lineTo(18, -154);
  ctx.lineTo(22, -126);
  ctx.lineTo(28 + labWave * 0.6, 10);
  ctx.stroke();
  ctx.restore();

  ctx.restore();
}

/**
 * 10. Tariq Mansour - Kinetic Movement Specialist
 */
function renderAthleteTariq(ctx, x, y, canvasTime, _progress, breathY, breathScale, windGust, _sunX, _sunY, isAiEnhanced) {
  ctx.save();
  ctx.translate(x, y + breathY);
  ctx.scale(breathScale, breathScale);

  const windPhase = canvasTime * 3.6;
  const hoodWave = Math.sin(windPhase) * 8 * windGust;

  // Sleek dark athletic techwear hoodie
  const hoodGrad = ctx.createLinearGradient(-30, -130, 35, 15);
  hoodGrad.addColorStop(0, '#18181b');
  hoodGrad.addColorStop(1, '#09090b');
  ctx.fillStyle = hoodGrad;

  ctx.beginPath();
  ctx.moveTo(-22, -126);
  ctx.lineTo(-30 + hoodWave, 10);
  ctx.lineTo(30 + hoodWave * 0.6, 10);
  ctx.lineTo(22, -126);
  ctx.closePath();
  ctx.fill();

  // Techwear purple accent chevron
  ctx.strokeStyle = '#8b5cf6';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(-10, -110);
  ctx.lineTo(0, -95);
  ctx.lineTo(10, -110);
  ctx.stroke();

  // Head & Neck
  ctx.fillStyle = '#dfa06e';
  ctx.beginPath();
  ctx.ellipse(0, -154, 15, 19, 0, 0, Math.PI * 2);
  ctx.fill();

  // Short cropped athletic hair
  ctx.fillStyle = '#18181b';
  ctx.beginPath();
  ctx.moveTo(-15, -158);
  ctx.quadraticCurveTo(-20, -180, 0, -180);
  ctx.quadraticCurveTo(20, -180, 15, -158);
  ctx.fill();

  // Twilight purple rim light
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.strokeStyle = 'rgba(167, 139, 250, 0.85)';
  ctx.lineWidth = isAiEnhanced ? 2.5 : 1.8;
  ctx.beginPath();
  ctx.moveTo(12, -178);
  ctx.lineTo(18, -154);
  ctx.lineTo(22, -126);
  ctx.lineTo(30 + hoodWave * 0.6, 10);
  ctx.stroke();
  ctx.restore();

  ctx.restore();
}

/**
 * Universal Fallback for any custom or archetype characters
 */
function renderUniversalCharacter(ctx, x, y, canvasTime, _progress, character, breathY, breathScale, windGust, _sunX, _sunY, isAiEnhanced) {
  ctx.save();
  ctx.translate(x, y + breathY);
  ctx.scale(breathScale, breathScale);

  const windPhase = canvasTime * 3.2;
  const clothWave = Math.sin(windPhase) * 7 * windGust;

  // Clean dark silhouette with accent color
  const accentColor = character?.accentColor || '#38bdf8';
  ctx.fillStyle = '#0f172a';

  ctx.beginPath();
  ctx.moveTo(-20, -120);
  ctx.lineTo(-28 + clothWave, 10);
  ctx.lineTo(28 + clothWave * 0.5, 10);
  ctx.lineTo(20, -120);
  ctx.closePath();
  ctx.fill();

  // Head
  ctx.fillStyle = '#fed7aa';
  ctx.beginPath();
  ctx.ellipse(0, -150, 15, 18, 0, 0, Math.PI * 2);
  ctx.fill();

  // Hair
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.arc(0, -162, 14, 0, Math.PI * 2);
  ctx.fill();

  // Golden / Accent rim light
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = isAiEnhanced ? 2.5 : 1.8;
  ctx.beginPath();
  ctx.moveTo(12, -165);
  ctx.lineTo(18, -145);
  ctx.lineTo(22, -120);
  ctx.lineTo(28 + clothWave * 0.5, 10);
  ctx.stroke();
  ctx.restore();

  ctx.restore();
}
