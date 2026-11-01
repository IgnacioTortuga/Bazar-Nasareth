import { useLanguage } from '../../shared/Language.jsx';
import React from 'react';
import Img from '../../shared/Img.jsx';
import { BazarDoodle } from '../../shared/Icons.jsx';
import { formattedPrice } from '../../shared/format.js';
import { serviceInquiryUrl } from './contact.js';
export default function ServicesSection({ data, images, business }) {
  const { t, language } = useLanguage();

  return (
    <section id="servicios" className="soft section">
      <div className="wrap">
        <span className="eyebrow">{t('LO QUE HACEMOS')}</span>
        <h2>
          {' '}
          {t('Hagamos su idea especial')} <BazarDoodle kind="gift" />
        </h2>
        <div className="grid">
          {data.servicios.map((s) => (
            <article className="card" key={s.id}>
              <Img id={s.imagenId} alt={images[s.imagenId]} />
              <div className="card-body">
                <h3>{s.nombre}</h3>
                <p>{s.descripcion}</p>
                <p>
                  <b>{t('Alcance:')}</b> {s.alcance}
                </p>
                {s.precioDesde != null && (
                  <strong>
                    {t('Desde ') +
                      formattedPrice(s.precioDesde, s.moneda, language)}
                  </strong>
                )}
                <a
                  className="button primary service-inquiry"
                  href={serviceInquiryUrl(s, business, language)}
                  target={
                    serviceInquiryUrl(s, business, language) === '#contacto'
                      ? undefined
                      : '_blank'
                  }
                  rel="noopener noreferrer"
                  aria-label={t('Consultar {name}{details}', {
                    name: s.nombre,
                    details: t(
                      s.precioDesde == null
                        ? ': precio y disponibilidad'
                        : ': disponibilidad y condiciones',
                    ),
                  })}
                >
                  {s.precioDesde == null
                    ? t('Consultar precio')
                    : t('Consultar servicio')}
                </a>
              </div>
            </article>
          ))}
        </div>
        {!data.servicios.length && (
          <p className="empty">
            {t('Próximamente habrá información de servicios.')}
          </p>
        )}
      </div>
    </section>
  );
}
