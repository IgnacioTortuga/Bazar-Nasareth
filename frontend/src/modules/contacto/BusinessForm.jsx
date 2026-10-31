import React from 'react';
import Field from '../../shared/Field.jsx';
import { contactoConfig } from './config.js';

export default function BusinessForm({
  saveBusiness,
  draft,
  data,
  setDraft,
  busy,
}) {
  return (
    <form className="form-panel" onSubmit={saveBusiness}>
      <p>
        Estos datos se comparten entre la sección de contacto y el pie de
        página.
      </p>
      {contactoConfig.fields.negocio.map(([name, label, kind]) => (
        <Field
          key={name}
          name={name}
          label={label}
          kind={kind}
          value={(draft || data.negocio)?.[name]}
          onChange={(n, v) => setDraft({ ...(draft || data.negocio), [n]: v })}
          data={data}
        />
      ))}
      <button className="button primary" disabled={busy}>
        Guardar contacto
      </button>
    </form>
  );
}
