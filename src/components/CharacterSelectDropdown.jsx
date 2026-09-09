import React, { useState, useRef, useEffect } from 'react';
import { Icons } from './Icons';
import { useCharacters } from '../context/CharacterContext';
import { useLanguage } from '../context/LanguageContext';

export default function CharacterSelectDropdown({
  badge = '02',
  label = '',
  className = '',
  onOpenLibrary = null
}) {
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

  // Group characters into Actors, Actresses, Custom
  const filtered = allCharacters.filter((char) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      char.name.toLowerCase().includes(q) ||
      char.role.toLowerCase().includes(q) ||
      (char.category && char.category.toLowerCase().includes(q))
    );
  });

  const actors = filtered.filter((c) => c.gender === 'Actor' || c.category === 'Actor' || (c.category !== 'Actress' && !c.isCustom));
  const actresses = filtered.filter((c) => c.gender === 'Actress' || c.category === 'Actress');
  const customList = filtered.filter((c) => c.isCustom);

  const selectedCharactersList = allCharacters.filter((c) =>
    selectedCharacterIds.includes(c.id)
  );

  return (
    <div className={`character-select-module ${className}`} ref={dropdownRef}>
      {/* Label Row */}
      <div className="char-select-header-row">
        <label className="form-step-label">
          {badge && <span className="form-step-badge">{badge}</span>}
          <span>{label || t('stepCharactersLabel')}</span>
        </label>

        {selectedCharactersList.length > 0 && (
          <button
            type="button"
            onClick={clearSelectedCharacters}
            className="mini-clear-btn"
            title="Clear all selected characters"
          >
            {t('remove')} {t('all')}
          </button>
        )}
      </div>

      {/* Dropdown Anchor & Trigger */}
      <div className="char-dropdown-anchor">
        <button
          type="button"
          className={`char-dropdown-trigger ${isOpen ? 'active' : ''}`}
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <div className="trigger-left-info">
            <span className="char-trigger-icon">
              <Icons.Users />
            </span>
            <span className="char-trigger-text">
              {selectedCharactersList.length > 0
                ? `${t('selected')}: ${selectedCharactersList.length} ${
                    selectedCharactersList.length === 1
                      ? selectedCharactersList[0].name
                      : `(${selectedCharactersList.length})`
                  }`
                : t('selectCharacters')}
            </span>
          </div>

          <div className="trigger-right-badge">
            <span className="char-pill-count">
              {selectedCharactersList.length}
            </span>
            <span className={`trigger-chevron ${isOpen ? 'open' : ''}`}>
              <Icons.ChevronDown />
            </span>
          </div>
        </button>

        {/* Dropdown Popover Menu */}
        {isOpen && (
          <div className="char-dropdown-popover">
            {/* Search Box */}
            <div className="char-popover-search">
              <span className="search-icon">
                <Icons.Search />
              </span>
              <input
                type="text"
                placeholder={t('searchCharactersPlaceholder')}
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
                  <Icons.X />
                </button>
              )}
            </div>

            {/* Scrollable Character Groups */}
            <div className="char-popover-list-body">
              {/* ACTORS GROUP */}
              {actors.length > 0 && (
                <div className="char-group-section">
                  <div className="char-group-title">
                    <span>{t('actors').toUpperCase()}</span>
                    <span className="group-count">({actors.length})</span>
                  </div>
                  <div className="char-items-subgrid">
                    {actors.map((actor) => {
                      const isSelected = selectedCharacterIds.includes(actor.id);
                      return (
                        <div
                          key={actor.id}
                          className={`char-option-item ${isSelected ? 'selected' : ''}`}
                          onClick={() => toggleSelectCharacter(actor.id)}
                        >
                          <div className="char-option-left">
                            <img
                              src={actor.avatar}
                              alt={actor.name}
                              className="char-mini-avatar"
                            />
                            <div className="char-option-details">
                              <span className="char-option-name">{actor.name}</span>
                              <span className="char-option-role">{actor.role}</span>
                            </div>
                          </div>

                          <div className={`char-checkbox-circle ${isSelected ? 'checked' : ''}`}>
                            {isSelected && <Icons.Check />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ACTRESSES GROUP */}
              {actresses.length > 0 && (
                <div className="char-group-section">
                  <div className="char-group-title">
                    <span>{t('actresses').toUpperCase()}</span>
                    <span className="group-count">({actresses.length})</span>
                  </div>
                  <div className="char-items-subgrid">
                    {actresses.map((actress) => {
                      const isSelected = selectedCharacterIds.includes(actress.id);
                      return (
                        <div
                          key={actress.id}
                          className={`char-option-item ${isSelected ? 'selected' : ''}`}
                          onClick={() => toggleSelectCharacter(actress.id)}
                        >
                          <div className="char-option-left">
                            <img
                              src={actress.avatar}
                              alt={actress.name}
                              className="char-mini-avatar"
                            />
                            <div className="char-option-details">
                              <span className="char-option-name">{actress.name}</span>
                              <span className="char-option-role">{actress.role}</span>
                            </div>
                          </div>

                          <div className={`char-checkbox-circle ${isSelected ? 'checked' : ''}`}>
                            {isSelected && <Icons.Check />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* CUSTOM CHARACTERS (if any) */}
              {customList.length > 0 && (
                <div className="char-group-section">
                  <div className="char-group-title">
                    <span>{t('custom').toUpperCase()}</span>
                    <span className="group-count">({customList.length})</span>
                  </div>
                  <div className="char-items-subgrid">
                    {customList.map((customChar) => {
                      const isSelected = selectedCharacterIds.includes(customChar.id);
                      return (
                        <div
                          key={customChar.id}
                          className={`char-option-item ${isSelected ? 'selected' : ''}`}
                          onClick={() => toggleSelectCharacter(customChar.id)}
                        >
                          <div className="char-option-left">
                            <img
                              src={customChar.avatar}
                              alt={customChar.name}
                              className="char-mini-avatar"
                            />
                            <div className="char-option-details">
                              <span className="char-option-name">{customChar.name}</span>
                              <span className="char-option-role">{customChar.role}</span>
                            </div>
                          </div>

                          <div className={`char-checkbox-circle ${isSelected ? 'checked' : ''}`}>
                            {isSelected && <Icons.Check />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {filtered.length === 0 && (
                <div className="char-popover-empty">
                  <p>{t('noCharactersFound')}</p>
                </div>
              )}
            </div>

            {/* Popover Footer */}
            <div className="char-popover-footer">
              <span className="selected-summary-text">
                {selectedCharacterIds.length} {t('selected')}
              </span>
              <button
                type="button"
                className="popover-done-btn"
                onClick={() => setIsOpen(false)}
              >
                {t('addSelectedCharacters')} ({selectedCharacterIds.length})
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Selected Characters Removable Tag Chips */}
      {selectedCharactersList.length > 0 && (
        <div className="selected-tags-container">
          <span className="selected-tags-label">{t('selectedCharactersLabel')}</span>
          <div className="selected-tags-row">
            {selectedCharactersList.map((character) => (
              <div key={character.id} className="selected-char-chip">
                <img
                  src={character.avatar}
                  alt={character.name}
                  className="chip-avatar-img"
                />
                <span className="chip-name-text">{character.name}</span>
                <button
                  type="button"
                  className="chip-remove-btn"
                  onClick={() => removeSelectedCharacter(character.id)}
                  title={`Remove ${character.name}`}
                >
                  <Icons.X />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
