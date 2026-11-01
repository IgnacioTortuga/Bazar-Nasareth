import React, {
  createContext,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import { translate } from './translations.js';

const LanguageContext = createContext({
  language: 'es',
  t: (text) => text,
  setLanguage: () => {},
});
export const useLanguage = () => useContext(LanguageContext);
export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    const query = new URLSearchParams(location.search).get('lang');
    if (query === 'en' || query === 'es') return query;
    try {
      return localStorage.getItem('bazar.language') === 'en' ? 'en' : 'es';
    } catch {
      return 'es';
    }
  });
  useLayoutEffect(() => {
    const original = document.documentElement.lang;
    return () => {
      document.documentElement.lang = original;
    };
  }, []);
  useLayoutEffect(() => {
    document.documentElement.lang = language;
    const url = new URL(location.href);
    url.searchParams.set('lang', language);
    history.replaceState(history.state, '', url);
    try {
      localStorage.setItem('bazar.language', language);
    } catch {
      /* Preferencia disponible sin almacenamiento. */
    }
  }, [language]);
  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: (text, parameters) => translate(text, language, parameters),
    }),
    [language],
  );
  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();
  const label = language === 'es' ? 'Switch to English' : 'Cambiar a español';
  return (
    <button
      type="button"
      className="reading-control language-toggle"
      aria-label={label}
      title={label}
      onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
    >
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" />
        <ellipse cx="12" cy="12" rx="4" ry="9" />
        <path d="M3 12h18" />
      </svg>
      <span lang={language === 'es' ? 'en' : 'es'}>
        {language === 'es' ? 'EN' : 'ES'}
      </span>
    </button>
  );
}
