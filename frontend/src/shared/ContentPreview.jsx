import React from 'react';
import Img from './Img.jsx';
import { formattedPrice } from './format.js';
import Modal from './Modal.jsx';
export default function ContentPreview({
  closePreview,
  active,
  relationIds,
  draft,
  imgAlt,
}) {
  return (
    <Modal
      className="editor-layout modal-backdrop"
      onClose={closePreview}
      label="Vista previa"
    >
      <div className="preview-modal">
        <div className="row spread">
          <h2>Vista previa · {draft.estado}</h2>
          <button type="button" autoFocus onClick={closePreview}>
            Cerrar ×
          </button>
        </div>
        <div className="preview-card">
          <Img
            id={active === 'productos' ? relationIds[0] : draft.imagenId}
            alt={imgAlt(
              active === 'productos' ? relationIds[0] : draft.imagenId,
            )}
          />
          <h3>{draft.nombre || draft.titulo || draft.clave}</h3>
          <p>{draft.descripcion || draft.cuerpo}</p>
          {draft.condiciones && (
            <p>
              <b>Condiciones:</b> {draft.condiciones}
            </p>
          )}
          {active === 'productos' && (
            <strong>
              {formattedPrice(draft.precioInformativo, draft.moneda)}
            </strong>
          )}
        </div>
        <p>Esta vista no publica ni guarda cambios.</p>
        <button className="button primary" onClick={closePreview}>
          Volver a editar
        </button>
      </div>
    </Modal>
  );
}
