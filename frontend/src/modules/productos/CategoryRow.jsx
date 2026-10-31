import React, { useEffect, useState } from 'react';
import { api, json } from '../../shared/api.js';

export default function CategoryRow({ category, refresh, setMessage }) {
  const [value, setValue] = useState(
    category || { nombre: '', orden: 0, activa: true },
  );
  useEffect(
    () => setValue(category || { nombre: '', orden: 0, activa: true }),
    [category],
  );
  async function save(e) {
    e.preventDefault();
    try {
      await api('/admin/categorias' + (category ? '/' + category.id : ''), {
        method: category ? 'PUT' : 'POST',
        ...json(value),
      });
      await refresh();
      setMessage('Categoría guardada.');
      if (!category) setValue({ nombre: '', orden: 0, activa: true });
    } catch (e) {
      setMessage(e.message);
    }
  }
  return (
    <form className="category-row" onSubmit={save}>
      <input
        aria-label="Nombre de categoría"
        required
        placeholder="Nombre de categoría"
        value={value.nombre}
        onChange={(e) => setValue({ ...value, nombre: e.target.value })}
      />
      <input
        aria-label="Orden"
        type="number"
        min="0"
        value={value.orden}
        onChange={(e) => setValue({ ...value, orden: Number(e.target.value) })}
      />
      <label>
        <input
          type="checkbox"
          checked={value.activa}
          onChange={(e) => setValue({ ...value, activa: e.target.checked })}
        />{' '}
        Activa
      </label>
      <button>{category ? 'Guardar' : 'Añadir'}</button>
    </form>
  );
}
