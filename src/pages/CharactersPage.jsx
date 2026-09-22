import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icons } from '../components/Icons';
import { useCharacters } from '../context/CharacterContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';

// Archetypes directly based on Reference Screenshot 1
const SAMPLE_ARCHETYPES = [
  {
    id: 'the-eccentric',
    name: 'The Eccentric',
    desc: 'Unforgettable quirky humans. Magnetic scene-stealers with offbeat charm.',
    role: 'Quirky Scene-Stealer',
    category: 'Actor',
    style: 'Cinematic',
    prompt: 'The Eccentric, an unforgettable quirky human with whimsical styling, magnetic offbeat charm, expressive cinematic lighting, 4K render.',
    avatar: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><defs><linearGradient id="ecc-bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%237c2d12"/><stop offset="50%" stop-color="%23ea580c"/><stop offset="100%" stop-color="%23f97316"/></linearGradient><linearGradient id="pink-collar" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23f472b6"/><stop offset="100%" stop-color="%23ec4899"/></linearGradient></defs><rect width="200" height="200" rx="14" fill="url(%23ecc-bg)"/><circle cx="100" cy="85" r="42" fill="%23fed7aa"/><path d="M 45 70 Q 100 20 155 70 Q 160 40 135 30 Q 100 20 65 30 Q 40 40 45 70 Z" fill="%23c2410c"/><circle cx="50" cy="65" r="16" fill="%23ea580c"/><circle cx="150" cy="65" r="16" fill="%23ea580c"/><circle cx="85" cy="82" r="4" fill="%230f172a"/><circle cx="115" cy="82" r="4" fill="%230f172a"/><path d="M 90 102 Q 100 112 110 102" stroke="%23c2410c" stroke-width="3" fill="none"/><rect x="50" y="130" width="100" height="40" rx="20" fill="url(%23pink-collar)"/><rect x="65" y="138" width="70" height="24" rx="12" fill="%23db2777"/></svg>'
  },
  {
    id: 'the-professional',
    name: 'The Professional',
    desc: 'Clean cut, well spoken, competent',
    role: 'Competent Specialist',
    category: 'Actor',
    style: 'Realistic',
    prompt: 'The Professional, clean cut, well spoken, competent modern specialist in crisp attire, sharp studio portrait lighting, 4K photorealistic.',
    avatar: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><defs><linearGradient id="pro-bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%231e293b"/><stop offset="100%" stop-color="%23475569"/></linearGradient></defs><rect width="200" height="200" rx="14" fill="url(%23pro-bg)"/><circle cx="100" cy="82" r="42" fill="%23a16207"/><path d="M 60 70 Q 100 35 140 70 L 138 90 Q 100 50 62 90 Z" fill="%230f172a"/><circle cx="86" cy="80" r="4" fill="%230f172a"/><circle cx="114" cy="80" r="4" fill="%230f172a"/><path d="M 92 100 Q 100 106 108 100" stroke="%23451a03" stroke-width="2.5" fill="none"/><path d="M 50 145 Q 100 125 150 145 L 160 200 L 40 200 Z" fill="%23f8fafc"/><path d="M 85 140 L 100 165 L 115 140 Z" fill="%230f172a"/></svg>'
  },
  {
    id: 'the-wildcard',
    name: 'The Wildcard',
    desc: 'Beyond human, anything can be a character, right?',
    role: 'Abstract Entity / Robot',
    category: 'Custom',
    style: '3D',
    prompt: 'The Wildcard, a geometric faceted crystalline entity with glowing internal refraction and iridescent light dispersion, 4K digital art.',
    avatar: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><defs><linearGradient id="wild-bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%233b0764"/><stop offset="50%" stop-color="%236b21a8"/><stop offset="100%" stop-color="%23c084fc"/></linearGradient></defs><rect width="200" height="200" rx="14" fill="url(%23wild-bg)"/><polygon points="100,40 135,70 120,115 80,115 65,70" fill="%23d8b4fe" stroke="%239333ea" stroke-width="3"/><polygon points="100,40 120,75 100,105 80,75" fill="%23f3e8ff"/><circle cx="85" cy="75" r="5" fill="%236b21a8"/><circle cx="115" cy="75" r="5" fill="%236b21a8"/><path d="M 55 135 Q 100 115 145 135 L 160 200 L 40 200 Z" fill="%237e22ce" stroke="%23a855f7" stroke-width="2"/><circle cx="100" cy="155" r="12" fill="%23facc15"/></svg>'
  },
  {
    id: 'the-familiar',
    name: 'The Familiar',
    desc: 'Grounded and authentic, a relatable anchor for your story',
    role: 'Relatable Story Anchor',
    category: 'Actor',
    style: 'Cinematic',
    prompt: 'The Familiar, grounded and authentic character with rugged jacket, warm naturalistic sunset lighting, cinematic depth of field.',
    avatar: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><defs><linearGradient id="fam-bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%2314532d"/><stop offset="100%" stop-color="%23166534"/></linearGradient></defs><rect width="200" height="200" rx="14" fill="url(%23fam-bg)"/><circle cx="100" cy="85" r="42" fill="%23c28552"/><path d="M 60 70 Q 100 35 140 70 L 135 90 Q 100 55 65 90 Z" fill="%231c1917"/><circle cx="86" cy="82" r="4" fill="%231c1917"/><circle cx="114" cy="82" r="4" fill="%231c1917"/><path d="M 90 105 Q 100 110 110 105" stroke="%2344403c" stroke-width="2.5" fill="none"/><path d="M 50 145 Q 100 120 150 145 L 160 200 L 40 200 Z" fill="%233f6212"/><path d="M 85 140 L 100 170 L 115 140 Z" fill="%2327272a"/></svg>'
  },
  {
    id: 'the-wicked',
    name: 'The Wicked',
    desc: 'Powerful antagonistic figures that command the screen',
    role: 'Commanding Antagonist',
    category: 'Actress',
    style: 'Cinematic',
    prompt: 'The Wicked, a powerful commanding antagonist with intense dark futuristic styling, dramatic rim lighting and atmospheric shadows, 4K.',
    avatar: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><defs><linearGradient id="wick-bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%2309090b"/><stop offset="100%" stop-color="%2318181b"/></linearGradient></defs><rect width="200" height="200" rx="14" fill="url(%23wick-bg)"/><circle cx="100" cy="85" r="40" fill="%23e2e8f0"/><path d="M 58 75 Q 100 40 142 75 L 140 115 Q 130 80 100 78 Q 70 80 60 115 Z" fill="%2309090b"/><line x1="62" y1="80" x2="68" y2="105" stroke="%23ffffff" stroke-width="3"/><circle cx="86" cy="82" r="4" fill="%2309090b"/><circle cx="114" cy="82" r="4" fill="%2309090b"/><path d="M 92 105 Q 100 108 108 105" stroke="%2309090b" stroke-width="2" fill="none"/><path d="M 50 145 Q 100 120 150 145 L 165 200 L 35 200 Z" fill="%2309090b" stroke="%23334155" stroke-width="1.5"/></svg>'
  },
  {
    id: 'the-fantastical',
    name: 'The Fantastical',
    desc: 'Ethereal, dreamlike beings fusing the human and the mythical',
    role: 'Mythical Dream Being',
    category: 'Actress',
    style: 'Cinematic',
    prompt: 'The Fantastical, an ethereal dreamlike mythical being with luminous crystalline collar, soft radiant glow and heavenly mist, 4K render.',
    avatar: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><defs><linearGradient id="fan-bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%230e7490"/><stop offset="50%" stop-color="%2306b6d4"/><stop offset="100%" stop-color="%2367e8f9"/></linearGradient></defs><rect width="200" height="200" rx="14" fill="url(%23fan-bg)"/><circle cx="100" cy="85" r="42" fill="%23f8fafc"/><path d="M 58 75 Q 100 35 142 75 L 140 105 Q 100 65 60 105 Z" fill="%23cbd5e1"/><circle cx="86" cy="82" r="4" fill="%230284c7"/><circle cx="114" cy="82" r="4" fill="%230284c7"/><path d="M 92 105 Q 100 110 108 105" stroke="%2338bdf8" stroke-width="2" fill="none"/><path d="M 50 145 Q 100 115 150 145 L 160 200 L 40 200 Z" fill="%23f1f5f9" stroke="%2338bdf8" stroke-width="2"/><polygon points="100,120 115,145 85,145" fill="%2338bdf8"/></svg>'
  }
];

