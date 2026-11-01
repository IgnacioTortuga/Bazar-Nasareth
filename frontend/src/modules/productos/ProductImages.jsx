import React from 'react';

export default function ProductImages({
  relationIds,
  setRelationIds,
  setPreview,
  setReviewed,
  data,
  error,
  disabled,
}) {
  return (
    <label className="field image-picker" htmlFor="productoImagenes">
      Fotografías existentes{' '}
      <select
        id="productoImagenes"
        form="content-editor-form"
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? 'productoImagenes-error' : undefined}
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
      {error && (
        <span id="productoImagenes-error" className="field-error">
          {error}
        </span>
      )}
      <small>
        Puede elegir varias. Cambiar la selección actualiza solo este producto
        al guardar.
      </small>
    </label>
  );
}
