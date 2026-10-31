import useImageLibrary from '../modules/imagenes/useImageLibrary.js';
import useAccounts from '../modules/usuarios/useAccounts.js';
import ProductImages from '../modules/productos/ProductImages.jsx';
import CategoriesPanel from '../modules/productos/CategoriesPanel.jsx';
import InlineImageTools from '../modules/imagenes/InlineImageTools.jsx';
import PromotionRelations from '../modules/promociones/PromotionRelations.jsx';
import ContentPreview from '../shared/ContentPreview.jsx';
import PaginatedList from '../shared/PaginatedList.jsx';
import React, { useEffect, useRef, useState } from 'react';
import { api, json } from '../shared/api.js';
import { promotionTimingLabel } from '../shared/format.js';
import {
  sections,
  labels,
  collection,
  fieldsets,
  defaults,
} from './adminConfig.js';
import Field from '../shared/Field.jsx';
import WhatsAppMetrics from '../modules/metricas/WhatsAppMetrics.jsx';
import BusinessForm from '../modules/contacto/BusinessForm.jsx';
import ImageLibrary from '../modules/imagenes/ImageLibrary.jsx';
import AccountsPanel from '../modules/usuarios/AccountsPanel.jsx';

export default function Editor({
  account,
  navigate,
  logout,
  path,
  registerNavigationGuard,
}) {
  const [active, setActive] = useState(
    location.pathname.split('/')[2] || 'portada',
  );
  const [data, setData] = useState({}),
    [selected, setSelected] = useState(null),
    [draft, setDraft] = useState(null),
    [preview, setPreview] = useState(false),
    [reviewed, setReviewed] = useState(false),
    [message, setMessage] = useState(''),
    [busy, setBusy] = useState(false),
    [menu, setMenu] = useState(false);
  const menuButton = useRef(null);
  const [relationIds, setRelationIds] = useState([]),
    [promoProducts, setPromoProducts] = useState([]),
    [promoServices, setPromoServices] = useState([]);
  const permitted = (p) => account.completo || account.permisos.includes(p);
  const {
    upload,
    setUpload,
    uploadImage,
    replaceImage,
    removeImage,
    saveAlt,
    imageUsages,
  } = useImageLibrary({ data, permitted, reload, setMessage, setBusy });
  const [inlineUpload, setInlineUpload] = useState({ file: null, alt: '' });
  const { editorForm, setEditorForm, saveEditor, loadEditors } = useAccounts({
    setBusy,
    setMessage,
    setData,
  });
  useEffect(() => {
    setActive(path.split('/')[2] || 'portada');
  }, [path]);

  const hasUnsavedChanges = () => {
    const baseline = active === 'contacto' ? data.negocio : selected;
    if (draft && JSON.stringify(draft) !== JSON.stringify(baseline))
      return true;
    if (!draft) return false;
    const sameIds = (left, right) =>
      JSON.stringify([...left].sort((a, b) => a - b)) ===
      JSON.stringify([...right].sort((a, b) => a - b));
    if (active === 'productos') {
      const original = (data.relaciones?.productoImagenes || [])
        .filter((x) => x.productoId === selected?.id)
        .sort((a, b) => a.orden - b.orden)
        .map((x) => x.imagenId);
      if (!sameIds(relationIds, original)) return true;
    }
    if (active === 'promociones') {
      const originalProducts = (data.relaciones?.promocionProductos || [])
        .filter((x) => x.promocionId === selected?.id)
        .map((x) => x.productoId);
      const originalServices = (data.relaciones?.promocionServicios || [])
        .filter((x) => x.promocionId === selected?.id)
        .map((x) => x.servicioId);
      if (
        !sameIds(promoProducts, originalProducts) ||
        !sameIds(promoServices, originalServices)
      )
        return true;
    }
    return false;
  };
  const dirty = hasUnsavedChanges();
  useEffect(() => {
    const guard = () => {
      if (hasUnsavedChanges() && !confirm('Hay cambios sin guardar. ¿Salir?'))
        return false;
      setSelected(null);
      setDraft(null);
      setPreview(false);
      setReviewed(false);
      setMenu(false);
      return true;
    };
    registerNavigationGuard(guard);
    return () => registerNavigationGuard(null);
  }, [
    active,
    data,
    draft,
    selected,
    relationIds,
    promoProducts,
    promoServices,
    registerNavigationGuard,
  ]);
  useEffect(() => {
    if (!dirty) return;
    const warnBeforeLeaving = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warnBeforeLeaving);
    return () => window.removeEventListener('beforeunload', warnBeforeLeaving);
  }, [dirty]);
  useEffect(() => {
    if (!menu) return;
    const closeOnEscape = (event) => {
      if (event.key !== 'Escape') return;
      setMenu(false);
      menuButton.current?.focus();
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [menu]);
  async function reload() {
    setBusy(true);
    try {
      const keys = [
        'categorias',
        'productos',
        'servicios',
        'promociones',
        'galeria',
        'secciones',
        'imagenes',
        'negocio',
        'relaciones',
      ];
      const values = await Promise.all(keys.map((k) => api('/admin/' + k)));
      setData(Object.fromEntries(keys.map((k, i) => [k, values[i]])));
      setMessage('');
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    reload();
  }, []);
  function go(section) {
    if (hasUnsavedChanges() && !confirm('Hay cambios sin guardar. ¿Salir?'))
      return;
    setActive(section);
    navigate('/contenido/' + section);
    setSelected(null);
    setDraft(null);
    setPreview(false);
    setReviewed(false);
    setMenu(false);
    setMessage('');
  }
  function closeDraft() {
    if (
      hasUnsavedChanges() &&
      !confirm('Hay cambios sin guardar. ¿Cerrar sin guardarlos?')
    )
      return;
    setSelected(null);
    setDraft(null);
    setPreview(false);
    setReviewed(false);
  }
  function closePreview() {
    setPreview(false);
    setReviewed(true);
  }
  async function requestLogout() {
    if (
      hasUnsavedChanges() &&
      !confirm('Hay cambios sin guardar. ¿Cerrar sesión de todas formas?')
    )
      return;
    await logout();
  }
  function open(entity) {
    const item = entity
      ? structuredClone(entity)
      : structuredClone(defaults[collection[active] || 'productos']);
    if (!entity && active === 'portada') item.clave = 'portada';
    setSelected(item);
    setDraft(structuredClone(item));
    setPreview(false);
    setReviewed(false);
    setRelationIds(
      (data.relaciones?.productoImagenes || [])
        .filter((x) => x.productoId === item.id)
        .sort((a, b) => a.orden - b.orden)
        .map((x) => x.imagenId),
    );
    setPromoProducts(
      (data.relaciones?.promocionProductos || [])
        .filter((x) => x.promocionId === item.id)
        .map((x) => x.productoId),
    );
    setPromoServices(
      (data.relaciones?.promocionServicios || [])
        .filter((x) => x.promocionId === item.id)
        .map((x) => x.servicioId),
    );
  }
  async function changePublicationState(item, nextState) {
    const route = collection[active];
    if (
      !route ||
      !item?.id ||
      !['Borrador', 'Publicado', 'Archivado'].includes(nextState)
    )
      return;
    const recovering = nextState !== 'Archivado';
    const promptText = recovering
      ? '¿Recuperar este contenido como borrador? No se mostrará públicamente hasta que lo edite, abra la vista previa y lo publique.'
      : '¿Archivar este contenido? Se conservará en el sistema, pero dejará de estar disponible públicamente.';
    if (!confirm(promptText)) return;
    setBusy(true);
    try {
      await api('/admin/' + route + '/' + item.id, {
        method: 'PUT',
        ...json({ ...item, estado: nextState }),
      });
      if (selected?.id === item.id) {
        setSelected(null);
        setDraft(null);
        setPreview(false);
        setReviewed(false);
      }
      await reload();
      setMessage(
        recovering
          ? 'Contenido recuperado como borrador. Abra el elemento para revisarlo y publicarlo.'
          : 'Contenido archivado. Se conservaron sus datos y relaciones.',
      );
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    const route = collection[active];
    if (!route || !draft || busy) return;
    if (draft.estado === 'Publicado' && !reviewed) {
      setMessage('Abra la vista previa antes de publicar o actualizar.');
      return;
    }
    if (
      selected?.estado === 'Publicado' &&
      draft.estado !== 'Publicado' &&
      !confirm('¿Retirar este contenido de la página?')
    )
      return;
    if (
      draft.estado === 'Publicado' &&
      !confirm('¿Confirmar publicación o actualización de este contenido?')
    )
      return;
    setBusy(true);
    try {
      const combined = active === 'productos' || active === 'promociones';
      const payload =
        active === 'productos'
          ? { producto: draft, imagenes: relationIds }
          : active === 'promociones'
            ? {
                promocion: draft,
                productos: promoProducts,
                servicios: promoServices,
              }
            : draft;
      await api(
        '/admin/' +
          route +
          (draft.id ? '/' + draft.id : '') +
          (combined ? '/guardar' : ''),
        { method: draft.id ? 'PUT' : 'POST', ...json(payload) },
      );
      setDraft(null);
      setSelected(null);
      setPreview(false);
      setReviewed(false);
      await reload();
      setMessage('Cambios guardados.');
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function saveBusiness(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await api('/admin/negocio', { method: 'PUT', ...json(draft) });
      await reload();
      setMessage('Contacto actualizado.');
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function uploadInlineImage(e) {
    e.preventDefault();
    if (!inlineUpload.file || !inlineUpload.alt.trim()) {
      setMessage('Seleccione una imagen y escriba su texto alternativo.');
      return;
    }
    if (
      !['image/jpeg', 'image/png', 'image/webp'].includes(
        inlineUpload.file.type,
      ) ||
      inlineUpload.file.size > 5 * 1024 * 1024
    ) {
      setMessage('Use JPG, PNG o WebP de hasta 5 MB.');
      return;
    }
    const form = e.currentTarget;
    setBusy(true);
    try {
      const body = new FormData();
      body.append('archivo', inlineUpload.file);
      body.append('textoAlternativo', inlineUpload.alt.trim());
      const img = await api('/admin/imagenes', { method: 'POST', body });
      const persistedGalleryItem =
        active === 'galeria' && selected?.id
          ? (data.galeria || []).find((item) => item.id === selected.id)
          : null;
      if (persistedGalleryItem && !hasUnsavedChanges()) {
        const updated = await api(`/admin/galeria/${persistedGalleryItem.id}`, {
          method: 'PUT',
          ...json({ ...persistedGalleryItem, imagenId: img.id }),
        });
        setSelected(updated);
        setDraft(structuredClone(updated));
        await reload();
        setMessage(
          `«${inlineUpload.file.name}» se cargó como archivo nuevo y reemplazó la foto de Galería. Se conservaron título, orden y publicación.`,
        );
      } else {
        const images = await api('/admin/imagenes');
        setData((d) => ({ ...d, imagenes: images }));
        if (active === 'productos')
          setRelationIds((ids) => [
            img.id,
            ...ids.filter((id) => id !== img.id),
          ]);
        else setDraft((current) => ({ ...current, imagenId: img.id }));
        setMessage(
          'Foto cargada y asignada al formulario. Abra Vista previa y guarde para aplicar los cambios.',
        );
      }
      setInlineUpload({ file: null, alt: '' });
      form.reset();
      setPreview(false);
      setReviewed(false);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (active === 'usuarios' && permitted('usuarios')) loadEditors();
  }, [active]);
  const route = collection[active],
    list =
      route && Array.isArray(data[route])
        ? data[route].filter((x) =>
            active === 'portada'
              ? x.clave === 'portada'
              : active === 'textos'
                ? x.clave !== 'portada'
                : true,
          )
        : [];
  const imgAlt = (id) =>
    data.imagenes?.find((x) => x.id === Number(id))?.textoAlternativo;
  const title = (x) => x.nombre || x.titulo || x.clave || `Fotografía ${x.id}`;

  return (
    <div className="editor-layout">
      <aside className={menu ? 'open' : ''}>
        <div className="aside-brand">
          BAZAR <span>NAZARETH</span>
          <small>Editor de contenidos</small>
        </div>
        <button className="mobile-nav-close" onClick={() => setMenu(false)}>
          Cerrar menú ×
        </button>
        <nav>
          {sections.filter(permitted).map((p) => (
            <button
              key={p}
              className={active === p ? 'active' : ''}
              onClick={() => go(p)}
            >
              {labels[p]}
            </button>
          ))}
        </nav>
        <div className="aside-bottom">
          <a href="/" target="_blank" rel="noopener noreferrer">
            Ver página ↗
          </a>
          <button onClick={requestLogout}>Cerrar sesión</button>
        </div>
      </aside>
      <main className="editor-main">
        <div className="editor-top">
          <button
            ref={menuButton}
            className="mobile-menu"
            onClick={() => setMenu(!menu)}
            aria-expanded={menu}
            aria-label={menu ? 'Cerrar menú' : 'Abrir menú'}
          >
            ☰ Menú
          </button>
          <span>{account.nombre}</span>
        </div>
        <div className="editor-content">
          <span className="eyebrow">GESTIÓN DE CONTENIDO</span>
          <h1>{labels[active] || 'Editor'}</h1>
          {message && (
            <div className="notice" role="alert">
              {message}
            </div>
          )}
          {busy && <p role="status">Procesando…</p>}
          {active === 'productos' && permitted('productos') && (
            <WhatsAppMetrics />
          )}
          {!permitted(active) ? (
            <p>No tiene permiso para esta sección.</p>
          ) : active === 'contacto' ? (
            <BusinessForm
              saveBusiness={saveBusiness}
              draft={draft}
              data={data}
              setDraft={setDraft}
              busy={busy}
            />
          ) : active === 'imagenes' ? (
            <ImageLibrary
              data={data}
              uploadImage={uploadImage}
              upload={upload}
              setUpload={setUpload}
              busy={busy}
              imageUsages={imageUsages}
              permitted={permitted}
              replaceImage={replaceImage}
              saveAlt={saveAlt}
              removeImage={removeImage}
            />
          ) : active === 'usuarios' ? (
            <AccountsPanel
              data={data}
              editorForm={editorForm}
              setEditorForm={setEditorForm}
              saveEditor={saveEditor}
              busy={busy}
            />
          ) : (
            route && (
              <>
                <div className="editor-actions">
                  <p>
                    {active === 'portada'
                      ? 'Encabezado y presentación de la página'
                      : active === 'productos'
                        ? 'Fichas informativas por categoría'
                        : active === 'textos'
                          ? 'Bloques informativos que aparecen entre la galería y el contacto'
                          : `Editar ${labels[active].toLowerCase()}`}
                  </p>
                  {active !== 'portada' && (
                    <button
                      className="button primary"
                      onClick={() => open(null)}
                    >
                      + Crear{' '}
                      {active === 'productos' ? 'producto' : 'contenido'}
                    </button>
                  )}
                  {active === 'portada' && !list.length && (
                    <button
                      className="button primary"
                      onClick={() => open(null)}
                    >
                      Crear portada
                    </button>
                  )}
                </div>
                {active === 'productos' && (
                  <CategoriesPanel
                    data={data}
                    reload={reload}
                    setMessage={setMessage}
                    busy={busy}
                  />
                )}
                <PaginatedList
                  key={active}
                  label={labels[active]}
                  searchable={active !== 'portada'}
                  searchTerms={list.map((item) =>
                    [
                      title(item),
                      item.descripcion,
                      item.cuerpo,
                      item.alcance,
                      item.condiciones,
                      item.estado,
                      data.categorias?.find(
                        (category) => category.id === item.categoriaId,
                      )?.nombre,
                    ]
                      .filter(Boolean)
                      .join(' '),
                  )}
                  className="list-panel"
                  total={list.length}
                  disabled={busy}
                >
                  {list.map((item) => (
                    <div className="list-item list-item-actions" key={item.id}>
                      <button
                        className="list-item-open"
                        onClick={() => open(item)}
                        disabled={busy}
                      >
                        <span>
                          <b>{title(item)}</b>{' '}
                          <small>
                            #{item.id} ·{' '}
                            {item.estado ||
                              (item.activa ? 'Activa' : 'Inactiva')}
                            {active === 'promociones'
                              ? ` · Vigencia: ${promotionTimingLabel(item)}`
                              : ''}
                          </small>
                        </span>
                        <span>Editar →</span>
                      </button>
                      {item.estado && (
                        <button
                          className={
                            item.estado === 'Archivado'
                              ? 'state-button restore-button'
                              : 'state-button archive-button'
                          }
                          disabled={busy}
                          onClick={() =>
                            changePublicationState(
                              item,
                              item.estado === 'Archivado'
                                ? 'Borrador'
                                : 'Archivado',
                            )
                          }
                        >
                          {item.estado === 'Archivado'
                            ? 'Recuperar'
                            : 'Archivar'}
                        </button>
                      )}
                    </div>
                  ))}
                  {!list.length && (
                    <p className="empty">
                      Aún no hay contenido en esta sección.
                    </p>
                  )}
                </PaginatedList>
                {draft && (
                  <div className="form-panel">
                    <div className="row spread">
                      <h2>
                        {draft.id ? 'Editar' : 'Crear'}{' '}
                        {labels[active].toLowerCase()}
                      </h2>
                      <button onClick={closeDraft}>Cerrar ×</button>
                    </div>
                    {active === 'productos' && (
                      <p className="hint">
                        Guarde primero un borrador para asignar fotografías;
                        después puede publicarlo.
                      </p>
                    )}
                    {active === 'promociones' && (
                      <p className="hint">
                        Vigencia calculada con inicio y fin:{' '}
                        {promotionTimingLabel(draft)}. Programada, Vigente y
                        Finalizada son etiquetas; la visibilidad pública también
                        requiere estado Publicado.
                      </p>
                    )}
                    {active === 'textos' && (
                      <div className="content-editor-help">
                        <strong>¿Para qué sirve esta sección?</strong>
                        <p>
                          Cada bloque publicado aparece en la página pública
                          después de la Galería de ideas. Úselo solo para
                          información complementaria, por ejemplo pedidos,
                          entregas o preguntas frecuentes. Si un bloque es de
                          demostración, puede archivarlo.
                        </p>
                        <small>
                          La “clave” es un nombre interno corto y único; los
                          clientes no la ven.
                        </small>
                      </div>
                    )}
                    {fieldsets[route].map(([name, label, kind]) => (
                      <Field
                        key={name}
                        name={name}
                        label={label}
                        kind={kind}
                        value={draft[name]}
                        onChange={(n, v) => {
                          setDraft({ ...draft, [n]: v });
                          setPreview(false);
                          setReviewed(false);
                        }}
                        data={data}
                        disabled={active === 'portada' && name === 'clave'}
                      />
                    ))}
                    {active === 'productos' && (
                      <ProductImages
                        relationIds={relationIds}
                        setRelationIds={setRelationIds}
                        setPreview={setPreview}
                        setReviewed={setReviewed}
                        data={data}
                      />
                    )}
                    {[
                      'portada',
                      'productos',
                      'servicios',
                      'promociones',
                      'galeria',
                      'textos',
                    ].includes(active) && (
                      <InlineImageTools
                        permitted={permitted}
                        uploadInlineImage={uploadInlineImage}
                        inlineUpload={inlineUpload}
                        setInlineUpload={setInlineUpload}
                        busy={busy}
                        active={active}
                        relationIds={relationIds}
                        draft={draft}
                        imgAlt={imgAlt}
                      />
                    )}

                    {active === 'promociones' && (
                      <PromotionRelations
                        data={data}
                        promoProducts={promoProducts}
                        promoServices={promoServices}
                        setPromoProducts={setPromoProducts}
                        setPromoServices={setPromoServices}
                        setPreview={setPreview}
                        setReviewed={setReviewed}
                      />
                    )}
                    <div className="row">
                      <button
                        className="button"
                        onClick={() => {
                          setPreview(true);
                          setReviewed(false);
                          setMessage('');
                        }}
                      >
                        Vista previa
                      </button>
                      <button
                        className="button primary"
                        disabled={busy}
                        onClick={save}
                      >
                        Guardar{' '}
                        {draft.estado === 'Publicado' ? 'y publicar' : ''}
                      </button>
                    </div>
                  </div>
                )}
                {preview && draft && (
                  <ContentPreview
                    closePreview={closePreview}
                    active={active}
                    relationIds={relationIds}
                    draft={draft}
                    imgAlt={imgAlt}
                  />
                )}
              </>
            )
          )}
        </div>
      </main>
    </div>
  );
}
