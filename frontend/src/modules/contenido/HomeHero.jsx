import { useLanguage } from '../../shared/Language.jsx';
import React from 'react';
import { BazarDoodle } from '../../shared/Icons.jsx';
export default function HomeHero({ hero, images }) {
  const { t, language } = useLanguage();

  return (
    <section className="hero-band" id="inicio">
      <div className="hero-decoration" aria-hidden="true">
        <BazarDoodle kind="flower" className="doodle-flower" />
        <BazarDoodle kind="gift" className="doodle-gift" />
        <span className="confetti confetti-one" />
        <span className="confetti confetti-two" />
      </div>
      <div className="hero wrap">
        <div className="hero-copy">
          <span className="eyebrow pill-label">
            {' '}
            {t('SU BAZAR EN HOJANCHA · GUANACASTE')}{' '}
          </span>
          <h1>
            {hero?.titulo || (
              <>
                {' '}
                {t('Pequeños detalles,')} <br />
                <span>{t('grandes sonrisas.')}</span>
              </>
            )}
          </h1>
          <p>
            {hero?.cuerpo ||
              t(
                'Un regalo, una idea, algo que diga mucho de usted. Explore nuestro bazar y encuentre ese detalle para su próxima ocasión especial.',
              )}
          </p>
          <div className="hero-buttons">
            <a className="button primary" href="#productos">
              {' '}
              {t('Explorar el bazar')} <span aria-hidden="true">↗</span>
            </a>
            <a className="button secondary" href="#contacto">
              {' '}
              {t('Hablemos de su idea')}{' '}
            </a>
          </div>
          <div className="hero-note">
            <BazarDoodle kind="gift" />
            <span>{t('El toque especial empieza con una idea.')}</span>
          </div>
        </div>
        <div className="hero-collage">
          <span className="collage-sticker">
            <BazarDoodle kind="spark" /> {t('Detalles con personalidad')}{' '}
          </span>
          <div className="photo-frame photo-main">
            <img src="/images/vasos-personalizados.jpeg"
              alt={t('Vasos de vidrio personalizados con iniciales doradas, preparados en una caja de regalo')}
              width="720" height="1280" fetchPriority="high" />
            <span>{t('Algo pequeño, algo especial.')}</span>
          </div>
          <div className="photo-frame photo-small">
            <img
              src="/images/regalo-padrinos.jpeg"
              alt={t('Caja de regalo con vasos personalizados para padrinos de boda')}
              width="720"
              height="1280"
              loading="lazy"
            />
            <span>{t('Un toque de creatividad ✦')}</span>
          </div>
          <BazarDoodle kind="flower" className="collage-flower" />
        </div>
      </div>
    </section>
  );
}
