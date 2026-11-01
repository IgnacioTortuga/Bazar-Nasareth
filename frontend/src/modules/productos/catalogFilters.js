import { matchesEditorSearch } from '../../shared/search.js';

export function readCatalogFilters(search = window.location.search) {
  const params = new URLSearchParams(search);
  return {
    category: params.get('categoria') || '',
    search: params.get('q') || '',
    promotionId: params.get('promocion') || '',
  };
}

export function catalogReturnUrl({ category, search, promotionId }) {
  const params = new URLSearchParams();
  if (category) params.set('categoria', category);
  if (search) params.set('q', search);
  if (promotionId) params.set('promocion', promotionId);
  return `/${params.size ? '?' + params : ''}#productos`;
}

export function filterCatalog(data, { category, search }) {
  return data.productos.filter(
    (product) =>
      (!category || product.categoriaId === Number(category)) &&
      matchesEditorSearch(product.nombre, search),
  );
}
