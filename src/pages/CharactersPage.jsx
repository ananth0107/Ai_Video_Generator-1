import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from '../components/Icons';
import { useCharacters } from '../context/CharacterContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';

export default function CharactersPage() {
  const navigate = useNavigate();
  const {
    allCharacters,
    customCharacters,
    selectedCharacterIds,
    toggleSelectCharacter,
    selectCharacter,
    addCharacter,
    deleteCharacter
  } = useCharacters();

  const { showToast } = useToast();
  const { t, language } = useLanguage();

  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New Character Form State
  const [newCharName, setNewCharName] = useState('');
  const [newCharRole, setNewCharRole] = useState('');
  const [newCharCategory, setNewCharCategory] = useState('Actor');
  const [newCharStyle, setNewCharStyle] = useState('Cinematic');
  const [newCharLore, setNewCharLore] = useState('');
  const [newCharPrompt, setNewCharPrompt] = useState('');
  const [newCharImage, setNewCharImage] = useState('');
  const [newCharImageName, setNewCharImageName] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef(null);

  // Filter characters
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
          char.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (char.lore && char.lore.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const handleImageUpload = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      showToast(
        language === 'ta'
          ? 'சரியான படக் கோப்பைப் பதிவேற்றவும்'
          : 'Please upload a valid image file (PNG, JPG, SVG, WebP)',
        'Settings'
      );
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setNewCharImage(e.target.result);
      setNewCharImageName(file.name);
      showToast(
        language === 'ta' ? 'படம் வெற்றிகரமாக பதிவேற்றப்பட்டது!' : 'Character portrait uploaded successfully!',
        'Check'
      );
    };
    reader.readAsDataURL(file);
  };

  const handleSaveCharacter = (redirectTo = null) => {
    if (!newCharName.trim()) {
      showToast(
        language === 'ta' ? 'கதாபாத்திரத்தின் பெயரை உள்ளிடவும்' : 'Please provide a character name',
        'User'
      );
      return;
    }

    const fallbackAvatar = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><defs><linearGradient id="cg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%231e1b4b"/><stop offset="100%" stop-color="%23ec4899"/></linearGradient></defs><rect width="400" height="400" fill="url(%23cg)"/><circle cx="200" cy="160" r="70" fill="%23f1f5f9"/><path d="M 120 320 Q 200 250 280 320 L 320 400 L 80 400 Z" fill="%230f172a"/><text x="200" y="375" fill="white" font-family="sans-serif" font-weight="900" font-size="16" text-anchor="middle">${encodeURIComponent(newCharName.toUpperCase())}</text></svg>`;

    const autoPrompt =
      newCharPrompt.trim() ||
      `${newCharName.trim()}, the ${newCharRole.trim() || 'cinematic protagonist'}, in dynamic lighting with volumetric environment and high fidelity details, 4K render.`;

    const created = addCharacter({
      name: newCharName.trim(),
      gender: newCharCategory === 'Actress' ? 'Actress' : 'Actor',
      role: newCharRole.trim() || 'Cinematic Persona',
      category: newCharCategory,
      style: newCharStyle,
      lore: newCharLore.trim() || `A customized character persona created for consistent video generation.`,
      prompt: autoPrompt,
      imagePrompt: `Cinematic camera zoom and lighting sweep around ${newCharName.trim()}.`,
      avatar: newCharImage || fallbackAvatar,
      avatarGradient: 'linear-gradient(135deg, #1e1b4b, #4f46e5, #ec4899)',
      accentColor: '#6366f1'
    });

    // Reset Form
    setNewCharName('');
    setNewCharRole('');
    setNewCharLore('');
    setNewCharPrompt('');
    setNewCharImage('');
    setNewCharImageName('');
    setIsCreateModalOpen(false);

    if (redirectTo === 'prompt') {
      navigate('/prompt-to-video', {
        state: {
          presetPrompt: created.prompt,
          presetStyle: created.style
        }
      });
    } else if (redirectTo === 'image') {
      navigate('/image-to-video', {
        state: {
          presetPrompt: created.imagePrompt || created.prompt,
          presetImage: created.avatar
        }
      });
    }
  };

  const handleUseInPromptVideo = (character) => {
    selectCharacter(character.id);
    navigate('/prompt-to-video', {
      state: {
        presetPrompt: character.prompt,
        presetStyle: character.style || 'Cinematic'
      }
    });
    showToast(
      language === 'ta'
        ? `${character.name} பிராம்ட் டூ வீடியோவில் சேர்க்கப்பட்டது!`
        : `Loaded ${character.name} into Prompt to Video!`,
      'Sparkles'
    );
  };

  const handleUseInImageVideo = (character) => {
    selectCharacter(character.id);
    navigate('/image-to-video', {
      state: {
        presetPrompt: character.imagePrompt || character.prompt,
        presetImage: character.avatar
      }
    });
    showToast(
      language === 'ta'
        ? `${character.name} படத்திலிருந்து வீடியோவில் சேர்க்கப்பட்டது!`
        : `Loaded ${character.name} into Image to Video!`,
      'Sparkles'
    );
  };

  const handleToggleAdd = (character) => {
    toggleSelectCharacter(character.id);
    const willBeSelected = !selectedCharacterIds.includes(character.id);
    showToast(
      willBeSelected
        ? language === 'ta'
          ? `${character.name} தேர்ந்தெடுக்கப்பட்டது!`
          : `${character.name} added to selected characters!`
        : language === 'ta'
        ? `${character.name} நீக்கப்பட்டது`
        : `${character.name} removed from selection`,
      willBeSelected ? 'Check' : 'Trash2'
    );
  };

  return (
    <div className="characters-page-container">
      {/* Top Header Section */}
      <div className="char-page-header">
        <div className="char-header-left">
          <div className="char-title-row">
            <h1 className="char-main-title">{t('charactersPageTitle')}</h1>
            <span className="char-count-badge">
              <Icons.Sparkles />
              <span>
                {allCharacters.length} {t('characterCountBadge')}
              </span>
            </span>
          </div>
          <p className="char-subtitle">{t('charactersPageSubtitle')}</p>
        </div>

        <div className="char-header-right">
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="char-create-cta-btn"
          >
            <Icons.UserPlus />
            <span>{t('createNewCharacter')}</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="char-filter-toolbar">
        <div className="char-category-pills">
          {[
            { key: 'All', label: t('all') },
            { key: 'Actors', label: t('actors') },
            { key: 'Actresses', label: t('actresses') },
            { key: 'Custom', label: t('custom') }
          ].map(({ key, label }) => {
            if (key === 'Custom' && customCharacters.length === 0) return null;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveCategory(key)}
                className={`char-cat-btn ${activeCategory === key ? 'active' : ''}`}
              >
                <span>{label}</span>
                {key === 'Custom' && customCharacters.length > 0 && (
                  <span className="char-cat-num">{customCharacters.length}</span>
                )}
              </button>
            );
          })}
        </div>

        <div className="char-search-box">
          <span className="search-box-icon">
            <Icons.Search />
          </span>
          <input
            type="text"
            placeholder={t('searchCharactersPagePlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="char-search-input"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="search-clear-btn"
            >
              <Icons.X />
            </button>
          )}
        </div>
      </div>

      {/* Characters Cards Grid */}
      <div className="characters-grid-viewport">
        {filteredCharacters.map((character) => {
          const isSelected = selectedCharacterIds.includes(character.id);
          const isActor = character.gender === 'Actor' || character.category === 'Actor';

          return (
            <div
              key={character.id}
              className={`character-card ${isSelected ? 'card-selected' : ''}`}
            >
              {/* Card Top Avatar Area */}
              <div
                className="char-avatar-frame"
                style={{
                  background:
                    character.avatarGradient ||
                    'linear-gradient(135deg, #0f172a, #1e1b4b)'
                }}
              >
                <img
                  src={character.avatar}
                  alt={character.name}
                  className="char-avatar-img"
                />
                <div className="char-badges-overlay">
                  <span className={`char-genre-badge ${isActor ? 'badge-actor' : 'badge-actress'}`}>
                    {isActor ? t('actorTag') : t('actressTag')}
                  </span>
                  {character.isCustom ? (
                    <span className="char-custom-tag">{t('customTag')}</span>
                  ) : (
                    <span className="char-style-tag">{character.style}</span>
                  )}
                </div>

                {character.isCustom && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteCharacter(character.id);
                    }}
                    className="char-card-delete-btn"
                    title="Delete character"
                  >
                    <Icons.Trash2 />
                  </button>
                )}
              </div>

              {/* Card Details Body */}
              <div className="char-card-body">
                <div className="char-card-titles">
                  <h3 className="char-card-name">{character.name}</h3>
                  <p className="char-card-role">{character.role}</p>
                </div>

                <p className="char-card-lore">{character.lore}</p>

                {/* Main Toggle Add Button */}
                <button
                  type="button"
                  onClick={() => handleToggleAdd(character)}
                  className={`char-toggle-select-btn ${isSelected ? 'is-added' : ''}`}
                >
                  {isSelected ? (
                    <>
                      <Icons.Check />
                      <span>{t('added')}</span>
                    </>
                  ) : (
                    <>
                      <Icons.UserPlus />
                      <span>{t('addCharacter')}</span>
                    </>
                  )}
                </button>

                {/* Quick Action Studio Buttons */}
                <div className="char-card-actions">
                  <button
                    type="button"
                    onClick={() => handleUseInPromptVideo(character)}
                    className="char-action-btn btn-prompt"
                    title="Open in Prompt to Video Studio"
                  >
                    <Icons.Sparkles />
                    <span>{t('useInPromptVideo')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleUseInImageVideo(character)}
                    className="char-action-btn btn-image"
                    title="Open in Image to Video Studio"
                  >
                    <Icons.Image />
                    <span>{t('useInImageVideo')}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Create Character Quick Card */}
        <div
          onClick={() => setIsCreateModalOpen(true)}
          className="character-card char-add-quick-card"
          role="button"
          tabIndex={0}
        >
          <div className="add-char-icon-circle">
            <Icons.UserPlus />
          </div>
          <h4 className="add-char-title">{t('createNewCharacter')}</h4>
          <p className="add-char-desc">
            {language === 'ta'
              ? 'உங்கள் சொந்த புகைப்படத்தை பதிவேற்றி புதிய கதாபாத்திரத்தை உருவாக்குங்கள்.'
              : 'Upload an image or describe your character to save for future videos.'}
          </p>
          <span className="add-char-btn-pill">{t('addCharacter')}</span>
        </div>
      </div>

      {/* CREATE NEW CHARACTER MODAL DIALOG */}
      {isCreateModalOpen && (
        <div className="modal-overlay" onClick={() => setIsCreateModalOpen(false)}>
          <div className="char-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-top-accent"></div>

            <div className="char-modal-header">
              <div className="char-modal-title-row">
                <div className="modal-icon-badge">
                  <Icons.UserPlus />
                </div>
                <div>
                  <h2 className="modal-heading">{t('modalCreateTitle')}</h2>
                  <p className="modal-subheading">{t('modalCreateSubtitle')}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="modal-close-btn"
              >
                <Icons.X />
              </button>
            </div>

            <div className="char-modal-scroll-body">
              {/* Image Input Section */}
              <div className="modal-form-section">
                <label className="modal-field-label">
                  <span>{t('modalPortraitLabel')}</span>
                  <span className="field-optional">{t('modalPortraitSub')}</span>
                </label>

                <div
                  onClick={() => {
                    if (fileInputRef.current) fileInputRef.current.click();
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setIsDragOver(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragOver(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleImageUpload(e.dataTransfer.files[0]);
                    }
                  }}
                  className={`char-dropzone ${isDragOver ? 'drag-over' : ''} ${newCharImage ? 'has-file' : ''}`}
                >
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

                  {!newCharImage ? (
                    <div className="char-dropzone-inner">
                      <div className="dropzone-upload-icon">
                        <Icons.UploadCloud />
                      </div>
                      <div>
                        <p className="dropzone-p-main">
                          {language === 'ta'
                            ? 'படத்தைப் பதிவேற்ற கிளிக் செய்யவும் அல்லது இழுத்து விடவும்'
                            : 'Click or Drag & Drop image to upload portrait'}
                        </p>
                        <span className="dropzone-p-sub">PNG, JPG, SVG up to 50MB</span>
                      </div>
                    </div>
                  ) : (
                    <div className="char-dropzone-preview">
                      <img src={newCharImage} alt="Uploaded" className="char-modal-preview-img" />
                      <div className="char-preview-info">
                        <strong>{newCharImageName || 'character_portrait.png'}</strong>
                        <span>✓ {t('imageReadyStatus')}</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setNewCharImage('');
                          setNewCharImageName('');
                        }}
                        className="ctrl-btn-remove"
                      >
                        <Icons.Trash2 />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Character Details Form Fields */}
              <div className="modal-two-col-grid">
                <div className="modal-field-group">
                  <label className="modal-field-label">{t('modalCharNameLabel')}</label>
                  <input
                    type="text"
                    placeholder="e.g. Vikram"
                    value={newCharName}
                    onChange={(e) => setNewCharName(e.target.value)}
                    className="modal-text-input"
                  />
                </div>

                <div className="modal-field-group">
                  <label className="modal-field-label">{t('modalCharRoleLabel')}</label>
                  <input
                    type="text"
                    placeholder="e.g. Secret Agent / Action Hero"
                    value={newCharRole}
                    onChange={(e) => setNewCharRole(e.target.value)}
                    className="modal-text-input"
                  />
                </div>
              </div>

              <div className="modal-two-col-grid">
                <div className="modal-field-group">
                  <label className="modal-field-label">{t('modalCharCategoryLabel')}</label>
                  <select
                    value={newCharCategory}
                    onChange={(e) => setNewCharCategory(e.target.value)}
                    className="modal-select-input"
                  >
                    <option value="Actor">{t('actors')}</option>
                    <option value="Actress">{t('actresses')}</option>
                  </select>
                </div>

                <div className="modal-field-group">
                  <label className="modal-field-label">{t('modalCharStyleLabel')}</label>
                  <select
                    value={newCharStyle}
                    onChange={(e) => setNewCharStyle(e.target.value)}
                    className="modal-select-input"
                  >
                    <option value="Cinematic">Cinematic</option>
                    <option value="Realistic">Photorealistic</option>
                    <option value="Anime">Anime</option>
                    <option value="3D">3D Render</option>
                  </select>
                </div>
              </div>

              <div className="modal-field-group">
                <label className="modal-field-label">{t('modalCharLoreLabel')}</label>
                <textarea
                  rows={2}
                  placeholder={
                    language === 'ta'
                      ? 'கதாபாத்திரத்தின் தனித்துவமான கதை அல்லது குணாதிசயத்தை விவரிக்கவும்...'
                      : 'Describe your character’s background or unique personality...'
                  }
                  value={newCharLore}
                  onChange={(e) => setNewCharLore(e.target.value)}
                  className="modal-textarea-input"
                />
              </div>

              <div className="modal-field-group">
                <label className="modal-field-label">
                  <span>{t('modalCharPromptLabel')}</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Character standing in heavy rain with golden backlight in 4k cinematic render..."
                  value={newCharPrompt}
                  onChange={(e) => setNewCharPrompt(e.target.value)}
                  className="modal-textarea-input"
                />
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="char-modal-footer">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="char-modal-cancel-btn"
              >
                {t('cancel')}
              </button>

              <div className="char-modal-save-group">
                <button
                  type="button"
                  onClick={() => handleSaveCharacter(null)}
                  className="char-modal-save-btn"
                >
                  <Icons.Bookmark />
                  <span>{t('modalSaveBtn')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveCharacter('prompt')}
                  className="char-modal-launch-btn"
                >
                  <Icons.Sparkles />
                  <span>{t('modalSaveAndLaunchBtn')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
