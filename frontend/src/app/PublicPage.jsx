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
import ChristmasSnow from '../modules/promociones/ChristmasSnow.jsx';
import {
  isActiveChristmasPromotion,
  isChristmasPromotion,
} from '../modules/promociones/christmasPromotion.js';
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
  const [snowReplay, setSnowReplay] = useState(0);
  const christmasPromotions = useMemo(
    () => originalData.promociones.filter(isChristmasPromotion),
    [originalData.promociones],
  );
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
  function navigateSection(event, id) {
    event.preventDefault();
    setMenu(false);
    setActiveSection(id);
    requestAnimationFrame(() => {
      const section = document.getElementById(id);
      if (!section) return;
      const header = document.querySelector('.public-header');
      const url = new URL(window.location.href);
      url.hash = id;
      history.pushState(history.state, '', url);
      const heading = section.querySelector('.eyebrow, h2, h1') || section;
      window.scrollTo({ top: heading.getBoundingClientRect().top + window.scrollY - (header?.getBoundingClientRect().height || 0) - 16, behavior: 'auto' });
    });
  }
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
    const originalChristmasPromotion = christmasPromotions.find((item) => item.id === promotion.id);
    if (originalChristmasPromotion && isActiveChristmasPromotion(originalChristmasPromotion)) {
      setSnowReplay((current) => current + 1);
    }
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
      {christmasPromotions.length > 0 && (
        <ChristmasSnow promotions={christmasPromotions} replay={snowReplay} />
      )}
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
      <header className="public-header" onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setMenu(false);
      }}>
        <ContrastToggle theme={reading.theme} onToggle={reading.toggleTheme} />
        <div className="header-inner wrap">
          <a className="brand" href="#inicio" aria-label={business.nombre}>
            <img
              className="brand-mark"
              src="/images/simbolo-bazar.png"
              alt=""
              width="48"
              height="48"
            />
            <span className="brand-full">{business.nombre}</span>
            <span className="brand-compact" aria-hidden="true">{business.nombre.replace(/\s+de Hojancha$/i, '')}</span>
          </a>
          <button
            className="mobile-menu"
            onClick={() => setMenu(!menu)}
            aria-expanded={menu}
            aria-controls="public-navigation"
            aria-label={menu ? t('Cerrar navegación') : t('Abrir navegación')}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d={menu ? 'M6 6l12 12M6 18 18 6' : 'M4 6h16M4 12h16M4 18h16'} /></svg>
            <span>{t(menu ? 'Cerrar' : 'Menú')}</span>
          </button>
          <nav id="public-navigation" className={menu ? 'open' : ''}
            aria-label={t('Navegación principal')}>
            <a
              href="#inicio"
              className={`nav-home ${activeSection === 'inicio' ? 'is-active' : ''}`}
              onClick={(event) => navigateSection(event, 'inicio')}
            >
              {' '}
              {t('Inicio')}{' '}
            </a>
            {links.map(([id, label]) => (
              <a
                key={id}
                href={'#' + id}
                className={activeSection === id ? 'is-active' : ''}
                onClick={(event) => navigateSection(event, id)}
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
      <main onClick={(event) => {
        const anchor = event.target.closest('a[href^="#"]');
        if (anchor && document.getElementById(anchor.hash.slice(1))) navigateSection(event, anchor.hash.slice(1));
      }}>
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
