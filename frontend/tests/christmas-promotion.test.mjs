import test from 'node:test';
import assert from 'node:assert/strict';
import { isActiveChristmasPromotion } from '../src/modules/promociones/christmasPromotion.js';

const christmas = {
  titulo: 'La magia de Navidad está por llegar',
  estado: 'Publicado',
  inicio: '2026-11-15T00:00:00-06:00',
  fin: '2027-01-07T00:00:00-06:00',
};
const start = Date.parse(christmas.inicio);
const end = Date.parse(christmas.fin);

test('La nieve se activa desde el inicio y cesa al vencer la promoción', () => {
  assert.equal(isActiveChristmasPromotion(christmas, start - 1), false);
  assert.equal(isActiveChristmasPromotion(christmas, start), true);
  assert.equal(isActiveChristmasPromotion(christmas, end - 1), true);
  assert.equal(isActiveChristmasPromotion(christmas, end), false);
});

test('La nieve requiere una promoción publicada, navideña y con fechas válidas', () => {
  for (const estado of ['Borrador', 'Archivado']) {
    assert.equal(isActiveChristmasPromotion({ ...christmas, estado }, start), false);
  }
  for (const titulo of ['Especial navideño', 'Ofertas NAVIDEÑAS', 'Christmas sale']) {
    assert.equal(isActiveChristmasPromotion({ ...christmas, titulo }, start), true);
  }
  assert.equal(isActiveChristmasPromotion({ ...christmas, titulo: 'Halloween' }, start), false);
  assert.equal(isActiveChristmasPromotion({ ...christmas, fin: null }, start), false);
});
