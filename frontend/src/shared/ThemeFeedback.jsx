import { useLanguage } from './Language.jsx';
import React, { useEffect, useRef } from 'react';

export default function ThemeFeedback({ title, onClose }) {
  const { t, language } = useLanguage();

  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const timeout = setTimeout(() => close.current(), 3400);
    return () => clearTimeout(timeout);
  }, []);
  return (
    <div className="theme-feedback" role="status" aria-atomic="true">
      <span className="theme-feedback-icon" aria-hidden="true">
        <svg
          viewBox="0 0 48 48"
          width="44"
          height="44"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            d="M24 14c-8-8-20 0-18 13 1 10 11 15 18 12 7 3 17-2 18-12 2-13-10-21-18-13Z"
            fill="currentColor"
            stroke="none"
          />
          <path
            d="M24 14c-2-5 0-8 5-9"
            stroke="#a9e2bb"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="m13 25 6-5 1 6Zm15 1 1-6 6 5ZM15 31l5 2 4-2 4 2 5-2-4 6H19Z"
            fill="#38213d"
            stroke="none"
          />
        </svg>
      </span>
      <div>
        <strong>
          {t('Temática')} {t(title)} {t('activada')}
        </strong>
        <span>{t('Se añadirá a su consulta por WhatsApp.')}</span>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label={t('Cerrar aviso de temática')}
      >
        ×
      </button>
    </div>
  );
}
