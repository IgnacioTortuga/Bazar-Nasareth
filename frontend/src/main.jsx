import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

async function api(path, options = {}) {
  let response;
  try {
    response = await fetch('/api' + path, {
      credentials: 'same-origin',
      ...options,
    });
  } catch {
    throw new Error(options.method && options.method !== 'GET'
      ? 'Se perdió la conexión. No se pudo confirmar el resultado. Conserve sus cambios y compruebe la lista antes de repetir el guardado.'
      : 'No se pudo conectar con el servidor. Compruebe su conexión e inténtelo de nuevo.');
  }
  if (!response.ok) {
    if (response.status === 401) throw new Error('Su sesión terminó. Abra el acceso en otra pestaña para iniciar sesión y conservar este formulario.');
    if (response.status === 403) throw new Error('El servidor rechazó la operación. Compruebe sus permisos y el origen desde el que abrió el panel.');
    if (response.status >= 500) throw new Error('El servidor no pudo completar la operación. Conserve el formulario y compruebe la lista antes de reintentar.');
    const body = await response.text();
    let message = body;
    try {
      const json = JSON.parse(body);
      message =
        json.title || json.detail || json.message || JSON.stringify(json);
    } catch {
      /* texto plano */
    }
    throw new Error(message || `Error ${response.status}`);
  }
  const body = await response.text();
  return body ? JSON.parse(body) : null;
}
const json = (body) => ({
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});
const imageUrl = (id) => (id ? `/api/imagenes/${id}/archivo` : null);
const toCostaRicaInput = (value) =>
  value
    ? new Date(value)
        .toLocaleString('sv-SE', {
          timeZone: 'America/Costa_Rica',
          hour12: false,
        })
        .slice(0, 16)
        .replace(' ', 'T')
    : '';
