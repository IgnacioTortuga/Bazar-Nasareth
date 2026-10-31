import React from 'react';
import Img from '../../shared/Img.jsx';
import { BazarDoodle } from '../../shared/Icons.jsx';
import { promotionTimingLabel } from '../../shared/format.js';
export default function PromotionsSection({ data, images, openCampaign }) {
  return (
    <section id="promociones" className="wrap section">
      <span className="eyebrow">TEMPORADA EN EL BAZAR</span>
      <h2>
        Un detalle más para alegrarse <BazarDoodle />
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
                  {upcoming ? '✦ Próximamente' : '✦ Vigente ahora'}
                </span>
                <h3>{p.titulo}</h3>
                <p>{p.descripcion}</p>
                <p>
                  <b>Condiciones:</b> {p.condiciones}
                </p>
                <small>
                  {upcoming ? 'Disponible desde ' : 'Hasta '}
                  {new Date(upcoming ? p.inicio : p.fin).toLocaleDateString(
                    'es-CR',
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
                    Ver productos para esta temática
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>
      {!data.promociones.length && (
        <p className="empty">No hay promociones vigentes.</p>
      )}
    </section>
  );
}
