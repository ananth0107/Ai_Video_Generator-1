import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
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

  const toggleSelectCharacter = useCallback((id) => {
    setSelectedCharacterIds((prev) => {
      const exists = prev.includes(id);
      if (exists) {
        return prev.filter((item) => item !== id);
      } else {
        return [...prev, id];
      }
    });
  }, []);

  const selectCharacter = useCallback((id) => {
    setSelectedCharacterIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const removeSelectedCharacter = useCallback((id) => {
    setSelectedCharacterIds((prev) => prev.filter((item) => item !== id));
  }, []);

  const clearSelectedCharacters = useCallback(() => {
    setSelectedCharacterIds([]);
  }, []);

  const isCharacterSelected = useCallback((id) => {
    return selectedCharacterIds.includes(id);
  }, [selectedCharacterIds]);

  const addCharacter = useCallback((characterData) => {
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
    showToast(`Character "${newCharacter.name}" created and added!`, 'Check');
    return newCharacter;
  }, [showToast]);

  const updateCharacter = useCallback((id, updatedData) => {
    setCustomCharacters((prev) =>
      prev.map((char) => (char.id === id ? { ...char, ...updatedData, updatedAt: new Date().toISOString() } : char))
    );
    showToast(`Character updated successfully!`, 'Check');
  }, [showToast]);

  const deleteCharacter = useCallback((id) => {
    setCustomCharacters((prev) => prev.filter((char) => char.id !== id));
    setSelectedCharacterIds((prev) => prev.filter((item) => item !== id));
    showToast('Character removed from library', 'Trash2');
  }, [showToast]);

  const getCharacterById = useCallback((id) => {
    return allCharacters.find((c) => c.id === id) || defaultCharacters[0];
  }, [allCharacters]);

  const value = useMemo(() => ({
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
    updateCharacter,
    deleteCharacter,
    getCharacterById
  }), [
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
    updateCharacter,
    deleteCharacter,
    getCharacterById
  ]);

  return (
    <CharacterContext.Provider value={value}>
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
