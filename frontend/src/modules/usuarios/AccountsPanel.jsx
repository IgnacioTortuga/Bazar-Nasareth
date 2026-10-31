import React from 'react';
import { sections, labels } from '../../app/adminConfig.js';
import PaginatedList from '../../shared/PaginatedList.jsx';

export default function AccountsPanel({
  data,
  editorForm,
  setEditorForm,
  saveEditor,
  busy,
}) {
  return (
    <>
      <PaginatedList
        key="usuarios"
        label="administradores"
        searchTerms={(data.editores || []).map((item) =>
          [
            item.nombre,
            item.email,
            item.permisos,
            item.completo ? 'Acceso completo' : '',
            item.activo ? 'Activo' : 'Inactivo',
          ].join(' '),
        )}
        className="list-panel"
        total={data.editores?.length || 0}
        disabled={busy}
      >
        {(data.editores || []).map((x) => (
          <button
            className="list-item"
            key={x.id}
            onClick={() =>
              setEditorForm({
                ...x,
                password: '',
                permisos: x.permisos ? x.permisos.split(',') : [],
              })
            }
          >
            {x.nombre} · {x.email}{' '}
            <small>
              {x.completo ? 'Acceso completo' : x.permisos || 'Sin permisos'} ·{' '}
              {x.activo ? 'Activo' : 'Inactivo'}
            </small>
          </button>
        ))}
      </PaginatedList>
      <form className="form-panel" onSubmit={saveEditor}>
        <h2>{editorForm.id ? 'Editar cuenta' : 'Nueva cuenta'}</h2>
        <label className="field">
          Nombre
          <input
            required
            value={editorForm.nombre}
            onChange={(e) =>
              setEditorForm({ ...editorForm, nombre: e.target.value })
            }
          />
        </label>
        <label className="field">
          Correo
          <input
            type="email"
            required
            value={editorForm.email}
            onChange={(e) =>
              setEditorForm({ ...editorForm, email: e.target.value })
            }
          />
        </label>
        <label className="field">
          Contraseña{' '}
          {editorForm.id
            ? '(dejar vacía para conservar)'
            : '(mínimo 12 caracteres)'}
          <input
            type="password"
            minLength="12"
            required={!editorForm.id}
            value={editorForm.password}
            onChange={(e) =>
              setEditorForm({ ...editorForm, password: e.target.value })
            }
          />
        </label>
        <label className="checkbox-field">
          Acceso completo
          <input
            type="checkbox"
            checked={editorForm.completo}
            onChange={(e) =>
              setEditorForm({
                ...editorForm,
                completo: e.target.checked,
              })
            }
          />
        </label>
        <fieldset disabled={editorForm.completo}>
          <legend>Permisos personalizados</legend>
          <div className="permission-grid">
            {sections.map((p) => (
              <label key={p}>
                <input
                  type="checkbox"
                  checked={editorForm.permisos.includes(p)}
                  onChange={(e) =>
                    setEditorForm({
                      ...editorForm,
                      permisos: e.target.checked
                        ? [...editorForm.permisos, p]
                        : editorForm.permisos.filter((x) => x !== p),
                    })
                  }
                />
                {labels[p]}
              </label>
            ))}
          </div>
        </fieldset>
        {editorForm.id && (
          <label className="checkbox-field">
            Cuenta activa
            <input
              type="checkbox"
              checked={editorForm.activo}
              onChange={(e) =>
                setEditorForm({
                  ...editorForm,
                  activo: e.target.checked,
                })
              }
            />
          </label>
        )}
        <div className="row">
          <button className="button primary" disabled={busy}>
            Guardar cuenta
          </button>
          <button
            type="button"
            onClick={() =>
              setEditorForm({
                nombre: '',
                email: '',
                password: '',
                completo: false,
                permisos: [],
                activo: true,
              })
            }
          >
            Nueva cuenta
          </button>
        </div>
      </form>
    </>
  );
}
