import { productosConfig } from '../modules/productos/config.js';
import { serviciosConfig } from '../modules/servicios/config.js';
import { promocionesConfig } from '../modules/promociones/config.js';
import { galeriaConfig } from '../modules/galeria/config.js';
import { contenidoConfig } from '../modules/contenido/config.js';
import { contactoConfig } from '../modules/contacto/config.js';
const sections = [
  'portada',
  'productos',
  'servicios',
  'imagenes',
  'promociones',
  'galeria',
  'textos',
  'contacto',
  'usuarios',
];
const labels = {
  portada: 'Portada',
  productos: 'Productos',
  servicios: 'Servicios',
  imagenes: 'Imágenes',
  promociones: 'Promociones',
  galeria: 'Galería',
  textos: 'Información adicional',
  contacto: 'Contacto',
  usuarios: 'Administradores',
};
const collection = {
  portada: 'secciones',
  textos: 'secciones',
  productos: 'productos',
  servicios: 'servicios',
  promociones: 'promociones',
  galeria: 'galeria',
};
const configs = [
  productosConfig,
  serviciosConfig,
  promocionesConfig,
  galeriaConfig,
  contenidoConfig,
  contactoConfig,
];
const fieldsets = Object.assign({}, ...configs.map((config) => config.fields));
const defaults = Object.assign({}, ...configs.map((config) => config.defaults));
export { sections, labels, collection, fieldsets, defaults };
