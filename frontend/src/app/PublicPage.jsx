import React, { useEffect, useState } from 'react';
import { BazarDoodle } from '../shared/Icons.jsx';
import ProductCatalog from '../modules/productos/ProductCatalog.jsx';
import ServicesSection from '../modules/servicios/ServicesSection.jsx';
import PromotionsSection from '../modules/promociones/PromotionsSection.jsx';
import HomeHero from '../modules/contenido/HomeHero.jsx';
import Highlights from '../modules/contenido/Highlights.jsx';
import TextBlocks from '../modules/contenido/TextBlocks.jsx';
import ContactSection from '../modules/contacto/ContactSection.jsx';
import Gallery from '../modules/galeria/Gallery.jsx';

export default function Public({ data }) {
  const [category, setCategory] = useState(''),
    [search, setSearch] = useState(''),
    [menu, setMenu] = useState(false),
    [campaign, setCampaign] = useState(''),
    [activeSection, setActiveSection] = useState('inicio');
  const business = data.negocio,
    images = Object.fromEntries(
      data.imagenes.map((i) => [i.id, i.textoAlternativo]),
    );
  const hero =
    data.secciones.find((s) => s.clave === 'portada') ||
    data.secciones.find((s) => s.clave === 'presentación');
  const products = data.productos.filter(
    (p) =>
      (!category || p.categoriaId === Number(category)) &&
      p.nombre.toLowerCase().includes(search.toLowerCase()),
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
    setCampaign(
      /halloween/i.test(promotion.titulo) ? 'Halloween' : promotion.titulo,
    );
    setCategory('');
    setSearch('');
    document
      .getElementById('productos')
      ?.scrollIntoView({ behavior: 'smooth' });
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
          <span>Dos tiendas en Hojancha · {business.telefono}</span>
          <a href="/login">Acceso al editor</a>
        </div>
      </footer>
    </div>
  );
}
