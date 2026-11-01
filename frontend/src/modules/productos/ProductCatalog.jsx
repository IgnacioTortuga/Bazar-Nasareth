import { useLanguage } from '../../shared/Language.jsx';
import React, { useEffect, useRef, useState } from 'react';
import Img from '../../shared/Img.jsx';
import { BazarDoodle } from '../../shared/Icons.jsx';
import { formattedPrice } from '../../shared/format.js';
import ContactMessage from './ContactMessage.jsx';
export default function ProductCatalog({
  data,
  products,
  category,
  setCategory,
  search,
  setSearch,
  business,
  images,
  campaign,
  clearCampaign,
  clearFilters,
  returnUrl,
}) {
  const { t, language } = useLanguage();
  const catalogRef = useRef(null);
  const [consultingId, setConsultingId] = useState(null);
  const hasConsultation = products.some((product) => product.id === consultingId);

  useEffect(() => {
    if (!hasConsultation) return;
    const card = catalogRef.current?.querySelector('.is-consulting > .card-body');
    if (!card) return;
    const close = (restoreFocus = false) => {
      const details = card.querySelector('.request-disclosure');
      details.open = false;
      setConsultingId(null);
      if (restoreFocus) details.querySelector('summary').focus();
    };
    const outside = (event) => {
      if (!card.contains(event.target) && !event.target.closest('.request-disclosure summary')) close();
    };
    const escape = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close(true);
      }
    };
    document.addEventListener('click', outside);
    document.addEventListener('focusin', outside);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('click', outside);
      document.removeEventListener('focusin', outside);
      document.removeEventListener('keydown', escape);
    };
  }, [consultingId, hasConsultation]);

  function toggleConsultation(event, productId) {
    if (event.currentTarget.open) {
      const card = event.currentTarget.closest('.product-card');
      card.style.setProperty('--consultation-card-height', card.getBoundingClientRect().height + 'px');
      for (const details of catalogRef.current.querySelectorAll('.request-disclosure[open]')) {
        if (details !== event.currentTarget) details.open = false;
      }
      setConsultingId(productId);
    } else {
      setConsultingId((current) => current === productId ? null : current);
    }
  }

  return (
    <section id="productos" className="wrap section" ref={catalogRef}>
      {hasConsultation && <div className="consultation-backdrop" aria-hidden="true" />}
      <div className="section-heading">
        <div>
          <span className="eyebrow">{t('ENCUENTRE SU FAVORITO')}</span>
          <h2>
            {' '}
            {t('Un bazar de posibilidades')} <BazarDoodle kind="flower" />
          </h2>
        </div>
        <p>{t('Precios informativos sujetos a confirmación.')}</p>
      </div>
      {campaign && (
        <div className="campaign-notice" role="status">
          <span>
            {' '}
            {t('Temática para su consulta:')} <b>{campaign}</b>
            {t('. Se añadirá al mensaje de WhatsApp.')}{' '}
          </span>
          <button type="button" onClick={clearCampaign}>
            {' '}
            {t('Quitar temática')}{' '}
          </button>
        </div>
      )}
      <div
        className="category-pills"
        role="group"
        aria-label={t('Filtrar productos por categoría')}
      >
        <button
          type="button"
          aria-pressed={!category}
          onClick={() => setCategory('')}
        >
          {' '}
          {t('Todo el bazar')}{' '}
        </button>
        {data.categorias.map((c) => (
          <button
            type="button"
            key={c.id}
            aria-pressed={category === String(c.id)}
            onClick={() => setCategory(String(c.id))}
          >
            {c.nombre}
          </button>
        ))}
      </div>
      <div className="catalog-count" role="status">
        {products.length}{' '}
        {products.length === 1
          ? t('producto encontrado')
          : t('productos encontrados')}
      </div>
      <div className="filters">
        <label>
          {' '}
          {t('Categoría')}{' '}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">{t('Todas las categorías')}</option>
            {data.categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </label>
        <label>
          {' '}
          {t('Buscar por nombre')}{' '}
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('Buscar producto')}
          />
        </label>
      </div>
      <div className="grid">
        {products.map((p) => (
          <article className={`card product-card${consultingId === p.id ? ' is-consulting' : ''}`} key={p.id}>
            {p.destacado && (
              <span className="product-badge">{t('✦ Destacado')}</span>
            )}
            <Img id={p.imagenes[0]} alt={images[p.imagenes[0]]} />
            <div className="card-body">
              <div className="product-meta">
                <small>
                  {data.categorias.find((c) => c.id === p.categoriaId)?.nombre}
                </small>
                <span>{t('Por encargo')}</span>
              </div>
              <h3>
                <a
                  href={`/producto/${p.id}?lang=${language}&volver=${encodeURIComponent(returnUrl)}`}
                >
                  {p.nombre}
                </a>
              </h3>
              <p className="product-description">{p.descripcion}</p>
              <strong className="product-price">
                {formattedPrice(p.precioInformativo, p.moneda, language)}
              </strong>
              <a
                className="product-detail-link"
                href={`/producto/${p.id}?lang=${language}&volver=${encodeURIComponent(returnUrl)}`}
              >
                {' '}
                {t('Ver detalles y compartir ↗')}{' '}
              </a>
              <details className="request-disclosure" onToggle={(event) => toggleConsultation(event, p.id)}>
                <summary>
                  {' '}
                  {t('Consultar por WhatsApp')}{' '}
                  <span aria-hidden="true">＋</span>
                </summary>
                <ContactMessage
                  product={p}
                  negocio={business}
                  medir={data.medicionWhatsApp}
                  campaign={campaign}
                />
              </details>
            </div>
          </article>
        ))}
      </div>
      {!products.length && (
        <div className="empty">
          <p>{t('No hay productos con esos filtros.')}</p>
          <button className="button" type="button" onClick={clearFilters}>
            {' '}
            {t('Ver todo el catálogo')}{' '}
          </button>
        </div>
      )}
    </section>
  );
}
