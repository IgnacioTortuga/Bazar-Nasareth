import React, { useEffect, useRef } from 'react';

export default function FormErrors({ errors, focusKey }) {
  const summary = useRef(null);
  const entries = Object.entries(errors);
  useEffect(() => {
    if (Object.keys(errors).length) summary.current?.focus();
  }, [focusKey]);
  if (!entries.length) return null;
  return (
    <div className="form-errors" tabIndex="-1" ref={summary} role="alert">
      <h3>Revise el formulario</h3>
      <ul>
        {entries.map(([name, message]) => (
          <li key={name}>
            {name === '_form' ? (
              message
            ) : (
              <a
                href={'#' + name}
                onClick={(event) => {
                  event.preventDefault();
                  document.getElementById(name)?.focus();
                }}
              >
                {message}
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
