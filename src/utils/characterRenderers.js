/**
 * High-Fidelity Character Rendering & Physics Engine
 * Naturally integrates selected characters (specifically Trisha Krishnan and superstars)
 * into the 4K neural video scene with environment lighting, wind physics, and temporal consistency.
 */

/**
 * Render character integrated seamlessly into the mountain sunrise scene
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

  // Determine character position on the mountain peak rock ledge
  // Rock peak ledge is at approximately x = width * 0.40, y = height * 0.73
  const baseX = width * 0.40;
  const baseY = height * 0.735;

  const sunX = environment.sunX ?? width * 0.65;
  const sunY = environment.sunY ?? height * 0.58;

  ctx.save();

  // Natural subtle breathing motion (chest and shoulders rise and fall at human resting rate ~0.25 Hz)
  const breathCycle = Math.sin(canvasTime * 1.6);
  const breathY = breathCycle * 1.5;
  const breathScale = 1.0 + breathCycle * 0.006;

  // Mountain wind speed & wave equation
  const windGust = Math.sin(canvasTime * 0.8) * 0.3 + 0.7; // gust variation

  // Contact ground shadow on mountain rock
  renderGroundContactShadow(ctx, baseX, baseY, sunX, sunY);

  if (charId.includes('trisha') || charName.includes('trisha')) {
    renderTrishaKrishnan(ctx, baseX, baseY, canvasTime, progress, breathY, breathScale, windGust, sunX, sunY, isAiEnhanced);
  } else if (charId.includes('rajini') || charName.includes('rajini')) {
    renderSuperstarRajini(ctx, baseX, baseY, canvasTime, progress, breathY, breathScale, windGust, sunX, sunY, isAiEnhanced);
  } else if (charId.includes('vijay') || charName.includes('vijay')) {
    renderThalapathyVijay(ctx, baseX, baseY, canvasTime, progress, breathY, breathScale, windGust, sunX, sunY, isAiEnhanced);
  } else if (charId.includes('nayanthara') || charName.includes('nayanthara')) {
    renderNayanthara(ctx, baseX, baseY, canvasTime, progress, breathY, breathScale, windGust, sunX, sunY, isAiEnhanced);
  } else {
    // Universal character renderer for custom or other characters
    renderUniversalCharacter(ctx, baseX, baseY, canvasTime, progress, character, breathY, breathScale, windGust, sunX, sunY, isAiEnhanced);
  }

  ctx.restore();
}

/**
 * Realistic Ground Contact Shadow
 * Softly grounded on the rocky crest according to sun angle
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
 * Photorealistic Character Model: Trisha Krishnan
 * Features:
 * - Timeless royal/cinematic elegance
 * - Waving dark hair strands reacting naturally to mountain breeze
 * - Flowing silk/linen mountain shawl with golden embroidery borders
 * - Subtle realistic facial expressions, eye reflections gazing at the sunrise
 * - Warm golden rim lighting cast along her right contour from the dawn sun
 * - Cool ambient indigo/purple mountain bounce on the shadow side
 */
