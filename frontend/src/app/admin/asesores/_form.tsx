'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { AdminGuard } from '@/components/AdminGuard';
import { createAsesor, updateAsesor, getAsesores, type Asesor } from '@/lib/api';
import { PROVINCIAS, cleanPhone, cn } from '@/lib/utils';

export function AsesorFormPage({ mode }: { mode: 'add' | 'edit' }) {
  const router = useRouter();
  const params = useParams() as { id?: string };
  const id = params?.id;
  const [loading, setLoading] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<{ nombre: string; whatsapp: string; provincia: string }>({
    nombre: '', whatsapp: '', provincia: '',
  });

  useEffect(() => {
    if (mode === 'edit' && id) {
      getAsesores().then((all) => {
        const a = all.find((x) => x.id === id);
        if (a) setForm({ nombre: a.nombre, whatsapp: a.whatsapp, provincia: a.provincia });
        else toast.error('Asesor no encontrado');
      }).catch(() => toast.error('No se pudo cargar')).finally(() => setLoading(false));
    }
  }, [mode, id]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim() || !form.whatsapp.trim() || !form.provincia) {
      toast.error('Completa nombre, WhatsApp y selecciona provincia');
      return;
    }
    const phone = cleanPhone(form.whatsapp);
    if (phone.length < 8) {
      toast.error('Ingresa un WhatsApp válido con código de país');
      return;
    }
    setSaving(true);
    try {
      const payload: Omit<Asesor, 'id'> = { nombre: form.nombre.trim(), whatsapp: phone, provincia: form.provincia };
      if (mode === 'edit' && id) await updateAsesor(id, payload);
      else await createAsesor(payload);
      toast.success(mode === 'edit' ? 'Asesor actualizado' : 'Asesor creado');
      router.back();
    } catch {
      toast.error('No se pudo guardar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" /></div>;

  return (
    <div className="min-h-full bg-slate-50">
      <header className="flex items-center justify-between border-b border-slate-100 bg-white p-4">
        <button onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-slate-100"><ArrowLeft size={22} className="text-purple-600" /></button>
        <h1 className="text-[16px] font-extrabold text-slate-900">{mode === 'edit' ? 'Editar Asesor' : 'Nuevo Asesor'}</h1>
        <div className="w-9" />
      </header>

      <form onSubmit={submit} className="space-y-4 p-4 pb-10">
        <div>
          <label className="label">Nombre del asesor</label>
          <input className="input mt-1" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ej. Juan Pérez" data-testid="asesor-nombre-input" />
        </div>
        <div>
          <label className="label">WhatsApp (con código de país)</label>
          <input className="input mt-1" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} placeholder="Ej. 593991234567" inputMode="tel" data-testid="asesor-whatsapp-input" />
          <p className="mt-1 text-[11px] text-slate-500">Incluye código de país sin (+). Ecuador: 593.</p>
        </div>
        <div>
          <label className="label">Provincia asignada</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {PROVINCIAS.map((p) => {
              const sel = form.provincia === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setForm({ ...form, provincia: p })}
                  className={cn('rounded-full border-[1.5px] px-3 py-1.5 text-xs font-semibold transition', sel ? 'border-brand-red bg-red-50 text-brand-red' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300')}
                  data-testid={`asesor-provincia-${p}`}
                >
                  {p}
                </button>
              );
            })}
          </div>
        </div>
        <button type="submit" disabled={saving} className="btn-secondary w-full" data-testid="asesor-submit-button">
          {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : (<><Save size={18} />{mode === 'edit' ? 'GUARDAR CAMBIOS' : 'CREAR ASESOR'}</>)}
        </button>
      </form>
    </div>
  );
}

export function _unused() { return <AdminGuard><div /></AdminGuard>; }
