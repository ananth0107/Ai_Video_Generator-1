import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from './Icons';
import { useCharacters } from '../context/CharacterContext';
import { useLanguage } from '../context/LanguageContext';

export default function CharacterSelectDropdown({
  badge = '02',
  label = '',
  className = '',
  onOpenLibrary = null,
  onSelectCharacter = null
}) {
  const navigate = useNavigate();
  const {
    allCharacters,
    selectedCharacterIds,
    toggleSelectCharacter,
    removeSelectedCharacter,
    clearSelectedCharacters
  } = useCharacters();

  const { t } = useLanguage();

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  // Close when clicked outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  const filtered = allCharacters.filter((char) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      char.name.toLowerCase().includes(q) ||
      (char.role && char.role.toLowerCase().includes(q)) ||
      (char.category && char.category.toLowerCase().includes(q))
    );
  });

  const selectedCharactersList = allCharacters.filter((c) =>
    selectedCharacterIds.includes(c.id)
  );

  const handleCharacterClick = (char) => {
    const wasSelected = selectedCharacterIds.includes(char.id);
    toggleSelectCharacter(char.id);
    if (!wasSelected && onSelectCharacter) {
      onSelectCharacter(char);
    }
  };

  const handleNewCharacterClick = () => {
    setIsOpen(false);
    if (onOpenLibrary) {
      onOpenLibrary();
    } else {
      navigate('/characters/new');
    }
  };

  return (
    <div className={`character-select-module ${className}`} ref={dropdownRef}>
      {/* Label Row */}
      <div className="char-select-header-row">
        <label className="form-step-label">
          {badge && <span className="form-step-badge">{badge}</span>}
          <span>{label || t('stepCharactersLabel', 'Characters')}</span>
        </label>

        <div className="char-header-actions-right">
          {selectedCharactersList.length > 0 && (
            <button
              type="button"
              onClick={clearSelectedCharacters}
              className="mini-clear-btn"
              title="Clear all selected characters"
            >
              {t('remove', 'Remove')} {t('all', 'All')}
            </button>
          )}
        </div>
      </div>

      {/* Dropdown Anchor & Trigger */}
      <div className="char-dropdown-anchor">
        <button
          type="button"
          className={`char-dropdown-trigger ${isOpen ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen((prev) => !prev);
          }}
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <div className="trigger-left-info">
            <span className="char-trigger-icon">
              <Icons.Users size={16} />
            </span>
            <span className="char-trigger-text">
              {selectedCharactersList.length > 0
                ? `${t('selected', 'Selected')}: ${
                    selectedCharactersList.length === 1
                      ? selectedCharactersList[0].name
                      : `${selectedCharactersList.length} characters`
                  }`
                : t('selectCharacters', 'Select Characters')}
            </span>
          </div>

          <div className="trigger-right-badge">
            <span className="char-pill-count">
              {selectedCharactersList.length}
            </span>
            <span className={`trigger-chevron ${isOpen ? 'open' : ''}`}>
              <Icons.ChevronDown size={14} />
            </span>
          </div>
        </button>

        {/* Dropdown Popover Menu */}
        {isOpen && (
          <div className="char-dropdown-popover google-flow-popover" onClick={(e) => e.stopPropagation()}>
            {/* 1. TOP ACTION ROW: + New Character */}
            <div className="char-popover-top-action">
              <button
                type="button"
                className="popover-new-char-btn"
                onClick={handleNewCharacterClick}
              >
                <div className="new-char-icon-circle">
                  <Icons.Plus size={16} />
                </div>
                <span className="new-char-label-text">+ New Character</span>
              </button>
            </div>

            <div className="popover-divider-line" />

            {/* 2. Quick Search Box */}
            <div className="char-popover-search">
              <span className="search-icon">
                <Icons.Search size={14} />
              </span>
              <input
                type="text"
                placeholder={t('searchCharactersPlaceholder', 'Search characters...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="char-popover-input"
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="search-clear-btn"
                >
                  <Icons.X size={12} />
                </button>
              )}
            </div>

            {/* 3. Scrollable List of Characters */}
            <div className="char-popover-list-body">
              {filtered.map((char) => {
                const isSelected = selectedCharacterIds.includes(char.id);
                return (
                  <div
                    key={char.id}
                    className={`char-option-item flow-char-row ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleCharacterClick(char)}
                  >
                    <div className="char-option-left">
                      <div className="char-mini-avatar-wrap">
                        <img
                          src={char.avatar}
                          alt={char.name}
                          className="char-mini-avatar"
                        />
                      </div>
                      <div className="char-option-details">
                        <div className="char-option-name-row">
                          <span className="char-option-name">{char.name}</span>
                          {char.isCustom && (
                            <span className="custom-char-mini-tag">Custom</span>
                          )}
                        </div>
                        <span className="char-option-role">{char.role || char.gender || 'Character'}</span>
                      </div>
                    </div>

                    <div className={`char-checkbox-circle ${isSelected ? 'checked' : ''}`}>
                      {isSelected && <Icons.Check size={12} />}
                    </div>
                  </div>
                );
              })}

              {filtered.length === 0 && (
                <div className="char-popover-empty">
                  <p>{t('noCharactersFound', 'No characters found')}</p>
                </div>
              )}
            </div>

            {/* 4. Popover Footer */}
            <div className="char-popover-footer">
              <span className="selected-summary-text">
                {selectedCharacterIds.length} {t('selected', 'selected')}
              </span>
              <button
                type="button"
                className="popover-done-btn"
                onClick={() => setIsOpen(false)}
              >
                {t('done', 'Done')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Selected Characters Removable Tag Chips */}
      {selectedCharactersList.length > 0 && (
        <div className="selected-tags-container">
          <span className="selected-tags-label">{t('selectedCharactersLabel', 'Active in Prompt')}:</span>
          <div className="selected-tags-row">
            {selectedCharactersList.map((character) => (
              <div key={character.id} className="selected-char-chip">
                <img
                  src={character.avatar}
                  alt={character.name}
                  className="chip-avatar-img"
                />
                <span className="chip-name-text">@{character.name}</span>
                <button
                  type="button"
                  className="chip-remove-btn"
                  onClick={() => removeSelectedCharacter(character.id)}
                  title={`Remove @${character.name}`}
                >
                  <Icons.X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
