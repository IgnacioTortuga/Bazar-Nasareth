import Modal from '../../shared/Modal.jsx';
import React, { useState } from 'react';
import EditorHelp from '../../shared/EditorHelp.jsx';
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
  const [action, setAction] = useState(null);
  const [description, setDescription] = useState('');
  const [actionError, setActionError] = useState('');
  const [filter, setFilter] = useState('todas');
  const allImages = data.imagenes || [];
  const unused = allImages.filter((img) => !imageUsages(img.id).length).length;
  const visibleImages = allImages.filter((img) => filter === 'todas' || (filter === 'libres' ? !imageUsages(img.id).length : imageUsages(img.id).length));
  return (
    <>
      {action && <Modal className="editor-action-dialog" label={action.kind === 'delete' ? 'Eliminar fotografía' : 'Editar descripción'} onClose={() => { if (!busy) setAction(null); }}>
        <form onSubmit={async (event) => {
          event.preventDefault();
          if (busy) return;
          setActionError('');
          const success = action.kind === 'delete' ? await removeImage(action.img.id) : await saveAlt(action.img.id, description);
          if (success) setAction(null);
          else setActionError(action.kind === 'delete' ? 'No se pudo eliminar. Revise su conexión; la foto puede seguir vinculada a un contenido.' : 'No se pudo guardar la descripción. Revise su conexión e intente de nuevo.');
        }} aria-busy={busy}>
          <span className="eyebrow">BIBLIOTECA DE FOTOS</span>
          <h2>{action.kind === 'delete' ? '¿Eliminar esta fotografía?' : 'Describa su fotografía'}</h2>
          <p className="editor-dialog-filename">{action.img.nombre}</p>
          {action.kind === 'delete' ? <p>Se eliminará de la biblioteca. Esta acción no se puede deshacer.</p> : <label className="field">Descripción breve<input autoFocus required maxLength="250" value={description} disabled={busy} onChange={(event) => setDescription(event.target.value)} /><small>Ayuda a identificar la foto y permite que un lector de pantalla la describa.</small></label>}
          {actionError && <p role="alert">{actionError}</p>}
          <div className="row"><button type="button" autoFocus={action.kind === 'delete'} disabled={busy} onClick={() => setAction(null)}>Cancelar</button><button className="button primary" disabled={busy || (action.kind === 'description' && !description.trim())}>{busy ? 'Procesando…' : action.kind === 'delete' ? 'Sí, eliminar foto' : 'Guardar descripción'}</button></div>
        </form>
      </Modal>}
      <div className="editor-overview">
        <div><strong>{allImages.length}</strong><span>Fotografías en biblioteca</span></div>
        <div><strong>{allImages.length - unused}</strong><span>Asignadas a contenido</span></div>
        <div><strong>{unused}</strong><span>Sin asignar · se pueden eliminar</span></div>
      </div>
      <EditorHelp title="¿Cómo cambio o elimino una foto?">
        <p><b>Cambiar:</b> use Reemplazar junto al contenido que quiere actualizar.</p>
        <p><b>Eliminar:</b> primero quite o cambie la foto en todos los lugares donde se usa. Archivar el contenido conserva su vínculo.</p>
        <p><b>Subir:</b> guarda una foto en la biblioteca; después debe elegirla en el contenido.</p>
      </EditorHelp>
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
            Descripción de la foto
            <input
              placeholder="Ej.: taza blanca con nombre en dorado"
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
      </div>
      <div className="editor-filter-tabs" role="group" aria-label="Filtrar fotografías">
        {[['todas', 'Todas'], ['usadas', 'En uso'], ['libres', 'Sin asignar']].map(([value, label]) => <button type="button" key={value} aria-pressed={filter === value} onClick={() => setFilter(value)} disabled={busy}>{label}</button>)}
      </div>
      <PaginatedList
        key={filter}
        label="imágenes"
        searchTerms={visibleImages.map((img) =>
          [
            img.nombre,
            img.textoAlternativo,
            ...imageUsages(img.id).map(
              (usage) => usage.title + ' ' + usage.section,
            ),
          ].join(' '),
        )}
        className="grid image-library"
        total={visibleImages.length}
        disabled={busy}
      >
        {visibleImages.map((img) => {
          const usages = imageUsages(img.id);
          return (
            <article className="card image-library-card" key={img.id}>
              <Img id={img.id} alt={img.textoAlternativo} />
              <div className="card-body">
                <span className={`image-use-badge ${usages.length ? 'in-use' : 'available'}`}>{usages.length ? `En uso · ${usages.length} ${usages.length === 1 ? 'lugar' : 'lugares'}` : 'Sin asignar'}</span>
                <b>{img.nombre}</b>
                <p>{img.textoAlternativo}</p>
                <small>{(img.tamanoBytes / 1024 / 1024).toFixed(2)} MB</small>
                {usages.map((usage) => (
                  <div className="image-usage" key={`${usage.kind}-${usage.id}`}>
                    <small>{usage.section}</small>
                    <b>{usage.title}</b>
                    <label className="button image-replace-button">
                      Reemplazar foto
                      <input
                        type="file"
                        aria-label={`Reemplazar foto de ${usage.title} en ${usage.section}`}
                        accept="image/jpeg,image/png,image/webp"
                        disabled={busy || !permitted(usage.permission)}
                        onChange={(e) => {
                          replaceImage(img, usage, e.target.files?.[0]);
                          e.target.value = '';
                        }}
                      />
                    </label>
                  </div>
                ))}
                <div className="row image-card-actions">
                  <button className="button" type="button" disabled={busy} onClick={() => { setDescription(img.textoAlternativo || ''); setActionError(''); setAction({ kind: 'description', img }); }}>
                    Editar descripción
                  </button>
                  <a className="button" href={imageUrl(img.id)} target="_blank" rel="noopener noreferrer">Ver foto ↗</a>
                  <button
                    className="button image-delete"
                    type="button"
                    aria-label={`Eliminar fotografía ${img.nombre}`}
                    title={usages.length ? 'Foto en uso' : 'Eliminar fotografía'}
                    disabled={busy || usages.length > 0}
                    onClick={() => { setActionError(''); setAction({ kind: 'delete', img }); }}
                  >
                    <span aria-hidden="true">×</span>
                  </button>
                </div>
                {usages.length > 0 && <EditorHelp title="¿Por qué no puedo eliminarla?">
                  <p>Cambie o quite la foto de cada contenido indicado arriba para poder eliminarla.</p>
                </EditorHelp>}
              </div>
            </article>
          );
        })}
      </PaginatedList>
      {!visibleImages.length && <p className="empty">No hay fotografías en este grupo. Puede subir una nueva o elegir otro filtro.</p>}
      <p className="hint">
        Reemplazar sube la nueva foto y actualiza solo el contenido elegido. Si
        la foto se usa en más de un lugar, cada uso tiene su propio botón.
      </p>
    </>
  );
}
