import React, { useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export default function Modal({
  children,
  onClose,
  label,
  labelledBy,
  className = '',
}) {
  const dialog = useRef(null);
  const close = useRef(onClose);
  close.current = onClose;
  useLayoutEffect(() => {
    const element = dialog.current;
    const trigger = document.activeElement;
    const overflow = document.body.style.overflow;
    element.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      element.close();
      document.body.style.overflow = overflow;
      if (trigger?.isConnected) trigger.focus();
    };
  }, []);
  return createPortal(
    <dialog
      ref={dialog}
      className={`dialog-shell ${className}`}
      aria-label={label}
      aria-labelledby={labelledBy}
      tabIndex="-1"
      onKeyDown={(event) => {
        if (event.key !== 'Tab') return;
        const items = Array.from(
          dialog.current.querySelectorAll(
            'a[href], button, input, select, textarea, [tabindex]',
          ),
        ).filter(
          (item) =>
            item.tabIndex >= 0 &&
            !item.matches(':disabled') &&
            item.getClientRects().length,
        );
        const first = items[0];
        const last = items.at(-1);
        if (!first) {
          event.preventDefault();
          dialog.current.focus();
        } else if (
          event.shiftKey &&
          (document.activeElement === first ||
            document.activeElement === dialog.current)
        ) {
          event.preventDefault();
          last.focus();
        } else if (
          !event.shiftKey &&
          (document.activeElement === last ||
            document.activeElement === dialog.current)
        ) {
          event.preventDefault();
          first.focus();
        }
      }}
      onCancel={(event) => {
        event.preventDefault();
        close.current();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) close.current();
      }}
    >
      {children}
    </dialog>,
    document.body,
  );
}
