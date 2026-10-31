import React from 'react';
import Img from '../../shared/Img.jsx';
import { BazarDoodle } from '../../shared/Icons.jsx';
import { formattedPrice } from '../../shared/format.js';
import { serviceInquiryUrl } from './contact.js';
export default function ServicesSection({ data, images, business }) {
  return (
    <section id="servicios" className="soft section">
      <div className="wrap">
        <span className="eyebrow">LO QUE HACEMOS</span>
        <h2>
          Hagamos su idea especial <BazarDoodle kind="gift" />
        </h2>
        <div className="grid">
          {data.servicios.map((s) => (
            <article className="card" key={s.id}>
              <Img id={s.imagenId} alt={images[s.imagenId]} />
              <div className="card-body">
                <h3>{s.nombre}</h3>
                <p>{s.descripcion}</p>
                <p>
                  <b>Alcance:</b> {s.alcance}
                </p>
                {s.precioDesde != null && (
                  <strong>
                    {'Desde ' + formattedPrice(s.precioDesde, s.moneda)}
                  </strong>
                )}
                <a
                  className="button primary service-inquiry"
                  href={serviceInquiryUrl(s, business)}
                  target={
                    serviceInquiryUrl(s, business) === '#contacto'
                      ? undefined
                      : '_blank'
                  }
                  rel="noopener noreferrer"
                  aria-label={`Consultar ${s.nombre}${s.precioDesde == null ? ': precio y disponibilidad' : ': disponibilidad y condiciones'}`}
                >
                  {s.precioDesde == null
                    ? 'Consultar precio'
                    : 'Consultar servicio'}
                </a>
              </div>
            </article>
          ))}
        </div>
        {!data.servicios.length && (
          <p className="empty">Próximamente habrá información de servicios.</p>
        )}
      </div>
    </section>
  );
}
