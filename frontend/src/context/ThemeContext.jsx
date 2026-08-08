import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // 1. Check Saved Theme in LocalStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme;

    // 2. Fallback to System Preference (Dark or Light)
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }

    return 'dark'; // Default
  });

  useEffect(() => {
    // HTML root element attribute set karein
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  // Light/Dark mode specific theme values (Useful for Recharts, Canvas, Chart.js)
  const isLight = theme === 'light';
  
  const colors = {
    accent: isLight ? '#4f46e5' : '#a3e635',
    accentDark: isLight ? '#4338ca' : '#84cc16',
    bgMain: isLight ? '#f8fafc' : '#0a0a0a',
    bgCard: isLight ? '#ffffff' : '#161616',
    textPrimary: isLight ? '#0f172a' : '#ffffff',
    textMuted: isLight ? '#64748b' : '#9ca3af',
    border: isLight ? '#e2e8f0' : '#2a2a2a',
    chartGrid: isLight ? 'rgba(15, 23, 42, 0.08)' : 'rgba(255, 255, 255, 0.08)'
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isLight, colors }}>
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