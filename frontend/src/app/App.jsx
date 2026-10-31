import LoginPage from '../modules/sesion/LoginPage.jsx';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { api, json } from '../shared/api.js';
import Public from './PublicPage.jsx';
import Editor from './Editor.jsx';

export default function App() {
  const [path, setPath] = useState(location.pathname),
    [account, setAccount] = useState(null),
    [data, setData] = useState(null),
    [error, setError] = useState(''),
    [loading, setLoading] = useState(true),
    [login, setLogin] = useState({ email: '', password: '' });
  const navigationGuard = useRef(null);
  const registerNavigationGuard = useCallback((guard) => {
    navigationGuard.current = guard;
  }, []);
  const navigate = (p) => {
    history.pushState({}, '', p);
    setPath(p);
  };
  useEffect(() => {
    const fn = () => {
      const nextPath = location.pathname;
      if (navigationGuard.current && !navigationGuard.current()) {
        history.pushState({}, '', path);
        return;
      }
      setPath(nextPath);
    };
    window.addEventListener('popstate', fn);
    return () => window.removeEventListener('popstate', fn);
  }, [path]);
  useEffect(() => {
    Promise.allSettled([api('/publico'), api('/session')]).then(
      ([pub, user]) => {
        if (pub.status === 'fulfilled') setData(pub.value);
        else
          setError(
            'No se pudo cargar la página. Compruebe que la API esté en ejecución.',
          );
        if (user.status === 'fulfilled') setAccount(user.value);
        setLoading(false);
      },
    );
  }, []);
  useEffect(() => {
    if (!loading && !account && path.startsWith('/contenido'))
      navigate('/login');
  }, [loading, account, path]);
  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      const u = await api('/login', { method: 'POST', ...json(login) });
      setAccount(u);
      navigate('/contenido/portada');
    } catch {
      setError('Correo o contraseña incorrectos.');
    }
  }
  async function logout() {
    await api('/logout', { method: 'POST' });
    setAccount(null);
    navigate('/login');
  }
  if (loading)
    return (
      <div className="center-state" role="status">
        Cargando Bazar Nazareth…
      </div>
    );
  if (path.startsWith('/contenido') && !account)
    return (
      <div className="center-state" role="status">
        Redirigiendo al acceso…
      </div>
    );
  if (path.startsWith('/contenido'))
    return (
      <Editor
        account={account}
        navigate={navigate}
        logout={logout}
        path={path}
        registerNavigationGuard={registerNavigationGuard}
      />
    );
  if (path === '/login')
    return (
      <LoginPage
        submit={submit}
        error={error}
        login={login}
        setLogin={setLogin}
      />
    );
  if (error)
    return (
      <div className="center-state" role="alert">
        {error}
      </div>
    );
  return data ? (
    <Public data={data} />
  ) : (
    <div className="center-state">Sin datos disponibles.</div>
  );
}
