import test from 'node:test';
import assert from 'node:assert/strict';
import { translate, localizeCatalog } from '../src/shared/translations.js';
import { catalogReturnUrl, filterCatalog } from '../src/modules/productos/catalogFilters.js';

test('Los destacados y etiquetas cambian y vuelven al idioma original', () => {
  assert.equal(translate('Encuentre su próximo detalle', 'en'), 'Find your next gift');
  assert.equal(translate('Ideas que hacemos realidad', 'en'), 'Ideas we bring to life');
  assert.equal(translate('Descubra nuestras promociones', 'en'), 'Discover our offers');
  assert.equal(translate('Nuestro catálogo', 'en'), 'Our catalog');
  assert.equal(translate('Nuestro catálogo', 'es'), 'Nuestro catálogo');
  assert.equal(translate('• Producto: {name}', 'en', { name: 'Mug' }), '• Product: Mug');
});
test('El catálogo se traduce sin modificar datos originales y conserva búsqueda bilingüe', () => {
  const source = { negocio: { nombre: 'Bazar Nazareth' }, productos: [{ id: 1, nombre: 'Llaveros personalizados', descripcion: 'Texto nuevo sin traducción' }] };
  const localized = localizeCatalog(source, 'en');
  assert.equal(localized.productos[0].nombre, 'Personalized keychains');
  assert.equal(source.productos[0].nombre, 'Llaveros personalizados');
  assert.equal(localized.productos[0].descripcion, 'Texto nuevo sin traducción');
  assert.equal(localizeCatalog(source, 'es'), source);
  assert.equal(filterCatalog(localized, { search: 'keychains' }).length, 1);
  assert.equal(filterCatalog(localized, { search: 'llaveros' }).length, 1);
});
test('El enlace de regreso conserva el idioma y los filtros', () => {
  const url = new URL(catalogReturnUrl({ category: '1', search: 'gift', promotionId: '2', language: 'en' }), 'https://bazar.example');
  assert.equal(url.searchParams.get('lang'), 'en');
  assert.equal(url.searchParams.get('promocion'), '2');
  assert.equal(url.hash, '#productos');
});
