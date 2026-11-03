import React, { useState } from 'react';
import { AdminIcon } from '../../shared/Icons.jsx';

export default function LoginPage({ submit, error, login, setLogin, busy }) {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="login-screen">
      <form className="login-card" onSubmit={submit} aria-busy={busy}>
        <a href="/">← Volver al sitio</a>
        <div className="login-emblem"><AdminIcon /></div>
        <span className="eyebrow">BAZAR NAZARETH</span>
        <h1>Bienvenido de nuevo</h1>
        <p className="login-intro">Ingrese para administrar los productos, las fotos y las novedades del bazar.</p>
        {error && <p role="alert">{error}</p>}
        <label>
          Correo electrónico
          <input
            autoComplete="username"
            type="email"
            required
            value={login.email}
            onChange={(e) => setLogin({ ...login, email: e.target.value })}
          />
        </label>
        <label>
          Contraseña
          <input
            autoComplete="current-password"
            type={showPassword ? 'text' : 'password'}
            required
            value={login.password}
            onChange={(e) => setLogin({ ...login, password: e.target.value })}
          />
        </label>
        <button className="password-toggle" type="button" aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)}>{showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}</button>
        <button className="button primary" disabled={busy}>
          {busy ? 'Ingresando…' : 'Iniciar sesión'}
        </button>
        {busy && <p role="status">Comprobando el acceso…</p>}
      </form>
    </div>
  );
}
