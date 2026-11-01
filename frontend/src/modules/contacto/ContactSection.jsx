import { useLanguage } from '../../shared/Language.jsx';
import React from 'react';
import { BazarDoodle, SocialIcon } from '../../shared/Icons.jsx';
import { businessEntries } from './contact.js';
export default function ContactSection({ business }) {
  const { t, language } = useLanguage();

  const addresses = businessEntries(business.direccion, [
    t('Tienda principal'),
    t('Tienda de fiestas'),
  ]);
  const schedules = businessEntries(business.horario, [
    t('Tienda principal'),
    t('Tienda de fiestas'),
  ]);
  const stores = addresses.map((address, index) => ({
    name: address.label,
    address: address.value,
    schedule: schedules[index]?.value || t('Consulte el horario'),
  }));

  return (
    <section id="contacto" className="wrap section contact">
      <span className="eyebrow">{t('NUESTRAS TIENDAS')}</span>
      <h2>
        {' '}
        {t('Su próxima idea')} <br /> {t('empieza con un')}{' '}
        <span>{t('¡hola!')}</span>
      </h2>
      <p className="contact-intro">
        {' '}
        {t(
          'Consulte disponibilidad, cuéntenos lo que busca o visítenos en el bazar.',
        )}{' '}
      </p>
      <BazarDoodle kind="gift" className="contact-gift" />
      <div className="store-grid">
        {stores.map((store) => (
          <article className="store-card" key={store.name}>
            <span>
              {t('Local')} {stores.indexOf(store) + 1}
            </span>
            <h3>{store.name}</h3>
            <p>
              <b>{t('Dirección')}</b>
              <br />
              {store.address}
            </p>
            <p>
              <b>{t('Horario')}</b>
              <br />
              {store.schedule}
            </p>
          </article>
        ))}
      </div>
      <div className="contact-grid contact-details">
        <p>
          <b>{t('Teléfono')}</b>
          <br />
          {business.telefono}
        </p>
        {business.email && (
          <p>
            <b>{t('Correo')}</b>
            <br />
            {business.email}
          </p>
        )}
      </div>
      <div className="location-map">
        <iframe
          title={t('Mapa de Bazar Nazareth en Hojancha')}
          src="https://www.google.com/maps?q=10.0576279,-85.4188402&z=19&output=embed"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        <a
          href="https://www.google.com/maps?q=10.0576279,-85.4188402"
          target="_blank"
          rel="noopener noreferrer"
        >
          {' '}
          {t('Abrir ubicación en Google Maps ↗')}{' '}
        </a>
      </div>
      <div className="contact-actions">
        <a
          className="button primary"
          href={business.enlaceContacto}
          target="_blank"
          rel="noopener noreferrer"
        >
          {' '}
          {t('Abrir contacto por WhatsApp')}{' '}
        </a>
        <div className="social" aria-label={t('Redes sociales')}>
          {(business.redes || '')
            .split('\n')
            .filter((x) => {
              try {
                return ['https:', 'http:'].includes(new URL(x.trim()).protocol);
              } catch {
                return false;
              }
            })
            .map((x, i) => {
              const url = new URL(x.trim());
              const instagram = url.hostname.includes('instagram.com');
              return (
                <a
                  key={i}
                  href={x.trim()}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={
                    instagram ? t('Abrir Instagram') : t('Abrir Linktree')
                  }
                >
                  <SocialIcon kind={instagram ? 'instagram' : 'linktree'} />
                  <span>{instagram ? 'Instagram' : 'Linktree'}</span>
                </a>
              );
            })}
        </div>
      </div>
    </section>
  );
}
