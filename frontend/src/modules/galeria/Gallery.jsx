import { useLanguage } from '../../shared/Language.jsx';
import React, { useState } from 'react';
import Modal from '../../shared/Modal.jsx';
import Img from '../../shared/Img.jsx';
import { BazarDoodle } from '../../shared/Icons.jsx';
import { imageUrl } from '../../shared/images.js';
export default function Gallery({ data, images, business }) {
  const { t, language } = useLanguage();

  const [galleryPage, setGalleryPage] = useState(1);
  const [gallerySelection, setGallerySelection] = useState(null);
  const galleryPageSize = 3;
  const galleryPages = Math.max(
    1,
    Math.ceil(data.galeria.length / galleryPageSize),
  );
  const visibleGallery = data.galeria.slice(
    (galleryPage - 1) * galleryPageSize,
    galleryPage * galleryPageSize,
  );

  return (
    <>
      <section id="galeria" className="soft section">
        <div className="wrap">
          <div className="gallery-heading">
            <div>
              <span className="eyebrow">{t('MUESTRAS PARA INSPIRARSE')}</span>
              <h2>
                {' '}
                {t('Galería de ideas')} <BazarDoodle kind="flower" />
              </h2>
            </div>
            <p>
              {' '}
              {t(
                'Puede pedir un diseño similar o usar estas muestras como punto de partida para crear algo propio.',
              )}{' '}
            </p>
          </div>
          <div className="inspiration-grid" aria-live="polite">
            {visibleGallery.map((g) => (
              <div className="inspiration-card" key={g.id}>
                <button
                  type="button"
                  className="inspiration-photo"
                  onClick={() => setGallerySelection(g)}
                  aria-label={t('Ver foto completa: {title}', {
                    title: g.titulo || t('idea personalizada'),
                  })}
                >
                  <Img id={g.imagenId} alt={images[g.imagenId]} />
                  <span aria-hidden="true">⌕</span>
                </button>
              </div>
            ))}
          </div>
          {galleryPages > 1 && (
            <nav
              className="gallery-pagination"
              aria-label={t('Páginas de la galería')}
            >
              <button
                type="button"
                disabled={galleryPage === 1}
                onClick={() => setGalleryPage((page) => page - 1)}
              >
                {' '}
                {t('← Anterior')}{' '}
              </button>
              <span>
                {' '}
                {t('Página')} {galleryPage} {t('de')} {galleryPages}
              </span>
              <button
                type="button"
                disabled={galleryPage === galleryPages}
                onClick={() => setGalleryPage((page) => page + 1)}
              >
                {' '}
                {t('Siguiente →')}{' '}
              </button>
            </nav>
          )}
          {!data.galeria.length && (
            <p className="empty">
              {' '}
              {t('Próximamente compartiremos ideas para inspirarse.')}{' '}
            </p>
          )}
        </div>
      </section>
      {gallerySelection &&
        (() => {
          const description =
            images[gallerySelection.imagenId] ||
            gallerySelection.titulo ||
            t('Idea personalizada');
          const reference = `Idea #${gallerySelection.id}: ${gallerySelection.titulo || description}`;
          const imageReference = new URL(
            imageUrl(gallerySelection.imagenId),
            window.location.origin,
          ).href;
          const candy =
            /dulce|cajita|caramelo|confite|sweet|candy|gift box/i.test(
              `${gallerySelection.titulo || ''} ${description}`,
            );
          const selectedMessage = [
            t('Hola, quisiera consultar por esta idea de la galería:'),
            t('• Referencia: {reference}', { reference }),
            t('• Imagen: {url}', { url: imageReference }),
            candy
              ? t(
                  '• Consulta: Quisiera conocer qué dulces se pueden agregar a una cajita de regalo.',
                )
              : null,
            '',
            t('¿Podrían indicarme opciones, precio y plazo de entrega?'),
          ]
            .filter(Boolean)
            .join('\n');
          const ownMessage = t(
            'Hola, quisiera personalizar una taza u otro artículo con una idea propia. ¿Cómo puedo enviarles mi diseño y conocer el precio?',
          );
          const phone = (business.telefono || '').replace(/\D/g, '');
          return (
            <Modal
              className="public-site idea-modal-backdrop"
              onClose={() => setGallerySelection(null)}
              labelledBy="idea-modal-title"
            >
              <section className="idea-modal">
                <button
                  autoFocus
                  className="idea-modal-close"
                  type="button"
                  onClick={() => setGallerySelection(null)}
                  aria-label={t('Cerrar imagen')}
                >
                  ×
                </button>
                <div className="idea-modal-image">
                  <Img id={gallerySelection.imagenId} alt={description} />
                </div>
                <div className="idea-modal-body">
                  <span>{t('Referencia para WhatsApp')}</span>
                  <h2 id="idea-modal-title">
                    {t('Idea #')}
                    {gallerySelection.id}
                  </h2>
                  {candy && (
                    <p>
                      {' '}
                      {t(
                        'Esta foto muestra algunos de los dulces que se pueden agregar a sus cajitas de regalo.',
                      )}{' '}
                    </p>
                  )}
                  <div className="idea-modal-actions">
                    <a
                      className="button primary"
                      href={`https://wa.me/${phone}?text=${encodeURIComponent(selectedMessage)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        if (data.medicionWhatsApp)
                          fetch(
                            `/api/galeria/${gallerySelection.id}/clic-whatsapp`,
                            {
                              method: 'POST',
                              credentials: 'same-origin',
                              keepalive: true,
                            },
                          ).catch(() => {});
                      }}
                    >
                      {' '}
                      {t('Quiero esta idea')}{' '}
                    </a>
                    <a
                      className="button secondary"
                      href={`https://wa.me/${phone}?text=${encodeURIComponent(ownMessage)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {' '}
                      {t('Tengo una idea propia')}{' '}
                    </a>
                  </div>
                </div>
              </section>
            </Modal>
          );
        })()}
    </>
  );
}
