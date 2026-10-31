import React, { useEffect, useState } from 'react';
import { matchesEditorSearch } from './search.js';

export default function PaginatedList({
  children,
  className,
  label,
  total,
  searchTerms = [],
  searchable = true,
  disabled = false,
}) {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const searchId = React.useId();
  const pageSize = 6;
  const entries = React.Children.toArray(children);
  const originalCount = total ?? entries.length;
  const filtering = searchable && !!query.trim();
  const filtered = originalCount
    ? entries.filter(
        (_, index) =>
          !filtering || matchesEditorSearch(searchTerms[index], query),
      )
    : [];
  const count = filtered.length;
  const pages = Math.max(1, Math.ceil(count / pageSize));
  const current = Math.min(page, pages);
  useEffect(() => {
    setPage((value) => Math.min(value, pages));
  }, [pages]);
  const first = Math.max(1, Math.min(current - 2, pages - 4));
  const numbers = Array.from(
    { length: Math.min(5, pages) },
    (_, index) => first + index,
  );
  const start = (current - 1) * pageSize;
  return (
    <div className="paginated-list">
      {searchable && (
        <div className="editor-search">
          <label htmlFor={searchId}>Buscar en {label}</label>
          <div className="editor-search-input">
            <input
              id={searchId}
              type="search"
              value={query}
              placeholder="Escriba para filtrar…"
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setPage(1);
                }}
              >
                Limpiar
              </button>
            )}
          </div>
        </div>
      )}
      <div className={className}>
        {count ? (
          filtered.slice(start, start + pageSize)
        ) : filtering ? (
          <p className="empty" role="status">
            No hay coincidencias para «{query}».
          </p>
        ) : (
          children
        )}
      </div>
      {count > 0 && (
        <nav
          className="editor-pagination"
          aria-label={'Paginación de ' + label}
        >
          <span role="status">
            {start + 1}–{Math.min(start + pageSize, count)} de {count}
            {filtering ? ' coincidencias de ' + originalCount : ''} · Página{' '}
            {current} de {pages}
          </span>
          {pages > 1 && (
            <div className="pagination-controls">
              <button
                type="button"
                disabled={disabled || current === 1}
                onClick={() => setPage(current - 1)}
              >
                Anterior
              </button>
              {numbers.map((number) => (
                <button
                  type="button"
                  key={number}
                  disabled={disabled}
                  aria-label={'Página ' + number}
                  aria-current={current === number ? 'page' : undefined}
                  onClick={() => setPage(number)}
                >
                  {number}
                </button>
              ))}
              <button
                type="button"
                disabled={disabled || current === pages}
                onClick={() => setPage(current + 1)}
              >
                Siguiente
              </button>
            </div>
          )}
        </nav>
      )}
    </div>
  );
}
