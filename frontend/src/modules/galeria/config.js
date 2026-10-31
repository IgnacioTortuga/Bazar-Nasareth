export const galeriaConfig = {
  fields: {
    galeria: [
      ['imagenId', 'Fotografía', 'image'],
      ['titulo', 'Título', 'text'],
      ['orden', 'Orden único', 'number'],
      ['estado', 'Estado', 'status'],
    ],
  },
  defaults: {
    galeria: { imagenId: 0, titulo: '', orden: 0, estado: 'Borrador' },
  },
};
