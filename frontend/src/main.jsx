import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

async function api(path, options = {}) {
  const response = await fetch('/api' + path, { credentials: 'same-origin', ...options });
  if (!response.ok) {
    const body = await response.text();
    let message = body;
    try { const json = JSON.parse(body); message = json.title || json.detail || json.message || JSON.stringify(json); } catch { /* texto plano */ }
    throw new Error(message || `Error ${response.status}`);
  }
  const body = await response.text();
  return body ? JSON.parse(body) : null;
}
const json = body => ({ headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
const imageUrl = id => id ? `/api/imagenes/${id}/archivo` : null;
const toCostaRicaInput = value => value ? new Date(value).toLocaleString('sv-SE', {timeZone:'America/Costa_Rica',hour12:false}).slice(0,16).replace(' ','T') : '';
const sections = ['portada', 'productos', 'servicios', 'imagenes', 'promociones', 'galeria', 'textos', 'contacto', 'usuarios'];
const labels = { portada: 'Portada', productos: 'Productos', servicios: 'Servicios', imagenes: 'Imágenes', promociones: 'Promociones', galeria: 'Galería', textos: 'Textos', contacto: 'Contacto', usuarios: 'Administradores' };
const collection = { portada: 'secciones', textos: 'secciones', productos: 'productos', servicios: 'servicios', promociones: 'promociones', galeria: 'galeria' };
const fieldsets = {
  categorias: [['nombre','Nombre','text'],['orden','Orden','number'],['activa','Activa','checkbox']],
  productos: [['categoriaId','Categoría','category'],['nombre','Nombre','text'],['descripcion','Descripción','textarea'],['precioInformativo','Precio informativo','decimal'],['moneda','Moneda','currency'],['destacado','Destacado','checkbox'],['orden','Orden','number'],['estado','Estado','status']],
  servicios: [['nombre','Nombre','text'],['descripcion','Descripción','textarea'],['alcance','Alcance','textarea'],['imagenId','Imagen','image'],['precioDesde','Precio desde','decimal'],['moneda','Moneda','currency'],['orden','Orden','number'],['estado','Estado','status']],
  promociones: [['titulo','Título','text'],['descripcion','Descripción','textarea'],['condiciones','Condiciones','textarea'],['imagenId','Imagen','image'],['inicio','Inicio','datetime'],['fin','Fin (exclusivo)','datetime'],['orden','Orden','number'],['estado','Estado','status']],
  galeria: [['imagenId','Imagen','image'],['titulo','Título','text'],['orden','Orden único','number'],['estado','Estado','status']],
  secciones: [['clave','Clave única (portada, presentación, preguntas...)','text'],['titulo','Título','text'],['cuerpo','Texto','textarea'],['imagenId','Imagen','image'],['orden','Orden','number'],['estado','Estado','status']],
  negocio: [['nombre','Nombre comercial','text'],['direccion','Dirección','textarea'],['horario','Horario','textarea'],['telefono','Teléfono WhatsApp','text'],['email','Correo','email'],['enlaceContacto','Enlace de contacto','url'],['redes','Enlaces de redes (uno por línea)','textarea']]
};
const defaults = { categorias: { nombre:'',orden:0,activa:true }, productos: { categoriaId:0,nombre:'',descripcion:'',precioInformativo:null,moneda:null,destacado:false,orden:0,estado:'Borrador' }, servicios: { nombre:'',descripcion:'',alcance:'',imagenId:null,precioDesde:null,moneda:null,orden:0,estado:'Borrador' }, promociones: { titulo:'',descripcion:'',condiciones:'',imagenId:null,inicio:null,fin:null,orden:0,estado:'Borrador' }, galeria: { imagenId:0,titulo:'',orden:0,estado:'Borrador' }, secciones: { clave:'',titulo:'',cuerpo:'',imagenId:null,orden:0,estado:'Borrador' } };
function formattedPrice(value, currency) { return value == null ? 'Consultar precio' : `${currency || 'CRC'} ${Number(value).toLocaleString('es-CR', { minimumFractionDigits: 2 })}`; }
function Img({ id, alt, className = '' }) { return id ? <img className={className} src={imageUrl(id)} alt={alt || ''} loading="lazy"/> : <div className={'no-image ' + className} aria-label="Sin fotografía">Fotografía próximamente</div>; }
function ContactMessage({ product, negocio }) {
  const [cantidad, setCantidad] = useState(1), [nombre, setNombre] = useState(''), [nota, setNota] = useState('');
  const num = (negocio.telefono || '').replace(/\D/g,'');
  const price = product.precioInformativo == null ? null : Number(product.precioInformativo) * cantidad;
  const message = [`Hola, quisiera consultar por ${cantidad} ${cantidad === 1 ? 'unidad' : 'unidades'} de ${product.nombre}.`, product.precioInformativo != null ? `Precio informativo unitario: ${formattedPrice(product.precioInformativo, product.moneda)}. Total informativo: ${formattedPrice(price, product.moneda)}.` : null, nombre.trim() ? `Mi nombre es ${nombre.trim()}.` : null, nota.trim() ? `Nota: ${nota.trim()}` : null].filter(Boolean).join('\n');
  return <div className="contact-request"><label>Cantidad <input type="number" min="1" max="999" value={cantidad} onChange={e=>setCantidad(Math.max(1,Math.min(999, Number(e.target.value) || 1)))}/></label><label>Nombre (opcional) <input value={nombre} maxLength="80" onChange={e=>setNombre(e.target.value)}/></label><label>Nota (opcional) <input value={nota} maxLength="500" onChange={e=>setNota(e.target.value)}/></label><a className="button primary" href={`https://wa.me/${num}?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer">Consultar por WhatsApp</a></div>;
}
function Public({ data }) {
  const [category, setCategory] = useState(''), [search, setSearch] = useState(''), [menu, setMenu] = useState(false);
  const business = data.negocio, images = Object.fromEntries(data.imagenes.map(i=>[i.id,i.textoAlternativo]));
  const hero = data.secciones.find(s=>s.clave==='portada') || data.secciones.find(s=>s.clave==='presentación');
  const products = data.productos.filter(p=>(!category || p.categoriaId === Number(category)) && p.nombre.toLowerCase().includes(search.toLowerCase()));
  const links = [['productos','Productos'],['servicios','Servicios'],['promociones','Promociones'],['galeria','Galería'],['contacto','Contacto']];
  return <><header className="public-header"><a className="brand" href="#inicio">{business.nombre}</a><button className="mobile-menu" onClick={()=>setMenu(!menu)} aria-expanded={menu} aria-label="Abrir navegación">☰</button><nav className={menu?'open':''}>{links.map(([id,label])=><a key={id} href={'#'+id} onClick={()=>setMenu(false)}>{label}</a>)}</nav></header>
  <main><section className="hero wrap" id="inicio"><div><span className="eyebrow">HOJANCHA · GUANACASTE</span><h1>{hero?.titulo || 'Detalles para cada ocasión'}</h1><p>{hero?.cuerpo || 'Artículos y servicios de Bazar Nazareth. Conozca nuestra oferta y contáctenos para consultar disponibilidad.'}</p><a className="button primary" href="#productos">Explorar productos</a></div><Img className="hero-img" id={hero?.imagenId} alt={images[hero?.imagenId]}/></section>
  <section id="productos" className="wrap section"><div className="section-heading"><div><span className="eyebrow">NUESTRA OFERTA</span><h2>Productos</h2></div><p>Precios informativos sujetos a confirmación.</p></div><div className="filters"><label>Categoría<select value={category} onChange={e=>setCategory(e.target.value)}><option value="">Todas las categorías</option>{data.categorias.map(c=><option key={c.id} value={c.id}>{c.nombre}</option>)}</select></label><label>Buscar por nombre<input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar producto"/></label></div><div className="grid">{products.map(p=><article className="card" key={p.id}><Img id={p.imagenes[0]} alt={images[p.imagenes[0]]}/><div className="card-body"><small>{data.categorias.find(c=>c.id===p.categoriaId)?.nombre}</small><h3>{p.nombre}</h3><p>{p.descripcion}</p><strong>{formattedPrice(p.precioInformativo,p.moneda)}</strong><ContactMessage product={p} negocio={business}/></div></article>)}</div>{!products.length && <p className="empty">No hay productos con esos filtros.</p>}</section>
  <section id="servicios" className="soft section"><div className="wrap"><span className="eyebrow">LO QUE HACEMOS</span><h2>Servicios</h2><div className="grid">{data.servicios.map(s=><article className="card" key={s.id}><Img id={s.imagenId} alt={images[s.imagenId]}/><div className="card-body"><h3>{s.nombre}</h3><p>{s.descripcion}</p><p><b>Alcance:</b> {s.alcance}</p><strong>{s.precioDesde==null?'Consultar precio':'Desde '+formattedPrice(s.precioDesde,s.moneda)}</strong></div></article>)}</div>{!data.servicios.length && <p className="empty">Próximamente habrá información de servicios.</p>}</div></section>
  <section id="promociones" className="wrap section"><span className="eyebrow">VIGENTES AHORA</span><h2>Promociones</h2><div className="grid">{data.promociones.map(p=><article className="card" key={p.id}><Img id={p.imagenId} alt={images[p.imagenId]}/><div className="card-body"><h3>{p.titulo}</h3><p>{p.descripcion}</p><p><b>Condiciones:</b> {p.condiciones}</p><small>Hasta {new Date(p.fin).toLocaleString('es-CR',{timeZone:'America/Costa_Rica'})}</small></div></article>)}</div>{!data.promociones.length && <p className="empty">No hay promociones vigentes.</p>}</section>
  <section id="galeria" className="soft section"><div className="wrap"><span className="eyebrow">NUESTRO ESPACIO</span><h2>Galería</h2><div className="grid">{data.galeria.map(g=><figure className="card" key={g.id}><Img id={g.imagenId} alt={images[g.imagenId]}/><figcaption className="card-body">{g.titulo}</figcaption></figure>)}</div>{!data.galeria.length && <p className="empty">Aún no hay fotos publicadas.</p>}</div></section>
  {data.secciones.filter(s=>s.id!==hero?.id).map(s=><section className="wrap section text-section" key={s.id}><h2>{s.titulo}</h2><p>{s.cuerpo}</p></section>)}
  <section id="contacto" className="wrap section contact"><span className="eyebrow">SEDE CENTRAL</span><h2>Visítenos o escríbanos</h2><div className="contact-grid"><p><b>Dirección</b><br/>{business.direccion}</p><p><b>Horario</b><br/>{business.horario}</p><p><b>Teléfono</b><br/>{business.telefono}</p>{business.email && <p><b>Correo</b><br/>{business.email}</p>}</div><p><a className="button primary" href={business.enlaceContacto} target="_blank" rel="noopener noreferrer">Abrir contacto</a></p><div className="social">{(business.redes||'').split('\n').filter(x=>{try {return ['https:','http:'].includes(new URL(x.trim()).protocol)} catch{return false}}).map((x,i)=><a key={i} href={x.trim()} target="_blank" rel="noopener noreferrer">{new URL(x.trim()).hostname.replace('www.','')}</a>)}</div></section></main>
  <footer><div className="wrap"><b>{business.nombre}</b><span>{business.direccion} · {business.horario} · {business.telefono}</span><a href="/login">Acceso al editor</a></div></footer></>;
}
function Field({ name, label, kind, value, onChange, data, disabled }) {
  const common = { id:name, disabled, onChange:e=>onChange(name, kind==='checkbox'?e.target.checked : kind==='number'?Number(e.target.value) : kind==='decimal'?(e.target.value===''?null:Number(e.target.value)) : kind==='image'||kind==='category'?(e.target.value?Number(e.target.value):null):kind==='datetime'?(e.target.value?new Date(e.target.value+':00-06:00').toISOString():null):e.target.value) };
  const imageOptions = data.imagenes || [];
  const options = kind==='status' ? [['Borrador','Borrador'],['Publicado','Publicado'],['Archivado','Archivado']] : kind==='category' ? (data.categorias||[]).map(c=>[c.id,c.nombre]) : kind==='image' ? imageOptions.map(i=>[i.id,`${i.id} · ${i.nombre}`]) : [['CRC','CRC'],['USD','USD']];
  return <label className={kind==='checkbox'?'checkbox-field':'field'} htmlFor={name}>{label}{kind==='textarea'?<textarea {...common} rows="4" value={value??''}/>:['status','category','image','currency'].includes(kind)?<select {...common} value={value??''}><option value="">{kind==='image'||kind==='currency'?'Sin seleccionar':'Seleccione...'}</option>{options.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select>:<input {...common} type={kind==='decimal'||kind==='number'?'number':kind==='datetime'?'datetime-local':kind==='checkbox'?kind:kind} step={kind==='decimal'?'0.01':undefined} min={kind==='decimal'||kind==='number'?0:undefined} checked={kind==='checkbox'?!!value:undefined} value={kind==='checkbox'?undefined:kind==='datetime'?toCostaRicaInput(value):value??''}/>}</label>;
}
function Editor({ account, navigate, logout, path }) {
  const [active,setActive] = useState(location.pathname.split('/')[2] || 'portada');
  const [data,setData] = useState({}), [selected,setSelected] = useState(null), [draft,setDraft] = useState(null), [preview,setPreview] = useState(false), [reviewed,setReviewed] = useState(false), [message,setMessage] = useState(''), [busy,setBusy] = useState(false), [menu,setMenu] = useState(false);
  const [relationIds,setRelationIds] = useState([]), [promoProducts,setPromoProducts] = useState([]), [promoServices,setPromoServices] = useState([]);
  const [upload,setUpload] = useState({ file:null,alt:'' });
  const [inlineUpload,setInlineUpload] = useState({ file:null,alt:'' });
  const [editorForm,setEditorForm] = useState({nombre:'',email:'',password:'',completo:false,permisos:[],activo:true});
  useEffect(()=>{setActive(path.split('/')[2]||'portada')},[path]);
  const permitted = p => account.completo || account.permisos.includes(p);
  async function reload() {
    setBusy(true);
    try {
      const keys = ['categorias','productos','servicios','promociones','galeria','secciones','imagenes','negocio','relaciones'];
      const values = await Promise.all(keys.map(k=>api('/admin/'+k)));
      setData(Object.fromEntries(keys.map((k,i)=>[k,values[i]]))); setMessage('');
    } catch(e) { setMessage(e.message); } finally {setBusy(false)}
  }
  useEffect(()=>{reload()},[]);
  function go(section) {
    if (draft && JSON.stringify(draft)!==JSON.stringify(selected) && !confirm('Hay cambios sin guardar. ¿Salir?')) return;
    setActive(section); navigate('/contenido/'+section); setSelected(null); setDraft(null); setPreview(false); setReviewed(false); setMenu(false); setMessage('');
  }
  function open(entity) {
    const item = entity ? structuredClone(entity) : structuredClone(defaults[collection[active] || 'productos']);
    if (!entity && active==='portada') item.clave='portada';
    setSelected(item); setDraft(structuredClone(item)); setPreview(false); setReviewed(false);
    setRelationIds((data.relaciones?.productoImagenes||[]).filter(x=>x.productoId===item.id).sort((a,b)=>a.orden-b.orden).map(x=>x.imagenId));
    setPromoProducts((data.relaciones?.promocionProductos||[]).filter(x=>x.promocionId===item.id).map(x=>x.productoId));
    setPromoServices((data.relaciones?.promocionServicios||[]).filter(x=>x.promocionId===item.id).map(x=>x.servicioId));
  }
  async function save() {
    const route=collection[active]; if (!route || !draft) return;
    if (draft.estado==='Publicado' && !reviewed) { setMessage('Abra la vista previa antes de publicar o actualizar.'); return; }
    if (selected?.estado==='Publicado' && draft.estado!=='Publicado' && !confirm('¿Retirar este contenido de la página?')) return;
    if (draft.estado==='Publicado' && !confirm('¿Confirmar publicación o actualización de este contenido?')) return;
    setBusy(true);
    try {
      const item=await api('/admin/'+route+(draft.id?'/'+draft.id:''),{method:draft.id?'PUT':'POST',...json(draft)});
      if (active==='productos') await api(`/admin/productos/${item.id}/imagenes`,{method:'PUT',...json(relationIds)});
      if (active==='promociones') await api(`/admin/promociones/${item.id}/relaciones`,{method:'PUT',...json({productos:promoProducts,servicios:promoServices})});
      setDraft(null); setSelected(null); setPreview(false); setReviewed(false); await reload(); setMessage('Cambios guardados.');
    } catch(e) {setMessage(e.message)} finally {setBusy(false)}
  }
  async function saveBusiness(e) { e.preventDefault(); setBusy(true); try { await api('/admin/negocio',{method:'PUT',...json(draft)}); await reload(); setMessage('Contacto actualizado.'); } catch(e){setMessage(e.message)} finally{setBusy(false)} }
  async function uploadImage(e) {e.preventDefault(); setBusy(true); try {const body=new FormData();body.append('archivo',upload.file);body.append('textoAlternativo',upload.alt);await api('/admin/imagenes',{method:'POST',body});setUpload({file:null,alt:''});e.target.reset();await reload();setMessage('Imagen cargada. Selecciónela en el contenido que desea cambiar.')}catch(e){setMessage(e.message)}finally{setBusy(false)} }
  async function uploadInlineImage(e) {
    e.preventDefault();
    if (!inlineUpload.file || !inlineUpload.alt.trim()) { setMessage('Seleccione una imagen y escriba su texto alternativo.'); return; }
    const form=e.currentTarget;
    setBusy(true);
    try {
      const body=new FormData(); body.append('archivo',inlineUpload.file); body.append('textoAlternativo',inlineUpload.alt.trim());
      const img=await api('/admin/imagenes',{method:'POST',body});
      const images=await api('/admin/imagenes'); setData(d=>({...d,imagenes:images}));
      if (active==='productos') setRelationIds(ids=>[img.id,...ids.filter(id=>id!==img.id)]);
      else setDraft(current=>({...current,imagenId:img.id}));
      setInlineUpload({file:null,alt:''}); form.reset(); setPreview(false); setReviewed(false);
      setMessage('Imagen cargada y asignada a este contenido. Guarde los cambios para conservar la asignación.');
    } catch(error) { setMessage(error.message); }
    finally { setBusy(false); }
  }
  async function removeImage(id) { if(!confirm('¿Eliminar esta imagen sin referencias?'))return;try{await api('/admin/imagenes/'+id,{method:'DELETE'});await reload();setMessage('Imagen eliminada.')}catch(e){setMessage(e.message)} }
  async function saveAlt(id,oldAlt) {const alt=prompt('Texto alternativo',oldAlt);if(alt===null)return;try{await api('/admin/imagenes/'+id,{method:'PUT',...json({textoAlternativo:alt})});await reload()}catch(e){setMessage(e.message)} }
  async function saveEditor(e) {e.preventDefault();setBusy(true);try{const id=editorForm.id;await api('/admin/editores'+(id?'/'+id:''),{method:id?'PUT':'POST',...json(editorForm)});setEditorForm({nombre:'',email:'',password:'',completo:false,permisos:[],activo:true});setData(d=>({...d,editores:undefined}));await loadEditors();setMessage('Cuenta guardada.')}catch(e){setMessage(e.message)}finally{setBusy(false)}}
  async function loadEditors(){try{const list=await api('/admin/editores');setData(d=>({...d,editores:list}))}catch(e){setMessage(e.message)}}
  useEffect(()=>{if(active==='usuarios'&&permitted('usuarios'))loadEditors()},[active]);
  const route=collection[active], list=route && Array.isArray(data[route]) ? data[route].filter(x=>active==='portada'?x.clave==='portada':active==='textos'?x.clave!=='portada':true) : [];
  const imgAlt=id=>data.imagenes?.find(x=>x.id===Number(id))?.textoAlternativo;
  const title=x=>x.nombre||x.titulo||x.clave||`Fotografía ${x.id}`;
  return <div className="editor-layout"><aside className={menu?'open':''}><div className="aside-brand">BAZAR <span>NAZARETH</span><small>Editor de contenidos</small></div><nav>{sections.filter(permitted).map(p=><button key={p} className={active===p?'active':''} onClick={()=>go(p)}>{labels[p]}</button>)}</nav><div className="aside-bottom"><a href="/" target="_blank" rel="noopener noreferrer">Ver página ↗</a><button onClick={logout}>Cerrar sesión</button></div></aside>
  <main className="editor-main"><div className="editor-top"><button className="mobile-menu" onClick={()=>setMenu(!menu)} aria-expanded={menu}>☰ Menú</button><span>{account.nombre}</span></div><div className="editor-content"><span className="eyebrow">GESTIÓN DE CONTENIDO</span><h1>{labels[active] || 'Editor'}</h1>{message&&<div className="notice" role="alert">{message}</div>}{busy&&<p role="status">Procesando…</p>}
  {!permitted(active) ? <p>No tiene permiso para esta sección.</p> : active==='contacto' ? <form className="form-panel" onSubmit={saveBusiness}><p>Estos datos se comparten entre la sección de contacto y el pie de página.</p>{fieldsets.negocio.map(([name,label,kind])=><Field key={name} name={name} label={label} kind={kind} value={(draft||data.negocio)?.[name]} onChange={(n,v)=>setDraft({... (draft||data.negocio),[n]:v})} data={data}/>)}<button className="button primary" disabled={busy}>Guardar contacto</button></form>
  : active==='imagenes' ? <><form className="form-panel" onSubmit={uploadImage}><h2>Cargar fotografía</h2><label className="field">JPG, PNG o WebP · hasta 5 MB<input type="file" accept="image/jpeg,image/png,image/webp" required onChange={e=>setUpload({...upload,file:e.target.files[0]})}/></label><label className="field">Texto alternativo<input required value={upload.alt} onChange={e=>setUpload({...upload,alt:e.target.value})}/></label><button className="button primary" disabled={busy}>Cargar imagen</button></form><div className="grid image-library">{data.imagenes?.map(img=><article className="card" key={img.id}><Img id={img.id} alt={img.textoAlternativo}/><div className="card-body"><b>{img.nombre}</b><p>{img.textoAlternativo}</p><small>{(img.tamanoBytes/1024/1024).toFixed(2)} MB</small><div className="row"><button onClick={()=>saveAlt(img.id,img.textoAlternativo)}>Editar texto</button><button onClick={()=>removeImage(img.id)}>Eliminar</button></div></div></article>)}</div></>
  : active==='usuarios' ? <><div className="list-panel">{(data.editores||[]).map(x=><button className="list-item" key={x.id} onClick={()=>setEditorForm({...x,password:'',permisos:x.permisos?x.permisos.split(','):[]})}>{x.nombre} · {x.email} <small>{x.completo?'Acceso completo':x.permisos||'Sin permisos'} · {x.activo?'Activo':'Inactivo'}</small></button>)}</div><form className="form-panel" onSubmit={saveEditor}><h2>{editorForm.id?'Editar cuenta':'Nueva cuenta'}</h2><label className="field">Nombre<input required value={editorForm.nombre} onChange={e=>setEditorForm({...editorForm,nombre:e.target.value})}/></label><label className="field">Correo<input type="email" required value={editorForm.email} onChange={e=>setEditorForm({...editorForm,email:e.target.value})}/></label><label className="field">Contraseña {editorForm.id?'(dejar vacía para conservar)':'(mínimo 12 caracteres)'}<input type="password" minLength="12" required={!editorForm.id} value={editorForm.password} onChange={e=>setEditorForm({...editorForm,password:e.target.value})}/></label><label className="checkbox-field">Acceso completo<input type="checkbox" checked={editorForm.completo} onChange={e=>setEditorForm({...editorForm,completo:e.target.checked})}/></label><fieldset disabled={editorForm.completo}><legend>Permisos personalizados</legend><div className="permission-grid">{sections.map(p=><label key={p}><input type="checkbox" checked={editorForm.permisos.includes(p)} onChange={e=>setEditorForm({...editorForm,permisos:e.target.checked?[...editorForm.permisos,p]:editorForm.permisos.filter(x=>x!==p)})}/>{labels[p]}</label>)}</div></fieldset>{editorForm.id&&<label className="checkbox-field">Cuenta activa<input type="checkbox" checked={editorForm.activo} onChange={e=>setEditorForm({...editorForm,activo:e.target.checked})}/></label>}<div className="row"><button className="button primary" disabled={busy}>Guardar cuenta</button><button type="button" onClick={()=>setEditorForm({nombre:'',email:'',password:'',completo:false,permisos:[],activo:true})}>Nueva cuenta</button></div></form></>
  : route && <><div className="editor-actions"><p>{active==='portada'?'Encabezado y presentación de la página':active==='productos'?'Fichas informativas por categoría':`Editar ${labels[active].toLowerCase()}`}</p>{active!=='portada'&&<button className="button primary" onClick={()=>open(null)}>+ Crear {active==='productos'?'producto':'contenido'}</button>}{active==='portada'&&!list.length&&<button className="button primary" onClick={()=>open(null)}>Crear portada</button>}</div>
  {active==='productos'&&<div className="category-block"><h2>Categorías</h2><div className="category-list">{(data.categorias||[]).map(c=><CategoryRow key={c.id} category={c} refresh={reload} setMessage={setMessage}/>)}</div><CategoryRow category={null} refresh={reload} setMessage={setMessage}/></div>}
  <div className="list-panel">{list.map(item=><button className="list-item" key={item.id} onClick={()=>open(item)}><span><b>{title(item)}</b> <small>#{item.id} · {item.estado|| (item.activa?'Activa':'Inactiva')}</small></span><span>Editar →</span></button>)}{!list.length&&<p className="empty">Aún no hay contenido en esta sección.</p>}</div>
  {draft&&<div className="form-panel"><div className="row spread"><h2>{draft.id?'Editar':'Crear'} {labels[active].toLowerCase()}</h2><button onClick={()=>{setDraft(null);setSelected(null);setPreview(false);setReviewed(false)}}>Cerrar ×</button></div>{active==='productos'&&<p className="hint">Guarde primero un borrador para asignar fotografías; después puede publicarlo.</p>}{fieldsets[route].map(([name,label,kind])=><Field key={name} name={name} label={label} kind={kind} value={draft[name]} onChange={(n,v)=>{setDraft({...draft,[n]:v});setPreview(false);setReviewed(false)}} data={data} disabled={active==='portada'&&name==='clave'}/>)}
  {['portada','productos','servicios','promociones'].includes(active)&&<div className="inline-image-tools"><h3>Imagen de este contenido</h3><p className="hint">Suba una fotografía aquí mismo; no necesita salir del formulario ni ir a la sección Imágenes.</p>{permitted('imagenes')?<form className="inline-image-form" onSubmit={uploadInlineImage}><label className="field">Archivo JPG, PNG o WebP (máximo 5 MB)<input type="file" accept="image/jpeg,image/png,image/webp" required onChange={e=>setInlineUpload({...inlineUpload,file:e.target.files?.[0]||null})}/></label><label className="field">Texto alternativo<input required maxLength="250" value={inlineUpload.alt} onChange={e=>setInlineUpload({...inlineUpload,alt:e.target.value})} placeholder="Describa la imagen"/></label><button className="button" type="submit" disabled={busy||!inlineUpload.file||!inlineUpload.alt.trim()}>Subir y asignar imagen</button></form>:<p className="hint">Su cuenta no tiene permiso para cargar imágenes. Solicite el permiso «Imágenes» o use una imagen ya cargada.</p>}{(active==='productos'?relationIds[0]:draft.imagenId)&&<div className="inline-image-preview"><span>Vista previa de la imagen asignada</span><Img id={active==='productos'?relationIds[0]:draft.imagenId} alt={imgAlt(active==='productos'?relationIds[0]:draft.imagenId)}/></div>}</div>}
  {active==='productos'&&<label className="field">Fotos (primera = portada)<select multiple size="5" value={relationIds.map(String)} onChange={e=>{setRelationIds([...e.target.selectedOptions].map(o=>Number(o.value)));setPreview(false);setReviewed(false)}}>{data.imagenes?.map(i=><option key={i.id} value={i.id}>{i.nombre} · {i.textoAlternativo}</option>)}</select><small>Puede subir imágenes aquí mismo. Use Ctrl o Cmd para seleccionar varias; la primera será la portada del producto.</small></label>}
  {active==='promociones'&&<><label className="field">Productos relacionados (opcional)<select multiple size="4" value={promoProducts.map(String)} onChange={e=>{setPromoProducts([...e.target.selectedOptions].map(o=>Number(o.value)));setPreview(false);setReviewed(false)}}>{data.productos?.map(p=><option key={p.id} value={p.id}>{p.nombre}</option>)}</select></label><label className="field">Servicios relacionados (opcional)<select multiple size="4" value={promoServices.map(String)} onChange={e=>{setPromoServices([...e.target.selectedOptions].map(o=>Number(o.value)));setPreview(false);setReviewed(false)}}>{data.servicios?.map(s=><option key={s.id} value={s.id}>{s.nombre}</option>)}</select></label></>}
  <div className="row"><button className="button" onClick={()=>{setPreview(true);setReviewed(true);setMessage('')}}>Vista previa</button><button className="button primary" disabled={busy} onClick={save}>Guardar {draft.estado==='Publicado'?'y publicar':''}</button></div></div>}
  {preview&&draft&&<div className="modal-backdrop" role="presentation" onMouseDown={()=>setPreview(false)}><div className="preview-modal" role="dialog" aria-modal="true" aria-label="Vista previa" onMouseDown={e=>e.stopPropagation()}><div className="row spread"><h2>Vista previa · {draft.estado}</h2><button onClick={()=>setPreview(false)}>Cerrar ×</button></div><div className="preview-card"><Img id={active==='productos'?relationIds[0]:draft.imagenId} alt={imgAlt(active==='productos'?relationIds[0]:draft.imagenId)}/><h3>{draft.nombre||draft.titulo||draft.clave}</h3><p>{draft.descripcion||draft.cuerpo}</p>{draft.condiciones&&<p><b>Condiciones:</b> {draft.condiciones}</p>}{active==='productos'&&<strong>{formattedPrice(draft.precioInformativo,draft.moneda)}</strong>}</div><p>Esta vista no publica ni guarda cambios.</p><button className="button primary" onClick={()=>setPreview(false)}>Volver a editar</button></div></div>}</>}
  </div></main></div>;
}
function CategoryRow({category,refresh,setMessage}) {
 const [value,setValue]=useState(category||{nombre:'',orden:0,activa:true});
 useEffect(()=>setValue(category||{nombre:'',orden:0,activa:true}),[category]);
 async function save(e){e.preventDefault();try{await api('/admin/categorias'+(category?'/'+category.id:''),{method:category?'PUT':'POST',...json(value)});await refresh();setMessage('Categoría guardada.');if(!category)setValue({nombre:'',orden:0,activa:true})}catch(e){setMessage(e.message)}}
 return <form className="category-row" onSubmit={save}><input aria-label="Nombre de categoría" required placeholder="Nombre de categoría" value={value.nombre} onChange={e=>setValue({...value,nombre:e.target.value})}/><input aria-label="Orden" type="number" min="0" value={value.orden} onChange={e=>setValue({...value,orden:Number(e.target.value)})}/><label><input type="checkbox" checked={value.activa} onChange={e=>setValue({...value,activa:e.target.checked})}/> Activa</label><button>{category?'Guardar':'Añadir'}</button></form>
}
function App(){
 const [path,setPath]=useState(location.pathname), [account,setAccount]=useState(null),[data,setData]=useState(null),[error,setError]=useState(''),[loading,setLoading]=useState(true),[login,setLogin]=useState({email:'',password:''});
 const navigate=p=>{history.pushState({},'',p);setPath(p)};
 useEffect(()=>{const fn=()=>setPath(location.pathname);window.addEventListener('popstate',fn);return()=>window.removeEventListener('popstate',fn)},[]);
 useEffect(()=>{Promise.allSettled([api('/publico'),api('/session')]).then(([pub,user])=>{if(pub.status==='fulfilled')setData(pub.value);else setError('No se pudo cargar la página. Compruebe que la API esté en ejecución.');if(user.status==='fulfilled')setAccount(user.value);setLoading(false)})},[]);
 useEffect(()=>{if(!loading&&!account&&path.startsWith('/contenido'))navigate('/login')},[loading,account,path]);
 async function submit(e){e.preventDefault();setError('');try{const u=await api('/login',{method:'POST',...json(login)});setAccount(u);navigate('/contenido/portada')}catch{setError('Correo o contraseña incorrectos.')}}
 async function logout(){await api('/logout',{method:'POST'});setAccount(null);navigate('/login')}
 if(loading)return <div className="center-state" role="status">Cargando Bazar Nazareth…</div>;
 if(path.startsWith('/contenido')&&!account)return <div className="center-state" role="status">Redirigiendo al acceso…</div>;
 if(path.startsWith('/contenido'))return <Editor account={account} navigate={navigate} logout={logout} path={path}/>;
 if(path==='/login')return <div className="login-screen"><form className="login-card" onSubmit={submit}><a href="/">← Volver al sitio</a><span className="eyebrow">BAZAR NAZARETH</span><h1>Acceso al editor</h1>{error&&<p role="alert">{error}</p>}<label>Correo electrónico<input autoComplete="username" type="email" required value={login.email} onChange={e=>setLogin({...login,email:e.target.value})}/></label><label>Contraseña<input autoComplete="current-password" type="password" required value={login.password} onChange={e=>setLogin({...login,password:e.target.value})}/></label><button className="button primary">Iniciar sesión</button></form></div>;
 if(error)return <div className="center-state" role="alert">{error}</div>;
 return data?<Public data={data}/>:<div className="center-state">Sin datos disponibles.</div>;
}
createRoot(document.getElementById('root')).render(<App/>);
