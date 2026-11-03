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
    [publicError, setPublicError] = useState(''),
    [signingIn, setSigningIn] = useState(false),
    [loading, setLoading] = useState(true),
    [login, setLogin] = useState({ email: '', password: '' });
  const navigationGuard = useRef(null);
  const loginInFlight = useRef(false);
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
      if (nextPath === path) return;
      if (navigationGuard.current && !navigationGuard.current()) {
        history.pushState({}, '', path);
        return;
      }
      setPath(nextPath);
    };
    window.addEventListener('popstate', fn);
    return () => window.removeEventListener('popstate', fn);
  }, [path]);
  const loadPage = useCallback(async () => {
    setLoading(true);
    setPublicError('');
    Promise.allSettled([api('/publico', { cache: 'no-store' }), api('/session')]).then(
      ([pub, user]) => {
        if (pub.status === 'fulfilled') setData(pub.value);
        else
          setPublicError(
            'No pudimos cargar el bazar. Compruebe su conexión y vuelva a intentarlo.',
          );
        if (user.status === 'fulfilled') setAccount(user.value);
        setLoading(false);
      },
    );
  }, []);
  useEffect(() => {
    loadPage();
  }, [loadPage]);
  useEffect(() => {
    if (!loading && !account && path.startsWith('/contenido'))
      navigate('/login');
  }, [loading, account, path]);
  // Una pestaña pública puede seguir abierta mientras se edita en otra.
  const previousPath = useRef(path);
  useEffect(() => {
    const returningFromEditor = previousPath.current.startsWith('/contenido') && !path.startsWith('/contenido');
    previousPath.current = path;
    if (loading || path.startsWith('/contenido') || path === '/login') return;
    let request;
    const refresh = () => {
      request?.abort();
      request = new AbortController();
      const current = request;
      api('/publico', { cache: 'no-store', signal: current.signal })
        .then((next) => { if (!current.signal.aborted) { setData(next); setPublicError(''); } })
        .catch(() => { if (!current.signal.aborted) setPublicError('No pudimos actualizar el bazar. Compruebe su conexión y vuelva a intentarlo.'); });
    };
    const onVisible = () => { if (document.visibilityState === 'visible') refresh(); };
    const onPageShow = (event) => { if (event.persisted) refresh(); };
    if (returningFromEditor) refresh();
    window.addEventListener('focus', refresh);
    window.addEventListener('pageshow', onPageShow);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      request?.abort();
      window.removeEventListener('focus', refresh);
      window.removeEventListener('pageshow', onPageShow);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [path, loading]);
  async function submit(e) {
    e.preventDefault();
    if (loginInFlight.current) return;
    loginInFlight.current = true;
    setSigningIn(true);
    setError('');
    try {
      const u = await api('/login', { method: 'POST', ...json(login) });
      setAccount(u);
      navigate('/contenido/portada');
    } catch (failure) {
      setError(failure.message);
    } finally {
      loginInFlight.current = false;
      setSigningIn(false);
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
        busy={signingIn}
      />
    );
  if (publicError)
    return (
      <div className="center-state" role="alert">
        <p>{publicError}</p>
        <button className="button primary" type="button" onClick={loadPage}>
          Volver a intentar
        </button>
      </div>
    );
  return data ? (
    <Public data={data} />
  ) : (
    <div className="center-state">Sin datos disponibles.</div>
  );
}