// Helper to generate dynamic stylized avatar SVG based on name and theme
function generateAvatarSvg(name = 'Hero', style = 'Cinematic') {
  const hash = Array.from(name).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hues = [
    { bg1: '#0f172a', bg2: '#38bdf8', skin: '#fed7aa', hair: '#0f172a', accent: '#0284c7' },
    { bg1: '#311042', bg2: '#c084fc', skin: '#fcd34d', hair: '#581c87', accent: '#9333ea' },
    { bg1: '#14532d', bg2: '#4ade80', skin: '#fbcfe8', hair: '#14532d', accent: '#16a34a' },
    { bg1: '#7c2d12', bg2: '#fb923c', skin: '#fed7aa', hair: '#7c2d12', accent: '#ea580c' },
    { bg1: '#1e1b4b', bg2: '#818cf8', skin: '#e2e8f0', hair: '#312e81', accent: '#6366f1' }
  ];
  const theme = hues[hash % hues.length];
  const initial = (name.trim()[0] || 'C').toUpperCase();

  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><defs><linearGradient id="bg-g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${encodeURIComponent(theme.bg1)}"/><stop offset="100%" stop-color="${encodeURIComponent(theme.bg2)}"/></linearGradient><linearGradient id="sh-g" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="transparent"/><stop offset="100%" stop-color="rgba(0,0,0,0.4)"/></linearGradient></defs><rect width="400" height="400" rx="24" fill="url(%23bg-g)"/><circle cx="200" cy="165" r="75" fill="${encodeURIComponent(theme.skin)}"/><path d="M 125 145 Q 200 70 275 145 Q 280 110 245 90 Q 200 75 155 90 Q 120 110 125 145 Z" fill="${encodeURIComponent(theme.hair)}"/><circle cx="170" cy="160" r="7" fill="${encodeURIComponent(theme.bg1)}"/><circle cx="230" cy="160" r="7" fill="${encodeURIComponent(theme.bg1)}"/><path d="M 180 200 Q 200 215 220 200" stroke="${encodeURIComponent(theme.accent)}" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M 100 290 Q 200 230 300 290 L 320 400 L 80 400 Z" fill="${encodeURIComponent(theme.hair)}"/><rect width="400" height="400" fill="url(%23sh-g)" rx="24"/><text x="200" y="365" fill="%23ffffff" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-weight="800" font-size="22" letter-spacing="2" text-anchor="middle">${encodeURIComponent(name.toUpperCase())}</text></svg>`;
}

