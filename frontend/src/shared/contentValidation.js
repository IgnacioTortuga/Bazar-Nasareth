export function requiredFields(section, draft) {
  const fields = ['orden', 'estado'];
  if (section === 'productos') fields.push('categoriaId');
  if (section === 'galeria') fields.push('imagenId');
  if (section === 'portada' || section === 'textos') fields.push('clave');
  if (draft.estado === 'Publicado') {
    fields.push(
      ...({
        productos: ['nombre', 'descripcion'],
        servicios: ['nombre', 'descripcion', 'alcance'],
        promociones: [
          'titulo',
          'descripcion',
          'condiciones',
          'imagenId',
          'inicio',
          'fin',
        ],
        portada: ['titulo', 'cuerpo'],
        textos: ['titulo', 'cuerpo'],
      }[section] || []),
    );
  }
  if ((draft.precioInformativo ?? draft.precioDesde) != null)
    fields.push('moneda');
  return fields;
}

export function contentErrors(section, draft, imageIds, data, fields) {
  const errors = {};
  const labels = Object.fromEntries(
    fields.map(([name, label]) => [name, label]),
  );
  for (const name of requiredFields(section, draft)) {
    if (
      draft[name] == null ||
      String(draft[name]).trim() === '' ||
      (['categoriaId', 'imagenId'].includes(name) && !draft[name])
    )
      errors[name] = `${labels[name] || name}: complete este campo.`;
  }
  if (!['Borrador', 'Publicado', 'Archivado'].includes(draft.estado))
    errors.estado = 'Seleccione un estado válido.';
  if (!Number.isInteger(Number(draft.orden)) || Number(draft.orden) < 0)
    errors.orden = 'Orden: use un número entero de cero o mayor.';
  if (section === 'productos') {
    const category = data.categorias?.find(
      (item) => item.id === draft.categoriaId,
    );
    if (!category || (draft.estado === 'Publicado' && !category.activa))
      errors.categoriaId =
        'Seleccione una categoría existente y activa para publicar.';
    if (draft.estado === 'Publicado' && !imageIds.length)
      errors.productoImagenes =
        'Seleccione al menos una fotografía para publicar.';
  }
  for (const name of ['precioInformativo', 'precioDesde']) {
    if (
      draft[name] != null &&
      (!Number.isFinite(Number(draft[name])) || Number(draft[name]) < 0)
    )
      errors[name] = `${labels[name]}: use un precio de cero o mayor.`;
  }
  if (
    draft.inicio &&
    draft.fin &&
    new Date(draft.fin) <= new Date(draft.inicio)
  )
    errors.fin = 'La finalización debe ser posterior al inicio.';
  return errors;
}

export function browserErrors(form) {
  return Object.fromEntries(
    Array.from(form.elements)
      .filter(
        (field) => field.id && field.willValidate && !field.validity.valid,
      )
      .map((field) => [field.id, field.validationMessage]),
  );
}
