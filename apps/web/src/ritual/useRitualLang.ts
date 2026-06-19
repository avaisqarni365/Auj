'use client';

import { useEffect, useState } from 'react';

const KEY = 'auj.ritual.lang';

/** Selected guide language, persisted on-device. Defaults to English. */
export function useRitualLang(): [string, (lang: string) => void] {
  const [lang, setLangState] = useState('en');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved) setLangState(saved);
    } catch {
      /* ignore */
    }
  }, []);

  const setLang = (l: string): void => {
    setLangState(l);
    try {
      localStorage.setItem(KEY, l);
    } catch {
      /* ignore */
    }
  };

  return [lang, setLang];
}