export default function CharactersPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    allCharacters,
    customCharacters,
    selectedCharacterIds,
    toggleSelectCharacter,
    selectCharacter,
    addCharacter,
    updateCharacter,
    deleteCharacter
  } = useCharacters();

  const { showToast } = useToast();
  const { t, language } = useLanguage();

  // Check if viewing New Character creation route
  const isNewCharRoute = location.pathname.includes('/new') || location.pathname.includes('/create');

  // Workspace Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  // Character Details Modal State
  const [activeDetailCharacter, setActiveDetailCharacter] = useState(null);
  const [isEditingInModal, setIsEditingInModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    role: '',
    lore: '',
    style: 'Cinematic',
    prompt: '',
    imagePrompt: ''
  });

  // New Character Creation State
  const [characterPrompt, setCharacterPrompt] = useState('');
  const [charName, setCharName] = useState('');
  const [charRole, setCharRole] = useState('');
  const [charCategory, setCharCategory] = useState('Actor');
  const [charStyle, setCharStyle] = useState('Cinematic');
  const [charLore, setCharLore] = useState('');
  const [uploadedImage, setUploadedImage] = useState('');
  const [uploadedImageName, setUploadedImageName] = useState('');
  const [selectedArchetypeId, setSelectedArchetypeId] = useState(null);
  const [selectedModel, setSelectedModel] = useState('Thamili Neural v2');
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showProjectImportModal, setShowProjectImportModal] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const fileInputRef = useRef(null);

  // Auto preset if query param has ?preset=avatar
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('preset') === 'avatar') {
      setCharName('My Digital Avatar');
      setCharRole('Personalized Digital Twin');
      setCharCategory('Actor');
      setCharStyle('Realistic');
      setCharLore('Hyper-realistic personalized digital twin avatar for seamless storytelling and video generation.');
      setCharacterPrompt('Personalized digital avatar twin in modern studio lighting, photorealistic 4K render.');
      setUploadedImage(generateAvatarSvg('My Digital Avatar', 'Realistic'));
    }
  }, [location.search]);

  // Filter characters in workspace
  const filteredCharacters = allCharacters.filter((char) => {
    const isActor = char.gender === 'Actor' || char.category === 'Actor' || (char.category !== 'Actress' && !char.isCustom);
    const isActress = char.gender === 'Actress' || char.category === 'Actress';

    const matchesCategory =
      activeCategory === 'All'
        ? true
        : activeCategory === 'Actors'
        ? isActor
        : activeCategory === 'Actresses'
        ? isActress
        : activeCategory === 'Custom'
        ? char.isCustom
        : true;

    const matchesSearch =
      searchQuery.trim() === ''
        ? true
        : char.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (char.role && char.role.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (char.lore && char.lore.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const handleImageUpload = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      showToast(
        language === 'ta'
          ? 'சரியான படக் கோப்பைப் பதிவேற்றவும் (PNG, JPG, WebP)'
          : 'Please upload a valid image file (PNG, JPG, WebP)',
        'Settings'
      );
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target.result);
      setUploadedImageName(file.name);
      showToast(
        language === 'ta' ? 'படம் வெற்றிகரமாக பதிவேற்றப்பட்டது!' : 'Portrait uploaded successfully!',
        'Check'
      );
    };
    reader.readAsDataURL(file);
  };

  const handleSelectArchetype = (archetype) => {
    setSelectedArchetypeId(archetype.id);
    setCharName(archetype.name);
    setCharRole(archetype.role);
    setCharCategory(archetype.category);
    setCharStyle(archetype.style);
    setCharLore(archetype.desc);
    setCharacterPrompt(archetype.prompt);
    setUploadedImage(archetype.avatar);
    setUploadedImageName(`${archetype.id}.svg`);
    showToast(
      language === 'ta'
        ? `${archetype.name} மாதிரி தேர்ந்தெடுக்கப்பட்டது!`
        : `Selected sample prompt for ${archetype.name}!`,
      'Sparkles'
    );
  };

  const handleImportFromCharacter = (char) => {
    setCharName(`${char.name} (Copy)`);
    setCharRole(char.role || 'Cinematic Persona');
    setCharCategory(char.category || char.gender || 'Actor');
    setCharStyle(char.style || 'Cinematic');
    setCharLore(char.lore || '');
    setCharacterPrompt(char.prompt || '');
    setUploadedImage(char.avatar || '');
    setUploadedImageName(`${char.name}_portrait.png`);
    setShowProjectImportModal(false);
    showToast(
      language === 'ta' ? `${char.name} தகவல் இறக்குமதி செய்யப்பட்டது!` : `Imported from ${char.name}!`,
      'Sparkles'
    );
  };

  const handleGenerateImageFromDescription = () => {
    setIsGeneratingImage(true);
    const targetName = charName.trim() || 'New Character';
    const targetStyle = charStyle || 'Cinematic';

    setTimeout(() => {
      const generatedSvg = generateAvatarSvg(targetName, targetStyle);
      setUploadedImage(generatedSvg);
      setUploadedImageName(`${targetName.toLowerCase().replace(/\s+/g, '_')}_generated.svg`);
      setIsGeneratingImage(false);
      showToast(
        language === 'ta'
          ? 'விளக்கத்திலிருந்து புதிய உருவப்படம் உருவாக்கப்பட்டது!'
          : 'Generated portrait from character description!',
        'Sparkles'
      );
    }, 600);
  };

  const handleSaveCharacter = (redirectTo = null) => {
    const finalName = charName.trim() || 'New Character';
    const finalPrompt =
      characterPrompt.trim() ||
      `${finalName}, cinematic character portrait in dynamic studio lighting, 4K render.`;

    const finalAvatar = uploadedImage || generateAvatarSvg(finalName, charStyle);

    const created = addCharacter({
      name: finalName,
      gender: charCategory === 'Actress' ? 'Actress' : 'Actor',
      role: charRole.trim() || 'Custom Persona',
      category: charCategory,
      style: charStyle,
      lore: charLore.trim() || `Custom character persona generated for consistent video productions.`,
      prompt: finalPrompt,
      imagePrompt: `Cinematic camera zoom and lighting sweep around ${finalName}.`,
      avatar: finalAvatar,
      avatarGradient: 'linear-gradient(135deg, #1e1b4b, #4f46e5, #ec4899)',
      accentColor: '#6366f1'
    });

    showToast(
      language === 'ta' ? `${created.name} வெற்றிகரமாக உருவாக்கப்பட்டது!` : `Character ${created.name} saved to Library!`,
      'Check'
    );

    if (redirectTo === 'prompt') {
      navigate('/prompt-to-video', {
        state: { presetPrompt: created.prompt, presetStyle: created.style }
      });
    } else if (redirectTo === 'image') {
      navigate('/image-to-video', {
        state: { presetPrompt: created.imagePrompt || created.prompt, presetImage: created.avatar }
      });
    } else {
      navigate('/characters');
    }
  };

  // Open Details Modal for a character
  const handleOpenDetails = (character) => {
    setActiveDetailCharacter(character);
    setIsEditingInModal(false);
    setEditFormData({
      name: character.name || '',
      role: character.role || '',
      lore: character.lore || '',
      style: character.style || 'Cinematic',
      prompt: character.prompt || '',
      imagePrompt: character.imagePrompt || ''
    });
  };

  const handleSaveModalEdit = () => {
    if (!activeDetailCharacter) return;
    if (activeDetailCharacter.isCustom) {
      updateCharacter(activeDetailCharacter.id, {
        name: editFormData.name,
        role: editFormData.role,
        lore: editFormData.lore,
        style: editFormData.style,
        prompt: editFormData.prompt,
        imagePrompt: editFormData.imagePrompt
      });
      setActiveDetailCharacter((prev) => ({
        ...prev,
        ...editFormData
      }));
    }
    setIsEditingInModal(false);
    showToast('Character details updated!', 'Check');
  };

  const handleDeleteFromModal = () => {
    if (!activeDetailCharacter) return;
    if (activeDetailCharacter.isCustom) {
      deleteCharacter(activeDetailCharacter.id);
      setActiveDetailCharacter(null);
    } else {
      showToast('Default superstar characters cannot be deleted.', 'AlertTriangle');
    }
  };

  const handleUseInPromptVideo = (character, e) => {
    if (e) e.stopPropagation();
    selectCharacter(character.id);
    setActiveDetailCharacter(null);
    navigate('/prompt-to-video', {
      state: { presetPrompt: character.prompt, presetStyle: character.style || 'Cinematic' }
    });
    showToast(
      language === 'ta' ? `${character.name} பிராம்ட் ஸ்டுடியோவில் திறக்கப்பட்டது!` : `Loaded ${character.name} into Prompt to Video!`,
      'Sparkles'
    );
  };

  const handleUseInImageVideo = (character, e) => {
    if (e) e.stopPropagation();
    selectCharacter(character.id);
    setActiveDetailCharacter(null);
    navigate('/image-to-video', {
      state: { presetPrompt: character.imagePrompt || character.prompt, presetImage: character.avatar }
    });
    showToast(
      language === 'ta' ? `${character.name} இமேஜ் ஸ்டுடியோவில் திறக்கப்பட்டது!` : `Loaded ${character.name} into Image to Video!`,
      'Sparkles'
    );
  };

  const handleToggleAdd = (character, e) => {
    if (e) e.stopPropagation();
    toggleSelectCharacter(character.id);
    const willBeSelected = !selectedCharacterIds.includes(character.id);
    showToast(
      willBeSelected
        ? language === 'ta' ? `${character.name} சேர்க்கப்பட்டது!` : `${character.name} added to selected!`
        : language === 'ta' ? `${character.name} நீக்கப்பட்டது` : `${character.name} removed from selection`,
      willBeSelected ? 'Check' : 'Trash2'
    );
  };

  // =========================================================================
  // SCREEN 1: NEW CHARACTER CREATION WORKFLOW (Google Flow Inspired)
  // =========================================================================
  if (isNewCharRoute) {
    return (
      <div className="new-char-screen-layout">
        {/* Top-Left Back Button & Page Title */}
        <div className="new-char-top-header">
          <button
            type="button"
            onClick={() => navigate('/characters')}
            className="new-char-back-action"
            title="Back to characters"
            aria-label="Back to characters"
          >
            <Icons.ArrowLeft size={20} />
            <span className="new-char-page-heading-text">New character</span>
          </button>
        </div>

        {/* Centered Heading & Subtitle */}
        <div className="new-char-hero-center">
          <h1 className="new-char-main-heading">
            Build and reuse characters for consistent videos.
          </h1>
          <p className="new-char-sub-heading">
            Use a sample prompt below, or create from scratch.
          </p>
        </div>

        {/* 2x3 Grid of Character Sample Cards (Image on Left, Text on Right) */}
        <div className="new-char-archetypes-grid">
          {SAMPLE_ARCHETYPES.map((archetype) => {
            const isSelected = selectedArchetypeId === archetype.id;
            return (
              <div
                key={archetype.id}
                onClick={() => handleSelectArchetype(archetype)}
                className={`archetype-card-item ${isSelected ? 'is-archetype-active' : ''}`}
                role="button"
                tabIndex={0}
              >
                <div className="archetype-thumb-frame">
                  <img src={archetype.avatar} alt={archetype.name} className="archetype-thumb-img" />
                </div>
                <div className="archetype-text-wrap">
                  <h3 className="archetype-title-text">{archetype.name}</h3>
                  <p className="archetype-desc-text">{archetype.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Character Description Prompt & Creation Configurator Box */}
        <div className="new-char-prompt-bar-wrap">
          <div className="new-char-prompt-box">
            <textarea
              rows={2.5}
              placeholder="Describe your character (e.g. A fearless cybernetic detective with glowing amber eyes in Neo-Tokyo...)"
              value={characterPrompt}
              onChange={(e) => setCharacterPrompt(e.target.value)}
              className="new-char-textarea"
            />

            {/* Embedded Toolbar at Bottom of Prompt Box */}
            <div className="prompt-box-bottom-bar">
              <div className="prompt-bottom-left-tools">
                <button
                  type="button"
                  onClick={() => {
                    if (fileInputRef.current) fileInputRef.current.click();
                  }}
                  className="prompt-tool-icon-btn"
                  title="Upload reference image"
                >
                  <Icons.Plus size={18} />
                </button>

                <button
                  type="button"
                  onClick={handleGenerateImageFromDescription}
                  disabled={isGeneratingImage}
                  className="prompt-tool-pill-btn"
                  title="Generate portrait from description"
                >
                  <Icons.Sparkles size={14} />
                  <span>{isGeneratingImage ? 'Generating...' : 'Generate Portrait'}</span>
                </button>
              </div>

              <div className="prompt-bottom-right-tools">
                {/* Model Selector Pill */}
                <div className="model-selector-pill-wrap">
                  <button
                    type="button"
                    onClick={() => setShowModelDropdown((prev) => !prev)}
                    className="model-select-pill-btn"
                  >
                    <span>🍌</span>
                    <span>{selectedModel}</span>
                    <Icons.ChevronDown size={14} />
                  </button>

                  {showModelDropdown && (
                    <div className="model-dropdown-menu">
                      {['Thamili Neural v2', 'Nano Banana 2', 'Diffusion 4K Pro', 'HyperReal 60fps'].map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => {
                            setSelectedModel(m);
                            setShowModelDropdown(false);
                          }}
                          className={`model-option-item ${selectedModel === m ? 'active' : ''}`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Save / Generate Arrow Button */}
                <button
                  type="button"
                  onClick={() => handleSaveCharacter(null)}
                  className="prompt-submit-arrow-btn"
                  title="Save character to library"
                  aria-label="Save character to library"
                >
                  <Icons.ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Reference Image Preview if generated or uploaded */}
          {uploadedImage && (
            <div className="char-preview-uploaded-bar">
              <div className="preview-uploaded-left">
                <img src={uploadedImage} alt="Character Portrait Preview" className="preview-portrait-mini" />
                <div className="preview-uploaded-meta">
                  <span className="preview-portrait-title">Portrait Attached</span>
                  <span className="preview-portrait-sub">{uploadedImageName || 'AI Generated Portrait'}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setUploadedImage('');
                  setUploadedImageName('');
                }}
                className="chip-remove-btn"
                title="Remove portrait"
              >
                <Icons.X size={14} />
              </button>
            </div>
          )}

          {/* Character Information Metadata Fields */}
          <div className="new-char-fields-grid">
            <div className="char-field-box">
              <label className="char-field-label">Character Name *</label>
              <input
                type="text"
                value={charName}
                onChange={(e) => setCharName(e.target.value)}
                placeholder="e.g. Detective Vikram, Arun, Maya..."
                className="char-field-input"
              />
            </div>

            <div className="char-field-box">
              <label className="char-field-label">Role / Archetype</label>
              <input
                type="text"
                value={charRole}
                onChange={(e) => setCharRole(e.target.value)}
                placeholder="e.g. Mastermind, Space Explorer, Protagonist..."
                className="char-field-input"
              />
            </div>

            <div className="char-field-box">
              <label className="char-field-label">Category</label>
              <select
                value={charCategory}
                onChange={(e) => setCharCategory(e.target.value)}
                className="char-field-input"
              >
                <option value="Actor">Actor</option>
                <option value="Actress">Actress</option>
                <option value="Custom">Custom / Creature</option>
              </select>
            </div>

            <div className="char-field-box">
              <label className="char-field-label">Visual Style</label>
              <select
                value={charStyle}
                onChange={(e) => setCharStyle(e.target.value)}
                className="char-field-input"
              >
                <option value="Cinematic">Cinematic</option>
                <option value="Realistic">Realistic Photoreal</option>
                <option value="3D">3D Render</option>
                <option value="Anime">Anime / Manga</option>
                <option value="Cyberpunk">Cyberpunk Neon</option>
                <option value="Fantasy">Mythical Fantasy</option>
              </select>
            </div>

            <div className="char-field-box char-field-box-full">
              <label className="char-field-label">Short Description / Lore</label>
              <input
                type="text"
                value={charLore}
                onChange={(e) => setCharLore(e.target.value)}
                placeholder="Brief backstory or signature trait for video consistency..."
                className="char-field-input"
              />
            </div>
          </div>

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleImageUpload(e.target.files[0]);
              }
            }}
            style={{ display: 'none' }}
          />

          {/* Dual Action Buttons Below */}
          <div className="new-char-dual-actions-row">
            <button
              type="button"
              onClick={() => {
                if (fileInputRef.current) fileInputRef.current.click();
              }}
              className="new-char-bottom-btn"
              title="Upload reference photo"
            >
              <Icons.UploadCloud size={16} />
              <span>{uploadedImageName ? `Photo: ${uploadedImageName}` : 'Upload Photo'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowProjectImportModal(true)}
              className="new-char-bottom-btn"
              title="Import from project"
            >
              <Icons.Plus size={16} />
              <span>Add from project</span>
            </button>

            <button
              type="button"
              onClick={() => handleSaveCharacter(null)}
              className="new-char-bottom-btn new-char-save-primary"
              title="Save to Library"
            >
              <Icons.Check size={16} />
              <span>Save Character</span>
            </button>
          </div>

          {/* Direct Studio Launch Shortcuts */}
          <div className="new-char-studio-quick-launches">
            <button
              type="button"
              onClick={() => handleSaveCharacter('prompt')}
              className="studio-launch-pill-btn"
            >
              <Icons.Sparkles size={14} />
              <span>Save & Launch Prompt Video</span>
            </button>
            <button
              type="button"
              onClick={() => handleSaveCharacter('image')}
              className="studio-launch-pill-btn"
            >
              <Icons.Image size={14} />
              <span>Save & Launch Image Video</span>
            </button>
          </div>
        </div>

        {/* Project Import Superstars Modal */}
        {showProjectImportModal && (
          <div className="modal-overlay" onClick={() => setShowProjectImportModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
              <div className="modal-top-accent" />
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                <h3 className="modal-title" style={{ textAlign: 'left', margin: 0 }}>
                  {language === 'ta' ? 'கதாபாத்திரத்தை தேர்வுசெய்க' : 'Add from Project / Superstars'}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowProjectImportModal(false)}
                  className="search-clear-btn"
                >
                  <Icons.X size={20} />
                </button>
              </div>

              <p className="modal-subtitle" style={{ textAlign: 'left', width: '100%', margin: 0 }}>
                Select an existing character or superstar persona to populate as your foundation.
              </p>

              <div className="project-import-grid" style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px', maxHeight: '380px', overflowY: 'auto', padding: '4px' }}>
                {allCharacters.map((char) => (
                  <div
                    key={char.id}
                    onClick={() => handleImportFromCharacter(char)}
                    className="import-char-card"
                  >
                    <img src={char.avatar} alt={char.name} className="import-char-avatar" />
                    <span className="import-char-name">{char.name}</span>
                    <span className="import-char-role">{char.role}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="new-char-page-footer-tag">
          <span>Thamili AI Video Studio • Characters Engine</span>
        </div>
      </div>
    );
  }

  // =========================================================================
  // SCREEN 2: MAIN CHARACTERS WORKSPACE & REUSABLE LIBRARY
  // =========================================================================
  return (
    <div className="char-workspace-layout">
      {/* Top Search Bar & Header Area */}
      <div className="char-workspace-header-bar">
        <div className="workspace-header-left">
          <div className="char-search-pill-container">
            <span className="search-pill-icon">
              <Icons.Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Search characters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="char-search-pill-input"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="search-clear-btn"
                aria-label="Clear Search"
              >
                <Icons.X size={14} />
              </button>
            )}
          </div>

          <button
            type="button"
            className="filter-toggle-icon-btn"
            title="Filter options"
            aria-label="Filter options"
          >
            <Icons.Sliders size={16} />
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="workspace-header-right-pills">
          {[
            { key: 'All', label: 'All' },
            { key: 'Actors', label: 'Actors' },
            { key: 'Actresses', label: 'Actresses' },
            { key: 'Custom', label: 'Custom' }
          ].map(({ key, label }) => {
            if (key === 'Custom' && customCharacters.length === 0) return null;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveCategory(key)}
                className={`category-pill-btn ${activeCategory === key ? 'active' : ''}`}
              >
                <span>{label}</span>
                {key === 'Custom' && customCharacters.length > 0 && (
                  <span className="pill-counter">{customCharacters.length}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area: Character Cards Grid */}
      <div className="char-workspace-cards-grid">
        {/* CARD 1: "New character" Outlined Card with Large "+" Icon */}
        <div
          onClick={() => navigate('/characters/new')}
          className="char-action-outline-card card-new-char-action"
          role="button"
          tabIndex={0}
          title="New character"
        >
          <div className="outline-card-center-icon">
            <Icons.Plus size={36} />
          </div>
          <span className="outline-card-bottom-text">New character</span>
        </div>

        {/* CARD 2: "Create my avatar" Outlined Card with Avatar Icon */}
        <div
          onClick={() => navigate('/characters/new?preset=avatar')}
          className="char-action-outline-card card-create-avatar-action"
          role="button"
          tabIndex={0}
          title="Create my avatar"
        >
          <div className="outline-card-center-icon avatar-user-icon">
            <Icons.User size={34} />
          </div>
          <span className="outline-card-bottom-text">Create my avatar</span>
        </div>

        {/* EXISTING & USER-CREATED CHARACTER IMAGE CARDS */}
        {filteredCharacters.map((character) => {
          const isSelected = selectedCharacterIds.includes(character.id);

          return (
            <div
              key={character.id}
              onClick={() => handleOpenDetails(character)}
              className={`char-fullbleed-card ${isSelected ? 'card-active-selection' : ''}`}
              role="button"
              tabIndex={0}
              title={`View details for ${character.name}`}
            >
              {/* Full Bleed Image / Avatar */}
              <div
                className="fullbleed-image-wrap"
                style={{
                  background:
                    character.avatarGradient ||
                    'linear-gradient(135deg, #0f172a, #1e1b4b)'
                }}
              >
                <img
                  src={character.avatar}
                  alt={character.name}
                  className="fullbleed-char-img"
                  loading="lazy"
                />

                {/* Top-Left Persona Icon Overlay Badge */}
                <div className="fullbleed-top-badge">
                  <Icons.User size={13} />
                </div>

                {/* Top-Right Action Row (Edit/Delete) */}
                <div className="fullbleed-top-actions">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenDetails(character);
                      setIsEditingInModal(true);
                    }}
                    className="card-quick-edit-btn"
                    title="Edit character"
                    aria-label="Edit character"
                  >
                    <Icons.Sliders size={12} />
                  </button>

                  {character.isCustom && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteCharacter(character.id);
                      }}
                      className="card-quick-delete-btn"
                      title="Delete character"
                      aria-label="Delete character"
                    >
                      <Icons.Trash2 size={12} />
                    </button>
                  )}
                </div>

                {/* Bottom Shadow Gradient & Clear Character Name and Role */}
                <div className="fullbleed-bottom-overlay">
                  <h3 className="fullbleed-character-name">{character.name}</h3>
                  <p className="fullbleed-character-role">{character.role || character.gender}</p>
                </div>

                {/* Hover Quick Action Overlay */}
                <div className="fullbleed-hover-actions">
                  <button
                    type="button"
                    onClick={(e) => handleToggleAdd(character, e)}
                    className={`hover-action-btn ${isSelected ? 'is-added' : ''}`}
                    title={isSelected ? 'Remove from selection' : 'Add to selection'}
                  >
                    {isSelected ? (
                      <>
                        <Icons.Check size={13} />
                        <span>Added</span>
                      </>
                    ) : (
                      <>
                        <Icons.Plus size={13} />
                        <span>Add</span>
                      </>
                    )}
                  </button>

                  <div className="hover-studio-btns">
                    <button
                      type="button"
                      onClick={(e) => handleUseInPromptVideo(character, e)}
                      className="hover-studio-btn"
                      title="Open in Prompt to Video"
                    >
                      <Icons.Sparkles size={12} />
                      <span>Prompt</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleUseInImageVideo(character, e)}
                      className="hover-studio-btn"
                      title="Open in Image to Video"
                    >
                      <Icons.Image size={12} />
                      <span>Image</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CHARACTER DETAILS & REUSE MODAL */}
      {activeDetailCharacter && (
        <div className="modal-overlay" onClick={() => setActiveDetailCharacter(null)}>
          <div
            className="modal-content char-details-modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '680px', padding: '0', overflow: 'hidden' }}
          >
            <div className="modal-top-accent" />

            <div className="char-modal-body-layout">
              {/* Left Column: Large Character Portrait */}
              <div className="char-modal-portrait-col">
                <img
                  src={activeDetailCharacter.avatar}
                  alt={activeDetailCharacter.name}
                  className="char-modal-large-img"
                />
                <div className="char-modal-portrait-tags">
                  <span className="char-tag-pill">{activeDetailCharacter.style || 'Cinematic'}</span>
                  <span className="char-tag-pill">{activeDetailCharacter.gender || activeDetailCharacter.category || 'Actor'}</span>
                </div>
              </div>

              {/* Right Column: Character Details & Action Buttons */}
              <div className="char-modal-info-col">
                <div className="char-modal-header-row">
                  <div>
                    <h2 className="char-modal-title">{activeDetailCharacter.name}</h2>
                    <span className="char-modal-subtitle">{activeDetailCharacter.role || 'Character Persona'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveDetailCharacter(null)}
                    className="search-clear-btn"
                    title="Close"
                  >
                    <Icons.X size={20} />
                  </button>
                </div>

                {!isEditingInModal ? (
                  <div className="char-modal-view-mode">
                    {activeDetailCharacter.lore && (
                      <div className="char-detail-section">
                        <label className="char-detail-label">Description / Lore</label>
                        <p className="char-detail-text">{activeDetailCharacter.lore}</p>
                      </div>
                    )}

                    {activeDetailCharacter.prompt && (
                      <div className="char-detail-section">
                        <label className="char-detail-label">Signature Video Prompt</label>
                        <p className="char-detail-prompt-box">
                          {activeDetailCharacter.prompt}
                        </p>
                      </div>
                    )}

                    {/* Edit and Delete Actions */}
                    <div className="char-modal-manage-row">
                      <button
                        type="button"
                        onClick={() => setIsEditingInModal(true)}
                        className="char-modal-btn-secondary"
                      >
                        <Icons.Sliders size={14} />
                        <span>Edit Character</span>
                      </button>

                      {activeDetailCharacter.isCustom && (
                        <button
                          type="button"
                          onClick={handleDeleteFromModal}
                          className="char-modal-btn-danger"
                          title="Delete Character"
                        >
                          <Icons.Trash2 size={14} />
                          <span>Delete</span>
                        </button>
                      )}
                    </div>

                    {/* Use in Video Action Buttons */}
                    <div className="char-modal-video-actions">
                      <button
                        type="button"
                        onClick={() => handleUseInPromptVideo(activeDetailCharacter)}
                        className="char-use-video-btn char-use-prompt-btn"
                      >
                        <Icons.Sparkles size={16} />
                        <span>Use in Prompt to Video</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleUseInImageVideo(activeDetailCharacter)}
                        className="char-use-video-btn char-use-image-btn"
                      >
                        <Icons.Image size={16} />
                        <span>Use in Image to Video</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="char-modal-edit-mode">
                    <div className="modal-edit-field">
                      <label className="char-detail-label">Name</label>
                      <input
                        type="text"
                        value={editFormData.name}
                        onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                        className="char-field-input"
                      />
                    </div>

                    <div className="modal-edit-field">
                      <label className="char-detail-label">Role</label>
                      <input
                        type="text"
                        value={editFormData.role}
                        onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                        className="char-field-input"
                      />
                    </div>

                    <div className="modal-edit-field">
                      <label className="char-detail-label">Description / Lore</label>
                      <textarea
                        rows={2}
                        value={editFormData.lore}
                        onChange={(e) => setEditFormData({ ...editFormData, lore: e.target.value })}
                        className="char-field-input"
                      />
                    </div>

                    <div className="modal-edit-field">
                      <label className="char-detail-label">Signature Video Prompt</label>
                      <textarea
                        rows={2.5}
                        value={editFormData.prompt}
                        onChange={(e) => setEditFormData({ ...editFormData, prompt: e.target.value })}
                        className="char-field-input"
                      />
                    </div>

                    <div className="modal-edit-actions-row">
                      <button
                        type="button"
                        onClick={() => setIsEditingInModal(false)}
                        className="char-modal-btn-secondary"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveModalEdit}
                        className="char-modal-btn-primary"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
