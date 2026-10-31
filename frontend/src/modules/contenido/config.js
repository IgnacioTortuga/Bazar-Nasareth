export const contenidoConfig = {
  fields: {
    secciones: [
      ['clave', 'Clave única (portada, presentación, preguntas...)', 'text'],
      ['titulo', 'Título', 'text'],
      ['cuerpo', 'Descripción visible', 'textarea'],
      ['imagenId', 'Fotografía', 'image'],
      ['orden', 'Orden', 'number'],
      ['estado', 'Estado', 'status'],
    ],
  },
  defaults: {
    secciones: {
      clave: '',
      titulo: '',
      cuerpo: '',
      imagenId: null,
      orden: 0,
      estado: 'Borrador',
    },
  },
};
