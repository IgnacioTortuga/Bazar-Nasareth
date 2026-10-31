export const serviciosConfig = {
  fields: {
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
  },
  defaults: {
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
  },
};
