export const promocionesConfig = {
  fields: {
    promociones: [
      ['titulo', 'Título', 'text'],
      ['descripcion', 'Descripción', 'textarea'],
      ['condiciones', 'Condiciones', 'textarea'],
      ['imagenId', 'Fotografía', 'image'],
      ['inicio', 'Fecha y hora de inicio (Costa Rica)', 'datetime'],
      ['fin', 'Fecha y hora de finalización (Costa Rica)', 'datetime'],
      ['orden', 'Orden', 'number'],
      ['estado', 'Estado', 'status'],
    ],
  },
  defaults: {
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
  },
};
