'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { lightTheme, darkTheme } from '../styles/themes';

type Theme = typeof lightTheme;
type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mounted, setMounted] = useState(false);
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark');

  // Handle initial theme setup
  useEffect(() => {
    const root = window.document.documentElement;
    const initialColorValue = root.style.getPropertyValue('--initial-color-mode');
    
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') as ThemeMode;
    
    if (savedTheme) {
      setThemeMode(savedTheme);
      root.setAttribute('data-theme', savedTheme);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initialTheme = prefersDark ? 'dark' : 'light';
      setThemeMode(initialTheme);
      root.setAttribute('data-theme', initialTheme);
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      const root = window.document.documentElement;
      
      // Remove existing theme classes
      root.classList.remove('light', 'dark');
      
      // Add new theme class
      root.classList.add(themeMode);
      
      // Set theme attribute
      root.setAttribute('data-theme', themeMode);
      
      // Store theme preference
      localStorage.setItem('theme', themeMode);
    }
  }, [themeMode, mounted]);

  const theme = themeMode === 'light' ? lightTheme : darkTheme;

  const toggleTheme = () => {
    setThemeMode(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, themeMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
