import React, { useEffect, useRef, useState } from 'react';
import Img from '../../shared/Img.jsx';
import { BazarDoodle } from '../../shared/Icons.jsx';
import { imageUrl } from '../../shared/images.js';
export default function Gallery({ data, images, business }) {
  const [galleryPage, setGalleryPage] = useState(1);
  const [gallerySelection, setGallerySelection] = useState(null);
  const galleryCloseRef = useRef(null);
  const galleryPageSize = 3;
  const galleryPages = Math.max(
    1,
    Math.ceil(data.galeria.length / galleryPageSize),
  );
  const visibleGallery = data.galeria.slice(
    (galleryPage - 1) * galleryPageSize,
    galleryPage * galleryPageSize,
  );

  useEffect(() => {
    if (!gallerySelection) return undefined;
    const previousOverflow = document.body.style.overflow;
    const close = (event) => {
      if (event.key === 'Escape') setGallerySelection(null);
    };
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', close);
    galleryCloseRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', close);
    };
  }, [gallerySelection]);
  return (
    <>
      <section id="galeria" className="soft section">
        <div className="wrap">
          <div className="gallery-heading">
            <div>
              <span className="eyebrow">MUESTRAS PARA INSPIRARSE</span>
              <h2>
                Galería de ideas <BazarDoodle kind="flower" />
              </h2>
            </div>
            <p>
              Puede pedir un diseño similar o usar estas muestras como punto de
              partida para crear algo propio.
            </p>
          </div>
          <div className="inspiration-grid" aria-live="polite">
            {visibleGallery.map((g) => (
              <div className="inspiration-card" key={g.id}>
                <button
                  type="button"
                  className="inspiration-photo"
                  onClick={() => setGallerySelection(g)}
                  aria-label={`Ver foto completa: ${g.titulo || 'idea personalizada'}`}
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
              aria-label="Páginas de la galería"
            >
              <button
                type="button"
                disabled={galleryPage === 1}
                onClick={() => setGalleryPage((page) => page - 1)}
              >
                ← Anterior
              </button>
              <span>
                Página {galleryPage} de {galleryPages}
              </span>
              <button
                type="button"
                disabled={galleryPage === galleryPages}
                onClick={() => setGalleryPage((page) => page + 1)}
              >
                Siguiente →
              </button>
            </nav>
          )}
          {!data.galeria.length && (
            <p className="empty">
              Próximamente compartiremos ideas para inspirarse.
            </p>
          )}
        </div>
      </section>
      {gallerySelection &&
        (() => {
          const description =
            images[gallerySelection.imagenId] ||
            gallerySelection.titulo ||
            'Idea personalizada';
          const reference = `Idea #${gallerySelection.id}: ${gallerySelection.titulo || description}`;
          const imageReference = new URL(
            imageUrl(gallerySelection.imagenId),
            window.location.origin,
          ).href;
          const candy = /dulce|cajita|caramelo|confite/i.test(
            `${gallerySelection.titulo || ''} ${description}`,
          );
          const selectedMessage = [
            'Hola, quisiera consultar por esta idea de la galería:',
            `• Referencia: ${reference}`,
            `• Imagen: ${imageReference}`,
            candy
              ? '• Consulta: Quisiera conocer qué dulces se pueden agregar a una cajita de regalo.'
              : null,
            '',
            '¿Podrían indicarme opciones, precio y plazo de entrega?',
          ]
            .filter(Boolean)
            .join('\n');
          const ownMessage =
            'Hola, quisiera personalizar una taza u otro artículo con una idea propia. ¿Cómo puedo enviarles mi diseño y conocer el precio?';
          const phone = (business.telefono || '').replace(/\D/g, '');
          return (
            <div
              className="idea-modal-backdrop"
              role="presentation"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget)
                  setGallerySelection(null);
              }}
            >
              <section
                className="idea-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="idea-modal-title"
              >
                <button
                  ref={galleryCloseRef}
                  className="idea-modal-close"
                  type="button"
                  onClick={() => setGallerySelection(null)}
                  aria-label="Cerrar imagen"
                >
                  ×
                </button>
                <div className="idea-modal-image">
                  <Img id={gallerySelection.imagenId} alt={description} />
                </div>
                <div className="idea-modal-body">
                  <span>Referencia para WhatsApp</span>
                  <h2 id="idea-modal-title">Idea #{gallerySelection.id}</h2>
                  {candy && (
                    <p>
                      Esta foto muestra algunos de los dulces que se pueden
                      agregar a sus cajitas de regalo.
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
                      Quiero esta idea
                    </a>
                    <a
                      className="button secondary"
                      href={`https://wa.me/${phone}?text=${encodeURIComponent(ownMessage)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Tengo una idea propia
                    </a>
                  </div>
                </div>
              </section>
            </div>
          );
        })()}
    </>
  );
}
