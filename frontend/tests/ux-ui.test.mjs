import test from 'node:test';
import assert from 'node:assert/strict';
import { api } from '../src/shared/api.js';
import {
  filterCatalog,
  catalogReturnUrl,
  readCatalogFilters,
} from '../src/modules/productos/catalogFilters.js';
import { contentErrors } from '../src/shared/contentValidation.js';
import { fieldsets } from '../src/app/adminConfig.js';

const data = {
  categorias: [{ id: 1, activa: true }],
  productos: [
    { id: 1, categoriaId: 1, nombre: 'Personalización de taza' },
    { id: 2, categoriaId: 1, nombre: 'Llavero' },
  ],
  promocionProductos: [{ promocionId: 7, productoId: 1 }],
};
test('La búsqueda tolera espacios, tildes y mayúsculas', () => {
  assert.deepEqual(
    filterCatalog(data, {
      category: '',
      search: ' PERSONALIZACION   TAZA ',
    }).map((p) => p.id),
    [1],
  );
});
test('La temática no limita los productos del catálogo, con o sin vínculos', () => {
  for (const promotionId of ['7', '8', '']) {
    assert.deepEqual(
      filterCatalog(data, { promotionId }).map((p) => p.id),
      [1, 2],
    );
    assert.deepEqual(
      filterCatalog(data, { promotionId, search: 'llavero' }).map((p) => p.id),
      [2],
    );
  }
});
test('El contexto del catálogo sobrevive al enlace de regreso', () => {
  const filters = { category: '1', search: 'Taza & detalle', promotionId: '7' };
  const url = new URL(catalogReturnUrl(filters), 'https://bazar.example');
  assert.deepEqual(readCatalogFilters(url.search), filters);
  assert.equal(url.hash, '#productos');
});
test('Se puede guardar un borrador incompleto y se orienta la publicación', () => {
  const draft = {
    categoriaId: 1,
    nombre: '',
    descripcion: '',
    orden: 0,
    estado: 'Borrador',
    precioInformativo: null,
  };
  assert.deepEqual(
    contentErrors('productos', draft, [], data, fieldsets.productos),
    {},
  );
  const errors = contentErrors(
    'productos',
    { ...draft, estado: 'Publicado' },
    [],
    data,
    fieldsets.productos,
  );
  assert.deepEqual(Object.keys(errors).sort(), [
    'descripcion',
    'nombre',
    'productoImagenes',
  ]);
});
test('Moneda, categoría activa y fechas se validan sin cambiar datos', () => {
  const product = {
    categoriaId: 1,
    nombre: 'Taza',
    descripcion: 'Detalle',
    orden: 0,
    estado: 'Publicado',
    precioInformativo: 1000,
    moneda: '',
  };
  assert.ok(
    contentErrors('productos', product, [1], data, fieldsets.productos).moneda,
  );
  assert.ok(
    contentErrors(
      'productos',
      product,
      [1],
      { ...data, categorias: [{ id: 1, activa: false }] },
      fieldsets.productos,
    ).categoriaId,
  );
  const promotion = {
    estado: 'Borrador',
    orden: 0,
    inicio: '2026-11-03T00:00:00Z',
    fin: '2026-11-02T00:00:00Z',
  };
  assert.ok(
    contentErrors('promociones', promotion, [], data, fieldsets.promociones)
      .fin,
  );
});
test('El acceso distingue credenciales, servicio caído y conexión', async () => {
  const originalFetch = globalThis.fetch;
  try {
    for (const [status, expected] of [
      [401, /Correo o contraseña/],
      [500, /servicio de acceso/],
      [429, /Demasiados intentos/],
    ]) {
      globalThis.fetch = async () => new Response('', { status });
      await assert.rejects(api('/login', { method: 'POST' }), expected);
    }
    globalThis.fetch = async () => {
      throw new TypeError('offline');
    };
    await assert.rejects(
      api('/login', { method: 'POST' }),
      /No se pudo conectar/,
    );
    globalThis.fetch = async () => new Response('', { status: 401 });
    await assert.rejects(api('/admin/productos'), /Su sesión terminó/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
