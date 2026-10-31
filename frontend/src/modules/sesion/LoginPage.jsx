import React from 'react';

export default function LoginPage({ submit, error, login, setLogin }) {
  return (
    <div className="login-screen">
      <form className="login-card" onSubmit={submit}>
        <a href="/">← Volver al sitio</a>
        <span className="eyebrow">BAZAR NAZARETH</span>
        <h1>Acceso al editor</h1>
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
            type="password"
            required
            value={login.password}
            onChange={(e) => setLogin({ ...login, password: e.target.value })}
          />
        </label>
        <button className="button primary">Iniciar sesión</button>
      </form>
    </div>
  );
}
