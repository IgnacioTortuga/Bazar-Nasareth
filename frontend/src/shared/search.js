function normalizeEditorSearch(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es')
    .trim();
}

function matchesEditorSearch(text, query) {
  const normalized = normalizeEditorSearch(text);
  return normalizeEditorSearch(query)
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => normalized.includes(word));
}
export { normalizeEditorSearch, matchesEditorSearch };
