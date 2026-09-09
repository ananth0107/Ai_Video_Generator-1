/**
 * THAMILI AI Video Studio - 10 Predefined Superstar Characters
 * 5 Actors & 5 Actresses with custom-crafted SVG avatars, roles, and cinematic prompts
 */

export const defaultCharacters = [
  // ==========================================
  // ACTORS
  // ==========================================
  {
    id: 'rajinikanth',
    name: 'Rajinikanth',
    gender: 'Actor',
    type: 'Actor',
    category: 'Actor',
    role: 'Superstar & Iconic Action Hero',
    style: 'Cinematic',
    accentColor: '#f59e0b',
    avatarGradient: 'linear-gradient(135deg, #1e1b4b, #78350f, #d97706)',
    avatar: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><defs><linearGradient id="rk-bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%230f172a"/><stop offset="50%" stop-color="%2378350f"/><stop offset="100%" stop-color="%23f59e0b"/></linearGradient><linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="%23fbbf24"/><stop offset="100%" stop-color="%23f59e0b"/></linearGradient></defs><rect width="400" height="400" fill="url(%23rk-bg)"/><circle cx="200" cy="170" r="75" fill="%23d4a373"/><path d="M 125 140 Q 200 60 275 140 L 265 190 Q 200 130 135 190 Z" fill="%231e293b"/><rect x="145" y="152" width="45" height="24" rx="5" fill="%2309090b" stroke="%23fbbf24" stroke-width="2"/><rect x="210" y="152" width="45" height="24" rx="5" fill="%2309090b" stroke="%23fbbf24" stroke-width="2"/><line x1="190" y1="162" x2="210" y2="162" stroke="%23fbbf24" stroke-width="3"/><path d="M 175 208 Q 200 220 225 208" stroke="%23334155" stroke-width="4" fill="none"/><path d="M 100 320 Q 200 250 300 320 L 330 400 L 70 400 Z" fill="%2318181b"/><path d="M 160 270 L 200 320 L 240 270 Z" fill="%23b45309"/><circle cx="200" cy="360" r="14" fill="url(%23gold)"/><text x="200" y="382" fill="%23fef3c7" font-family="sans-serif" font-weight="900" font-size="15" text-anchor="middle">RAJINIKANTH</text></svg>',
    lore: 'The legendary Super Star of Indian cinema, renowned for electrifying charisma, signature sunglasses flip, and unmatched mass screen presence.',
    prompt: 'Rajinikanth as a charismatic super star in a tailored dark trenchcoat and stylish sunglasses walking in slow motion through golden smoke and cheering cinematic crowds, 4K HDR volumetric lighting.',
    imagePrompt: 'Slow dynamic zoom toward Rajinikanth with golden embers swirling in cinematic atmospheric lighting.',
    isDefault: true
  },
  {
    id: 'vijay',
    name: 'Vijay',
    gender: 'Actor',
    type: 'Actor',
    category: 'Actor',
    role: 'Thalapathy & Dynamic Mass Hero',
    style: 'Cinematic',
    accentColor: '#3b82f6',
    avatarGradient: 'linear-gradient(135deg, #0f172a, #1e3a8a, #3b82f6)',
    avatar: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><defs><linearGradient id="vj-bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23090d16"/><stop offset="50%" stop-color="%231e3a8a"/><stop offset="100%" stop-color="%2338bdf8"/></linearGradient></defs><rect width="400" height="400" fill="url(%23vj-bg)"/><circle cx="200" cy="170" r="75" fill="%23e0a96d"/><path d="M 125 130 Q 170 65 270 120 L 260 170 Q 200 120 135 170 Z" fill="%2318181b"/><circle cx="170" cy="165" r="5" fill="%230f172a"/><circle cx="230" cy="165" r="5" fill="%230f172a"/><path d="M 180 205 Q 200 220 220 205" stroke="%230f172a" stroke-width="3" fill="none"/><path d="M 160 215 Q 200 240 240 215" stroke="%23334155" stroke-width="3" stroke-linecap="round" fill="none"/><path d="M 95 320 Q 200 250 305 320 L 335 400 L 65 400 Z" fill="%230f172a"/><path d="M 170 270 L 200 310 L 230 270 Z" fill="%232563eb"/><text x="200" y="380" fill="%2393c5fd" font-family="sans-serif" font-weight="900" font-size="16" text-anchor="middle">VIJAY</text></svg>',
    lore: 'Thalapathy Vijay, celebrated for high-energy dance choreography, unmatched screen charisma, sharp dialogue delivery, and heroic blockbusters.',
    prompt: 'Vijay as a sleek action protagonist in a stylish navy jacket leading a high-octane urban sequence with neon city lights and dynamic rain effects, 4K cinematic render.',
    imagePrompt: 'Fluid camera dolly forward to Vijay as neon reflections and atmospheric rain sweep smoothly across the lens.',
    isDefault: true
  },
  {
    id: 'ajith-kumar',
    name: 'Ajith Kumar',
    gender: 'Actor',
    type: 'Actor',
    category: 'Actor',
    role: 'Ultimate Star & Racer Hero',
    style: 'Realistic',
    accentColor: '#64748b',
    avatarGradient: 'linear-gradient(135deg, #18181b, #334155, #94a3b8)',
    avatar: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><defs><linearGradient id="ak-bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%2309090b"/><stop offset="50%" stop-color="%23334155"/><stop offset="100%" stop-color="%23cbd5e1"/></linearGradient></defs><rect width="400" height="400" fill="url(%23ak-bg)"/><circle cx="200" cy="170" r="75" fill="%23e2b17a"/><path d="M 125 135 Q 200 70 275 135 L 265 175 Q 200 130 135 175 Z" fill="%23cbd5e1"/><rect x="145" y="152" width="45" height="24" rx="4" fill="%230f172a" stroke="%2394a3b8" stroke-width="2"/><rect x="210" y="152" width="45" height="24" rx="4" fill="%230f172a" stroke="%2394a3b8" stroke-width="2"/><line x1="190" y1="162" x2="210" y2="162" stroke="%2394a3b8" stroke-width="2"/><path d="M 160 215 Q 200 235 240 215" stroke="%2394a3b8" stroke-width="4" fill="none"/><path d="M 95 320 Q 200 250 305 320 L 335 400 L 65 400 Z" fill="%2318181b"/><path d="M 160 275 L 200 315 L 240 275 Z" fill="%23475569"/><text x="200" y="380" fill="%23f1f5f9" font-family="sans-serif" font-weight="900" font-size="15" text-anchor="middle">AJITH KUMAR</text></svg>',
    lore: 'AK - Ultimate Star known for dignified screen presence, iconic salt-and-pepper styling, passion for professional racing, and intense action roles.',
    prompt: 'Ajith Kumar in a black racer leather jacket with salt-and-pepper hair leaning against a high-speed superbike during twilight on a coastal highway, 4K cinematic lighting.',
    imagePrompt: 'Smooth camera orbit around Ajith Kumar with golden hour headlight flares and atmospheric ocean mist.',
    isDefault: true
  },
  {
    id: 'suriya',
    name: 'Suriya',
    gender: 'Actor',
    type: 'Actor',
    category: 'Actor',
    role: 'Versatile Maverick & Dramatic Lead',
    style: 'Cinematic',
    accentColor: '#10b981',
    avatarGradient: 'linear-gradient(135deg, #022c22, #047857, #10b981)',
    avatar: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><defs><linearGradient id="su-bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23022c22"/><stop offset="50%" stop-color="%23065f46"/><stop offset="100%" stop-color="%2334d399"/></linearGradient></defs><rect width="400" height="400" fill="url(%23su-bg)"/><circle cx="200" cy="170" r="75" fill="%23dfa06e"/><path d="M 125 125 Q 180 65 275 125 L 265 170 Q 200 120 135 170 Z" fill="%231e293b"/><circle cx="170" cy="165" r="5" fill="%230f172a"/><circle cx="230" cy="165" r="5" fill="%230f172a"/><path d="M 180 205 Q 200 215 220 205" stroke="%230f172a" stroke-width="3" fill="none"/><path d="M 175 220 L 200 240 L 225 220 Z" fill="%230f172a"/><path d="M 95 320 Q 200 250 305 320 L 335 400 L 65 400 Z" fill="%23064e3b"/><path d="M 170 270 L 200 310 L 230 270 Z" fill="%2310b981"/><text x="200" y="380" fill="%23a7f3d0" font-family="sans-serif" font-weight="900" font-size="16" text-anchor="middle">SURIYA</text></svg>',
    lore: 'National Award-winning powerhouse performer renowned for chameleon-like character transformations, intense emotions, and visionary cinema.',
    prompt: 'Suriya in a tactical commander uniform looking intensely across a futuristic flight deck at sunset with dramatic cloud dynamics and volumetric sun rays, 4K HDR.',
    imagePrompt: 'Low angle heroic camera pan around Suriya as golden sunset rays illuminate his determined expression.',
    isDefault: true
  },
  {
    id: 'dhanush',
    name: 'Dhanush',
    gender: 'Actor',
    type: 'Actor',
    category: 'Actor',
    role: 'Intense Cinematic Maestro',
    style: 'Realistic',
    accentColor: '#ec4899',
    avatarGradient: 'linear-gradient(135deg, #3b0764, #831843, #f43f5e)',
    avatar: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><defs><linearGradient id="dh-bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%232e0854"/><stop offset="50%" stop-color="%23701a75"/><stop offset="100%" stop-color="%23f43f5e"/></linearGradient></defs><rect width="400" height="400" fill="url(%23dh-bg)"/><circle cx="200" cy="170" r="75" fill="%23cb8a58"/><path d="M 125 125 Q 160 55 275 130 L 265 175 Q 200 120 135 175 Z" fill="%2318181b"/><circle cx="170" cy="165" r="5" fill="%230f172a"/><circle cx="230" cy="165" r="5" fill="%230f172a"/><path d="M 180 205 Q 200 215 220 205" stroke="%230f172a" stroke-width="3" fill="none"/><path d="M 165 210 Q 200 240 235 210" stroke="%230f172a" stroke-width="3" fill="none"/><path d="M 95 320 Q 200 250 305 320 L 335 400 L 65 400 Z" fill="%231e1b4b"/><path d="M 170 270 L 200 310 L 230 270 Z" fill="%23db2777"/><text x="200" y="380" fill="%23fbcfe8" font-family="sans-serif" font-weight="900" font-size="16" text-anchor="middle">DHANUSH</text></svg>',
    lore: 'Multiple National Award winner and global star acclaimed for naturalistic realism, raw intensity, and captivating screen versatility.',
    prompt: 'Dhanush standing atop a rustic temple staircase at twilight with flowing linen attire, warm oil lamp reflections, and atmospheric cinematic fog, 4K render.',
    imagePrompt: 'Gentle tilt up toward Dhanush as ambient temple lanterns glow warmly in evening mist.',
    isDefault: true
  },

  // ==========================================
  // ACTRESSES
  // ==========================================
  {
    id: 'nayanthara',
    name: 'Nayanthara',
    gender: 'Actress',
    type: 'Actress',
    category: 'Actress',
    role: 'Lady Super Star & Regal Icon',
    style: 'Cinematic',
    accentColor: '#a855f7',
    avatarGradient: 'linear-gradient(135deg, #1e1b4b, #581c87, #c084fc)',
    avatar: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><defs><linearGradient id="ny-bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%231e1b4b"/><stop offset="50%" stop-color="%23581c87"/><stop offset="100%" stop-color="%23e879f9"/></linearGradient></defs><rect width="400" height="400" fill="url(%23ny-bg)"/><circle cx="200" cy="170" r="72" fill="%23f7c59f"/><path d="M 115 150 Q 200 60 285 150 L 295 280 Q 200 330 105 280 Z" fill="%231e1b4b"/><circle cx="170" cy="165" r="5" fill="%234c1d95"/><circle cx="230" cy="165" r="5" fill="%234c1d95"/><circle cx="200" cy="148" r="3" fill="%23b91c1c"/><path d="M 180 205 Q 200 220 220 205" stroke="%23be185d" stroke-width="3" fill="none"/><circle cx="200" cy="115" r="9" fill="%23fbbf24" stroke="%23d97706" stroke-width="2"/><path d="M 95 320 Q 200 260 305 320 L 335 400 L 65 400 Z" fill="%234c1d95"/><path d="M 160 270 L 200 320 L 240 270 Z" fill="%23c084fc"/><text x="200" y="380" fill="%23f5d0fe" font-family="sans-serif" font-weight="900" font-size="16" text-anchor="middle">NAYANTHARA</text></svg>',
    lore: 'Lady Super Star Nayanthara, commanding regal grace, empowering screen authority, and timeless cinematic elegance across Indian cinema.',
    prompt: 'Nayanthara in an elegant royal gold-bordered silk attire standing inside a grand palace courtyard as petals drift through golden sunlight beams, 4K cinematic lighting.',
    imagePrompt: 'Cinematic 360 orbit around Nayanthara with soft glowing rim light and graceful depth of field.',
    isDefault: true
  },
  {
    id: 'trisha-krishnan',
    name: 'Trisha Krishnan',
    gender: 'Actress',
    type: 'Actress',
    category: 'Actress',
    role: 'Timeless Queen of Grace & Poise',
    style: 'Cinematic',
    accentColor: '#38bdf8',
    avatarGradient: 'linear-gradient(135deg, #082f49, #0284c7, #7dd3fc)',
    avatar: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><defs><linearGradient id="tr-bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%230c4a6e"/><stop offset="50%" stop-color="%230369a1"/><stop offset="100%" stop-color="%2338bdf8"/></linearGradient></defs><rect width="400" height="400" fill="url(%23tr-bg)"/><circle cx="200" cy="170" r="72" fill="%23f9d5bb"/><path d="M 115 150 Q 200 60 285 150 L 290 280 Q 200 325 110 280 Z" fill="%230f172a"/><circle cx="170" cy="165" r="5" fill="%230369a1"/><circle cx="230" cy="165" r="5" fill="%230369a1"/><path d="M 180 205 Q 200 220 220 205" stroke="%23e11d48" stroke-width="3" fill="none"/><path d="M 95 320 Q 200 260 305 320 L 335 400 L 65 400 Z" fill="%23082f49"/><path d="M 160 270 L 200 320 L 240 270 Z" fill="%2338bdf8"/><text x="200" y="380" fill="%23e0f2fe" font-family="sans-serif" font-weight="900" font-size="15" text-anchor="middle">TRISHA KRISHNAN</text></svg>',
    lore: 'Enduring icon of grace and majesty, captivating audiences for over two decades with memorable classic roles and historic royal characters.',
    prompt: 'Trisha Krishnan as a historic queen with antique emerald jewelry looking across a peaceful lotus pond at twilight in a majestic ancient heritage palace, 4K render.',
    imagePrompt: 'Gentle forward dolly shot toward Trisha Krishnan with sparkling water reflections and ethereal breeze.',
    isDefault: true
  },
  {
    id: 'samantha-ruth-prabhu',
    name: 'Samantha Ruth Prabhu',
    gender: 'Actress',
    type: 'Actress',
    category: 'Actress',
    role: 'Powerhouse Star & Versatile Lead',
    style: 'Realistic',
    accentColor: '#f43f5e',
    avatarGradient: 'linear-gradient(135deg, #4c0519, #be123c, #fb7185)',
    avatar: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><defs><linearGradient id="sm-bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%234c0519"/><stop offset="50%" stop-color="%239f1239"/><stop offset="100%" stop-color="%23fb7185"/></linearGradient></defs><rect width="400" height="400" fill="url(%23sm-bg)"/><circle cx="200" cy="170" r="72" fill="%23fcd5ce"/><path d="M 120 145 Q 185 60 280 145 L 275 270 Q 200 310 125 270 Z" fill="%2318181b"/><circle cx="170" cy="165" r="5" fill="%23881337"/><circle cx="230" cy="165" r="5" fill="%23881337"/><path d="M 180 205 Q 200 220 220 205" stroke="%23e11d48" stroke-width="3.5" fill="none"/><path d="M 95 320 Q 200 260 305 320 L 335 400 L 65 400 Z" fill="%23881337"/><path d="M 160 270 L 200 315 L 240 270 Z" fill="%23fb7185"/><text x="200" y="380" fill="%23ffe4e6" font-family="sans-serif" font-weight="900" font-size="14" text-anchor="middle">SAMANTHA</text></svg>',
    lore: 'Dynamic, versatile powerhouse celebrated for high-voltage action sequences, infectious charm, emotional depth, and pan-Indian popularity.',
    prompt: 'Samantha Ruth Prabhu in a sharp modern cyberpunk agent outfit overlooking a neon-lit futuristic metropolis during nightfall, 4K cinematic lighting.',
    imagePrompt: 'Dynamic camera tracking shot following Samantha with neon lights reflecting smoothly against sleek modern architecture.',
    isDefault: true
  },
  {
    id: 'keerthy-suresh',
    name: 'Keerthy Suresh',
    gender: 'Actress',
    type: 'Actress',
    category: 'Actress',
    role: 'National Award Winner & Classical Prodigy',
    style: 'Realistic',
    accentColor: '#d97706',
    avatarGradient: 'linear-gradient(135deg, #451a03, #b45309, #fcd34d)',
    avatar: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><defs><linearGradient id="ks-bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23451a03"/><stop offset="50%" stop-color="%2392400e"/><stop offset="100%" stop-color="%23fbbf24"/></linearGradient></defs><rect width="400" height="400" fill="url(%23ks-bg)"/><circle cx="200" cy="170" r="72" fill="%23fed7aa"/><path d="M 115 150 Q 200 65 285 150 L 290 280 Q 200 325 110 280 Z" fill="%23292524"/><circle cx="170" cy="165" r="5" fill="%2378350f"/><circle cx="230" cy="165" r="5" fill="%2378350f"/><circle cx="200" cy="150" r="3" fill="%23991b1b"/><path d="M 180 205 Q 200 220 220 205" stroke="%23dc2626" stroke-width="3" fill="none"/><path d="M 95 320 Q 200 260 305 320 L 335 400 L 65 400 Z" fill="%2378350f"/><path d="M 160 270 L 200 320 L 240 270 Z" fill="%23f59e0b"/><text x="200" y="380" fill="%23fef3c7" font-family="sans-serif" font-weight="900" font-size="15" text-anchor="middle">KEERTHY SURESH</text></svg>',
    lore: 'National Award-winning actress admired for expressive classic performances, emotional resonance, and authentic storytelling.',
    prompt: 'Keerthy Suresh in a classic vintage cinema aesthetic with warm sepia lighting and golden lens flare inside an old-world artistic studio, 4K render.',
    imagePrompt: 'Smooth focus pull to Keerthy Suresh as warm golden light streams through vintage wooden windows.',
    isDefault: true
  },
  {
    id: 'sai-pallavi',
    name: 'Sai Pallavi',
    gender: 'Actress',
    type: 'Actress',
    category: 'Actress',
    role: 'Soulful Dancer & Natural Icon',
    style: 'Realistic',
    accentColor: '#059669',
    avatarGradient: 'linear-gradient(135deg, #022c22, #047857, #6ee7b7)',
    avatar: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><defs><linearGradient id="sp-bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23022c22"/><stop offset="50%" stop-color="%23065f46"/><stop offset="100%" stop-color="%236ee7b7"/></linearGradient></defs><rect width="400" height="400" fill="url(%23sp-bg)"/><circle cx="200" cy="170" r="72" fill="%23fed7aa"/><path d="M 110 145 Q 180 55 290 145 L 295 290 Q 200 340 105 290 Z" fill="%231c1917"/><circle cx="170" cy="165" r="5" fill="%23064e3b"/><circle cx="230" cy="165" r="5" fill="%23064e3b"/><path d="M 180 205 Q 200 220 220 205" stroke="%23e11d48" stroke-width="3" fill="none"/><path d="M 95 320 Q 200 260 305 320 L 335 400 L 65 400 Z" fill="%23064e3b"/><path d="M 160 270 L 200 320 L 240 270 Z" fill="%2310b981"/><text x="200" y="380" fill="%23d1fae5" font-family="sans-serif" font-weight="900" font-size="16" text-anchor="middle">SAI PALLAVI</text></svg>',
    lore: 'Acclaimed for natural beauty without cosmetics, breathtaking classical and freestyle dance prowess, and deeply moving raw character portrayals.',
    prompt: 'Sai Pallavi dancing gracefully in a lush tea plantation mist during sunrise with water droplets on green leaves and golden morning light, 4K cinematic render.',
    imagePrompt: 'Fluid circular camera glide around Sai Pallavi as sunrise rays scatter through lush highland mist.',
    isDefault: true
  }
];
