import { matchesEditorSearch } from '../../shared/search.js';

export function galleryItems(items, images, query = '') {
  const seen = new Set();
  return items.filter((item) => {
    if (seen.has(item.imagenId)) return false;
    seen.add(item.imagenId);
    return matchesEditorSearch(`${item.titulo || ''} ${images[item.imagenId] || ''}`, query);
  });
}
