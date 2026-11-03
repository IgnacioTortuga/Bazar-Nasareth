import {
  LanguageProvider,
  LanguageToggle,
  useLanguage,
} from '../shared/Language.jsx';
import { useMemo } from 'react';
import { localizeCatalog } from '../shared/translations.js';
import ThemeFeedback from '../shared/ThemeFeedback.jsx';
import React, { useEffect, useState } from 'react';
import { AdminIcon, BazarDoodle } from '../shared/Icons.jsx';
import ProductCatalog from '../modules/productos/ProductCatalog.jsx';
import ServicesSection from '../modules/servicios/ServicesSection.jsx';
import PromotionsSection from '../modules/promociones/PromotionsSection.jsx';
import HomeHero from '../modules/contenido/HomeHero.jsx';
import Highlights from '../modules/contenido/Highlights.jsx';
import TextBlocks from '../modules/contenido/TextBlocks.jsx';
import ContactSection from '../modules/contacto/ContactSection.jsx';
import Gallery from '../modules/galeria/Gallery.jsx';
import {
  readCatalogFilters,
  catalogReturnUrl,
  filterCatalog,
} from '../modules/productos/catalogFilters.js';
import { promotionTimingLabel } from '../shared/format.js';
import {
  useReadingPreferences,
  ContrastToggle,
  ReadingMenu,
} from '../shared/ReadingControls.jsx';

export default function Public({ data }) {
  return (
    <LanguageProvider>
      <PublicContent originalData={data} />
    </LanguageProvider>
  );
}
function PublicContent({ originalData }) {
  const { t, language } = useLanguage();
  const data = useMemo(
    () => localizeCatalog(originalData, language),
    [originalData, language],
  );

  const reading = useReadingPreferences();
  const [themeFeedback, setThemeFeedback] = useState(null);
  const [filters, setFilters] = useState(readCatalogFilters),
    [menu, setMenu] = useState(false),
    [activeSection, setActiveSection] = useState('inicio');
  const { category, search, promotionId } = filters;
  const setCategory = (value) =>
    setFilters((current) => ({ ...current, category: value }));
  const setSearch = (value) =>
    setFilters((current) => ({ ...current, search: value }));
  const promotion = data.promociones.find(
    (item) =>
      String(item.id) === promotionId &&
      promotionTimingLabel(item) === 'Vigente',
  );
  const campaign = promotion?.titulo || '';
  const returnUrl = catalogReturnUrl({ ...filters, language });
  useEffect(() => {
    const url = new URL(window.location.href);
    const values = { categoria: category, q: search, promocion: promotionId };
    for (const [key, value] of Object.entries(values)) {
      if (value) url.searchParams.set(key, value);
      else url.searchParams.delete(key);
    }
    history.replaceState(history.state, '', url);
  }, [category, search, promotionId]);
  useEffect(() => {
    const restore = () => setFilters(readCatalogFilters());
    const closeMenu = (event) => {
      if (event.key === 'Escape' && menu) {
        setMenu(false);
        document.querySelector('.public-header .mobile-menu')?.focus();
      }
    };
    window.addEventListener('popstate', restore);
    window.addEventListener('keydown', closeMenu);
    return () => {
      window.removeEventListener('popstate', restore);
      window.removeEventListener('keydown', closeMenu);
    };
  }, [menu]);
  const business = data.negocio,
    images = Object.fromEntries(
      data.imagenes.map((i) => [i.id, i.textoAlternativo]),
    );
  const hero =
    data.secciones.find((s) => s.clave === 'portada') ||
    data.secciones.find((s) => s.clave === 'presentación');
  const products = filterCatalog(data, filters);
  const links = [
    ['productos', t('Productos')],
    ['servicios', t('Servicios')],
    ['promociones', t('Promociones')],
    ['galeria', t('Galería')],
    ['contacto', t('Contacto')],
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
    document.getElementById('productos')?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
    });
  }
  function openCampaign(promotion) {
    setThemeFeedback(
      /halloween/i.test(promotion.titulo)
        ? { title: promotion.titulo, id: performance.now() }
        : null,
    );
    setFilters({ category: '', search: '', promotionId: String(promotion.id) });
    document.getElementById('productos')?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
    });
  }
  return (
    <div className="public-site">
      {themeFeedback && (
        <ThemeFeedback
          key={themeFeedback.id}
          title={themeFeedback.title}
          onClose={() => setThemeFeedback(null)}
        />
      )}
      <a className="skip-link" href="#productos">
        {' '}
        {t('Saltar al catálogo')}{' '}
      </a>
      <div className="welcome-ribbon">
        <BazarDoodle /> {t('Un detalle pequeño. Una sonrisa enorme.')}{' '}
        <BazarDoodle />
      </div>
      <header className="public-header">
        <ContrastToggle theme={reading.theme} onToggle={reading.toggleTheme} />
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
            aria-label={menu ? t('Cerrar navegación') : t('Abrir navegación')}
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
              {' '}
              {t('Inicio')}{' '}
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
              aria-label={t('Buscar productos en el catálogo')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('Buscar productos…')}
            />
            <button type="submit" aria-label={t('Buscar')}>
              ⌕
            </button>
          </form>
        </div>
        <div className="header-utilities">
          <LanguageToggle />
          <ReadingMenu
            fontSize={reading.fontSize}
            onSizeChange={reading.setFontSize}
          />
        </div>
      </header>
      <main>
        <HomeHero hero={hero} images={images} />
        <Highlights highlights={highlights} images={images} />
        <ProductCatalog
          data={data}
          products={products}
          category={category}
          setCategory={setCategory}
          search={search}
          setSearch={setSearch}
          business={business}
          images={images}
          campaign={campaign}
          clearCampaign={() => {
            setThemeFeedback(null);
            setFilters((current) => ({ ...current, promotionId: '' }));
          }}
          clearFilters={() =>
            setFilters({ category: '', search: '', promotionId: '' })
          }
          returnUrl={returnUrl}
        />
        <ServicesSection data={data} images={images} business={business} />
        <PromotionsSection
          data={data}
          images={images}
          openCampaign={openCampaign}
        />
        <Gallery data={data} images={images} business={business} />
        <TextBlocks data={data} hero={hero} />
        <ContactSection business={business} />
      </main>
      <footer>
        <div className="wrap">
          <b>{business.nombre}</b>
          <span>
            {t('Dos tiendas en Hojancha ·')} {business.telefono}
          </span>
          <a className="editor-access" href="/login" aria-label={t('Acceso al editor')} title={t('Acceso al editor')}><AdminIcon /></a>
        </div>
      </footer>
    </div>
  );
}
