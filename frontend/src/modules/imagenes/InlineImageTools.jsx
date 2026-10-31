import React from 'react';
import Img from '../../shared/Img.jsx';
export default function InlineImageTools({
  permitted,
  uploadInlineImage,
  inlineUpload,
  setInlineUpload,
  busy,
  active,
  relationIds,
  draft,
  imgAlt,
}) {
  return (
    <div className="inline-image-tools">
      <h3>Imagen de este contenido</h3>
      <p className="hint">
        Puede elegir una fotografía de la biblioteca o cargar otra. Al cargarla
        se crea un archivo nuevo y solo se cambia la referencia de este
        contenido.
      </p>
      {permitted('imagenes') ? (
        <form className="inline-image-form" onSubmit={uploadInlineImage}>
          <label className="field">
            Archivo JPG, PNG o WebP (máximo 5 MB)
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              required
              onChange={(e) =>
                setInlineUpload({
                  ...inlineUpload,
                  file: e.target.files?.[0] || null,
                })
              }
            />
          </label>
          <label className="field">
            Texto alternativo
            <input
              required
              maxLength="250"
              value={inlineUpload.alt}
              onChange={(e) =>
                setInlineUpload({
                  ...inlineUpload,
                  alt: e.target.value,
                })
              }
              placeholder="Describa la imagen"
            />
          </label>
          <button
            className="button"
            type="submit"
            disabled={busy || !inlineUpload.file || !inlineUpload.alt.trim()}
          >
            Subir y asignar imagen
          </button>
        </form>
      ) : (
        <p className="hint">
          Su cuenta no tiene permiso para cargar imágenes. Solicite el permiso
          «Imágenes» o use una imagen ya cargada.
        </p>
      )}
      {(active === 'productos' ? relationIds[0] : draft.imagenId) && (
        <div className="inline-image-preview">
          <span>Vista previa de la imagen asignada</span>
          <Img
            id={active === 'productos' ? relationIds[0] : draft.imagenId}
            alt={imgAlt(
              active === 'productos' ? relationIds[0] : draft.imagenId,
            )}
          />
        </div>
      )}
    </div>
  );
}
