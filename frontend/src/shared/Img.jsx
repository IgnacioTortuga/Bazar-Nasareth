import React from 'react';
import { imageUrl } from './images.js';

export default function Img({ id, alt, className = '' }) {
  return id ? (
    <img
      className={className}
      src={imageUrl(id)}
      alt={alt || ''}
      loading="lazy"
    />
  ) : (
    <div className={'no-image ' + className} aria-label="Sin fotografía">
      Fotografía próximamente
    </div>
  );
}
