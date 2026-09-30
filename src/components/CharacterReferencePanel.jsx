import React, { useState, useRef, useEffect } from 'react';
import { Icons } from './Icons';
import { useCharacters } from '../context/CharacterContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';

// Helper to generate dynamic stylized avatar SVG if user doesn't upload a custom file
function generateQuickAvatarSvg(name = 'Hero', role = 'Protagonist') {
  const hash = Array.from(name + role).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const palettes = [
    { bg1: '#071228', bg2: '#2563eb', skin: '#fed7aa', hair: '#0f172a', accent: '#38bdf8' },
    { bg1: '#1e082b', bg2: '#9333ea', skin: '#fcd34d', hair: '#3b0764', accent: '#c084fc' },
    { bg1: '#042f2e', bg2: '#0d9488', skin: '#fed7aa', hair: '#134e4a', accent: '#2dd4bf' },
    { bg1: '#3b0a0a', bg2: '#dc2626', skin: '#fbcfe8', hair: '#18181b', accent: '#f87171' },
    { bg1: '#1c1917', bg2: '#ea580c', skin: '#fed7aa', hair: '#292524', accent: '#fb923c' }
  ];
  const theme = palettes[hash % palettes.length];
  const initial = (name.trim()[0] || 'C').toUpperCase();

  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><defs><linearGradient id="bg-thm" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${encodeURIComponent(theme.bg1)}"/><stop offset="100%" stop-color="${encodeURIComponent(theme.bg2)}"/></linearGradient><linearGradient id="overlay-thm" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="transparent"/><stop offset="100%" stop-color="rgba(0,0,0,0.6)"/></linearGradient></defs><rect width="400" height="400" rx="20" fill="url(%23bg-thm)"/><circle cx="200" cy="165" r="74" fill="${encodeURIComponent(theme.skin)}"/><path d="M 125 145 Q 200 70 275 145 Q 280 110 245 90 Q 200 75 155 90 Q 120 110 125 145 Z" fill="${encodeURIComponent(theme.hair)}"/><circle cx="170" cy="160" r="7" fill="${encodeURIComponent(theme.hair)}"/><circle cx="230" cy="160" r="7" fill="${encodeURIComponent(theme.hair)}"/><path d="M 180 200 Q 200 215 220 200" stroke="${encodeURIComponent(theme.accent)}" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M 95 300 Q 200 230 305 300 L 335 400 L 65 400 Z" fill="${encodeURIComponent(theme.hair)}"/><rect width="400" height="400" fill="url(%23overlay-thm)" rx="20"/><text x="200" y="365" fill="%23ffffff" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-weight="800" font-size="20" letter-spacing="2" text-anchor="middle">${encodeURIComponent(name.toUpperCase())}</text></svg>`;
}

export default function CharacterReferencePanel({
  isOpen,
  onClose,
  onConfirmAddToPrompt
}) {
  const {
    allCharacters,
    selectedCharacterIds,
    selectedCharacters,
    toggleSelectCharacter,
    removeSelectedCharacter,
    clearSelectedCharacters,
    addCharacter
  } = useCharacters();

  const { t, language } = useLanguage();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All'); // 'All', 'Custom', 'Professional', 'Cinematic'
  const [isCreating, setIsCreating] = useState(false);

  // New Character Creation Form State
  const [newCharName, setNewCharName] = useState('');
  const [newCharRole, setNewCharRole] = useState('');
  const [newCharLore, setNewCharLore] = useState('');
  const [newCharImage, setNewCharImage] = useState('');
  const [newCharImageName, setNewCharImageName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const panelRef = useRef(null);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        if (isCreating) {
          setIsCreating(false);
        } else {
          onClose();
        }
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isCreating, onClose]);

  // Handle file upload for reference image
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast(
        language === 'ta'
          ? 'தயவுசெய்து சரியான படக் கோப்பை தேர்வு செய்யவும்'
          : 'Please select a valid image file (PNG, JPG, WebP)',
        'AlertTriangle'
      );
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast(
        language === 'ta' ? 'படத்தின் அளவு 10MB க்குள் இருக்க வேண்டும்' : 'Image size must be under 10MB',
        'AlertTriangle'
      );
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      const dataUrl = loadEvt.target?.result;
      setNewCharImage(dataUrl);
      setNewCharImageName(file.name);
      setIsUploading(false);
      showToast(
        language === 'ta' ? 'குறிப்புப் படம் ஏற்றப்பட்டது' : 'Character reference image loaded',
        'Check'
      );
    };
    reader.onerror = () => {
      setIsUploading(false);
      showToast('Failed to read image file', 'AlertTriangle');
    };
    reader.readAsDataURL(file);
  };

  // Handle saving new character
  const handleSaveCharacter = (e) => {
    e.preventDefault();
    const cleanName = newCharName.trim();
    if (!cleanName) {
      showToast(
        language === 'ta' ? 'கதாபாத்திரத்தின் பெயரை உள்ளிடவும்' : 'Please enter a character name',
        'AlertTriangle'
      );
      return;
    }

    const finalImage = newCharImage || generateQuickAvatarSvg(cleanName, newCharRole || 'Custom Character');
    const roleText = newCharRole.trim() || (language === 'ta' ? 'தனிப்பயன் கதாபாத்திரம்' : 'Custom Character');

    const created = addCharacter({
      name: cleanName,
      role: roleText,
      category: 'Custom',
      style: 'Cinematic',
      avatar: finalImage,
      lore: newCharLore.trim() || `Custom visual character reference for ${cleanName}.`,
      prompt: `${cleanName}, ${roleText}, high quality 4K visual reference.`,
      imagePrompt: `Cinematic focus shot of ${cleanName} with consistent character visual identity.`
    });

    // Reset form & return to grid
    setNewCharName('');
    setNewCharRole('');
    setNewCharLore('');
    setNewCharImage('');
    setNewCharImageName('');
    setIsCreating(false);

    showToast(
      language === 'ta'
        ? `"${cleanName}" கதாபாத்திரம் சேர்க்கப்பட்டது!`
        : `Character "${cleanName}" added & selected!`,
      'Check'
    );
  };

  // Confirm selection and close panel
  const handleConfirmAdd = () => {
    if (onConfirmAddToPrompt) {
      onConfirmAddToPrompt(selectedCharacters);
    }
    onClose();
  };

  if (!isOpen) return null;

  // Filter characters based on search and tab
  const filteredList = allCharacters.filter((char) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || (
      char.name.toLowerCase().includes(q) ||
      (char.role && char.role.toLowerCase().includes(q)) ||
      (char.category && char.category.toLowerCase().includes(q))
    );

    if (!matchesSearch) return false;

    if (activeTab === 'Custom') return char.isCustom;
    if (activeTab === 'Professional') return char.category === 'Executive' || char.category === 'Tech' || char.category === 'Host';
    if (activeTab === 'Cinematic') return char.category === 'Cinematic' || char.category === 'Sci-Fi' || char.category === 'Creative';

    return true;
  });

  return (
    <div className="char-ref-panel-backdrop" onClick={onClose}>
      <div
        className="char-ref-panel-container"
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="char-panel-title"
        aria-modal="true"
      >
        {/* ========================================================= */}
        {/* 1. HEADER ROW */}
        {/* ========================================================= */}
        <div className="char-ref-panel-header">
          <div className="char-ref-header-info">
            <div className="char-ref-title-badge-row">
              <h2 id="char-panel-title" className="char-ref-title">
                {language === 'ta' ? 'கதாபாத்திரங்கள்' : 'Characters'}
              </h2>
              <span className="char-ref-count-badge">
                {allCharacters.length} {language === 'ta' ? 'கிடைக்கின்றன' : 'available'}
              </span>
            </div>
            <p className="char-ref-subtitle">
              {language === 'ta'
                ? 'உங்கள் வீடியோ உருவாக்கத்தில் கதாபாத்திரக் குறிப்புகளை சேர்க்கவும்'
                : 'Add character references to your video'}
            </p>
          </div>

          <button
            type="button"
            className="char-ref-close-btn"
            onClick={onClose}
            title={language === 'ta' ? 'மூடு' : 'Close'}
            aria-label="Close"
          >
            <Icons.X size={18} />
          </button>
        </div>

        {/* ========================================================= */}
        {/* 2. BODY CONTENT (LIBRARY GRID or CREATE CHARACTER VIEW) */}
        {/* ========================================================= */}
        {!isCreating ? (
          <div className="char-ref-library-view">
            {/* Search and Category Filter Toolbar */}
            <div className="char-ref-toolbar">
              <div className="char-ref-search-box">
                <span className="char-ref-search-icon">
                  <Icons.Search size={14} />
                </span>
                <input
                  type="text"
                  placeholder={
                    language === 'ta'
                      ? 'கதாபாத்திரங்களைத் தேடுங்கள்...'
                      : 'Search character references...'
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="char-ref-search-input"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="char-ref-search-clear"
                    title="Clear search"
                  >
                    <Icons.X size={12} />
                  </button>
                )}
              </div>

              {/* Quick Tab Filters */}
              <div className="char-ref-tabs-row">
                {['All', 'Custom', 'Professional', 'Cinematic'].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    className={`char-ref-tab-btn ${activeTab === tab ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab === 'All' && (language === 'ta' ? 'அனைத்தும்' : 'All')}
                    {tab === 'Custom' && (language === 'ta' ? 'தனிப்பயன்' : 'Custom')}
                    {tab === 'Professional' && (language === 'ta' ? 'தொழில்முறை' : 'Professional')}
                    {tab === 'Cinematic' && (language === 'ta' ? 'சினிமா' : 'Cinematic')}
                  </button>
                ))}
              </div>
            </div>

            {/* Character Cards Grid */}
            <div className="char-ref-card-grid">
              {/* CREATE CHARACTER ACTION CARD (First item in grid) */}
              <div
                className="char-ref-card char-ref-create-card"
                onClick={() => setIsCreating(true)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setIsCreating(true);
                  }
                }}
              >
                <div className="create-card-inner">
                  <div className="create-card-icon-wrap">
                    <Icons.Plus size={22} />
                  </div>
                  <span className="create-card-title">
                    {language === 'ta' ? '+ புதிய கதாபாத்திரம்' : 'Create Character'}
                  </span>
                  <span className="create-card-hint">
                    {language === 'ta' ? 'குறிப்புப் படம் பதிவேற்றவும்' : 'Upload reference image'}
                  </span>
                </div>
              </div>

              {/* AVAILABLE CHARACTER CARDS */}
              {filteredList.map((char) => {
                const isSelected = selectedCharacterIds.includes(char.id);
                return (
                  <div
                    key={char.id}
                    className={`char-ref-card ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => toggleSelectCharacter(char.id)}
                    role="checkbox"
                    aria-checked={isSelected}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleSelectCharacter(char.id);
                      }
                    }}
                  >
                    {/* Character Visual Reference Image */}
                    <div className="char-card-media-wrap">
                      <img
                        src={char.avatar}
                        alt={char.name}
                        className="char-card-img"
                        loading="lazy"
                      />
                      <div className="char-card-media-overlay" />

                      {/* Selection Checkmark Indicator */}
                      <div className={`char-card-selection-badge ${isSelected ? 'active' : ''}`}>
                        {isSelected ? <Icons.Check size={13} /> : <div className="unselected-dot" />}
                      </div>

                      {/* Custom or Role Tag Pill */}
                      {char.isCustom ? (
                        <span className="char-card-tag custom-tag">Custom</span>
                      ) : char.category ? (
                        <span className="char-card-tag">{char.category}</span>
                      ) : null}
                    </div>

                    {/* Character Card Details */}
                    <div className="char-card-info">
                      <div className="char-card-name-row">
                        <h4 className="char-card-name" title={char.name}>
                          {char.name}
                        </h4>
                      </div>
                      <p className="char-card-role" title={char.role || char.gender || 'Character'}>
                        {char.role || char.gender || 'Character'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Empty State */}
            {filteredList.length === 0 && (
              <div className="char-ref-empty-state">
                <Icons.Users size={32} className="empty-icon" />
                <p className="empty-title">
                  {language === 'ta' ? 'கதாபாத்திரங்கள் காணப்படவில்லை' : 'No character references found'}
                </p>
                <p className="empty-sub">
                  {language === 'ta'
                    ? 'புதிய தேடலை முயற்சிக்கவும் அல்லது புதிய கதாபாத்திரத்தை உருவாக்கவும்'
                    : 'Try a different search query or create a new custom character'}
                </p>
                <button
                  type="button"
                  className="char-ref-empty-create-btn"
                  onClick={() => setIsCreating(true)}
                >
                  <Icons.Plus size={14} />
                  <span>{language === 'ta' ? 'கதாபாத்திரம் உருவாக்கு' : 'Create Character'}</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* ========================================================= */
          /* 3. INLINE CREATE CHARACTER FORM                           */
          /* ========================================================= */
          <div className="char-ref-create-view">
            <div className="create-view-header">
              <button
                type="button"
                className="create-back-btn"
                onClick={() => setIsCreating(false)}
                title="Back to library"
              >
                <Icons.ArrowLeft size={16} />
                <span>{language === 'ta' ? 'நூலகத்திற்கு திரும்பு' : 'Back to library'}</span>
              </button>
              <h3 className="create-view-title">
                {language === 'ta' ? 'புதிய கதாபாத்திரக் குறிப்பு' : 'Create Character Reference'}
              </h3>
            </div>

            <form onSubmit={handleSaveCharacter} className="create-char-form">
              {/* Image Upload Zone */}
              <div className="form-field-group">
                <label className="create-field-label">
                  {language === 'ta' ? 'குறிப்புப் படம் (Reference Image)' : 'Reference Image'}
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/png,image/jpeg,image/webp"
                  style={{ display: 'none' }}
                />

                {newCharImage ? (
                  <div className="char-upload-preview-card">
                    <img
                      src={newCharImage}
                      alt="Uploaded character reference"
                      className="char-upload-preview-img"
                    />
                    <div className="upload-preview-details">
                      <span className="preview-filename">{newCharImageName || 'character-reference.png'}</span>
                      <span className="preview-status">
                        <Icons.Check size={12} /> {language === 'ta' ? 'படம் தயாராக உள்ளது' : 'Ready as visual reference'}
                      </span>
                      <div className="preview-actions">
                        <button
                          type="button"
                          className="preview-change-btn"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Icons.Upload size={12} /> {language === 'ta' ? 'படத்தை மாற்று' : 'Replace Image'}
                        </button>
                        <button
                          type="button"
                          className="preview-remove-btn"
                          onClick={() => {
                            setNewCharImage('');
                            setNewCharImageName('');
                          }}
                        >
                          <Icons.Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`char-upload-dropzone ${isUploading ? 'uploading' : ''}`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="dropzone-icon-wrap">
                      <Icons.Upload size={22} />
                    </div>
                    <p className="dropzone-prompt">
                      <strong>{language === 'ta' ? 'படத்தைப் பதிவேற்ற கிளிக் செய்யவும்' : 'Click to upload reference image'}</strong>
                    </p>
                    <span className="dropzone-sub">
                      {language === 'ta' ? 'PNG, JPG அல்லது WebP (அதிகபட்சம் 10MB)' : 'PNG, JPG, or WebP (max 10MB)'}
                    </span>
                  </div>
                )}
              </div>

              {/* Character Name Input */}
              <div className="form-field-group">
                <label htmlFor="new-char-name-input" className="create-field-label">
                  {language === 'ta' ? 'கதாபாத்திரப் பெயர்' : 'Character Name'} <span className="req-star">*</span>
                </label>
                <input
                  id="new-char-name-input"
                  type="text"
                  placeholder={language === 'ta' ? 'எ.கா. மாலினி, விக்ரம்' : 'e.g. Elena Vance, Marcus Cole'}
                  value={newCharName}
                  onChange={(e) => setNewCharName(e.target.value)}
                  className="create-field-input"
                  required
                  autoFocus
                />
              </div>

              {/* Character Role/Archetype Input */}
              <div className="form-field-group">
                <label htmlFor="new-char-role-input" className="create-field-label">
                  {language === 'ta' ? 'பாத்திரம் / பதவி (Role)' : 'Role / Persona'}
                </label>
                <input
                  id="new-char-role-input"
                  type="text"
                  placeholder={
                    language === 'ta'
                      ? 'எ.கா. சினிமா இயக்குனர், வான்வெளி ஆய்வாளர்'
                      : 'e.g. Cyberpunk Detective, Aerospace Commander'
                  }
                  value={newCharRole}
                  onChange={(e) => setNewCharRole(e.target.value)}
                  className="create-field-input"
                />
              </div>

              {/* Optional Visual Lore / Attributes */}
              <div className="form-field-group">
                <label htmlFor="new-char-lore-input" className="create-field-label">
                  {language === 'ta' ? 'தோற்ற விவரங்கள் (Visual Details)' : 'Visual Traits & Description (Optional)'}
                </label>
                <textarea
                  id="new-char-lore-input"
                  rows={2}
                  placeholder={
                    language === 'ta'
                      ? 'கதாபாத்திரத்தின் உடை, தனித்துவமான அம்சங்கள்...'
                      : 'Distinctive wardrobe, facial features, style lighting...'
                  }
                  value={newCharLore}
                  onChange={(e) => setNewCharLore(e.target.value)}
                  className="create-field-textarea"
                />
              </div>

              {/* Action Buttons */}
              <div className="create-form-actions">
                <button
                  type="button"
                  className="create-cancel-btn"
                  onClick={() => setIsCreating(false)}
                >
                  {language === 'ta' ? 'ரத்துசெய்' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="create-save-btn"
                  disabled={!newCharName.trim()}
                >
                  <Icons.Check size={14} />
                  <span>{language === 'ta' ? 'நூலகத்தில் சேமி' : 'Save & Select'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================= */}
        {/* 4. SELECTED CHARACTERS BOTTOM DOCK & CONFIRMATION         */}
        {/* ========================================================= */}
        <div className="char-ref-bottom-dock">
          <div className="bottom-dock-left">
            {selectedCharacters.length > 0 ? (
              <div className="dock-selected-group">
                <span className="dock-label">
                  {language === 'ta' ? 'தேர்ந்தெடுக்கப்பட்டவை' : 'Selected'} ({selectedCharacters.length}):
                </span>
                <div className="dock-chips-list">
                  {selectedCharacters.map((char) => (
                    <div key={char.id} className="dock-char-chip" title={char.name}>
                      <img
                        src={char.avatar}
                        alt={char.name}
                        className="dock-chip-avatar"
                      />
                      <span className="dock-chip-name">{char.name}</span>
                      <button
                        type="button"
                        className="dock-chip-remove"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeSelectedCharacter(char.id);
                        }}
                        title={`Remove ${char.name}`}
                      >
                        <Icons.X size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <span className="dock-hint-text">
                {language === 'ta'
                  ? 'வீடியோவில் பயன்படுத்த கதாபாத்திரங்களை தேர்ந்தெடுக்கவும்'
                  : 'Select character references to guide video generation'}
              </span>
            )}
          </div>

          <div className="bottom-dock-right">
            {selectedCharacters.length > 0 && (
              <button
                type="button"
                className="dock-clear-btn"
                onClick={clearSelectedCharacters}
                title="Clear selection"
              >
                {language === 'ta' ? 'அனைத்தையும் நீக்கு' : 'Clear'}
              </button>
            )}

            <button
              type="button"
              className="dock-confirm-btn"
              onClick={handleConfirmAdd}
            >
              <Icons.Check size={14} />
              <span>
                {selectedCharacters.length > 0
                  ? language === 'ta'
                    ? 'பிராம்ட்டில் சேர்'
                    : 'Add to prompt'
                  : language === 'ta'
                  ? 'முடிந்தது'
                  : 'Done'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
