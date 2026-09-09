import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { defaultCharacters } from '../data/defaultCharacters';
import { useToast } from './ToastContext';

const CharacterContext = createContext();

const STORAGE_KEY = 'thamili_custom_characters_v2';
const SELECTED_STORAGE_KEY = 'thamili_selected_characters_v2';

export function CharacterProvider({ children }) {
  const { showToast } = useToast();

  const [customCharacters, setCustomCharacters] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to load custom characters from localStorage:', e);
      return [];
    }
  });

  const [selectedCharacterIds, setSelectedCharacterIds] = useState(() => {
    try {
      const saved = localStorage.getItem(SELECTED_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save custom characters to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customCharacters));
    } catch (e) {
      console.error('Failed to save custom characters to localStorage:', e);
    }
  }, [customCharacters]);

  // Save selected characters to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(SELECTED_STORAGE_KEY, JSON.stringify(selectedCharacterIds));
    } catch (e) {
      console.error('Failed to save selected characters:', e);
    }
  }, [selectedCharacterIds]);

  // Combined character list (Custom first, then Defaults)
  const allCharacters = useMemo(() => {
    return [...customCharacters, ...defaultCharacters];
  }, [customCharacters]);

  const selectedCharacters = useMemo(() => {
    return allCharacters.filter((c) => selectedCharacterIds.includes(c.id));
  }, [allCharacters, selectedCharacterIds]);

  const toggleSelectCharacter = (id) => {
    setSelectedCharacterIds((prev) => {
      const exists = prev.includes(id);
      if (exists) {
        return prev.filter((item) => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const selectCharacter = (id) => {
    setSelectedCharacterIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const removeSelectedCharacter = (id) => {
    setSelectedCharacterIds((prev) => prev.filter((item) => item !== id));
  };

  const clearSelectedCharacters = () => {
    setSelectedCharacterIds([]);
  };

  const isCharacterSelected = (id) => {
    return selectedCharacterIds.includes(id);
  };

  const addCharacter = (characterData) => {
    const newId = `custom-${Date.now()}`;
    const newCharacter = {
      ...characterData,
      id: newId,
      isCustom: true,
      isDefault: false,
      gender: characterData.category || 'Actor',
      category: characterData.category || 'Custom',
      createdAt: new Date().toISOString()
    };

    setCustomCharacters((prev) => [newCharacter, ...prev]);
    // Auto-select newly created character
    setSelectedCharacterIds((prev) => [...prev, newId]);
    showToast(`✨ Character "${newCharacter.name}" created and added!`, 'Sparkles');
    return newCharacter;
  };

  const deleteCharacter = (id) => {
    setCustomCharacters((prev) => prev.filter((char) => char.id !== id));
    setSelectedCharacterIds((prev) => prev.filter((item) => item !== id));
    showToast('Character removed from library', 'Trash2');
  };

  const getCharacterById = (id) => {
    return allCharacters.find((c) => c.id === id) || defaultCharacters[0];
  };

  return (
    <CharacterContext.Provider
      value={{
        defaultCharacters,
        customCharacters,
        allCharacters,
        selectedCharacterIds,
        selectedCharacters,
        toggleSelectCharacter,
        selectCharacter,
        removeSelectedCharacter,
        clearSelectedCharacters,
        isCharacterSelected,
        addCharacter,
        deleteCharacter,
        getCharacterById
      }}
    >
      {children}
    </CharacterContext.Provider>
  );
}

export function useCharacters() {
  const context = useContext(CharacterContext);
  if (!context) {
    throw new Error('useCharacters must be used within a CharacterProvider');
  }
  return context;
}
