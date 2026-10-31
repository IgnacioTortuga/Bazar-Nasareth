const toCostaRicaInput = (value) =>
  value
    ? new Date(value)
        .toLocaleString('sv-SE', {
          timeZone: 'America/Costa_Rica',
          hour12: false,
        })
        .slice(0, 16)
        .replace(' ', 'T')
    : '';
function formattedPrice(value, currency) {
  return value == null
    ? 'Consultar precio'
    : `${currency || 'CRC'} ${Number(value).toLocaleString('es-CR', { minimumFractionDigits: 2 })}`;
}
function promotionTimingLabel(promotion, now = Date.now()) {
  const start = promotion.inicio ? new Date(promotion.inicio).getTime() : NaN;
  const end = promotion.fin ? new Date(promotion.fin).getTime() : NaN;
  if (!Number.isFinite(start) || !Number.isFinite(end) || start >= end)
    return 'Sin vigencia válida';
  if (now < start) return 'Programada';
  if (now >= end) return 'Finalizada';
  return 'Vigente';
}
export { toCostaRicaInput, formattedPrice, promotionTimingLabel };
