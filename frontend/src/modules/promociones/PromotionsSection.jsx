import { useLanguage } from '../../shared/Language.jsx';
import React from 'react';
import Img from '../../shared/Img.jsx';
import { BazarDoodle } from '../../shared/Icons.jsx';
import { promotionTimingLabel } from '../../shared/format.js';
export default function PromotionsSection({ data, images, openCampaign }) {
  const { t, language } = useLanguage();

  return (
    <section id="promociones" className="wrap section">
      <span className="eyebrow">{t('TEMPORADA EN EL BAZAR')}</span>
      <h2>
        {' '}
        {t('Un detalle más para alegrarse')} <BazarDoodle />
      </h2>
      <div className="grid promotion-grid">
        {data.promociones.map((p) => {
          const status = promotionTimingLabel(p);
          const upcoming = status === 'Programada';
          return (
            <article
              className={`card promo-card ${upcoming ? 'promo-upcoming' : 'promo-current'}`}
              key={p.id}
            >
              <Img id={p.imagenId} alt={images[p.imagenId]} />
              <div className="card-body">
                <span className="promo-status">
                  {upcoming ? t('✦ Próximamente') : t('✦ Vigente ahora')}
                </span>
                <h3>{p.titulo}</h3>
                <p>{p.descripcion}</p>
                <p>
                  <b>{t('Condiciones:')}</b> {p.condiciones}
                </p>
                <small>
                  {upcoming ? t('Disponible desde ') : t('Hasta ')}
                  {new Date(upcoming ? p.inicio : p.fin).toLocaleDateString(
                    language === 'en' ? 'en-US' : 'es-CR',
                    {
                      timeZone: 'America/Costa_Rica',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    },
                  )}
                </small>
                {!upcoming && (
                  <button
                    className="button promo-products-button"
                    type="button"
                    onClick={() => openCampaign(p)}
                  >
                    {' '}
                    {t('Consultar con esta temática')}{' '}
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>
      {!data.promociones.length && (
        <p className="empty">{t('No hay promociones vigentes.')}</p>
      )}
    </section>
  );
}
