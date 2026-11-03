import { useLanguage } from '../../shared/Language.jsx';
import React, { useState } from 'react';
import { formattedPrice } from '../../shared/format.js';

export default function ContactMessage({
  product,
  negocio,
  medir = false,
  campaign = '',
}) {
  const { t, language } = useLanguage();

  const [cantidad, setCantidad] = useState(1),
    [nombre, setNombre] = useState(''),
    [nota, setNota] = useState('');
  const num = (negocio.telefono || '').replace(/\D/g, '');
  const price =
    product.precioInformativo == null
      ? null
      : Number(product.precioInformativo) * cantidad;
  const message = [
    t('Hola, me interesa cotizar este producto:'),
    t('• Producto: {name}', { name: product.nombre }),
    new URL(`/producto/${product.id}${language === 'en' ? '?lang=en' : ''}`, window.location.origin).href,
    campaign ? t('• Temática: {theme}', { theme: campaign }) : null,
    t('• Cantidad: {quantity} {unit}', {
      quantity: cantidad,
      unit: t(cantidad === 1 ? 'unidad' : 'unidades'),
    }),
    product.precioInformativo != null
      ? t('• Precio de referencia: {price} por unidad', {
          price: formattedPrice(
            product.precioInformativo,
            product.moneda,
            language,
          ),
        })
      : null,
    price != null
      ? t('• Total estimado: {price}', {
          price: formattedPrice(price, product.moneda, language),
        })
      : null,
    nombre.trim() ? t('• Nombre: {name}', { name: nombre.trim() }) : null,
    nota.trim() ? t('• Detalles: {note}', { note: nota.trim() }) : null,
    t('¿Podrían confirmarme disponibilidad, plazo de entrega y precio final?'),
  ]
    .filter(Boolean)
    .join('\n');
  return (
    <div className="contact-request">
      <label>
        {' '}
        {t('Cantidad aproximada')}{' '}
        <input
          type="number"
          min="1"
          max="999"
          value={cantidad}
          onChange={(e) =>
            setCantidad(Math.max(1, Math.min(999, Number(e.target.value) || 1)))
          }
        />
      </label>
      <label>
        {' '}
        {t('Nombre (opcional)')}{' '}
        <input
          value={nombre}
          maxLength="80"
          onChange={(e) => setNombre(e.target.value)}
        />
      </label>
      <label>
        {' '}
        {t('Nota (opcional)')}{' '}
        <input
          value={nota}
          maxLength="500"
          onChange={(e) => setNota(e.target.value)}
        />
      </label>
      <a
        className="button primary"
        href={`https://wa.me/${num}?text=${encodeURIComponent(message)}`}
        onClick={() => {
          const origin = /halloween/i.test(campaign) ? 'halloween' : 'catalogo';
          if (medir)
            fetch(
              `/api/productos/${product.id}/clic-whatsapp?origen=${origin}`,
              {
                method: 'POST',
                credentials: 'same-origin',
                keepalive: true,
              },
            ).catch(() => {});
        }}
        target="_blank"
        rel="noopener noreferrer"
      >
        {' '}
        {t('Consultar por WhatsApp')}{' '}
      </a>
    </div>
  );
}
