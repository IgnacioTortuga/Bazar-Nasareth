import test from 'node:test';
import assert from 'node:assert/strict';
import { galleryItems, isGiftComplement } from '../src/modules/galeria/galleryItems.js';

test('La galería muestra una sola referencia por foto sin modificar los registros', () => {
  const items = [{ id: 1, imagenId: 41, titulo: 'Taza' }, { id: 2, imagenId: 41, titulo: 'Taza' }, { id: 3, imagenId: 42, titulo: 'Taza' }];
  assert.deepEqual(galleryItems(items, {}).map(x => x.id), [1, 3]);
  assert.equal(items.length, 3);
});
test('La galería busca por título y descripción, tolera tildes y conserva fotos diferentes', () => {
  const items = [{ id: 1, imagenId: 41, titulo: 'Recuerdo' }, { id: 2, imagenId: 42, titulo: 'Recuerdo' }];
  assert.deepEqual(galleryItems(items, { 41: 'Tazón floral' }, 'tazon').map(x => x.id), [1]);
  assert.equal(galleryItems(items, {}, 'recuerdo').length, 2);
  assert.equal(galleryItems(items, {}, 'inexistente').length, 0);
});

test('Solo los dulces se presentan como complemento, no todas las cajas personalizadas', () => {
  assert.equal(isGiftComplement({ titulo: 'Dulces para regalos', imagenId: 1 }, {}), true);
  assert.equal(isGiftComplement({ titulo: 'Caja personalizada', imagenId: 2 }, { 2: 'Confites surtidos' }), true);
  assert.equal(isGiftComplement({ titulo: 'Cajita de regalo', imagenId: 3 }, { 3: 'Taza personalizada' }), false);
});

test('Los números visibles no dejan huecos y una búsqueda conserva la numeración de la galería', () => {
  const items = [{id: 8, imagenId: 2, titulo: 'Taza'}, {id: 23, imagenId: 5, titulo: 'Bolsa'}];
  assert.deepEqual(galleryItems(items, {}).map(x => x.displayNumber), [1, 2]);
  assert.equal(galleryItems(items, {}, 'Bolsa')[0].displayNumber, 2);
  assert.equal(items[1].id, 23);
});
