'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { AdminGuard } from '@/components/AdminGuard';
import { ImagePicker } from '@/components/ImagePicker';
import { CATEGORIAS_REPUESTO, cn } from '@/lib/utils';
import { createRepuesto, updateRepuesto, getRepuestos, type Repuesto } from '@/lib/api';

interface Props { mode: 'add' | 'edit'; }

export function RepuestoFormPage({ mode }: Props) {
  const router = useRouter();
  const params = useParams() as { id?: string };
  const id = params?.id;
  const [loading, setLoading] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
  nombre: '', descripcion: '', precio: '', imagen: '', categoria: 'General', stock: '0', modelos_compatibles: '', codigo: '',
  });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (mode === 'edit' && id) {
      getRepuestos().then((all) => {
        const r = all.find((x) => x.id === id);
        if (r) setForm({
          nombre: r.nombre, descripcion: r.descripcion, precio: String(r.precio),
          imagen: r.imagen || '', categoria: r.categoria || 'General', stock: String(r.stock || 0), modelos_compatibles: r.modelos_compatibles || '', codigo: r.codigo || '',
        });
      }).catch(() => toast.error('No se pudo cargar')).finally(() => setLoading(false));
    }
  }, [mode, id]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre || !form.descripcion || !form.precio) {
      toast.error('Completa nombre, descripción y precio');
      return;
    }
    setSaving(true);
    try {
      const payload: Omit<Repuesto, 'id'> = {
        nombre: form.nombre, descripcion: form.descripcion,
        precio: parseFloat(form.precio), imagen: form.imagen, categoria: form.categoria,
        stock: parseInt(form.stock) || 0,
        modelos_compatibles: form.modelos_compatibles,
        codigo: form.codigo,
      };
      if (mode === 'edit' && id) await updateRepuesto(id, payload);
      else await createRepuesto(payload);
      toast.success(mode === 'edit' ? 'Cambios guardados' : 'Repuesto creado');
      router.back();
    } catch {
      toast.error('No se pudo guardar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-[#0066cc] border-t-transparent" /></div>;

  return (
    <div className="min-h-full bg-slate-50">
      <header className="flex items-center justify-between border-b border-slate-100 bg-white p-4">
        <button onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-slate-100"><ArrowLeft size={22} className="text-[#0066cc]" /></button>
        <h1 className="text-[16px] font-extrabold text-slate-900">{mode === 'edit' ? 'Editar Repuesto' : 'Agregar Repuesto'}</h1>
        <div className="w-9" />
      </header>

      <form onSubmit={submit} className="space-y-4 p-4 pb-10">
        <ImagePicker value={form.imagen} onChange={(v) => set('imagen', v)} aspectRatio="1/1" testID="repuesto-image-input" />

        <div><label className="label">Nombre *</label><input className="input mt-1" value={form.nombre} onChange={(e) => set('nombre', e.target.value)} placeholder="Ej: Filtro de aceite OEM" /></div>
        <div><label className="label">Descripción *</label><textarea className="input mt-1 min-h-[100px]" value={form.descripcion} onChange={(e) => set('descripcion', e.target.value)} placeholder="Descripción, compatibilidades, etc." /></div>
        <div><label className="label">Precio (USD) *</label><input className="input mt-1" type="number" value={form.precio} onChange={(e) => set('precio', e.target.value)} placeholder="28.50" step="0.01" /></div>

        <div>
          <label className="label">Categoría</label>
          <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto">
            {CATEGORIAS_REPUESTO.map((c) => {
              const sel = form.categoria === c;
              return (
                <button key={c} type="button" onClick={() => set('categoria', c)} className={cn('whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-bold transition', sel ? 'border-brand-navy bg-brand-navy text-white' : 'border-slate-200 bg-white text-slate-600')}>
                  {c}
                </button>
              );
            })}
          </div>
        </div>
        <div><label className="label">Código de repuesto</label><input className="input mt-1" value={form.codigo} onChange={(e) => set('codigo', e.target.value)} placeholder="Ej: 3V9-01453-1" /></div>
        <div><label className="label">Modelos compatibles</label><input className="input mt-1" value={form.modelos_compatibles} onChange={(e) => set('modelos_compatibles', e.target.value)} placeholder="Ej: MFS30, MFS40, MX40" /></div>
        <div><label className="label">Stock disponible</label><input className="input mt-1" type="number" value={form.stock} onChange={(e) => set('stock', e.target.value)} placeholder="25" /></div>

        <button type="submit" disabled={saving} className="btn-primary w-full">
          {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : (<><Save size={18} />{mode === 'edit' ? 'GUARDAR CAMBIOS' : 'CREAR REPUESTO'}</>)}
        </button>
      </form>
    </div>
  );
}

export function withAdminGuard(C: React.FC<Props>, mode: Props['mode']) {
  return () => (<AdminGuard><C mode={mode} /></AdminGuard>);
}
