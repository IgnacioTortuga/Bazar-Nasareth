async function api(path, options = {}) {
  let response;
  try {
    response = await fetch('/api' + path, {
      credentials: 'same-origin',
      ...options,
    });
  } catch {
    throw new Error(
      options.method && options.method !== 'GET'
        ? 'Se perdió la conexión. No se pudo confirmar el resultado. Conserve sus cambios y compruebe la lista antes de repetir el guardado.'
        : 'No se pudo conectar con el servidor. Compruebe su conexión e inténtelo de nuevo.',
    );
  }
  if (!response.ok) {
    if (response.status === 401)
      throw new Error(
        'Su sesión terminó. Abra el acceso en otra pestaña para iniciar sesión y conservar este formulario.',
      );
    if (response.status === 403)
      throw new Error(
        'El servidor rechazó la operación. Compruebe sus permisos y el origen desde el que abrió el panel.',
      );
    if (response.status >= 500)
      throw new Error(
        'El servidor no pudo completar la operación. Conserve el formulario y compruebe la lista antes de reintentar.',
      );
    const body = await response.text();
    let message = body;
    try {
      const json = JSON.parse(body);
      message =
        json.title || json.detail || json.message || JSON.stringify(json);
    } catch {
      /* texto plano */
    }
    throw new Error(message || `Error ${response.status}`);
  }
  const body = await response.text();
  return body ? JSON.parse(body) : null;
}
const json = (body) => ({
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});
export { api, json };
