import React from 'react';
import Img from '../../shared/Img.jsx';
import { BazarDoodle } from '../../shared/Icons.jsx';
export default function Highlights({ highlights, images }) {
  return (
    <section className="featured wrap" aria-label="Explore Bazar Nazareth">
      <div className="featured-grid">
        {highlights.map((item, index) => (
          <a
            className={'feature-card feature-' + index}
            key={item.id}
            href={'#' + item.id}
          >
            <div className="feature-visual">
              {item.imageId ? (
                <Img id={item.imageId} alt={images[item.imageId]} />
              ) : item.fallback ? (
                <img
                  src={item.fallback}
                  alt="Inspiración de detalles personalizados del bazar"
                  loading="lazy"
                  width="1004"
                  height="1004"
                />
              ) : (
                <div className="feature-art" aria-hidden="true">
                  <span className="art-orbit" />
                  <BazarDoodle kind={item.symbol} className="art-symbol" />
                  <span className="art-word">
                    {index === 0
                      ? 'Un detalle especial'
                      : index === 1
                        ? 'Hecho para usted'
                        : 'Algo por descubrir'}
                  </span>
                </div>
              )}
              <span className="feature-arrow" aria-hidden="true">
                ↗
              </span>
            </div>
            <div className="feature-body">
              <h2>{item.title}</h2>
              <span>{item.tag}</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
