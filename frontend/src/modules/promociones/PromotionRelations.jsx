import React from 'react';

export default function PromotionRelations({
  data,
  promoProducts,
  promoServices,
  setPromoProducts,
  setPromoServices,
  setPreview,
  setReviewed,
}) {
  return (
    <>
      <label className="field">
        Productos relacionados (opcional)
        <select
          multiple
          size="4"
          value={promoProducts.map(String)}
          onChange={(e) => {
            setPromoProducts(
              [...e.target.selectedOptions].map((o) => Number(o.value)),
            );
            setPreview(false);
            setReviewed(false);
          }}
        >
          {data.productos?.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        Servicios relacionados (opcional)
        <select
          multiple
          size="4"
          value={promoServices.map(String)}
          onChange={(e) => {
            setPromoServices(
              [...e.target.selectedOptions].map((o) => Number(o.value)),
            );
            setPreview(false);
            setReviewed(false);
          }}
        >
          {data.servicios?.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nombre}
            </option>
          ))}
        </select>
      </label>
    </>
  );
}
