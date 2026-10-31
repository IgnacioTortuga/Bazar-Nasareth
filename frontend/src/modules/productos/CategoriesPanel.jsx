import React from 'react';
import CategoryRow from './CategoryRow.jsx';
import PaginatedList from '../../shared/PaginatedList.jsx';
export default function CategoriesPanel({ data, reload, setMessage, busy }) {
  return (
    <div className="category-block">
      <h2>Categorías</h2>
      <PaginatedList
        key="categorias"
        label="categorías"
        searchTerms={(data.categorias || []).map((item) => item.nombre)}
        className="category-list"
        total={data.categorias?.length || 0}
        disabled={busy}
      >
        {(data.categorias || []).map((c) => (
          <CategoryRow
            key={c.id}
            category={c}
            refresh={reload}
            setMessage={setMessage}
          />
        ))}
      </PaginatedList>
      <CategoryRow category={null} refresh={reload} setMessage={setMessage} />
    </div>
  );
}
