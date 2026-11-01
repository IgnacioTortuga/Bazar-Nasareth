import { useLanguage } from './Language.jsx';
import React from 'react';
import { imageUrl } from './images.js';

export default function Img({ id, alt, className = '' }) {
  const { t, language } = useLanguage();

  return id ? (
    <img
      className={className}
      src={imageUrl(id)}
      alt={alt || ''}
      loading="lazy"
    />
  ) : (
    <div className={'no-image ' + className} aria-label={t('Sin fotografía')}>
      {' '}
      {t('Fotografía próximamente')}{' '}
    </div>
  );
}
