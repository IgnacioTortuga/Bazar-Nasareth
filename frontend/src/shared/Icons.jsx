import React from 'react';

function BazarDoodle({ kind = 'spark', className = '' }) {
  const shapes = {
    spark: <path d="M24 3L29 19L45 24L29 29L24 45L19 29L3 24L19 19Z" />,
    gift: (
      <>
        <rect x="7" y="20" width="34" height="23" rx="3" />
        <path d="M5 15H43V23H5Z M24 15V43 M24 15C10 16 8 4 16 5C22 5 24 15 24 15C24 15 26 5 32 5C40 4 38 16 24 15" />
      </>
    ),
    flower: (
      <>
        <path d="M24 15C9 0 0 16 15 24C0 32 9 48 24 33C39 48 48 32 33 24C48 16 39 0 24 15Z" />
        <circle cx="24" cy="24" r="5" />
      </>
    ),
  };
  return (
    <svg
      className={'bazar-doodle ' + className}
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {shapes[kind] || shapes.spark}
    </svg>
  );
}
function SocialIcon({ kind }) {
  if (kind === 'instagram') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" className="social-icon-fill" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3v5M7 8h10M7 8v4M17 8v4M12 8v4" />
      <circle cx="7" cy="15" r="2.5" />
      <circle cx="12" cy="15" r="2.5" />
      <circle cx="17" cy="15" r="2.5" />
    </svg>
  );
}
export { BazarDoodle, SocialIcon };

export function AdminIcon({ kind = 'usuarios' }) {
  const paths = {
    portada: 'M3 11 12 3l9 8M5 10v11h14V10M9 21v-7h6v7',
    productos: 'm3 7 9-4 9 4-9 4-9-4Zm0 0v10l9 4 9-4V7M12 11v10',
    servicios: 'm14 6 4-3 3 3-3 4-4-4ZM14 8 3 19l2 2L16 10',
    imagenes: 'M3 3h18v18H3zM3 17l6-6 4 4 3-3 5 5M15 7h2',
    promociones: 'M3 3h9l9 9-9 9-9-9V3ZM7 7h.01',
    galeria: 'M7 3h14v14H7zM3 7v14h14',
    textos: 'M5 3h14v18H5zM8 8h8M8 12h8M8 16h5',
    contacto: 'M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0ZM10 10a2 2 0 1 0 4 0 2 2 0 1 0-4 0',
    usuarios: 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM4 21v-2a8 8 0 0 1 16 0v2',
  };
  return <svg className="admin-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[kind] || paths.usuarios} /></svg>;
}
