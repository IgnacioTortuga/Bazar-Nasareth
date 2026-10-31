import { useState } from 'react';
import { api, json } from '../../shared/api.js';

export default function useAccounts({ setBusy, setMessage, setData }) {
  const [editorForm, setEditorForm] = useState({
    nombre: '',
    email: '',
    password: '',
    completo: false,
    permisos: [],
    activo: true,
  });
  async function saveEditor(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const id = editorForm.id;
      await api('/admin/editores' + (id ? '/' + id : ''), {
        method: id ? 'PUT' : 'POST',
        ...json(editorForm),
      });
      setEditorForm({
        nombre: '',
        email: '',
        password: '',
        completo: false,
        permisos: [],
        activo: true,
      });
      setData((d) => ({ ...d, editores: undefined }));
      await loadEditors();
      setMessage('Cuenta guardada.');
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function loadEditors() {
    try {
      const list = await api('/admin/editores');
      setData((d) => ({ ...d, editores: list }));
    } catch (e) {
      setMessage(e.message);
    }
  }

  return { editorForm, setEditorForm, saveEditor, loadEditors };
}
