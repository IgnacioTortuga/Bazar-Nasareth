import { useLanguage } from '../../shared/Language.jsx';
import React from 'react';

export default function TextBlocks({ data, hero }) {
  return data.secciones
    .filter((s) => s.id !== hero?.id)
    .map((s) => (
      <section className="wrap section text-section" key={s.id}>
        <h2>{s.titulo}</h2>
        <p>{s.cuerpo}</p>
      </section>
    ));
}
