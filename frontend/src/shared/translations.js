import english from '../../../localization/en.json' with { type: 'json' };

export function translate(text, language = 'es', parameters = {}) {
  if (typeof text !== 'string') return text;
  const key = text.replace(/\s+/g, ' ').trim();
  const translated =
    language === 'en' ? (english[text] ?? english[key] ?? text) : text;
  return translated.replace(/\{(\w+)\}/g, (match, name) =>
    Object.hasOwn(parameters, name) ? String(parameters[name]) : match,
  );
}

export function localizeCatalog(data, language) {
  if (language !== 'en') return data;
  const localize = (item) =>
    Object.fromEntries(
      Object.entries(item).map(([key, value]) => [
        key,
        [
          'nombre',
          'descripcion',
          'titulo',
          'cuerpo',
          'condiciones',
          'alcance',
          'textoAlternativo',
          'direccion',
          'horario',
        ].includes(key)
          ? translate(value, language)
          : value,
      ]),
    );
  const result = { ...data, negocio: localize(data.negocio) };
  for (const name of [
    'productos',
    'categorias',
    'servicios',
    'promociones',
    'secciones',
    'galeria',
    'imagenes',
  ])
    result[name] = (data[name] || []).map(localize);
  result.productos = result.productos.map((product, index) => ({
    ...product,
    searchNames: data.productos[index].nombre + ' ' + product.nombre,
  }));
  return result;
}
