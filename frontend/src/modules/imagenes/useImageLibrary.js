import { useState } from 'react';
import { api, json } from '../../shared/api.js';
import { labels } from '../../app/adminConfig.js';
export default function useImageLibrary({
  data,
  permitted,
  reload,
  setMessage,
  setBusy,
}) {
  const [upload, setUpload] = useState({ file: null, alt: '' });
  async function uploadImage(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const body = new FormData();
      body.append('archivo', upload.file);
      body.append('textoAlternativo', upload.alt);
      await api('/admin/imagenes', { method: 'POST', body });
      setUpload({ file: null, alt: '' });
      e.target.reset();
      await reload();
      setMessage(
        'Imagen cargada. Selecciónela en el contenido que desea cambiar.',
      );
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function replaceImage(img, usage, file) {
    if (!file) return;
    if (!permitted(usage.permission)) {
      setMessage(
        `Su cuenta necesita permiso de ${labels[usage.permission]} para cambiar esta referencia.`,
      );
      return;
    }
    if (
      !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
      file.size > 5 * 1024 * 1024
    ) {
      setMessage('No se pudo cargar. Use JPG, PNG o WebP de hasta 5 MB.');
      return;
    }
    const alt =
      file.name
        .replace(/\.[^.]+$/, '')
        .replace(/[-_]+/g, ' ')
        .trim() || `Fotografía de ${usage.title}`;
    setMessage(
      `Subiendo «${file.name}» y reemplazando la foto solo en ${usage.section}…`,
    );
    setBusy(true);
    try {
      const body = new FormData();
      body.append('archivo', file);
      body.append('textoAlternativo', alt);
      const replacement = await api('/admin/imagenes', {
        method: 'POST',
        body,
      });
      if (usage.kind === 'producto') {
        const ids = (data.relaciones?.productoImagenes || [])
          .filter((x) => x.productoId === usage.id)
          .sort((a, b) => a.orden - b.orden)
          .map((x) => (x.imagenId === img.id ? replacement.id : x.imagenId));
        await api(`/admin/productos/${usage.id}/imagenes`, {
          method: 'PUT',
          ...json(ids),
        });
      } else {
        const route =
          usage.kind === 'seccion'
            ? 'secciones'
            : usage.kind === 'galeria'
              ? 'galeria'
              : usage.kind === 'servicio'
                ? 'servicios'
                : 'promociones';
        const item = data[route]?.find((x) => x.id === usage.id);
        if (!item)
          throw new Error(
            'No se encontró el contenido que usa esta fotografía.',
          );
        await api(`/admin/${route}/${usage.id}`, {
          method: 'PUT',
          ...json({ ...item, imagenId: replacement.id }),
        });
      }
      await reload();
      setMessage(
        `«${file.name}» se cargó como una fotografía nueva y ahora se usa en «${usage.title}». Se conservaron el título, el estado y el orden; los demás usos mantienen la foto anterior.`,
      );
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }
  async function removeImage(id) {
    if (imageUsages(id).length) {
      setMessage('Esta foto está en uso. Cámbiela o quítela de los contenidos indicados antes de eliminarla.');
      return;
    }
    setBusy(true);
    try {
      await api('/admin/imagenes/' + id, { method: 'DELETE' });
      await reload();
      setMessage('Imagen eliminada.');
      return true;
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function saveAlt(id, alt) {
    setBusy(true);
    try {
      await api('/admin/imagenes/' + id, {
        method: 'PUT',
        ...json({ textoAlternativo: alt.trim() }),
      });
      await reload();
      setMessage('Descripción de la foto guardada.');
      return true;
    } catch (e) {
      setMessage(e.message);
      return false;
    } finally {
      setBusy(false);
    }
  }

  const title = (x) => x.nombre || x.titulo || x.clave || `Fotografía ${x.id}`;
  const imageUsages = (id) => [
    ...(data.relaciones?.productoImagenes || [])
      .filter((x) => x.imagenId === id)
      .map((x) => ({
        kind: 'producto',
        id: x.productoId,
        title: title(
          data.productos?.find((p) => p.id === x.productoId) || {
            id: x.productoId,
          },
        ),
        section: 'Productos',
        permission: 'productos',
      })),
    ...(data.servicios || [])
      .filter((x) => x.imagenId === id)
      .map((x) => ({
        kind: 'servicio',
        id: x.id,
        title: title(x),
        section: 'Servicios',
        permission: 'servicios',
      })),
    ...(data.promociones || [])
      .filter((x) => x.imagenId === id)
      .map((x) => ({
        kind: 'promocion',
        id: x.id,
        title: title(x),
        section: 'Promoción',
        permission: 'promociones',
      })),
    ...(data.galeria || [])
      .filter((x) => x.imagenId === id)
      .map((x) => ({
        kind: 'galeria',
        id: x.id,
        title: title(x),
        section: 'Galería',
        permission: 'galeria',
      })),
    ...(data.secciones || [])
      .filter((x) => x.imagenId === id)
      .map((x) => ({
        kind: 'seccion',
        id: x.id,
        title: title(x),
        section: x.clave === 'portada' ? 'Inicio' : 'Textos',
        permission: 'textos',
      })),
  ];
  return {
    upload,
    setUpload,
    uploadImage,
    replaceImage,
    removeImage,
    saveAlt,
    imageUsages,
  };
}
