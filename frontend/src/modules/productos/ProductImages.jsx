import React from 'react';

export default function ProductImages({
  relationIds,
  setRelationIds,
  setPreview,
  setReviewed,
  data,
}) {
  return (
    <label className="field image-picker" htmlFor="productoImagenes">
      Fotografías existentes{' '}
      <select
        id="productoImagenes"
        multiple
        size="5"
        value={relationIds.map(String)}
        onChange={(e) => {
          setRelationIds(
            [...e.target.selectedOptions].map((option) => Number(option.value)),
          );
          setPreview(false);
          setReviewed(false);
        }}
      >
        {(data.imagenes || []).map((image) => (
          <option key={image.id} value={image.id}>
            {image.nombre} · {image.textoAlternativo}
          </option>
        ))}
      </select>
      <small>
        Puede elegir varias. Cambiar la selección actualiza solo este producto
        al guardar.
      </small>
    </label>
  );
}
