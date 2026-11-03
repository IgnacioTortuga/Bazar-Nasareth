import React from 'react';
import { toCostaRicaInput } from './format.js';

export default function Field({
  name,
  label,
  kind,
  value,
  onChange,
  data,
  disabled,
  error,
  required = false,
  form,
}) {
  const hint = kind === 'status' ? 'Borrador: solo el equipo lo ve. Publicado: visible en el sitio. Archivado: oculto, se puede recuperar.'
    : kind === 'image' ? 'Elija una foto de la biblioteca. Subir una foto no la asigna automáticamente.'
    : name === 'orden' ? 'Los números menores aparecen primero.'
    : name === 'clave' ? 'Nombre interno único. Sus clientes no lo verán.'
    : null;
  const common = {
    id: name,
    disabled,
    required,
    form,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': [hint && `${name}-hint`, error && `${name}-error`].filter(Boolean).join(' ') || undefined,
    onChange: (e) =>
      onChange(
        name,
        kind === 'checkbox'
          ? e.target.checked
          : kind === 'number'
            ? Number(e.target.value)
            : kind === 'decimal'
              ? e.target.value === ''
                ? null
                : Number(e.target.value)
              : kind === 'image' || kind === 'category'
                ? e.target.value
                  ? Number(e.target.value)
                  : null
                : kind === 'datetime'
                  ? e.target.value
                    ? new Date(e.target.value + ':00-06:00').toISOString()
                    : null
                  : e.target.value,
      ),
  };
  const imageOptions = data.imagenes || [];
  const options =
    kind === 'status'
      ? [
          ['Borrador', 'Borrador'],
          ['Publicado', 'Publicado'],
          ['Archivado', 'Archivado'],
        ]
      : kind === 'category'
        ? (data.categorias || []).map((c) => [c.id, c.nombre])
        : kind === 'image'
          ? imageOptions.map((i) => [i.id, `${i.id} · ${i.nombre}`])
          : [
              ['CRC', 'CRC'],
              ['USD', 'USD'],
            ];
  return (
    <label
      className={kind === 'checkbox' ? 'checkbox-field' : 'field'}
      htmlFor={name}
    >
      <span>
        {label}
        {required && <span className="required-label"> (obligatorio)</span>}
      </span>
      {kind === 'textarea' ? (
        <textarea {...common} rows="4" value={value ?? ''} />
      ) : ['status', 'category', 'image', 'currency'].includes(kind) ? (
        <select {...common} value={value ?? ''}>
          <option value="">
            {kind === 'image' || kind === 'currency'
              ? 'Sin seleccionar'
              : 'Seleccione...'}
          </option>
          {options.map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
      ) : (
        <input
          {...common}
          type={
            kind === 'decimal' || kind === 'number'
              ? 'number'
              : kind === 'datetime'
                ? 'datetime-local'
                : kind === 'checkbox'
                  ? kind
                  : kind
          }
          step={kind === 'decimal' ? '0.01' : undefined}
          min={kind === 'decimal' || kind === 'number' ? 0 : undefined}
          checked={kind === 'checkbox' ? !!value : undefined}
          value={
            kind === 'checkbox'
              ? undefined
              : kind === 'datetime'
                ? toCostaRicaInput(value)
                : (value ?? '')
          }
        />
      )}
      {hint && <small className="editor-field-hint" id={`${name}-hint`}>{hint}</small>}
      {error && (
        <span id={`${name}-error`} className="field-error">
          {error}
        </span>
      )}
    </label>
  );
}
