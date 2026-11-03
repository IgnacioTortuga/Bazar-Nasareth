import React, { useId, useRef } from 'react';

export default function EditorHelp({ title = 'Ayuda rápida', children }) {
  const id = useId();
  const panel = useRef(null);
  return <details className="editor-help" ref={panel} onKeyDown={(event) => {
    if (event.key === 'Escape') {
      panel.current.open = false;
      panel.current.querySelector('summary').focus();
    }
  }}>
    <summary aria-controls={id}><span aria-hidden="true">?</span>{title}</summary>
    <div id={id} className="editor-help-panel">{children}</div>
  </details>;
}
