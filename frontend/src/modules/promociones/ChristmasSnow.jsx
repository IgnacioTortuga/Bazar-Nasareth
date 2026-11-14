import React, { useEffect, useState } from 'react';
import { isActiveChristmasPromotion } from './christmasPromotion.js';
import './christmasSnow.css';

const flakes = Array.from({ length: 28 }, (_, index) => ({
  '--snow-left': `${(index * 37) % 100}%`,
  '--snow-size': `${7 + (index % 5) * 3}px`,
  '--snow-drift': `${(index % 7 - 3) * 10}px`,
  '--snow-delay': `${(index % 6) * 100}ms`,
  '--snow-duration': `${2900 + (index % 8) * 160}ms`,
}));

export default function ChristmasSnow({ promotions, replay }) {
  const [now, setNow] = useState(Date.now);
  const active = promotions.some((promotion) => isActiveChristmasPromotion(promotion, now));

  useEffect(() => {
    const update = () => setNow(Date.now());
    update();
    const timer = window.setInterval(update, 15000);
    return () => window.clearInterval(timer);
  }, [promotions]);

  return active && (
    <div className="christmas-snow" aria-hidden="true" key={replay}>
      {flakes.map((style, index) => (
        <span key={index} style={style}>{index % 3 === 0 ? '❄︎' : '•'}</span>
      ))}
    </div>
  );
}
