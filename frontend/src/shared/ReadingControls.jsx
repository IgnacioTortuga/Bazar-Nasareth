import { useLanguage } from './Language.jsx';
import { flushSync } from 'react-dom';
import { revealTheme } from './pageMotion.js';
import React, {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

const preferenceKey = 'bazar.reading-preferences';
const sizes = { normal: '100%', medium: '112.5%', large: '125%' };
function readPreferences() {
  try {
    const saved = JSON.parse(localStorage.getItem(preferenceKey));
    return {
      theme: saved?.theme === 'dark' ? 'dark' : 'light',
      fontSize: Object.hasOwn(sizes, saved?.fontSize)
        ? saved.fontSize
        : 'normal',
    };
  } catch {
    return { theme: 'light', fontSize: 'normal' };
  }
}

export function useReadingPreferences() {
  const [preferences, setPreferences] = useState(readPreferences);
  const transition = useRef(null);
  useEffect(() => () => transition.current?.skipTransition(), []);
  useLayoutEffect(() => {
    const root = document.documentElement;
    const original = {
      theme: root.getAttribute('data-bazar-theme'),
      size: root.getAttribute('data-bazar-font'),
      fontSize: root.style.fontSize,
      scheme: root.style.colorScheme,
      header: root.style.getPropertyValue('--bazar-header-height'),
    };
    const header = document.querySelector('.public-header');
    const observer = new ResizeObserver(() =>
      root.style.setProperty(
        '--bazar-header-height',
        `${header.getBoundingClientRect().height}px`,
      ),
    );
    if (header) observer.observe(header);
    return () => {
      observer.disconnect();
      for (const [name, value] of [
        ['data-bazar-theme', original.theme],
        ['data-bazar-font', original.size],
      ]) {
        if (value == null) root.removeAttribute(name);
        else root.setAttribute(name, value);
      }
      root.style.fontSize = original.fontSize;
      root.style.colorScheme = original.scheme;
      if (original.header)
        root.style.setProperty('--bazar-header-height', original.header);
      else root.style.removeProperty('--bazar-header-height');
    };
  }, []);
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.dataset.bazarTheme = preferences.theme;
    root.dataset.bazarFont = preferences.fontSize;
    root.style.fontSize = sizes[preferences.fontSize];
    root.style.colorScheme = preferences.theme;
    try {
      localStorage.setItem(preferenceKey, JSON.stringify(preferences));
    } catch {
      /* Sigue funcionando sin almacenamiento. */
    }
  }, [preferences]);
  return {
    ...preferences,
    toggleTheme: (event) => {
      if (transition.current) return;
      const active = revealTheme(
        () =>
          flushSync(() =>
            setPreferences((current) => ({
              ...current,
              theme: current.theme === 'dark' ? 'light' : 'dark',
            })),
          ),
        event?.currentTarget,
      );
      transition.current = active;
      active?.finished
        .catch(() => {})
        .finally(() => {
          if (transition.current === active) transition.current = null;
        });
    },
    setFontSize: (fontSize) =>
      setPreferences((current) => ({ ...current, fontSize })),
  };
}

export function ContrastToggle({ theme, onToggle }) {
  const { t, language } = useLanguage();

  const dark = theme === 'dark';
  const label = dark ? t('Cambiar a modo claro') : t('Cambiar a modo oscuro');
  return (
    <button
      type="button"
      className="reading-control contrast-toggle"
      aria-label={label}
      aria-pressed={dark}
      title={label}
      onClick={onToggle}
    >
      <svg
        viewBox="0 0 24 24"
        width="24"
        height="24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
      >
        {dark ? (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
          </>
        ) : (
          <path d="M20.7 13A8.7 8.7 0 0 1 11 3.3 8.8 8.8 0 1 0 20.7 13Z" />
        )}
      </svg>
    </button>
  );
}

export function ReadingMenu({ fontSize, onSizeChange }) {
  const { t, language } = useLanguage();

  const [open, setOpen] = useState(false);
  const container = useRef(null);
  const trigger = useRef(null);
  const panelId = useId();
  useEffect(() => {
    if (!open) return;
    container.current.querySelector('button[aria-pressed="true"]')?.focus();
    const outside = (event) => {
      if (!container.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [open]);
  return (
    <div
      className="reading-menu"
      ref={container}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open) {
          event.stopPropagation();
          setOpen(false);
          trigger.current?.focus();
        }
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <button
        ref={trigger}
        type="button"
        className="reading-control"
        aria-label={t('Opciones de accesibilidad')}
        title={t('Opciones de accesibilidad')}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((current) => !current)}
      >
        <svg
          viewBox="0 0 24 24"
          width="24"
          height="24"
          fill="currentColor"
          aria-hidden="true"
        >
          <circle cx="5" cy="12" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="19" cy="12" r="2" />
        </svg>
      </button>
      {open && (
        <div className="reading-panel" id={panelId}>
          <fieldset>
            <legend>{t('Tamaño del texto')}</legend>
            {[
              ['normal', t('Normal')],
              ['medium', t('Mediano')],
              ['large', t('Grande')],
            ].map(([value, label]) => (
              <button
                className="reading-option"
                key={value}
                type="button"
                aria-pressed={fontSize === value}
                onClick={() => onSizeChange(value)}
              >
                <svg
                  className="reading-check"
                  viewBox="0 0 20 20"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  {fontSize === value && <path d="m4 10 4 4 8-8" />}
                </svg>
                <span>{label}</span>
                <span
                  className={`reading-sample sample-${value}`}
                  aria-hidden="true"
                >
                  Aa
                </span>
              </button>
            ))}
          </fieldset>
        </div>
      )}
    </div>
  );
}
