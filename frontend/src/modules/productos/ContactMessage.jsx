import React, { useState } from 'react';
import { formattedPrice } from '../../shared/format.js';

export default function ContactMessage({
  product,
  negocio,
  medir = false,
  campaign = '',
}) {
  const [cantidad, setCantidad] = useState(1),
    [nombre, setNombre] = useState(''),
    [nota, setNota] = useState('');
  const num = (negocio.telefono || '').replace(/\D/g, '');
  const price =
    product.precioInformativo == null
      ? null
      : Number(product.precioInformativo) * cantidad;
  const message = [
    'Hola, me interesa cotizar este producto:',
    `• Producto: ${product.nombre}`,
    campaign ? `• Temática: ${campaign}` : null,
    `• Cantidad: ${cantidad} ${cantidad === 1 ? 'unidad' : 'unidades'}`,
    product.precioInformativo != null
      ? `• Precio de referencia: ${formattedPrice(product.precioInformativo, product.moneda)} por unidad`
      : null,
    price != null
      ? `• Total estimado: ${formattedPrice(price, product.moneda)}`
      : null,
    nombre.trim() ? `• Nombre: ${nombre.trim()}` : null,
    nota.trim() ? `• Detalles: ${nota.trim()}` : null,
    '',
    '¿Podrían confirmarme disponibilidad, plazo de entrega y precio final?',
  ]
    .filter(Boolean)
    .join('\n');
  return (
    <div className="contact-request">
      <label>
        Cantidad aproximada{' '}
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
        Nombre (opcional){' '}
        <input
          value={nombre}
          maxLength="80"
          onChange={(e) => setNombre(e.target.value)}
        />
      </label>
      <label>
        Nota (opcional){' '}
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
          const origin = campaign ? 'halloween' : 'catalogo';
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
        Consultar por WhatsApp
      </a>
    </div>
  );
}
