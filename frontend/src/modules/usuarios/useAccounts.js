import { useState } from 'react';
import { api, json } from '../../shared/api.js';

export default function useAccounts({ setBusy, setMessage, setData }) {
  const emptyAccount = () => ({
    nombre: '',
    email: '',
    password: '',
    completo: false,
    permisos: [],
    activo: true,
  });
  const [editorForm, setEditorForm] = useState(emptyAccount);
  const [baseline, setBaseline] = useState(emptyAccount);
  const accountDirty = JSON.stringify(editorForm) !== JSON.stringify(baseline);
  function resetAccount() {
    const empty = emptyAccount();
    setEditorForm(empty);
    setBaseline(empty);
  }
  function openAccount(account) {
    if (
      accountDirty &&
      !confirm(
        'Hay cambios en esta cuenta sin guardar. ¿Descartarlos para abrir otra cuenta?',
      )
    )
      return;
    const next = account
      ? {
          ...account,
          password: '',
          permisos: account.permisos ? account.permisos.split(',') : [],
        }
      : emptyAccount();
    setEditorForm(next);
    setBaseline(structuredClone(next));
  }
  async function saveEditor(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const id = editorForm.id;
      await api('/admin/editores' + (id ? '/' + id : ''), {
        method: id ? 'PUT' : 'POST',
        ...json(editorForm),
      });
      resetAccount();
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

  return {
    editorForm,
    setEditorForm,
    saveEditor,
    loadEditors,
    accountDirty,
    resetAccount,
    openAccount,
  };
}
