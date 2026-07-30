'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type Theme = 'dark' | 'dim' | 'light';

interface ThemeContextType {
  theme: Theme;
  setTheme: (t: Theme) => void;
  cycleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

const STORAGE_KEY = 'containo_theme';
const THEMES: Theme[] = ['dark', 'dim', 'light'];

function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
  if (saved && THEMES.includes(saved)) return saved;
  return getSystemTheme();
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = getInitialTheme();
    if (saved && saved !== 'dark') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setThemeState(saved);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme, mounted]);

  const setTheme = useCallback((t: Theme) => setThemeState(t), []);

  const cycleTheme = useCallback(() => {
    setThemeState(prev => {
      const idx = THEMES.indexOf(prev);
      return THEMES[(idx + 1) % THEMES.length];
    });
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: light)');
    const handler = () => {
      if (!localStorage.getItem(STORAGE_KEY)) {
        setThemeState(mq.matches ? 'light' : 'dark');
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, cycleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
