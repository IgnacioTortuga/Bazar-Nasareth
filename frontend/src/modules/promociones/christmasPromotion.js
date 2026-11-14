import { promotionTimingLabel } from '../../shared/format.js';

export function isChristmasPromotion(promotion) {
  return /\b(?:navidad|navideñ[oa]s?|christmas)\b/iu.test(promotion.titulo);
}

export function isActiveChristmasPromotion(promotion, now = Date.now()) {
  return (
    promotion.estado === 'Publicado' &&
    isChristmasPromotion(promotion) &&
    promotionTimingLabel(promotion, now) === 'Vigente'
  );
}
