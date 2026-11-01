import React from 'react';
import Img from '../../shared/Img.jsx';
import { imageUrl } from '../../shared/images.js';
import PaginatedList from '../../shared/PaginatedList.jsx';

export default function ImageLibrary({
  data,
  uploadImage,
  upload,
  setUpload,
  busy,
  imageUsages,
  permitted,
  replaceImage,
  saveAlt,
  removeImage,
}) {
  return (
    <>
      <p className="image-library-intro">
        Para cambiar una sección, use <b>Reemplazar</b> en la fila que muestre
        su uso. <b>Cargar a la biblioteca</b> solo guarda una foto nueva; no la
        asigna automáticamente.
      </p>
      <div className="image-library-toolbar">
        <form className="image-upload-inline" onSubmit={uploadImage}>
          <h2>Añadir fotografía a la biblioteca</h2>
          <label className="field">
            JPG, PNG o WebP · hasta 5 MB
            <input
              type="file"
              disabled={busy}
              accept="image/jpeg,image/png,image/webp"
              required
              onChange={(e) =>
                setUpload({ ...upload, file: e.target.files[0] })
              }
            />
          </label>
          <label className="field">
            Texto alternativo
            <input
              required
              value={upload.alt}
              disabled={busy}
              onChange={(e) => setUpload({ ...upload, alt: e.target.value })}
            />
          </label>
          <button className="button" disabled={busy}>
            Cargar a la biblioteca
          </button>
        </form>
        <button
          className="button"
          onClick={() => {
            const first = data.imagenes?.[0];
            if (first)
              window.open(imageUrl(first.id), '_blank', 'noopener,noreferrer');
          }}
        >
          Vista previa
        </button>
      </div>
      <PaginatedList
        key="imagenes"
        label="imágenes"
        searchTerms={(data.imagenes || []).map((img) =>
          [
            img.nombre,
            img.textoAlternativo,
            ...imageUsages(img.id).map(
              (usage) => usage.title + ' ' + usage.section,
            ),
          ].join(' '),
        )}
        className="grid image-library"
        total={data.imagenes?.length || 0}
        disabled={busy}
      >
        {data.imagenes?.map((img) => {
          const usages = imageUsages(img.id);
          return (
            <article className="card image-library-card" key={img.id}>
              <Img id={img.id} alt={img.textoAlternativo} />
              <div className="card-body">
                <b>{img.nombre}</b>
                <p>{img.textoAlternativo}</p>
                <small>{(img.tamanoBytes / 1024 / 1024).toFixed(2)} MB</small>
                {usages.length ? (
                  usages.map((usage) => (
                    <div
                      className="image-usage"
                      key={`${usage.kind}-${usage.id}`}
                    >
                      <span>
                        <b>{usage.title}</b>
                        <small>Uso: {usage.section}</small>
                      </span>
                      <label className="button image-replace-button">
                        Reemplazar en {usage.section}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          disabled={busy || !permitted(usage.permission)}
                          onChange={(e) => {
                            replaceImage(img, usage, e.target.files?.[0]);
                            e.target.value = '';
                          }}
                        />
                      </label>
                    </div>
                  ))
                ) : (
                  <p className="image-unused">Sin contenido vinculado</p>
                )}
                <div className="row">
                  <button onClick={() => saveAlt(img.id, img.textoAlternativo)}>
                    Editar texto alternativo
                  </button>
                  <button onClick={() => removeImage(img.id)}>Eliminar</button>
                </div>
              </div>
            </article>
          );
        })}
      </PaginatedList>
      <p className="hint">
        Reemplazar sube la nueva foto y actualiza solo el contenido elegido. Si
        la foto se usa en más de un lugar, cada uso tiene su propio botón.
      </p>
    </>
  );
}