function renderTrishaKrishnan(ctx, x, y, canvasTime, _progress, breathY, breathScale, windGust, _sunX, _sunY, isAiEnhanced) {
  ctx.save();
  ctx.translate(x, y + breathY);
  ctx.scale(breathScale, breathScale);

  // Natural wind oscillation for hair and clothing
  const windPhase = canvasTime * 3.6;
  const hairFlutter1 = Math.sin(windPhase) * 9 * windGust;
  const hairFlutter2 = Math.cos(windPhase * 0.9 + 1.2) * 12 * windGust;
  const fabricWave1 = Math.sin(windPhase * 0.8) * 10 * windGust;
  const fabricWave2 = Math.cos(windPhase * 1.1 + 0.6) * 14 * windGust;

  // Eye blink calculation: quick blink every ~3.6 seconds
  const blinkTimer = (canvasTime % 3.6);
  const isBlinking = blinkTimer > 3.45 && blinkTimer < 3.58;

  // ==========================================
  // 1. BACK HAIR (Behind neck & shoulders)
  // ==========================================
  ctx.save();
  const backHairGrad = ctx.createLinearGradient(-35, -160, 30 + hairFlutter2, -60);
  backHairGrad.addColorStop(0, '#110b14');
  backHairGrad.addColorStop(0.7, '#1f1322');
  backHairGrad.addColorStop(1, '#0c070d');
  ctx.fillStyle = backHairGrad;
  ctx.beginPath();
  ctx.moveTo(-18, -145);
  ctx.bezierCurveTo(-45, -130, -55 + hairFlutter1 * 0.5, -95, -42 + hairFlutter2, -60);
  ctx.bezierCurveTo(-30 + hairFlutter1, -40, -10 + hairFlutter2, -30, 0, -35);
  ctx.bezierCurveTo(15, -40, 28 + hairFlutter1 * 0.3, -80, 20, -140);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // ==========================================
  // 2. LOWER BODY & FLOWING DRESS / ATTIRE
  // ==========================================
  ctx.save();
  // Deep royal crimson & dusk wine silk gown with soft mountain shadow
  const dressGrad = ctx.createLinearGradient(-40, -110, 45, 15);
  dressGrad.addColorStop(0, '#581c3f');
  dressGrad.addColorStop(0.5, '#42122d');
  dressGrad.addColorStop(1, '#27081a');
  ctx.fillStyle = dressGrad;

  ctx.beginPath();
  ctx.moveTo(-22, -90);
  // Waist to hem
  ctx.bezierCurveTo(-26, -50, -36 + fabricWave1 * 0.3, -15, -42 + fabricWave1, 10);
  ctx.bezierCurveTo(-15 + fabricWave2 * 0.5, 14, 25 + fabricWave1 * 0.5, 12, 38 + fabricWave2, 10);
  ctx.bezierCurveTo(34 + fabricWave1 * 0.4, -20, 24, -55, 20, -90);
  ctx.closePath();
  ctx.fill();

  // Golden embroidered hem border
  ctx.strokeStyle = 'rgba(251, 191, 36, 0.85)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(-42 + fabricWave1, 8);
  ctx.bezierCurveTo(-15 + fabricWave2 * 0.5, 12, 25 + fabricWave1 * 0.5, 10, 38 + fabricWave2, 8);
  ctx.stroke();

  // Soft fabric folds & ripples
  ctx.strokeStyle = 'rgba(244, 114, 182, 0.18)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 3; i++) {
    const fx = -20 + i * 20 + Math.sin(windPhase + i) * 3;
    ctx.beginPath();
    ctx.moveTo(fx * 0.5, -70);
    ctx.quadraticCurveTo(fx * 0.8, -25, fx + fabricWave1 * 0.4, 6);
    ctx.stroke();
  }
  ctx.restore();

  // ==========================================
  // 3. TORSO, BLOUSE & EMBROIDERED SHAWL
  // ==========================================
  ctx.save();
  // Torso base
  const torsoGrad = ctx.createLinearGradient(-25, -135, 25, -85);
  torsoGrad.addColorStop(0, '#6b2149');
  torsoGrad.addColorStop(0.7, '#481331');
  torsoGrad.addColorStop(1, '#340a22');
  ctx.fillStyle = torsoGrad;

  ctx.beginPath();
  ctx.moveTo(-18, -132); // Left shoulder
  ctx.bezierCurveTo(-24, -120, -22, -100, -20, -90);
  ctx.bezierCurveTo(-5, -86, 10, -86, 18, -90);
  ctx.bezierCurveTo(20, -100, 22, -120, 18, -132); // Right shoulder
  ctx.closePath();
  ctx.fill();

  // Elegant flowing mountain shawl (Pallu / Dupatta) fluttering rightwards
  const shawlGrad = ctx.createLinearGradient(-25, -135, 60 + fabricWave2, -60);
  shawlGrad.addColorStop(0, 'rgba(217, 119, 6, 0.95)');
  shawlGrad.addColorStop(0.5, 'rgba(194, 65, 12, 0.85)');
  shawlGrad.addColorStop(1, 'rgba(120, 35, 8, 0.7)');
  ctx.fillStyle = shawlGrad;

  ctx.beginPath();
  ctx.moveTo(-12, -134);
  ctx.bezierCurveTo(0, -125, 20, -120, 32 + fabricWave1 * 0.4, -105);
  ctx.bezierCurveTo(55 + fabricWave2, -90, 68 + fabricWave1, -65, 75 + fabricWave2, -45);
  ctx.bezierCurveTo(62 + fabricWave1, -40, 48 + fabricWave2 * 0.5, -60, 24, -80);
  ctx.bezierCurveTo(15, -95, -5, -115, -12, -134);
  ctx.closePath();
  ctx.fill();

  // Shawl golden trim
  ctx.strokeStyle = 'rgba(254, 240, 138, 0.9)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(18, -130);
  ctx.bezierCurveTo(35, -120, 55 + fabricWave2, -95, 75 + fabricWave2, -45);
  ctx.stroke();
  ctx.restore();

  // ==========================================
  // 4. NECK, COLLAR & JEWELRY
  // ==========================================
  ctx.save();
  // Warm golden-toned Indian complexion with natural ambient bounce
  const skinGrad = ctx.createLinearGradient(-15, -165, 20, -130);
  skinGrad.addColorStop(0, '#fed7aa'); // Warm highlight
  skinGrad.addColorStop(0.5, '#fba777'); // Warm natural tone
  skinGrad.addColorStop(1, '#be673b'); // Soft shadow tone
  ctx.fillStyle = skinGrad;

  // Graceful neck
  ctx.beginPath();
  ctx.moveTo(-9, -145);
  ctx.bezierCurveTo(-10, -138, -13, -132, -14, -130);
  ctx.lineTo(14, -130);
  ctx.bezierCurveTo(13, -138, 10, -145, 9, -145);
  ctx.closePath();
  ctx.fill();

  // Antique emerald & gold neckpiece
  ctx.strokeStyle = 'rgba(251, 191, 36, 0.95)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, -138, 12, 0.2, Math.PI - 0.2);
  ctx.stroke();

  // Emerald center pendant
  ctx.fillStyle = '#059669';
  ctx.beginPath();
  ctx.arc(0, -126, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // ==========================================
  // 5. FACE, JAWLINE & NATURAL PROFILE
  // ==========================================
  ctx.save();
  // Sculpted graceful head & profile turned 3/4 towards the sunrise (rightwards)
  const faceGrad = ctx.createLinearGradient(-16, -175, 18, -145);
  faceGrad.addColorStop(0, '#ffedd5'); // Radiant dawn light on brow
  faceGrad.addColorStop(0.4, '#fdb98a'); // Smooth skin tone
  faceGrad.addColorStop(0.85, '#e07d4b'); // Jaw contour
  faceGrad.addColorStop(1, '#943818'); // Ambient bounce edge
  ctx.fillStyle = faceGrad;

  ctx.beginPath();
  // Hairline at top
  ctx.moveTo(-4, -182);
  // Forehead to brow
  ctx.bezierCurveTo(7, -181, 13, -172, 14, -165);
  // Delicate nose bridge turned towards sunrise
  ctx.bezierCurveTo(17, -163, 19, -159, 18.5, -156);
  ctx.bezierCurveTo(16.5, -155, 14.5, -154, 15, -152);
  // Upper lip, mouth & lower lip
  ctx.bezierCurveTo(16.5, -150, 16.5, -148, 14.5, -146);
  // Gentle chin
  ctx.bezierCurveTo(15, -144, 13, -141, 10, -141);
  // Defined, elegant jawline
  ctx.bezierCurveTo(3, -142, -5, -146, -11, -152);
  // Ear area
  ctx.bezierCurveTo(-14, -158, -13, -168, -8, -175);
  ctx.closePath();
  ctx.fill();

  // ==========================================
  // 6. FACIAL FEATURES: EYE, EYEBROW & LIPS
  // ==========================================
  // Graceful arched eyebrow
  ctx.strokeStyle = '#291811';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(3, -167);
  ctx.quadraticCurveTo(10, -169, 15, -166);
  ctx.stroke();

  // Realistic expressive eye looking towards the sunrise
  if (isBlinking) {
    // Closed eyelid during natural blink
    ctx.strokeStyle = '#431407';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(5, -161);
    ctx.quadraticCurveTo(10, -160, 14, -161);
    ctx.stroke();
  } else {
    // Eye sclera
    ctx.fillStyle = '#fef3c7';
    ctx.beginPath();
    ctx.ellipse(9.5, -162, 4.5, 2.3, 0.08, 0, Math.PI * 2);
    ctx.fill();

    // Dark almond iris
    ctx.fillStyle = '#1c100b';
    ctx.beginPath();
    ctx.arc(10.5, -162, 2.1, 0, Math.PI * 2);
    ctx.fill();

    // Specular golden reflection of the rising sun in pupil
    ctx.fillStyle = '#fffbeb';
    ctx.beginPath();
    ctx.arc(11.2, -162.8, 0.9, 0, Math.PI * 2);
    ctx.fill();

    // Delicate upper lash line
    ctx.strokeStyle = '#1c0a00';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(5, -163);
    ctx.quadraticCurveTo(10, -164.5, 14.5, -162.2);
    ctx.stroke();
  }

  // Soft natural lips with subtle serene smile
  ctx.fillStyle = '#b91c1c';
  ctx.globalAlpha = 0.85;
  ctx.beginPath();
  ctx.moveTo(11.5, -150);
  ctx.quadraticCurveTo(14.5, -151.2, 16.5, -149.8);
  ctx.quadraticCurveTo(14, -148, 11.5, -150);
  ctx.fill();
  ctx.globalAlpha = 1.0;

  // Traditional bindi (delicate red accent)
  ctx.fillStyle = '#991b1b';
  ctx.beginPath();
  ctx.arc(6.5, -168, 1.2, 0, Math.PI * 2);
  ctx.fill();

  // Antique gold jhumka / earring
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.arc(-8, -154, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-8, -152);
  ctx.lineTo(-8 + Math.sin(windPhase) * 1.5, -147);
  ctx.stroke();
  ctx.restore();

  // ==========================================
  // 7. FRONT HAIR & CASCADING BREEZE STRANDS
  // ==========================================
  ctx.save();
  const hairGrad = ctx.createLinearGradient(-15, -188, 35 + hairFlutter1, -120);
  hairGrad.addColorStop(0, '#1c1117');
  hairGrad.addColorStop(0.5, '#2e1925');
  hairGrad.addColorStop(1, '#12090e');
  ctx.fillStyle = hairGrad;

  // Crown & hairline
  ctx.beginPath();
  ctx.moveTo(-16, -165);
  ctx.bezierCurveTo(-20, -185, -5, -194, 8, -188);
  ctx.bezierCurveTo(16, -184, 18, -172, 12, -165);
  ctx.bezierCurveTo(5, -170, -4, -174, -8, -168);
  ctx.bezierCurveTo(-11, -162, -13, -155, -15, -150);
  ctx.closePath();
  ctx.fill();

  // Soft cascading locks rippling in the mountain breeze towards the left/back
  ctx.strokeStyle = '#22111b';
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';

  for (let s = 0; s < 4; s++) {
    const strandOffset = s * 0.4;
    const strandSway = Math.sin(windPhase + strandOffset) * (8 + s * 3) * windGust;
    ctx.beginPath();
    ctx.moveTo(-12 - s * 2, -175 + s * 4);
    ctx.bezierCurveTo(
      -25 - s * 4 + strandSway * 0.5,
      -160 + s * 6,
      -35 - s * 6 + strandSway,
      -130 + s * 10,
      -30 + strandSway * 1.2,
      -95 + s * 14
    );
    ctx.stroke();
  }
  ctx.restore();

  // ==========================================
  // 8. VOLUMETRIC GOLDEN RIM LIGHTING (Dawn Sun Integration)
  // ==========================================
  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  // Sun rim highlight along right profile and shoulder
  const rimGrad = ctx.createLinearGradient(5, -190, 45, -80);
  rimGrad.addColorStop(0, 'rgba(254, 240, 138, 0.9)'); // Bright gold
  rimGrad.addColorStop(0.3, 'rgba(251, 191, 36, 0.7)');
  rimGrad.addColorStop(0.7, 'rgba(249, 115, 22, 0.4)');
  rimGrad.addColorStop(1, 'rgba(244, 63, 94, 0)');

  ctx.strokeStyle = rimGrad;
  ctx.lineWidth = isAiEnhanced ? 3 : 2;
  ctx.lineCap = 'round';

  // Trace illuminated right silhouette
  ctx.beginPath();
  ctx.moveTo(8, -188);
  ctx.bezierCurveTo(16, -184, 18, -172, 14, -165);
  ctx.bezierCurveTo(19, -159, 18.5, -156, 15, -152);
  ctx.bezierCurveTo(16.5, -148, 14.5, -146, 10, -141);
  ctx.bezierCurveTo(14, -135, 18, -132, 22, -120);
  ctx.bezierCurveTo(24, -100, 20, -90, 28, -60);
  ctx.stroke();

  // Subsurface scattering glow on face edge
  const sssGlow = ctx.createRadialGradient(16, -160, 1, 16, -160, 18);
  sssGlow.addColorStop(0, 'rgba(251, 191, 36, 0.45)');
  sssGlow.addColorStop(0.6, 'rgba(244, 63, 94, 0.15)');
  sssGlow.addColorStop(1, 'rgba(244, 63, 94, 0)');
  ctx.fillStyle = sssGlow;
  ctx.beginPath();
  ctx.arc(16, -160, 18, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  ctx.restore();
}

/**
 * Procedural Model: Superstar Rajinikanth
 * Features signature sunglasses, charismatic action trenchcoat, and iconic hairstyle
 */
function renderSuperstarRajini(ctx, x, y, canvasTime, _progress, breathY, breathScale, windGust, _sunX, _sunY, _isAiEnhanced) {
  ctx.save();
  ctx.translate(x, y + breathY);
  ctx.scale(breathScale, breathScale);

  const windPhase = canvasTime * 3.4;
  const coatWave = Math.sin(windPhase) * 12 * windGust;

  // Dark tailored trench coat
  const coatGrad = ctx.createLinearGradient(-35, -130, 45, 15);
  coatGrad.addColorStop(0, '#18181b');
  coatGrad.addColorStop(0.6, '#0f172a');
  coatGrad.addColorStop(1, '#020617');
  ctx.fillStyle = coatGrad;

  ctx.beginPath();
  ctx.moveTo(-24, -128);
  ctx.lineTo(-38 + coatWave, 10);
  ctx.lineTo(36 + coatWave * 0.7, 10);
  ctx.lineTo(24, -128);
  ctx.closePath();
  ctx.fill();

  // Inner shirt with amber scarf
  ctx.fillStyle = '#b45309';
  ctx.beginPath();
  ctx.moveTo(-10, -126);
  ctx.lineTo(0, -90);
  ctx.lineTo(10, -126);
  ctx.closePath();
  ctx.fill();

  // Head & Neck
  ctx.fillStyle = '#d4a373';
  ctx.beginPath();
  ctx.ellipse(0, -156, 16, 20, 0, 0, Math.PI * 2);
  ctx.fill();

  // Signature dynamic hair
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.moveTo(-18, -162);
  ctx.quadraticCurveTo(-26, -188, 0, -186);
  ctx.quadraticCurveTo(24, -188, 18, -162);
  ctx.quadraticCurveTo(0, -172, -18, -162);
  ctx.fill();

  // Iconic stylish dark sunglasses with gold frame
  ctx.fillStyle = '#09090b';
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.roundRect(-14, -160, 12, 7, 2);
  ctx.roundRect(2, -160, 12, 7, 2);
  ctx.fill();
  ctx.stroke();

  // Golden sunrise rim light
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.strokeStyle = 'rgba(251, 191, 36, 0.75)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(14, -180);
  ctx.lineTo(22, -156);
  ctx.lineTo(26, -128);
  ctx.lineTo(36 + coatWave * 0.7, 10);
  ctx.stroke();
  ctx.restore();

  ctx.restore();
}

/**
 * Procedural Model: Thalapathy Vijay
 * Dynamic athletic posture, stylish navy jacket, and sharp screen presence
 */
function renderThalapathyVijay(ctx, x, y, canvasTime, _progress, breathY, breathScale, windGust, _sunX, _sunY, _isAiEnhanced) {
  ctx.save();
  ctx.translate(x, y + breathY);
  ctx.scale(breathScale, breathScale);

  const windPhase = canvasTime * 3.2;
  const jacketWave = Math.sin(windPhase) * 8 * windGust;

  // Navy action jacket
  const jacketGrad = ctx.createLinearGradient(-30, -130, 35, 15);
  jacketGrad.addColorStop(0, '#1e3a8a');
  jacketGrad.addColorStop(0.7, '#0f172a');
  jacketGrad.addColorStop(1, '#020617');
  ctx.fillStyle = jacketGrad;

  ctx.beginPath();
  ctx.moveTo(-22, -126);
  ctx.lineTo(-30 + jacketWave, 10);
  ctx.lineTo(30 + jacketWave * 0.6, 10);
  ctx.lineTo(22, -126);
  ctx.closePath();
  ctx.fill();

  // Head & Neck
  ctx.fillStyle = '#e0a96d';
  ctx.beginPath();
  ctx.ellipse(0, -154, 15, 19, 0, 0, Math.PI * 2);
  ctx.fill();

  // Sharp styled hair
  ctx.fillStyle = '#18181b';
  ctx.beginPath();
  ctx.moveTo(-16, -158);
  ctx.quadraticCurveTo(-22, -182, 0, -182);
  ctx.quadraticCurveTo(22, -180, 16, -158);
  ctx.quadraticCurveTo(0, -168, -16, -158);
  ctx.fill();

  // Golden sunrise rim light
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.strokeStyle = 'rgba(251, 191, 36, 0.75)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(14, -178);
  ctx.lineTo(20, -154);
  ctx.lineTo(24, -126);
  ctx.lineTo(30 + jacketWave * 0.6, 10);
  ctx.stroke();
  ctx.restore();

  ctx.restore();
}

/**
 * Procedural Model: Lady Super Star Nayanthara
 * Regal poise, traditional royal silhouette, and commanding screen presence
 */
function renderNayanthara(ctx, x, y, canvasTime, _progress, breathY, breathScale, windGust, _sunX, _sunY, _isAiEnhanced) {
  ctx.save();
  ctx.translate(x, y + breathY);
  ctx.scale(breathScale, breathScale);

  const windPhase = canvasTime * 3.5;
  const sareeWave = Math.sin(windPhase) * 11 * windGust;

  // Royal purple & gold silk saree
  const sareeGrad = ctx.createLinearGradient(-35, -120, 45, 15);
  sareeGrad.addColorStop(0, '#581c87');
  sareeGrad.addColorStop(0.7, '#3b0764');
  sareeGrad.addColorStop(1, '#1e1b4b');
  ctx.fillStyle = sareeGrad;

  ctx.beginPath();
  ctx.moveTo(-22, -90);
  ctx.bezierCurveTo(-26, -50, -36 + sareeWave * 0.3, -15, -40 + sareeWave, 10);
  ctx.bezierCurveTo(-15, 14, 25, 12, 36 + sareeWave * 0.7, 10);
  ctx.bezierCurveTo(32, -20, 24, -55, 20, -90);
  ctx.closePath();
  ctx.fill();

  // Gold border
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(-40 + sareeWave, 8);
  ctx.bezierCurveTo(-15, 12, 25, 10, 36 + sareeWave * 0.7, 8);
  ctx.stroke();

  // Head & Neck
  ctx.fillStyle = '#f7c59f';
  ctx.beginPath();
  ctx.ellipse(0, -154, 15, 19, 0, 0, Math.PI * 2);
  ctx.fill();

  // Classic regal hair bun & flowing waves
  ctx.fillStyle = '#1e1b4b';
  ctx.beginPath();
  ctx.arc(0, -172, 14, 0, Math.PI * 2);
  ctx.fill();

  // Golden sunrise rim light
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.strokeStyle = 'rgba(251, 191, 36, 0.85)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(10, -182);
  ctx.lineTo(18, -154);
  ctx.lineTo(22, -126);
  ctx.lineTo(36 + sareeWave * 0.7, 10);
  ctx.stroke();
  ctx.restore();

  ctx.restore();
}

/**
 * Universal Fallback for other characters & custom user uploads
 */
function renderUniversalCharacter(ctx, x, y, canvasTime, _progress, character, breathY, breathScale, windGust, _sunX, _sunY, _isAiEnhanced) {
  ctx.save();
  ctx.translate(x, y + breathY);
  ctx.scale(breathScale, breathScale);

  const windPhase = canvasTime * 3.2;
  const clothWave = Math.sin(windPhase) * 8 * windGust;

  // Atmospheric dark silhouette with subtle accent color tint
  ctx.fillStyle = '#0f172a';

  ctx.beginPath();
  ctx.moveTo(-20, -120);
  ctx.lineTo(-28 + clothWave, 10);
  ctx.lineTo(28 + clothWave * 0.5, 10);
  ctx.lineTo(20, -120);
  ctx.closePath();
  ctx.fill();

  // Head
  ctx.fillStyle = '#e2e8f0';
  ctx.beginPath();
  ctx.ellipse(0, -150, 15, 18, 0, 0, Math.PI * 2);
  ctx.fill();

  // Golden rim light
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.strokeStyle = 'rgba(251, 191, 36, 0.7)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(12, -165);
  ctx.lineTo(18, -145);
  ctx.lineTo(22, -120);
  ctx.lineTo(28 + clothWave * 0.5, 10);
  ctx.stroke();
  ctx.restore();

  ctx.restore();
}
