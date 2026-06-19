'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { AdminGuard } from '@/components/AdminGuard';
import { ImagePicker } from '@/components/ImagePicker';
import { getMotor, updateMotor, type Motor } from '@/lib/api';

function EditMotorInner() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>(null);

  useEffect(() => {
    getMotor(id).then((m) => {
      setForm({
        modelo: m.modelo, potencia: m.potencia, hp_value: String(m.hp_value || 0),
        tipo: m.tipo || '', cilindrada: m.cilindrada || '', peso_seco: m.peso_seco || '',
        sistema: m.sistema || '', badge_text: m.badge_text || 'JAPAN TECH',
        caracteristicas: m.caracteristicas || '',
        precio: String(m.precio), imagen: m.imagen,
        financiamiento_entrada: String(m.financiamiento_entrada),
        financiamiento_cuotas: String(m.financiamiento_cuotas),
      });
    }).catch(() => toast.error('No se pudo cargar')).finally(() => setLoading(false));
  }, [id]);

  const set = (k: string, v: string) => setForm((f: any) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.modelo || !form.potencia || !form.precio || !form.imagen) {
      toast.error('Faltan campos obligatorios');
      return;
    }
    setSaving(true);
    try {
      const payload: Omit<Motor, 'id'> = {
        modelo: form.modelo, potencia: form.potencia,
        hp_value: parseInt(form.hp_value) || 0,
        tipo: form.tipo, cilindrada: form.cilindrada, peso_seco: form.peso_seco, sistema: form.sistema,
        badge_text: form.badge_text, caracteristicas: form.caracteristicas,
        precio: parseFloat(form.precio), imagen: form.imagen,
        financiamiento_entrada: parseFloat(form.financiamiento_entrada) || 0,
        financiamiento_cuotas: parseInt(form.financiamiento_cuotas) || 30,
      };
      await updateMotor(id, payload);
      toast.success('Cambios guardados');
      router.back();
    } catch {
      toast.error('No se pudo guardar');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) return (
    <div className="flex min-h-[60vh] items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-[#0066cc] border-t-transparent" /></div>
  );

  return (
    <div className="min-h-full bg-slate-50">
      <header className="flex items-center justify-between border-b border-slate-100 bg-white p-4">
        <button onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-slate-100"><ArrowLeft size={22} className="text-[#0066cc]" /></button>
        <h1 className="text-[16px] font-extrabold text-slate-900">Editar Motor</h1>
        <div className="w-9" />
      </header>

      <form onSubmit={submit} className="space-y-4 p-4 pb-10">
        <ImagePicker value={form.imagen} onChange={(v) => set('imagen', v)} aspectRatio="4/5" />

        {[
          ['Modelo *', 'modelo'], ['Potencia *', 'potencia'], ['HP (número)', 'hp_value'],
          ['Tipo', 'tipo'], ['Cilindrada', 'cilindrada'], ['Peso seco', 'peso_seco'],
          ['Sistema', 'sistema'], ['Texto Badge', 'badge_text'], ['Precio (USD) *', 'precio'],
          ['Entrada mínima', 'financiamiento_entrada'], ['Cuotas máximas', 'financiamiento_cuotas'],
        ].map(([label, key]) => (
          <div key={key}>
            <label className="label">{label}</label>
            <input className="input mt-1" value={form[key]} onChange={(e) => set(key, e.target.value)} />
          </div>
        ))}

        <div>
          <label className="label">Características</label>
          <textarea className="input mt-1 min-h-[100px]" value={form.caracteristicas} onChange={(e) => set('caracteristicas', e.target.value)} />
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full">
          {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : (<><Save size={18} />GUARDAR CAMBIOS</>)}
        </button>
      </form>
    </div>
  );
}

export default function EditMotorPage() { return <AdminGuard><EditMotorInner /></AdminGuard>; }
