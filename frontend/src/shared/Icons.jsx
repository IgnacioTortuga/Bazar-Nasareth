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
