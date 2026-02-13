'use client';

import { useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const stored = localStorage.getItem('blokus-theme') as Theme | null;
    if (stored === 'light' || stored === 'dark') {
      setTheme(stored);
      document.documentElement.dataset.theme = stored;
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
      document.documentElement.dataset.theme = 'dark';
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('blokus-theme', next);
      document.documentElement.dataset.theme = next;
      return next;
    });
  }, []);

  return { theme, toggleTheme };
}
