import React from 'react';
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
  return (
    <section id="productos" className="wrap section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">ENCUENTRE SU FAVORITO</span>
          <h2>
            Un bazar de posibilidades <BazarDoodle kind="flower" />
          </h2>
        </div>
        <p>Precios informativos sujetos a confirmación.</p>
      </div>
      {campaign && (
        <div className="campaign-notice" role="status">
          <span>
            Temática para su consulta: <b>{campaign}</b>. Se añadirá al mensaje de WhatsApp.
          </span>
          <button type="button" onClick={clearCampaign}>
            Quitar temática
          </button>
        </div>
      )}
      <div
        className="category-pills"
        role="group"
        aria-label="Filtrar productos por categoría"
      >
        <button
          type="button"
          aria-pressed={!category}
          onClick={() => setCategory('')}
        >
          Todo el bazar
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
          ? 'producto encontrado'
          : 'productos encontrados'}
      </div>
      <div className="filters">
        <label>
          Categoría
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Todas las categorías</option>
            {data.categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </label>
        <label>
          Buscar por nombre
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar producto"
          />
        </label>
      </div>
      <div className="grid">
        {products.map((p) => (
          <article className="card product-card" key={p.id}>
            {p.destacado && <span className="product-badge">✦ Destacado</span>}
            <Img id={p.imagenes[0]} alt={images[p.imagenes[0]]} />
            <div className="card-body">
              <div className="product-meta">
                <small>
                  {data.categorias.find((c) => c.id === p.categoriaId)?.nombre}
                </small>
                <span>Por encargo</span>
              </div>
              <h3>
                <a
                  href={`/producto/${p.id}?volver=${encodeURIComponent(returnUrl)}`}
                >
                  {p.nombre}
                </a>
              </h3>
              <p className="product-description">{p.descripcion}</p>
              <strong className="product-price">
                {formattedPrice(p.precioInformativo, p.moneda)}
              </strong>
              <a
                className="product-detail-link"
                href={`/producto/${p.id}?volver=${encodeURIComponent(returnUrl)}`}
              >
                Ver detalles y compartir ↗
              </a>
              <details className="request-disclosure">
                <summary>
                  Consultar por WhatsApp <span aria-hidden="true">＋</span>
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
          <p>No hay productos con esos filtros.</p>
          <button className="button" type="button" onClick={clearFilters}>
            Ver todo el catálogo
          </button>
        </div>
      )}
    </section>
  );
}
