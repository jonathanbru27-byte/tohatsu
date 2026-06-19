'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Edit2, Trash2, Calendar as CalIcon, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { AdminGuard } from '@/components/AdminGuard';
import { getCalendar, createEvento, updateEvento, deleteEvento, type CalendarioEvento } from '@/lib/api';
import { MES_NAMES_SHORT } from '@/lib/utils';

const EMPTY = { titulo: '', fecha: '', hora: '', localidad: '', descripcion: '' };

function CalendarAdminInner() {
  const router = useRouter();
  const [items, setItems] = useState<CalendarioEvento[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = () => { setLoading(true); getCalendar().then((d) => setItems(d.sort((a, b) => a.fecha.localeCompare(b.fecha)))).finally(() => setLoading(false)); };
  useEffect(load, []);

  const startAdd = () => { setForm(EMPTY); setEditingId(null); setOpen(true); };
  const startEdit = (e: CalendarioEvento) => {
    setForm({ titulo: e.titulo || '', fecha: e.fecha, hora: e.hora || '', localidad: e.localidad, descripcion: e.descripcion });
    setEditingId(e.id!);
    setOpen(true);
  };

  const submit = async () => {
    if (!form.titulo || !form.fecha || !form.localidad) {
      toast.error('Completa título, fecha y lugar');
      return;
    }
    setSaving(true);
    try {
      if (editingId) await updateEvento(editingId, form);
      else await createEvento(form);
      setOpen(false); setEditingId(null); setForm(EMPTY); load();
      toast.success('Evento guardado');
    } catch { toast.error('No se pudo guardar'); }
    finally { setSaving(false); }
  };

  const remove = (e: CalendarioEvento) => {
    if (!confirm(`¿Eliminar "${e.titulo || e.localidad}"?`)) return;
    deleteEvento(e.id!).then(() => { toast.success('Eliminado'); load(); }).catch(() => toast.error('No se pudo eliminar'));
  };

  return (
    <div className="min-h-full bg-slate-50">
      <header className="flex items-center justify-between border-b border-slate-100 bg-white p-4">
        <button onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-slate-100"><ArrowLeft size={22} className="text-[#0066cc]" /></button>
        <h1 className="text-[16px] font-extrabold text-slate-900">Gestionar Calendario</h1>
        <button onClick={startAdd} className="flex h-10 w-10 items-center justify-center rounded-full text-[#0066cc] hover:bg-slate-100" data-testid="add-evento-button"><Plus size={26} /></button>
      </header>

      <div className="p-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-16"><div className="h-10 w-10 animate-spin rounded-full border-4 border-[#0066cc] border-t-transparent" /></div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center py-16">
            <CalIcon size={56} className="text-slate-300" />
            <p className="mt-4 text-sm font-semibold text-slate-600">No hay eventos programados</p>
            <button onClick={startAdd} className="mt-4 rounded-full bg-[#0066cc] px-5 py-2.5 text-sm font-bold text-white">Agregar evento</button>
          </div>
        ) : (
          items.map((e) => {
            const [_, m, d] = e.fecha.split('-');
            return (
              <div key={e.id} className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-100">
                <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-brand-red text-white">
                  <span className="text-[20px] font-black leading-none">{d}</span>
                  <span className="mt-0.5 text-[10px] font-extrabold tracking-wide">{MES_NAMES_SHORT[parseInt(m,10)-1] || ''}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-bold text-slate-900">{e.titulo || 'Sin título'}</p>
                  <p className="text-[11px] text-slate-500">{e.hora ? `${e.hora} • ` : ''}{e.localidad}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <button onClick={() => startEdit(e)} className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-[#0066cc] hover:bg-blue-100"><Edit2 size={16} /></button>
                  <button onClick={() => remove(e)} className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100"><Trash2 size={16} /></button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div className="absolute inset-0 bg-black/55" onClick={() => !saving && setOpen(false)} />
          <div className="relative z-10 w-full max-w-[480px] rounded-t-3xl bg-white px-5 pb-5 pt-3 shadow-2xl sm:rounded-3xl">
            <div className="mx-auto mb-3 h-1 w-10 rounded bg-slate-200" />
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-[18px] font-extrabold text-slate-900">{editingId ? 'Editar evento' : 'Nuevo evento'}</h3>
              <button onClick={() => setOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-100"><X size={20} /></button>
            </div>
            <div className="space-y-3">
              <div><label className="label">Título *</label><input className="input mt-1" value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} placeholder="Ej: Jornada de Mantenimiento" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Fecha *</label><input type="date" className="input mt-1" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} /></div>
                <div><label className="label">Hora</label><input type="time" className="input mt-1" value={form.hora} onChange={(e) => setForm({ ...form, hora: e.target.value })} /></div>
              </div>
              <div><label className="label">Lugar *</label><input className="input mt-1" value={form.localidad} onChange={(e) => setForm({ ...form, localidad: e.target.value })} placeholder="Ej: Guayaquil - Puerto Marítimo" /></div>
              <div><label className="label">Descripción</label><textarea className="input mt-1 min-h-[80px]" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} placeholder="Detalles del evento" /></div>
              <button onClick={submit} disabled={saving} className="btn-primary mt-2 w-full">
                {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : 'GUARDAR EVENTO'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default function CalendarAdminPage() { return <AdminGuard><CalendarAdminInner /></AdminGuard>; }
