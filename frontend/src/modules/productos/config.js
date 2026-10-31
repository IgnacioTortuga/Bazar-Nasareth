export const productosConfig = {
  fields: {
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
  },
  defaults: {
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
  },
};
