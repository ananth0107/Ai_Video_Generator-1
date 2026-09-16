import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext({
  theme: 'dark',
  toggleTheme: () => {},
  setTheme: () => {}
});

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try {
      const saved = localStorage.getItem('thamili_theme');
      if (saved === 'dark' || saved === 'light') return saved;
    } catch (e) {
      console.warn('Could not read theme from localStorage', e);
    }
    return 'dark'; // Default to Deep Cosmic Dark Studio
  });

  useEffect(() => {
    try {
      localStorage.setItem('thamili_theme', theme);
    } catch (e) {
      console.warn('Could not save theme to localStorage', e);
    }

    const root = document.documentElement;
    const body = document.body;

    if (theme === 'dark') {
      root.classList.add('theme-dark', 'dark');
      root.classList.remove('theme-light', 'light');
      body.classList.add('theme-dark', 'dark');
      body.classList.remove('theme-light', 'light');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.add('theme-light', 'light');
      root.classList.remove('theme-dark', 'dark');
      body.classList.add('theme-light', 'light');
      body.classList.remove('theme-dark', 'dark');
      root.setAttribute('data-theme', 'light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setTheme = (newTheme) => {
    if (newTheme === 'dark' || newTheme === 'light') {
      setThemeState(newTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
