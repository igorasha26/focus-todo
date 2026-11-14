import { useCallback, useEffect, useState } from 'react';
import { THEME_STORAGE_KEY, loadTheme, saveTheme, subscribeToStorage } from '../lib/storage';
import type { Theme } from '../model/types';

const DARK_QUERY = '(prefers-color-scheme: dark)';

function getSystemTheme(): Theme {
  if (typeof window.matchMedia !== 'function') {
    return 'light';
  }
  return window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light';
}

interface UseThemeResult {
  theme: Theme;
  toggleTheme: () => void;
}

export function useTheme(): UseThemeResult {
  const [preference, setPreference] = useState<Theme | null>(loadTheme);
  const [systemTheme, setSystemTheme] = useState<Theme>(getSystemTheme);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') {
      return;
    }
    const query = window.matchMedia(DARK_QUERY);
    const handleChange = (event: MediaQueryListEvent) => setSystemTheme(event.matches ? 'dark' : 'light');
    query.addEventListener('change', handleChange);
    return () => query.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => subscribeToStorage(THEME_STORAGE_KEY, () => setPreference(loadTheme())), []);

  useEffect(() => {
    const root = document.documentElement;
    if (preference) {
      root.dataset.theme = preference;
    } else {
      delete root.dataset.theme;
    }
  }, [preference]);

  const theme = preference ?? systemTheme;

  const toggleTheme = useCallback(() => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    saveTheme(next);
    setPreference(next);
  }, [theme]);

  return { theme, toggleTheme };
}