const sections = [
  'portada',
  'productos',
  'servicios',
  'imagenes',
  'promociones',
  'galeria',
  'textos',
  'contacto',
  'usuarios',
];
const labels = {
  portada: 'Portada',
  productos: 'Productos',
  servicios: 'Servicios',
  imagenes: 'Imágenes',
  promociones: 'Promociones',
  galeria: 'Galería',
  textos: 'Información adicional',
  contacto: 'Contacto',
  usuarios: 'Administradores',
};
const collection = {
  portada: 'secciones',
  textos: 'secciones',
  productos: 'productos',
  servicios: 'servicios',
  promociones: 'promociones',
  galeria: 'galeria',
};
const fieldsets = {
  categorias: [
    ['nombre', 'Nombre', 'text'],
    ['orden', 'Orden', 'number'],
    ['activa', 'Activa', 'checkbox'],
  ],
  productos: [
    ['categoriaId', 'Categoría', 'category'],
    ['nombre', 'Nombre', 'text'],
    ['descripcion', 'Descripción', 'textarea'],
    ['precioInformativo', 'Precio informativo', 'decimal'],
    ['moneda', 'Moneda', 'currency'],
    ['destacado', 'Destacado', 'checkbox'],
    ['orden', 'Orden', 'number'],
    ['estado', 'Estado', 'status'],
  ],
  servicios: [
    ['nombre', 'Nombre', 'text'],
    ['descripcion', 'Descripción', 'textarea'],
    ['alcance', 'Alcance', 'textarea'],
    ['imagenId', 'Fotografía', 'image'],
    ['precioDesde', 'Precio desde', 'decimal'],
    ['moneda', 'Moneda', 'currency'],
    ['orden', 'Orden', 'number'],
    ['estado', 'Estado', 'status'],
  ],
  promociones: [
    ['titulo', 'Título', 'text'],
    ['descripcion', 'Descripción', 'textarea'],
    ['condiciones', 'Condiciones', 'textarea'],
    ['imagenId', 'Fotografía', 'image'],
    ['inicio', 'Inicio', 'datetime'],
    ['fin', 'Fin (exclusivo)', 'datetime'],
    ['orden', 'Orden', 'number'],
    ['estado', 'Estado', 'status'],
  ],
  galeria: [
    ['imagenId', 'Fotografía', 'image'],
    ['titulo', 'Título', 'text'],
    ['orden', 'Orden único', 'number'],
    ['estado', 'Estado', 'status'],
  ],
  secciones: [
    ['clave', 'Clave única (portada, presentación, preguntas...)', 'text'],
    ['titulo', 'Título', 'text'],
    ['cuerpo', 'Descripción visible', 'textarea'],
    ['imagenId', 'Fotografía', 'image'],
    ['orden', 'Orden', 'number'],
    ['estado', 'Estado', 'status'],
  ],
  negocio: [
    ['nombre', 'Nombre comercial', 'text'],
    ['direccion', 'Dirección', 'textarea'],
    ['horario', 'Horario', 'textarea'],
    ['telefono', 'Teléfono WhatsApp', 'text'],
    ['email', 'Correo', 'email'],
    ['enlaceContacto', 'Enlace de contacto', 'url'],
    ['redes', 'Enlaces de redes (uno por línea)', 'textarea'],
  ],
};
const defaults = {
  categorias: { nombre: '', orden: 0, activa: true },
  productos: {
    categoriaId: 0,
    nombre: '',
    descripcion: '',
    precioInformativo: null,
    moneda: null,
    destacado: false,
    orden: 0,
    estado: 'Borrador',
  },
  servicios: {
    nombre: '',
    descripcion: '',
    alcance: '',
    imagenId: null,
    precioDesde: null,
    moneda: null,
    orden: 0,
    estado: 'Borrador',
  },
  promociones: {
    titulo: '',
    descripcion: '',
    condiciones: '',
    imagenId: null,
    inicio: null,
    fin: null,
    orden: 0,
    estado: 'Borrador',
  },
  galeria: { imagenId: 0, titulo: '', orden: 0, estado: 'Borrador' },
  secciones: {
    clave: '',
    titulo: '',
    cuerpo: '',
    imagenId: null,
    orden: 0,
    estado: 'Borrador',
  },
};
function formattedPrice(value, currency) {
  return value == null
    ? 'Consultar precio'
    : `${currency || 'CRC'} ${Number(value).toLocaleString('es-CR', { minimumFractionDigits: 2 })}`;
}
function promotionTimingLabel(promotion, now = Date.now()) {
  const start = promotion.inicio ? new Date(promotion.inicio).getTime() : NaN;
  const end = promotion.fin ? new Date(promotion.fin).getTime() : NaN;
  if (!Number.isFinite(start) || !Number.isFinite(end) || start >= end)
    return 'Sin vigencia válida';
  if (now < start) return 'Programada';
  if (now >= end) return 'Finalizada';
  return 'Vigente';
}
function Img({ id, alt, className = '' }) {
  return id ? (
    <img
      className={className}
      src={imageUrl(id)}
      alt={alt || ''}
      loading="lazy"
    />
  ) : (
    <div className={'no-image ' + className} aria-label="Sin fotografía">
      Fotografía próximamente
    </div>
  );
}
function ContactMessage({ product, negocio, medir = false, campaign = '' }) {
  const [cantidad, setCantidad] = useState(1),
    [nombre, setNombre] = useState(''),
    [nota, setNota] = useState('');
  const num = (negocio.telefono || '').replace(/\D/g, '');
  const price =
    product.precioInformativo == null
      ? null
      : Number(product.precioInformativo) * cantidad;
  const message = [
    'Hola, me interesa cotizar este producto:',
    `• Producto: ${product.nombre}`,
    campaign ? `• Temática: ${campaign}` : null,
    `• Cantidad: ${cantidad} ${cantidad === 1 ? 'unidad' : 'unidades'}`,
    product.precioInformativo != null
      ? `• Precio de referencia: ${formattedPrice(product.precioInformativo, product.moneda)} por unidad`
      : null,
    price != null
      ? `• Total estimado: ${formattedPrice(price, product.moneda)}`
      : null,
    nombre.trim() ? `• Nombre: ${nombre.trim()}` : null,
    nota.trim() ? `• Detalles: ${nota.trim()}` : null,
    '',
    '¿Podrían confirmarme disponibilidad, plazo de entrega y precio final?',
  ]
    .filter(Boolean)
    .join('\n');
  return (
    <div className="contact-request">
      <label>
        Cantidad aproximada{' '}
        <input
          type="number"
          min="1"
          max="999"
          value={cantidad}
          onChange={(e) =>
            setCantidad(Math.max(1, Math.min(999, Number(e.target.value) || 1)))
          }
        />
      </label>
      <label>
        Nombre (opcional){' '}
        <input
          value={nombre}
          maxLength="80"
          onChange={(e) => setNombre(e.target.value)}
        />
      </label>
      <label>
        Nota (opcional){' '}
        <input
          value={nota}
          maxLength="500"
          onChange={(e) => setNota(e.target.value)}
        />
      </label>
      <a
        className="button primary"
        href={`https://wa.me/${num}?text=${encodeURIComponent(message)}`}
        onClick={() => {
          const origin = campaign ? 'halloween' : 'catalogo';
          if (medir) fetch(`/api/productos/${product.id}/clic-whatsapp?origen=${origin}`, {
            method: 'POST', credentials: 'same-origin', keepalive: true,
          }).catch(() => {});
        }}
        target="_blank"
        rel="noopener noreferrer"
      >
        Consultar por WhatsApp
      </a>
    </div>
  );
}
function BazarDoodle({ kind = 'spark', className = '' }) {
  const shapes = {
    spark: <path d="M24 3L29 19L45 24L29 29L24 45L19 29L3 24L19 19Z" />,
    gift: (
      <>
        <rect x="7" y="20" width="34" height="23" rx="3" />
        <path d="M5 15H43V23H5Z M24 15V43 M24 15C10 16 8 4 16 5C22 5 24 15 24 15C24 15 26 5 32 5C40 4 38 16 24 15" />
      </>
    ),
    flower: (
      <>
        <path d="M24 15C9 0 0 16 15 24C0 32 9 48 24 33C39 48 48 32 33 24C48 16 39 0 24 15Z" />
        <circle cx="24" cy="24" r="5" />
      </>
    ),
  };
  return (
    <svg
      className={'bazar-doodle ' + className}
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {shapes[kind] || shapes.spark}
    </svg>
  );
}
function SocialIcon({ kind }) {
  if (kind === 'instagram') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" className="social-icon-fill" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3v5M7 8h10M7 8v4M17 8v4M12 8v4" />
      <circle cx="7" cy="15" r="2.5" />
      <circle cx="12" cy="15" r="2.5" />
      <circle cx="17" cy="15" r="2.5" />
    </svg>
  );
}
function businessEntries(value, fallbackLabels) {
  return (value || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const separator = line.indexOf('|');
      return separator >= 0
        ? {
            label: line.slice(0, separator).trim(),
            value: line.slice(separator + 1).trim(),
          }
        : { label: fallbackLabels[index] || `Local ${index + 1}`, value: line };
    });
}
function serviceInquiryUrl(service, business) {
  let phone = (business.telefono || "").replace(/\D/g, "");
  if (phone.length === 8) phone = "506" + phone;
  if (!/^[1-9]\d{7,14}$/.test(phone)) return "#contacto";
  const message = `Hola, quisiera consultar por el servicio «${service.nombre}». ¿Me pueden indicar el precio, la disponibilidad y las condiciones?`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

function Public({ data }) {
  const [category, setCategory] = useState(''),
    [search, setSearch] = useState(''),
    [menu, setMenu] = useState(false),
    [galleryPage, setGalleryPage] = useState(1),
    [gallerySelection, setGallerySelection] = useState(null),
    [campaign, setCampaign] = useState(''),
    [activeSection, setActiveSection] = useState('inicio');
  const galleryCloseRef = useRef(null);
  const business = data.negocio,
    images = Object.fromEntries(
      data.imagenes.map((i) => [i.id, i.textoAlternativo]),
    );
  const addresses = businessEntries(business.direccion, [
    'Tienda principal',
    'Tienda de fiestas',
  ]);
  const schedules = businessEntries(business.horario, [
    'Tienda principal',
    'Tienda de fiestas',
  ]);
  const stores = addresses.map((address, index) => ({
    name: address.label,
    address: address.value,
    schedule: schedules[index]?.value || 'Consulte el horario',
  }));
  const hero =
    data.secciones.find((s) => s.clave === 'portada') ||
    data.secciones.find((s) => s.clave === 'presentación');
  const products = data.productos.filter(
    (p) =>
      (!category || p.categoriaId === Number(category)) &&
      p.nombre.toLowerCase().includes(search.toLowerCase()),
  );
  const galleryPageSize = 6;
  const galleryPages = Math.max(1, Math.ceil(data.galeria.length / galleryPageSize));
  const visibleGallery = data.galeria.slice(
    (galleryPage - 1) * galleryPageSize,
    galleryPage * galleryPageSize,
  );
  const links = [
    ['productos', 'Productos'],
    ['servicios', 'Servicios'],
    ['promociones', 'Promociones'],
    ['galeria', 'Galería'],
    ['contacto', 'Contacto'],
  ];
  useEffect(() => {
    const sectionIds = ['inicio', ...links.map(([id]) => id)];
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActiveSection(visible.target.id);
      },
      { rootMargin: '-18% 0px -62% 0px', threshold: [0, 0.15, 0.4] },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);
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
  const highlights = [
    {
      id: 'productos',
      title: 'Encuentre su próximo detalle',
      tag: 'Nuestro catálogo',
      imageId: (data.productos.find((p) => p.destacado) || data.productos[0])
        ?.imagenes?.[0],
      symbol: 'gift',
      fallback: '/images/detalle-llavero.png',
    },
    {
      id: 'servicios',
      title: 'Ideas que hacemos realidad',
      tag: 'Servicios del bazar',
      imageId: data.servicios[0]?.imagenId || hero?.imagenId,
      symbol: 'flower',
      fallback: '/images/detalle-personalizado.png',
    },
    {
      id: 'promociones',
      title: 'Descubra nuestras promociones',
      tag: 'Consulte las novedades',
      imageId: data.promociones[0]?.imagenId,
      symbol: 'spark',
    },
  ];
  function searchCatalog(e) {
    e.preventDefault();
    setMenu(false);
    document
      .getElementById('productos')
      ?.scrollIntoView({ behavior: 'smooth' });
  }
  function openCampaign(promotion) {
    setCampaign(/halloween/i.test(promotion.titulo) ? 'Halloween' : promotion.titulo);
    setCategory('');
    setSearch('');
    document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' });
  }
  return (
    <div className="public-site">
      <a className="skip-link" href="#productos">
        Saltar al catálogo
      </a>
      <div className="welcome-ribbon">
        <BazarDoodle /> Un detalle pequeño. Una sonrisa enorme. <BazarDoodle />
      </div>
      <header className="public-header">
        <div className="header-inner wrap">
          <a className="brand" href="#inicio">
            <img
              className="brand-mark"
              src="/images/simbolo-bazar.png"
              alt=""
              width="48"
              height="48"
            />
            {business.nombre}
          </a>
          <button
            className="mobile-menu"
            onClick={() => setMenu(!menu)}
            aria-expanded={menu}
            aria-controls="public-navigation"
            aria-label={menu ? 'Cerrar navegación' : 'Abrir navegación'}
          >
            ☰
          </button>
          <nav id="public-navigation" className={menu ? 'open' : ''}>
            <a
              href="#inicio"
              className={`nav-home ${activeSection === 'inicio' ? 'is-active' : ''}`}
              onClick={() => {
                setActiveSection('inicio');
                setMenu(false);
              }}
            >
              Inicio
            </a>
            {links.map(([id, label]) => (
              <a
                key={id}
                href={'#' + id}
                className={activeSection === id ? 'is-active' : ''}
                onClick={() => {
                  setActiveSection(id);
                  setMenu(false);
                }}
              >
                {label}
              </a>
            ))}
          </nav>
          <form className="header-search" onSubmit={searchCatalog}>
            <input
              type="search"
              aria-label="Buscar productos en el catálogo"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar productos…"
            />
            <button type="submit" aria-label="Buscar">
              ⌕
            </button>
          </form>
        </div>
      </header>
      <main>
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
                SU BAZAR EN HOJANCHA · GUANACASTE
              </span>
              <h1>
                {hero?.titulo || (
                  <>
                    Pequeños detalles,
                    <br />
                    <span>grandes sonrisas.</span>
                  </>
                )}
              </h1>
              <p>
                {hero?.cuerpo ||
                  'Un regalo, una idea, algo que diga mucho de usted. Explore nuestro bazar y encuentre ese detalle para su próxima ocasión especial.'}
              </p>
              <div className="hero-buttons">
                <a className="button primary" href="#productos">
                  Explorar el bazar <span aria-hidden="true">↗</span>
                </a>
                <a className="button secondary" href="#contacto">
                  Hablemos de su idea
                </a>
              </div>
              <div className="hero-note">
                <BazarDoodle kind="gift" />
                <span>El toque especial empieza con una idea.</span>
              </div>
            </div>
            <div className="hero-collage">
              <span className="collage-sticker">
                <BazarDoodle kind="spark" /> Detalles con personalidad
              </span>
              <div className="photo-frame photo-main">
                {hero?.imagenId ? (
                  <Img id={hero.imagenId} alt={images[hero.imagenId]} />
                ) : (
                  <img
                    src="/images/detalle-llavero.png"
                    alt="Inspiración del bazar: llavero personalizado con inicial y cerezas"
                    width="1004"
                    height="1004"
                    fetchPriority="high"
                  />
                )}
                <span>Algo pequeño, algo especial.</span>
              </div>
              <div className="photo-frame photo-small">
                <img
                  src="/images/detalle-personalizado.png"
                  alt="Inspiración del bazar: llavero con una frase creativa"
                  width="1004"
                  height="1004"
                  loading="lazy"
                />
                <span>Un toque de creatividad ✦</span>
              </div>
              <BazarDoodle kind="flower" className="collage-flower" />
            </div>
          </div>
        </section>
        <section className="featured wrap" aria-label="Explore Bazar Nazareth">
          <div className="featured-grid">
            {highlights.map((item, index) => (
              <a
                className={'feature-card feature-' + index}
                key={item.id}
                href={'#' + item.id}
              >
                <div className="feature-visual">
                  {item.imageId ? (
                    <Img id={item.imageId} alt={images[item.imageId]} />
                  ) : item.fallback ? (
                    <img
                      src={item.fallback}
                      alt="Inspiración de detalles personalizados del bazar"
                      loading="lazy"
                      width="1004"
                      height="1004"
                    />
                  ) : (
                    <div className="feature-art" aria-hidden="true">
                      <span className="art-orbit" />
                      <BazarDoodle kind={item.symbol} className="art-symbol" />
                      <span className="art-word">
                        {index === 0
                          ? 'Un detalle especial'
                          : index === 1
                            ? 'Hecho para usted'
                            : 'Algo por descubrir'}
                      </span>
                    </div>
                  )}
                  <span className="feature-arrow" aria-hidden="true">
                    ↗
                  </span>
                </div>
                <div className="feature-body">
                  <h2>{item.title}</h2>
                  <span>{item.tag}</span>
                </div>
              </a>
            ))}
          </div>
        </section>
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
              <span>🎃 Está viendo el catálogo para pedidos con temática de <b>{campaign}</b>.</span>
              <button type="button" onClick={() => setCampaign('')}>Quitar temática</button>
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
                {p.destacado && (
                  <span className="product-badge">✦ Destacado</span>
                )}
                <Img id={p.imagenes[0]} alt={images[p.imagenes[0]]} />
                <div className="card-body">
                  <div className="product-meta">
                    <small>
                      {
                        data.categorias.find((c) => c.id === p.categoriaId)
                          ?.nombre
                      }
                    </small>
                    <span>Por encargo</span>
                  </div>
                  <h3><a href={`/producto/${p.id}`}>{p.nombre}</a></h3>
                  <p className="product-description">{p.descripcion}</p>
                  <strong className="product-price">
                    {formattedPrice(p.precioInformativo, p.moneda)}
                  </strong>
                  <a className="product-detail-link" href={`/producto/${p.id}`}>
                    Ver detalles y compartir ↗
                  </a>
                  <details className="request-disclosure">
                    <summary>
                      Consultar por WhatsApp <span aria-hidden="true">＋</span>
                    </summary>
                    <ContactMessage product={p} negocio={business} medir={data.medicionWhatsApp} campaign={campaign} />
                  </details>
                </div>
              </article>
            ))}
          </div>
          {!products.length && (
            <p className="empty">No hay productos con esos filtros.</p>
          )}
        </section>
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
                        {"Desde " + formattedPrice(s.precioDesde, s.moneda)}
                      </strong>
                    )}
                    <a
                      className="button primary service-inquiry"
                      href={serviceInquiryUrl(s, business)}
                      target={serviceInquiryUrl(s, business) === "#contacto" ? undefined : "_blank"}
                      rel="noopener noreferrer"
                      aria-label={`Consultar ${s.nombre}${s.precioDesde == null ? ": precio y disponibilidad" : ": disponibilidad y condiciones"}`}
                    >
                      {s.precioDesde == null ? "Consultar precio" : "Consultar servicio"}
                    </a>
                  </div>
                </article>
              ))}
            </div>
            {!data.servicios.length && (
              <p className="empty">
                Próximamente habrá información de servicios.
              </p>
            )}
          </div>
        </section>
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
              <article className={`card promo-card ${upcoming ? 'promo-upcoming' : 'promo-current'}`} key={p.id}>
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
                    {new Date(upcoming ? p.inicio : p.fin).toLocaleDateString('es-CR', {
                      timeZone: 'America/Costa_Rica',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
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
        <section id="galeria" className="soft section">
          <div className="wrap">
            <div className="gallery-heading">
              <div>
                <span className="eyebrow">MUESTRAS PARA INSPIRARSE</span>
                <h2>Galería de ideas <BazarDoodle kind="flower" /></h2>
              </div>
              <p>
                Puede pedir un diseño similar o usar estas muestras como punto
                de partida para crear algo propio.
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
              <nav className="gallery-pagination" aria-label="Páginas de la galería">
                <button type="button" disabled={galleryPage === 1} onClick={() => setGalleryPage((page) => page - 1)}>← Anterior</button>
                <span>Página {galleryPage} de {galleryPages}</span>
                <button type="button" disabled={galleryPage === galleryPages} onClick={() => setGalleryPage((page) => page + 1)}>Siguiente →</button>
              </nav>
            )}
            {!data.galeria.length && (
              <p className="empty">Próximamente compartiremos ideas para inspirarse.</p>
            )}
          </div>
        </section>
        {gallerySelection && (() => {
          const description = images[gallerySelection.imagenId] || gallerySelection.titulo || 'Idea personalizada';
          const reference = `Idea #${gallerySelection.id}: ${gallerySelection.titulo || description}`;
          const imageReference = new URL(imageUrl(gallerySelection.imagenId), window.location.origin).href;
          const candy = /dulce|cajita|caramelo|confite/i.test(`${gallerySelection.titulo || ''} ${description}`);
          const selectedMessage = [
            'Hola, quisiera consultar por esta idea de la galería:',
            `• Referencia: ${reference}`,
            `• Imagen: ${imageReference}`,
            candy ? '• Consulta: Quisiera conocer qué dulces se pueden agregar a una cajita de regalo.' : null,
            '',
            '¿Podrían indicarme opciones, precio y plazo de entrega?',
          ].filter(Boolean).join('\n');
          const ownMessage = 'Hola, quisiera personalizar una taza u otro artículo con una idea propia. ¿Cómo puedo enviarles mi diseño y conocer el precio?';
          const phone = (business.telefono || '').replace(/\D/g, '');
          return (
            <div className="idea-modal-backdrop" role="presentation" onMouseDown={(event) => {
              if (event.target === event.currentTarget) setGallerySelection(null);
            }}>
              <section className="idea-modal" role="dialog" aria-modal="true" aria-labelledby="idea-modal-title">
                <button ref={galleryCloseRef} className="idea-modal-close" type="button" onClick={() => setGallerySelection(null)} aria-label="Cerrar imagen">×</button>
                <div className="idea-modal-image"><Img id={gallerySelection.imagenId} alt={description} /></div>
                <div className="idea-modal-body">
                  <span>Referencia para WhatsApp</span>
                  <h2 id="idea-modal-title">Idea #{gallerySelection.id}</h2>
                  {candy && <p>Esta foto muestra algunos de los dulces que se pueden agregar a sus cajitas de regalo.</p>}
                  <div className="idea-modal-actions">
                    <a className="button primary" href={`https://wa.me/${phone}?text=${encodeURIComponent(selectedMessage)}`} target="_blank" rel="noopener noreferrer" onClick={() => {
                      if (data.medicionWhatsApp) fetch(`/api/galeria/${gallerySelection.id}/clic-whatsapp`, { method: 'POST', credentials: 'same-origin', keepalive: true }).catch(() => {});
                    }}>Quiero esta idea</a>
                    <a className="button secondary" href={`https://wa.me/${phone}?text=${encodeURIComponent(ownMessage)}`} target="_blank" rel="noopener noreferrer">Tengo una idea propia</a>
                  </div>
                </div>
              </section>
            </div>
          );
        })()}
        {data.secciones
          .filter((s) => s.id !== hero?.id)
          .map((s) => (
            <section className="wrap section text-section" key={s.id}>
              <h2>{s.titulo}</h2>
              <p>{s.cuerpo}</p>
            </section>
          ))}
        <section id="contacto" className="wrap section contact">
          <span className="eyebrow">NUESTRAS TIENDAS</span>
          <h2>
            Su próxima idea
            <br />
            empieza con un <span>¡hola!</span>
          </h2>
          <p className="contact-intro">
            Consulte disponibilidad, cuéntenos lo que busca o visítenos en el
            bazar.
          </p>
          <BazarDoodle kind="gift" className="contact-gift" />
          <div className="store-grid">
            {stores.map((store) => (
              <article className="store-card" key={store.name}>
                <span>Local {stores.indexOf(store) + 1}</span>
                <h3>{store.name}</h3>
                <p>
                  <b>Dirección</b>
                  <br />
                  {store.address}
                </p>
                <p>
                  <b>Horario</b>
                  <br />
                  {store.schedule}
                </p>
              </article>
            ))}
          </div>
          <div className="contact-grid contact-details">
            <p>
              <b>Teléfono</b>
              <br />
              {business.telefono}
            </p>
            {business.email && (
              <p>
                <b>Correo</b>
                <br />
                {business.email}
              </p>
            )}
          </div>
          <div className="location-map">
            <iframe
              title="Mapa de Bazar Nazareth en Hojancha"
              src="https://www.google.com/maps?q=10.0576279,-85.4188402&z=19&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <a
              href="https://www.google.com/maps?q=10.0576279,-85.4188402"
              target="_blank"
              rel="noopener noreferrer"
            >
              Abrir ubicación en Google Maps ↗
            </a>
          </div>
          <div className="contact-actions">
            <a
              className="button primary"
              href={business.enlaceContacto}
              target="_blank"
              rel="noopener noreferrer"
            >
              Abrir contacto por WhatsApp
            </a>
            <div className="social" aria-label="Redes sociales">
            {(business.redes || '')
              .split('\n')
              .filter((x) => {
                try {
                  return ['https:', 'http:'].includes(
                    new URL(x.trim()).protocol,
                  );
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
                    aria-label={instagram ? 'Abrir Instagram' : 'Abrir Linktree'}
                  >
                    <SocialIcon kind={instagram ? 'instagram' : 'linktree'} />
                    <span>{instagram ? 'Instagram' : 'Linktree'}</span>
                  </a>
                );
              })}
            </div>
          </div>
        </section>
      </main>
      <footer>
        <div className="wrap">
          <b>{business.nombre}</b>
          <span>
            Dos tiendas en Hojancha · {business.telefono}
          </span>
          <a href="/login">Acceso al editor</a>
        </div>
      </footer>
    </div>
  );
}
function Field({ name, label, kind, value, onChange, data, disabled }) {
  const common = {
    id: name,
    disabled,
    onChange: (e) =>
      onChange(
        name,
        kind === 'checkbox'
          ? e.target.checked
          : kind === 'number'
            ? Number(e.target.value)
            : kind === 'decimal'
              ? e.target.value === ''
                ? null
                : Number(e.target.value)
              : kind === 'image' || kind === 'category'
                ? e.target.value
                  ? Number(e.target.value)
                  : null
                : kind === 'datetime'
                  ? e.target.value
                    ? new Date(e.target.value + ':00-06:00').toISOString()
                    : null
                  : e.target.value,
      ),
  };
  const imageOptions = data.imagenes || [];
  const options =
    kind === 'status'
      ? [
          ['Borrador', 'Borrador'],
          ['Publicado', 'Publicado'],
          ['Archivado', 'Archivado'],
        ]
      : kind === 'category'
        ? (data.categorias || []).map((c) => [c.id, c.nombre])
        : kind === 'image'
          ? imageOptions.map((i) => [i.id, `${i.id} · ${i.nombre}`])
          : [
              ['CRC', 'CRC'],
              ['USD', 'USD'],
            ];
  return (
    <label
      className={kind === 'checkbox' ? 'checkbox-field' : 'field'}
      htmlFor={name}
    >
      {label}
      {kind === 'textarea' ? (
        <textarea {...common} rows="4" value={value ?? ''} />
      ) : ['status', 'category', 'image', 'currency'].includes(kind) ? (
        <select {...common} value={value ?? ''}>
          <option value="">
            {kind === 'image' || kind === 'currency'
              ? 'Sin seleccionar'
              : 'Seleccione...'}
          </option>
          {options.map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
      ) : (
        <input
          {...common}
          type={
            kind === 'decimal' || kind === 'number'
              ? 'number'
              : kind === 'datetime'
                ? 'datetime-local'
                : kind === 'checkbox'
                  ? kind
                  : kind
          }
          step={kind === 'decimal' ? '0.01' : undefined}
          min={kind === 'decimal' || kind === 'number' ? 0 : undefined}
          checked={kind === 'checkbox' ? !!value : undefined}
          value={
            kind === 'checkbox'
              ? undefined
              : kind === 'datetime'
                ? toCostaRicaInput(value)
                : (value ?? '')
          }
        />
      )}
    </label>
  );
}
function WhatsAppMetrics() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  async function load() {
    setLoading(true); setError('');
    try { setResult(await api('/admin/metricas/whatsapp')); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }
  const originLabels = {
    catalogo: 'Catálogo', detalle: 'Ficha para compartir', halloween: 'Temática de Halloween',
    galeria: 'Galería de ideas', anterior: 'Clics anteriores (sin origen)',
  };
  return <section className="form-panel" aria-label="Interés por productos">
    <h2>Interés por WhatsApp</h2>
    <p>Clics en los últimos 30 días. El informe indica desde qué parte de la web se abrió WhatsApp; no confirma que se enviara un mensaje ni que hubiera una venta.</p>
    <button className="button" type="button" onClick={load} disabled={loading}>
      {loading ? 'Consultando…' : 'Consultar clics'}
    </button>
    {error && <p role="alert">{error}</p>}
    {result && (!result.habilitada ? <p>La medición está pendiente de activación.</p>
      : (result.productos.length || result.galeria?.length) ? <div className="metrics-results">
          <h3>Por lugar del clic</h3>
          <ul>{(result.origenes || []).map(item => <li key={item.origen}><b>{originLabels[item.origen] || item.origen}:</b> {item.clics} clics</li>)}</ul>
          {!!result.productos.length && <><h3>Productos consultados</h3><ul>{result.productos.map(p => <li key={`${p.productoId}-${p.origen}`}><b>{p.nombre}:</b> {p.clics} desde {originLabels[p.origen] || p.origen}</li>)}</ul></>}
          {!!result.galeria?.length && <><h3>Ideas elegidas</h3><ul>{result.galeria.map(item => <li key={item.galeriaImagenId}><b>{item.titulo || `Idea #${item.galeriaImagenId}`}:</b> {item.clics} clics (referencia #{item.galeriaImagenId})</li>)}</ul></>}
        </div>
      : <p>Todavía no hay clics registrados en este período.</p>)}
  </section>;
}
function Editor({ account, navigate, logout, path, registerNavigationGuard }) {
  const [active, setActive] = useState(
    location.pathname.split('/')[2] || 'portada',
  );
  const [data, setData] = useState({}),
    [selected, setSelected] = useState(null),
    [draft, setDraft] = useState(null),
    [preview, setPreview] = useState(false),
    [reviewed, setReviewed] = useState(false),
    [message, setMessage] = useState(''),
    [busy, setBusy] = useState(false),
    [menu, setMenu] = useState(false);
  const menuButton = useRef(null);
  const [relationIds, setRelationIds] = useState([]),
    [promoProducts, setPromoProducts] = useState([]),
    [promoServices, setPromoServices] = useState([]);
  const [upload, setUpload] = useState({ file: null, alt: '' });
  const [inlineUpload, setInlineUpload] = useState({ file: null, alt: '' });
  const [editorForm, setEditorForm] = useState({
    nombre: '',
    email: '',
    password: '',
    completo: false,
    permisos: [],
    activo: true,
  });
  useEffect(() => {
    setActive(path.split('/')[2] || 'portada');
  }, [path]);
  const permitted = (p) => account.completo || account.permisos.includes(p);
  const hasUnsavedChanges = () => {
    const baseline = active === 'contacto' ? data.negocio : selected;
    if (draft && JSON.stringify(draft) !== JSON.stringify(baseline))
      return true;
    if (!draft) return false;
    const sameIds = (left, right) =>
      JSON.stringify([...left].sort((a, b) => a - b)) ===
      JSON.stringify([...right].sort((a, b) => a - b));
    if (active === 'productos') {
      const original = (data.relaciones?.productoImagenes || [])
        .filter((x) => x.productoId === selected?.id)
        .sort((a, b) => a.orden - b.orden)
        .map((x) => x.imagenId);
      if (!sameIds(relationIds, original)) return true;
    }
    if (active === 'promociones') {
      const originalProducts = (data.relaciones?.promocionProductos || [])
        .filter((x) => x.promocionId === selected?.id)
        .map((x) => x.productoId);
      const originalServices = (data.relaciones?.promocionServicios || [])
        .filter((x) => x.promocionId === selected?.id)
        .map((x) => x.servicioId);
      if (
        !sameIds(promoProducts, originalProducts) ||
        !sameIds(promoServices, originalServices)
      )
        return true;
    }
    return false;
  };
  const dirty = hasUnsavedChanges();
  useEffect(() => {
    const guard = () => {
      if (hasUnsavedChanges() && !confirm('Hay cambios sin guardar. ¿Salir?'))
        return false;
      setSelected(null);
      setDraft(null);
      setPreview(false);
      setReviewed(false);
      setMenu(false);
      return true;
    };
    registerNavigationGuard(guard);
    return () => registerNavigationGuard(null);
  }, [
    active,
    data,
    draft,
    selected,
    relationIds,
    promoProducts,
    promoServices,
    registerNavigationGuard,
  ]);
  useEffect(() => {
    if (!dirty) return;
    const warnBeforeLeaving = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warnBeforeLeaving);
    return () => window.removeEventListener('beforeunload', warnBeforeLeaving);
  }, [dirty]);
  useEffect(() => {
    if (!menu) return;
    const closeOnEscape = (event) => {
      if (event.key !== 'Escape') return;
      setMenu(false);
      menuButton.current?.focus();
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [menu]);
  async function reload() {
    setBusy(true);
    try {
      const keys = [
        'categorias',
        'productos',
        'servicios',
        'promociones',
        'galeria',
        'secciones',
        'imagenes',
        'negocio',
        'relaciones',
      ];
      const values = await Promise.all(keys.map((k) => api('/admin/' + k)));
      setData(Object.fromEntries(keys.map((k, i) => [k, values[i]])));
      setMessage('');
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    reload();
  }, []);
  function go(section) {
    if (hasUnsavedChanges() && !confirm('Hay cambios sin guardar. ¿Salir?'))
      return;
    setActive(section);
    navigate('/contenido/' + section);
    setSelected(null);
    setDraft(null);
    setPreview(false);
    setReviewed(false);
    setMenu(false);
    setMessage('');
  }
  function closeDraft() {
    if (
      hasUnsavedChanges() &&
      !confirm('Hay cambios sin guardar. ¿Cerrar sin guardarlos?')
    )
      return;
    setSelected(null);
    setDraft(null);
    setPreview(false);
    setReviewed(false);
  }
  function closePreview() {
    setPreview(false);
    setReviewed(true);
  }
  async function requestLogout() {
    if (
      hasUnsavedChanges() &&
      !confirm('Hay cambios sin guardar. ¿Cerrar sesión de todas formas?')
    )
      return;
    await logout();
  }
  function open(entity) {
    const item = entity
      ? structuredClone(entity)
      : structuredClone(defaults[collection[active] || 'productos']);
    if (!entity && active === 'portada') item.clave = 'portada';
    setSelected(item);
    setDraft(structuredClone(item));
    setPreview(false);
    setReviewed(false);
    setRelationIds(
      (data.relaciones?.productoImagenes || [])
        .filter((x) => x.productoId === item.id)
        .sort((a, b) => a.orden - b.orden)
        .map((x) => x.imagenId),
    );
    setPromoProducts(
      (data.relaciones?.promocionProductos || [])
        .filter((x) => x.promocionId === item.id)
        .map((x) => x.productoId),
    );
    setPromoServices(
      (data.relaciones?.promocionServicios || [])
        .filter((x) => x.promocionId === item.id)
        .map((x) => x.servicioId),
    );
  }
  async function changePublicationState(item, nextState) {
    const route = collection[active];
    if (
      !route ||
      !item?.id ||
      !['Borrador', 'Publicado', 'Archivado'].includes(nextState)
    )
      return;
    const recovering = nextState !== 'Archivado';
    const promptText = recovering
      ? '¿Recuperar este contenido como borrador? No se mostrará públicamente hasta que lo edite, abra la vista previa y lo publique.'
      : '¿Archivar este contenido? Se conservará en el sistema, pero dejará de estar disponible públicamente.';
    if (!confirm(promptText)) return;
    setBusy(true);
    try {
      await api('/admin/' + route + '/' + item.id, {
        method: 'PUT',
        ...json({ ...item, estado: nextState }),
      });
      if (selected?.id === item.id) {
        setSelected(null);
        setDraft(null);
        setPreview(false);
        setReviewed(false);
      }
      await reload();
      setMessage(
        recovering
          ? 'Contenido recuperado como borrador. Abra el elemento para revisarlo y publicarlo.'
          : 'Contenido archivado. Se conservaron sus datos y relaciones.',
      );
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    const route = collection[active];
    if (!route || !draft || busy) return;
    if (draft.estado === 'Publicado' && !reviewed) {
      setMessage('Abra la vista previa antes de publicar o actualizar.');
      return;
    }
    if (
      selected?.estado === 'Publicado' &&
      draft.estado !== 'Publicado' &&
      !confirm('¿Retirar este contenido de la página?')
    )
      return;
    if (
      draft.estado === 'Publicado' &&
      !confirm('¿Confirmar publicación o actualización de este contenido?')
    )
      return;
    setBusy(true);
    try {
      const combined = active === 'productos' || active === 'promociones';
      const payload = active === 'productos'
        ? { producto: draft, imagenes: relationIds }
        : active === 'promociones'
          ? { promocion: draft, productos: promoProducts, servicios: promoServices }
          : draft;
      await api(
        '/admin/' + route + (draft.id ? '/' + draft.id : '') + (combined ? '/guardar' : ''),
        { method: draft.id ? 'PUT' : 'POST', ...json(payload) },
      );
      setDraft(null);
      setSelected(null);
      setPreview(false);
      setReviewed(false);
      await reload();
      setMessage('Cambios guardados.');
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function saveBusiness(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await api('/admin/negocio', { method: 'PUT', ...json(draft) });
      await reload();
      setMessage('Contacto actualizado.');
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function uploadImage(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const body = new FormData();
      body.append('archivo', upload.file);
      body.append('textoAlternativo', upload.alt);
      await api('/admin/imagenes', { method: 'POST', body });
      setUpload({ file: null, alt: '' });
      e.target.reset();
      await reload();
      setMessage(
        'Imagen cargada. Selecciónela en el contenido que desea cambiar.',
      );
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function replaceImage(img, usage, file) {
    if (!file) return;
    if (!permitted(usage.permission)) {
      setMessage(
        `Su cuenta necesita permiso de ${labels[usage.permission]} para cambiar esta referencia.`,
      );
      return;
    }
    if (
      !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
      file.size > 5 * 1024 * 1024
    ) {
      setMessage('No se pudo cargar. Use JPG, PNG o WebP de hasta 5 MB.');
      return;
    }
    const alt =
      file.name
        .replace(/\.[^.]+$/, '')
        .replace(/[-_]+/g, ' ')
        .trim() || `Fotografía de ${usage.title}`;
    setMessage(
      `Subiendo «${file.name}» y reemplazando la foto solo en ${usage.section}…`,
    );
    setBusy(true);
    try {
      const body = new FormData();
      body.append('archivo', file);
      body.append('textoAlternativo', alt);
      const replacement = await api('/admin/imagenes', {
        method: 'POST',
        body,
      });
      if (usage.kind === 'producto') {
        const ids = (data.relaciones?.productoImagenes || [])
          .filter((x) => x.productoId === usage.id)
          .sort((a, b) => a.orden - b.orden)
          .map((x) => (x.imagenId === img.id ? replacement.id : x.imagenId));
        await api(`/admin/productos/${usage.id}/imagenes`, {
          method: 'PUT',
          ...json(ids),
        });
      } else {
        const route =
          usage.kind === 'seccion'
            ? 'secciones'
            : usage.kind === 'galeria'
              ? 'galeria'
              : usage.kind === 'servicio'
                ? 'servicios'
                : 'promociones';
        const item = data[route]?.find((x) => x.id === usage.id);
        if (!item)
          throw new Error(
            'No se encontró el contenido que usa esta fotografía.',
          );
        await api(`/admin/${route}/${usage.id}`, {
          method: 'PUT',
          ...json({ ...item, imagenId: replacement.id }),
        });
      }
      await reload();
      setMessage(
        `«${file.name}» se cargó como una fotografía nueva y ahora se usa en «${usage.title}». Se conservaron el título, el estado y el orden; los demás usos mantienen la foto anterior.`,
      );
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }
  async function uploadInlineImage(e) {
    e.preventDefault();
    if (!inlineUpload.file || !inlineUpload.alt.trim()) {
      setMessage('Seleccione una imagen y escriba su texto alternativo.');
      return;
    }
    if (
      !['image/jpeg', 'image/png', 'image/webp'].includes(
        inlineUpload.file.type,
      ) ||
      inlineUpload.file.size > 5 * 1024 * 1024
    ) {
      setMessage('Use JPG, PNG o WebP de hasta 5 MB.');
      return;
    }
    const form = e.currentTarget;
    setBusy(true);
    try {
      const body = new FormData();
      body.append('archivo', inlineUpload.file);
      body.append('textoAlternativo', inlineUpload.alt.trim());
      const img = await api('/admin/imagenes', { method: 'POST', body });
      const persistedGalleryItem =
        active === 'galeria' && selected?.id
          ? (data.galeria || []).find((item) => item.id === selected.id)
          : null;
      if (persistedGalleryItem && !hasUnsavedChanges()) {
        const updated = await api(`/admin/galeria/${persistedGalleryItem.id}`, {
          method: 'PUT',
          ...json({ ...persistedGalleryItem, imagenId: img.id }),
        });
        setSelected(updated);
        setDraft(structuredClone(updated));
        await reload();
        setMessage(
          `«${inlineUpload.file.name}» se cargó como archivo nuevo y reemplazó la foto de Galería. Se conservaron título, orden y publicación.`,
        );
      } else {
        const images = await api('/admin/imagenes');
        setData((d) => ({ ...d, imagenes: images }));
        if (active === 'productos')
          setRelationIds((ids) => [
            img.id,
            ...ids.filter((id) => id !== img.id),
          ]);
        else setDraft((current) => ({ ...current, imagenId: img.id }));
        setMessage(
          'Foto cargada y asignada al formulario. Abra Vista previa y guarde para aplicar los cambios.',
        );
      }
      setInlineUpload({ file: null, alt: '' });
      form.reset();
      setPreview(false);
      setReviewed(false);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }
  async function removeImage(id) {
    if (!confirm('¿Eliminar esta imagen sin referencias?')) return;
    try {
      await api('/admin/imagenes/' + id, { method: 'DELETE' });
      await reload();
      setMessage('Imagen eliminada.');
    } catch (e) {
      setMessage(e.message);
    }
  }
  async function saveAlt(id, oldAlt) {
    const alt = prompt('Texto alternativo', oldAlt);
    if (alt === null) return;
    try {
      await api('/admin/imagenes/' + id, {
        method: 'PUT',
        ...json({ textoAlternativo: alt }),
      });
      await reload();
    } catch (e) {
      setMessage(e.message);
    }
  }
  async function saveEditor(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const id = editorForm.id;
      await api('/admin/editores' + (id ? '/' + id : ''), {
        method: id ? 'PUT' : 'POST',
        ...json(editorForm),
      });
      setEditorForm({
        nombre: '',
        email: '',
        password: '',
        completo: false,
        permisos: [],
        activo: true,
      });
      setData((d) => ({ ...d, editores: undefined }));
      await loadEditors();
      setMessage('Cuenta guardada.');
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function loadEditors() {
    try {
      const list = await api('/admin/editores');
      setData((d) => ({ ...d, editores: list }));
    } catch (e) {
      setMessage(e.message);
    }
  }
  useEffect(() => {
    if (active === 'usuarios' && permitted('usuarios')) loadEditors();
  }, [active]);
  const route = collection[active],
    list =
      route && Array.isArray(data[route])
        ? data[route].filter((x) =>
            active === 'portada'
              ? x.clave === 'portada'
              : active === 'textos'
                ? x.clave !== 'portada'
                : true,
          )
        : [];
  const imgAlt = (id) =>
    data.imagenes?.find((x) => x.id === Number(id))?.textoAlternativo;
  const title = (x) => x.nombre || x.titulo || x.clave || `Fotografía ${x.id}`;
  const imageUsages = (id) => [
    ...(data.relaciones?.productoImagenes || [])
      .filter((x) => x.imagenId === id)
      .map((x) => ({
        kind: 'producto',
        id: x.productoId,
        title: title(
          data.productos?.find((p) => p.id === x.productoId) || {
            id: x.productoId,
          },
        ),
        section: 'Productos',
        permission: 'productos',
      })),
    ...(data.servicios || [])
      .filter((x) => x.imagenId === id)
      .map((x) => ({
        kind: 'servicio',
        id: x.id,
        title: title(x),
        section: 'Servicios',
        permission: 'servicios',
      })),
    ...(data.promociones || [])
      .filter((x) => x.imagenId === id)
      .map((x) => ({
        kind: 'promocion',
        id: x.id,
        title: title(x),
        section: 'Promoción',
        permission: 'promociones',
      })),
    ...(data.galeria || [])
      .filter((x) => x.imagenId === id)
      .map((x) => ({
        kind: 'galeria',
        id: x.id,
        title: title(x),
        section: 'Galería',
        permission: 'galeria',
      })),
    ...(data.secciones || [])
      .filter((x) => x.imagenId === id)
      .map((x) => ({
        kind: 'seccion',
        id: x.id,
        title: title(x),
        section: x.clave === 'portada' ? 'Inicio' : 'Textos',
        permission: 'textos',
      })),
  ];
  return (
    <div className="editor-layout">
      <aside className={menu ? 'open' : ''}>
        <div className="aside-brand">
          BAZAR <span>NAZARETH</span>
          <small>Editor de contenidos</small>
        </div>
        <button className="mobile-nav-close" onClick={() => setMenu(false)}>
          Cerrar menú ×
        </button>
        <nav>
          {sections.filter(permitted).map((p) => (
            <button
              key={p}
              className={active === p ? 'active' : ''}
              onClick={() => go(p)}
            >
              {labels[p]}
            </button>
          ))}
        </nav>
        <div className="aside-bottom">
          <a href="/" target="_blank" rel="noopener noreferrer">
            Ver página ↗
          </a>
          <button onClick={requestLogout}>Cerrar sesión</button>
        </div>
      </aside>
      <main className="editor-main">
        <div className="editor-top">
          <button
            ref={menuButton}
            className="mobile-menu"
            onClick={() => setMenu(!menu)}
            aria-expanded={menu}
            aria-label={menu ? 'Cerrar menú' : 'Abrir menú'}
          >
            ☰ Menú
          </button>
          <span>{account.nombre}</span>
        </div>
        <div className="editor-content">
          <span className="eyebrow">GESTIÓN DE CONTENIDO</span>
          <h1>{labels[active] || 'Editor'}</h1>
          {message && (
            <div className="notice" role="alert">
              {message}
            </div>
          )}
          {busy && <p role="status">Procesando…</p>}
          {active === 'productos' && permitted('productos') && <WhatsAppMetrics />}
          {!permitted(active) ? (
            <p>No tiene permiso para esta sección.</p>
          ) : active === 'contacto' ? (
            <form className="form-panel" onSubmit={saveBusiness}>
              <p>
                Estos datos se comparten entre la sección de contacto y el pie
                de página.
              </p>
              {fieldsets.negocio.map(([name, label, kind]) => (
                <Field
                  key={name}
                  name={name}
                  label={label}
                  kind={kind}
                  value={(draft || data.negocio)?.[name]}
                  onChange={(n, v) =>
                    setDraft({ ...(draft || data.negocio), [n]: v })
                  }
                  data={data}
                />
              ))}
              <button className="button primary" disabled={busy}>
                Guardar contacto
              </button>
            </form>
          ) : active === 'imagenes' ? (
            <>
              <p className="image-library-intro">
                Para cambiar una sección, use <b>Reemplazar</b> en la fila que
                muestre su uso. <b>Cargar a la biblioteca</b> solo guarda una
                foto nueva; no la asigna automáticamente.
              </p>
              <div className="image-library-toolbar">
                <form className="image-upload-inline" onSubmit={uploadImage}>
                  <h2>Añadir fotografía a la biblioteca</h2>
                  <label className="field">
                    JPG, PNG o WebP · hasta 5 MB
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      required
                      onChange={(e) =>
                        setUpload({ ...upload, file: e.target.files[0] })
                      }
                    />
                  </label>
                  <label className="field">
                    Texto alternativo
                    <input
                      required
                      value={upload.alt}
                      onChange={(e) =>
                        setUpload({ ...upload, alt: e.target.value })
                      }
                    />
                  </label>
                  <button className="button" disabled={busy}>
                    Cargar a la biblioteca
                  </button>
                </form>
                <button
                  className="button"
                  onClick={() => {
                    const first = data.imagenes?.[0];
                    if (first)
                      window.open(
                        imageUrl(first.id),
                        '_blank',
                        'noopener,noreferrer',
                      );
                  }}
                >
                  Vista previa
                </button>
              </div>
              <div className="grid image-library">
                {data.imagenes?.map((img) => {
                  const usages = imageUsages(img.id);
                  return (
                    <article className="card image-library-card" key={img.id}>
                      <Img id={img.id} alt={img.textoAlternativo} />
                      <div className="card-body">
                        <b>{img.nombre}</b>
                        <p>{img.textoAlternativo}</p>
                        <small>
                          {(img.tamanoBytes / 1024 / 1024).toFixed(2)} MB
                        </small>
                        {usages.length ? (
                          usages.map((usage) => (
                            <div
                              className="image-usage"
                              key={`${usage.kind}-${usage.id}`}
                            >
                              <span>
                                <b>{usage.title}</b>
                                <small>Uso: {usage.section}</small>
                              </span>
                              <label className="button image-replace-button">
                                Reemplazar en {usage.section}
                                <input
                                  type="file"
                                  accept="image/jpeg,image/png,image/webp"
                                  disabled={
                                    busy || !permitted(usage.permission)
                                  }
                                  onChange={(e) => {
                                    replaceImage(
                                      img,
                                      usage,
                                      e.target.files?.[0],
                                    );
                                    e.target.value = '';
                                  }}
                                />
                              </label>
                            </div>
                          ))
                        ) : (
                          <p className="image-unused">
                            Sin contenido vinculado
                          </p>
                        )}
                        <div className="row">
                          <button
                            onClick={() =>
                              saveAlt(img.id, img.textoAlternativo)
                            }
                          >
                            Editar texto alternativo
                          </button>
                          <button onClick={() => removeImage(img.id)}>
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
              <p className="hint">
                Reemplazar sube la nueva foto y actualiza solo el contenido
                elegido. Si la foto se usa en más de un lugar, cada uso tiene su
                propio botón.
              </p>
            </>
          ) : active === 'usuarios' ? (
            <>
              <div className="list-panel">
                {(data.editores || []).map((x) => (
                  <button
                    className="list-item"
                    key={x.id}
                    onClick={() =>
                      setEditorForm({
                        ...x,
                        password: '',
                        permisos: x.permisos ? x.permisos.split(',') : [],
                      })
                    }
                  >
                    {x.nombre} · {x.email}{' '}
                    <small>
                      {x.completo
                        ? 'Acceso completo'
                        : x.permisos || 'Sin permisos'}{' '}
                      · {x.activo ? 'Activo' : 'Inactivo'}
                    </small>
                  </button>
                ))}
              </div>
              <form className="form-panel" onSubmit={saveEditor}>
                <h2>{editorForm.id ? 'Editar cuenta' : 'Nueva cuenta'}</h2>
                <label className="field">
                  Nombre
                  <input
                    required
                    value={editorForm.nombre}
                    onChange={(e) =>
                      setEditorForm({ ...editorForm, nombre: e.target.value })
                    }
                  />
                </label>
                <label className="field">
                  Correo
                  <input
                    type="email"
                    required
                    value={editorForm.email}
                    onChange={(e) =>
                      setEditorForm({ ...editorForm, email: e.target.value })
                    }
                  />
                </label>
                <label className="field">
                  Contraseña{' '}
                  {editorForm.id
                    ? '(dejar vacía para conservar)'
                    : '(mínimo 12 caracteres)'}
                  <input
                    type="password"
                    minLength="12"
                    required={!editorForm.id}
                    value={editorForm.password}
                    onChange={(e) =>
                      setEditorForm({ ...editorForm, password: e.target.value })
                    }
                  />
                </label>
                <label className="checkbox-field">
                  Acceso completo
                  <input
                    type="checkbox"
                    checked={editorForm.completo}
                    onChange={(e) =>
                      setEditorForm({
                        ...editorForm,
                        completo: e.target.checked,
                      })
                    }
                  />
                </label>
                <fieldset disabled={editorForm.completo}>
                  <legend>Permisos personalizados</legend>
                  <div className="permission-grid">
                    {sections.map((p) => (
                      <label key={p}>
                        <input
                          type="checkbox"
                          checked={editorForm.permisos.includes(p)}
                          onChange={(e) =>
                            setEditorForm({
                              ...editorForm,
                              permisos: e.target.checked
                                ? [...editorForm.permisos, p]
                                : editorForm.permisos.filter((x) => x !== p),
                            })
                          }
                        />
                        {labels[p]}
                      </label>
                    ))}
                  </div>
                </fieldset>
                {editorForm.id && (
                  <label className="checkbox-field">
                    Cuenta activa
                    <input
                      type="checkbox"
                      checked={editorForm.activo}
                      onChange={(e) =>
                        setEditorForm({
                          ...editorForm,
                          activo: e.target.checked,
                        })
                      }
                    />
                  </label>
                )}
                <div className="row">
                  <button className="button primary" disabled={busy}>
                    Guardar cuenta
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setEditorForm({
                        nombre: '',
                        email: '',
                        password: '',
                        completo: false,
                        permisos: [],
                        activo: true,
                      })
                    }
                  >
                    Nueva cuenta
                  </button>
                </div>
              </form>
            </>
          ) : (
            route && (
              <>
                <div className="editor-actions">
                  <p>
                    {active === 'portada'
                      ? 'Encabezado y presentación de la página'
                      : active === 'productos'
                        ? 'Fichas informativas por categoría'
                        : active === 'textos'
                          ? 'Bloques informativos que aparecen entre la galería y el contacto'
                        : `Editar ${labels[active].toLowerCase()}`}
                  </p>
                  {active !== 'portada' && (
                    <button
                      className="button primary"
                      onClick={() => open(null)}
                    >
                      + Crear{' '}
                      {active === 'productos' ? 'producto' : 'contenido'}
                    </button>
                  )}
                  {active === 'portada' && !list.length && (
                    <button
                      className="button primary"
                      onClick={() => open(null)}
                    >
                      Crear portada
                    </button>
                  )}
                </div>
                {active === 'productos' && (
                  <div className="category-block">
                    <h2>Categorías</h2>
                    <div className="category-list">
                      {(data.categorias || []).map((c) => (
                        <CategoryRow
                          key={c.id}
                          category={c}
                          refresh={reload}
                          setMessage={setMessage}
                        />
                      ))}
                    </div>
                    <CategoryRow
                      category={null}
                      refresh={reload}
                      setMessage={setMessage}
                    />
                  </div>
                )}
                <div className="list-panel">
                  {list.map((item) => (
                    <div className="list-item list-item-actions" key={item.id}>
                      <button
                        className="list-item-open"
                        onClick={() => open(item)}
                        disabled={busy}
                      >
                        <span>
                          <b>{title(item)}</b>{' '}
                          <small>
                            #{item.id} ·{' '}
                            {item.estado ||
                              (item.activa ? 'Activa' : 'Inactiva')}
                            {active === 'promociones'
                              ? ` · Vigencia: ${promotionTimingLabel(item)}`
                              : ''}
                          </small>
                        </span>
                        <span>Editar →</span>
                      </button>
                      {item.estado && (
                        <button
                          className={
                            item.estado === 'Archivado'
                              ? 'state-button restore-button'
                              : 'state-button archive-button'
                          }
                          disabled={busy}
                          onClick={() =>
                            changePublicationState(
                              item,
                              item.estado === 'Archivado'
                                ? 'Borrador'
                                : 'Archivado',
                            )
                          }
                        >
                          {item.estado === 'Archivado'
                            ? 'Recuperar'
                            : 'Archivar'}
                        </button>
                      )}
                    </div>
                  ))}
                  {!list.length && (
                    <p className="empty">
                      Aún no hay contenido en esta sección.
                    </p>
                  )}
                </div>
                {draft && (
                  <div className="form-panel">
                    <div className="row spread">
                      <h2>
                        {draft.id ? 'Editar' : 'Crear'}{' '}
                        {labels[active].toLowerCase()}
                      </h2>
                      <button onClick={closeDraft}>Cerrar ×</button>
                    </div>
                    {active === 'productos' && (
                      <p className="hint">
                        Guarde primero un borrador para asignar fotografías;
                        después puede publicarlo.
                      </p>
                    )}
                    {active === 'promociones' && (
                      <p className="hint">
                        Vigencia calculada con inicio y fin:{' '}
                        {promotionTimingLabel(draft)}. Programada, Vigente y
                        Finalizada son etiquetas; la visibilidad pública también
                        requiere estado Publicado.
                      </p>
                    )}
                    {active === 'textos' && (
                      <div className="content-editor-help">
                        <strong>¿Para qué sirve esta sección?</strong>
                        <p>Cada bloque publicado aparece en la página pública después de la Galería de ideas. Úselo solo para información complementaria, por ejemplo pedidos, entregas o preguntas frecuentes. Si un bloque es de demostración, puede archivarlo.</p>
                        <small>La “clave” es un nombre interno corto y único; los clientes no la ven.</small>
                      </div>
                    )}
                    {fieldsets[route].map(([name, label, kind]) => (
                      <Field
                        key={name}
                        name={name}
                        label={label}
                        kind={kind}
                        value={draft[name]}
                        onChange={(n, v) => {
                          setDraft({ ...draft, [n]: v });
                          setPreview(false);
                          setReviewed(false);
                        }}
                        data={data}
                        disabled={active === 'portada' && name === 'clave'}
                      />
                    ))}
                    {active === 'productos' && (
                      <label
                        className="field image-picker"
                        htmlFor="productoImagenes"
                      >
                        Fotografías existentes{' '}
                        <select
                          id="productoImagenes"
                          multiple
                          size="5"
                          value={relationIds.map(String)}
                          onChange={(e) => {
                            setRelationIds(
                              [...e.target.selectedOptions].map((option) =>
                                Number(option.value),
                              ),
                            );
                            setPreview(false);
                            setReviewed(false);
                          }}
                        >
                          {(data.imagenes || []).map((image) => (
                            <option key={image.id} value={image.id}>
                              {image.nombre} · {image.textoAlternativo}
                            </option>
                          ))}
                        </select>
                        <small>
                          Puede elegir varias. Cambiar la selección actualiza
                          solo este producto al guardar.
                        </small>
                      </label>
                    )}
                    {[
                      'portada',
                      'productos',
                      'servicios',
                      'promociones',
                      'galeria',
                      'textos',
                    ].includes(active) && (
                      <div className="inline-image-tools">
                        <h3>Imagen de este contenido</h3>
                        <p className="hint">
                          Puede elegir una fotografía de la biblioteca o cargar
                          otra. Al cargarla se crea un archivo nuevo y solo se
                          cambia la referencia de este contenido.
                        </p>
                        {permitted('imagenes') ? (
                          <form
                            className="inline-image-form"
                            onSubmit={uploadInlineImage}
                          >
                            <label className="field">
                              Archivo JPG, PNG o WebP (máximo 5 MB)
                              <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                required
                                onChange={(e) =>
                                  setInlineUpload({
                                    ...inlineUpload,
                                    file: e.target.files?.[0] || null,
                                  })
                                }
                              />
                            </label>
                            <label className="field">
                              Texto alternativo
                              <input
                                required
                                maxLength="250"
                                value={inlineUpload.alt}
                                onChange={(e) =>
                                  setInlineUpload({
                                    ...inlineUpload,
                                    alt: e.target.value,
                                  })
                                }
                                placeholder="Describa la imagen"
                              />
                            </label>
                            <button
                              className="button"
                              type="submit"
                              disabled={
                                busy ||
                                !inlineUpload.file ||
                                !inlineUpload.alt.trim()
                              }
                            >
                              Subir y asignar imagen
                            </button>
                          </form>
                        ) : (
                          <p className="hint">
                            Su cuenta no tiene permiso para cargar imágenes.
                            Solicite el permiso «Imágenes» o use una imagen ya
                            cargada.
                          </p>
                        )}
                        {(active === 'productos'
                          ? relationIds[0]
                          : draft.imagenId) && (
                          <div className="inline-image-preview">
                            <span>Vista previa de la imagen asignada</span>
                            <Img
                              id={
                                active === 'productos'
                                  ? relationIds[0]
                                  : draft.imagenId
                              }
                              alt={imgAlt(
                                active === 'productos'
                                  ? relationIds[0]
                                  : draft.imagenId,
                              )}
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {active === 'promociones' && (
                      <>
                        <label className="field">
                          Productos relacionados (opcional)
                          <select
                            multiple
                            size="4"
                            value={promoProducts.map(String)}
                            onChange={(e) => {
                              setPromoProducts(
                                [...e.target.selectedOptions].map((o) =>
                                  Number(o.value),
                                ),
                              );
                              setPreview(false);
                              setReviewed(false);
                            }}
                          >
                            {data.productos?.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.nombre}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="field">
                          Servicios relacionados (opcional)
                          <select
                            multiple
                            size="4"
                            value={promoServices.map(String)}
                            onChange={(e) => {
                              setPromoServices(
                                [...e.target.selectedOptions].map((o) =>
                                  Number(o.value),
                                ),
                              );
                              setPreview(false);
                              setReviewed(false);
                            }}
                          >
                            {data.servicios?.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.nombre}
                              </option>
                            ))}
                          </select>
                        </label>
                      </>
                    )}
                    <div className="row">
                      <button
                        className="button"
                        onClick={() => {
                          setPreview(true);
                          setReviewed(false);
                          setMessage('');
                        }}
                      >
                        Vista previa
                      </button>
                      <button
                        className="button primary"
                        disabled={busy}
                        onClick={save}
                      >
                        Guardar{' '}
                        {draft.estado === 'Publicado' ? 'y publicar' : ''}
                      </button>
                    </div>
                  </div>
                )}
                {preview && draft && (
                  <div
                    className="modal-backdrop"
                    role="presentation"
                    onMouseDown={(e) => {
                      if (e.target === e.currentTarget) closePreview();
                    }}
                  >
                    <div
                      className="preview-modal"
                      role="dialog"
                      aria-modal="true"
                      aria-label="Vista previa"
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      <div className="row spread">
                        <h2>Vista previa · {draft.estado}</h2>
                        <button onClick={closePreview}>Cerrar ×</button>
                      </div>
                      <div className="preview-card">
                        <Img
                          id={
                            active === 'productos'
                              ? relationIds[0]
                              : draft.imagenId
                          }
                          alt={imgAlt(
                            active === 'productos'
                              ? relationIds[0]
                              : draft.imagenId,
                          )}
                        />
                        <h3>{draft.nombre || draft.titulo || draft.clave}</h3>
                        <p>{draft.descripcion || draft.cuerpo}</p>
                        {draft.condiciones && (
                          <p>
                            <b>Condiciones:</b> {draft.condiciones}
                          </p>
                        )}
                        {active === 'productos' && (
                          <strong>
                            {formattedPrice(
                              draft.precioInformativo,
                              draft.moneda,
                            )}
                          </strong>
                        )}
                      </div>
                      <p>Esta vista no publica ni guarda cambios.</p>
                      <button className="button primary" onClick={closePreview}>
                        Volver a editar
                      </button>
                    </div>
                  </div>
                )}
              </>
            )
          )}
        </div>
      </main>
    </div>
  );
}
function CategoryRow({ category, refresh, setMessage }) {
  const [value, setValue] = useState(
    category || { nombre: '', orden: 0, activa: true },
  );
  useEffect(
    () => setValue(category || { nombre: '', orden: 0, activa: true }),
    [category],
  );
  async function save(e) {
    e.preventDefault();
    try {
      await api('/admin/categorias' + (category ? '/' + category.id : ''), {
        method: category ? 'PUT' : 'POST',
        ...json(value),
      });
      await refresh();
      setMessage('Categoría guardada.');
      if (!category) setValue({ nombre: '', orden: 0, activa: true });
    } catch (e) {
      setMessage(e.message);
    }
  }
  return (
    <form className="category-row" onSubmit={save}>
      <input
        aria-label="Nombre de categoría"
        required
        placeholder="Nombre de categoría"
        value={value.nombre}
        onChange={(e) => setValue({ ...value, nombre: e.target.value })}
      />
      <input
        aria-label="Orden"
        type="number"
        min="0"
        value={value.orden}
        onChange={(e) => setValue({ ...value, orden: Number(e.target.value) })}
      />
      <label>
        <input
          type="checkbox"
          checked={value.activa}
          onChange={(e) => setValue({ ...value, activa: e.target.checked })}
        />{' '}
        Activa
      </label>
      <button>{category ? 'Guardar' : 'Añadir'}</button>
    </form>
  );
}
function App() {
  const [path, setPath] = useState(location.pathname),
    [account, setAccount] = useState(null),
    [data, setData] = useState(null),
    [error, setError] = useState(''),
    [loading, setLoading] = useState(true),
    [login, setLogin] = useState({ email: '', password: '' });
  const navigationGuard = useRef(null);
  const registerNavigationGuard = useCallback((guard) => {
    navigationGuard.current = guard;
  }, []);
  const navigate = (p) => {
    history.pushState({}, '', p);
    setPath(p);
  };
  useEffect(() => {
    const fn = () => {
      const nextPath = location.pathname;
      if (navigationGuard.current && !navigationGuard.current()) {
        history.pushState({}, '', path);
        return;
      }
      setPath(nextPath);
    };
    window.addEventListener('popstate', fn);
    return () => window.removeEventListener('popstate', fn);
  }, [path]);
  useEffect(() => {
    Promise.allSettled([api('/publico'), api('/session')]).then(
      ([pub, user]) => {
        if (pub.status === 'fulfilled') setData(pub.value);
        else
          setError(
            'No se pudo cargar la página. Compruebe que la API esté en ejecución.',
          );
        if (user.status === 'fulfilled') setAccount(user.value);
        setLoading(false);
      },
    );
  }, []);
  useEffect(() => {
    if (!loading && !account && path.startsWith('/contenido'))
      navigate('/login');
  }, [loading, account, path]);
  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      const u = await api('/login', { method: 'POST', ...json(login) });
      setAccount(u);
      navigate('/contenido/portada');
    } catch {
      setError('Correo o contraseña incorrectos.');
    }
  }
  async function logout() {
    await api('/logout', { method: 'POST' });
    setAccount(null);
    navigate('/login');
  }
  if (loading)
    return (
      <div className="center-state" role="status">
        Cargando Bazar Nazareth…
      </div>
    );
  if (path.startsWith('/contenido') && !account)
    return (
      <div className="center-state" role="status">
        Redirigiendo al acceso…
      </div>
    );
  if (path.startsWith('/contenido'))
    return (
      <Editor
        account={account}
        navigate={navigate}
        logout={logout}
        path={path}
        registerNavigationGuard={registerNavigationGuard}
      />
    );
  if (path === '/login')
    return (
      <div className="login-screen">
        <form className="login-card" onSubmit={submit}>
          <a href="/">← Volver al sitio</a>
          <span className="eyebrow">BAZAR NAZARETH</span>
          <h1>Acceso al editor</h1>
          {error && <p role="alert">{error}</p>}
          <label>
            Correo electrónico
            <input
              autoComplete="username"
              type="email"
              required
              value={login.email}
              onChange={(e) => setLogin({ ...login, email: e.target.value })}
            />
          </label>
          <label>
            Contraseña
            <input
              autoComplete="current-password"
              type="password"
              required
              value={login.password}
              onChange={(e) => setLogin({ ...login, password: e.target.value })}
            />
          </label>
          <button className="button primary">Iniciar sesión</button>
        </form>
      </div>
    );
  if (error)
    return (
      <div className="center-state" role="alert">
        {error}
      </div>
    );
  return data ? (
    <Public data={data} />
  ) : (
    <div className="center-state">Sin datos disponibles.</div>
  );
}
createRoot(document.getElementById('root')).render(<App />);
