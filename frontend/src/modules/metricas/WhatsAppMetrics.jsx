import React, { useState } from 'react';
import { api } from '../../shared/api.js';

export default function WhatsAppMetrics() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  async function load() {
    setLoading(true);
    setError('');
    try {
      setResult(await api('/admin/metricas/whatsapp'));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }
  const originLabels = {
    catalogo: 'Catálogo',
    detalle: 'Ficha para compartir',
    halloween: 'Temática de Halloween',
    galeria: 'Galería de ideas',
    anterior: 'Clics anteriores (sin origen)',
  };
  return (
    <section className="form-panel" aria-label="Interés por productos">
      <h2>Interés por WhatsApp</h2>
      <p>
        Clics en los últimos 30 días. El informe indica desde qué parte de la
        web se abrió WhatsApp; no confirma que se enviara un mensaje ni que
        hubiera una venta.
      </p>
      <button
        className="button"
        type="button"
        onClick={load}
        disabled={loading}
      >
        {loading ? 'Consultando…' : 'Consultar clics'}
      </button>
      {error && <p role="alert">{error}</p>}
      {result &&
        (!result.habilitada ? (
          <p>La medición está pendiente de activación.</p>
        ) : result.productos.length || result.galeria?.length ? (
          <div className="metrics-results">
            <h3>Por lugar del clic</h3>
            <ul>
              {(result.origenes || []).map((item) => (
                <li key={item.origen}>
                  <b>{originLabels[item.origen] || item.origen}:</b>{' '}
                  {item.clics} clics
                </li>
              ))}
            </ul>
            {!!result.productos.length && (
              <>
                <h3>Productos consultados</h3>
                <ul>
                  {result.productos.map((p) => (
                    <li key={`${p.productoId}-${p.origen}`}>
                      <b>{p.nombre}:</b> {p.clics} desde{' '}
                      {originLabels[p.origen] || p.origen}
                    </li>
                  ))}
                </ul>
              </>
            )}
            {!!result.galeria?.length && (
              <>
                <h3>Ideas elegidas</h3>
                <ul>
                  {result.galeria.map((item) => (
                    <li key={item.galeriaImagenId}>
                      <b>{item.titulo || `Idea #${item.galeriaImagenId}`}:</b>{' '}
                      {item.clics} clics (referencia #{item.galeriaImagenId})
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        ) : (
          <p>Todavía no hay clics registrados en este período.</p>
        ))}
    </section>
  );
}
