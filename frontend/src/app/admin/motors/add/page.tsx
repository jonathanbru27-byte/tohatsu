'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { AdminGuard } from '@/components/AdminGuard';
import { ImagePicker } from '@/components/ImagePicker';
import { createMotor, type Motor } from '@/lib/api';

function AddMotorInner() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    modelo: '', potencia: '', hp_value: '', tipo: '', cilindrada: '', peso_seco: '',
    sistema: '', badge_text: 'JAPAN TECH', caracteristicas: '',
    precio: '', imagen: '', financiamiento_entrada: '', financiamiento_cuotas: '30',
  });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.modelo || !form.potencia || !form.precio || !form.imagen) {
      toast.error('Completa modelo, potencia, precio e imagen');
      return;
    }
    setSaving(true);
    try {
      const payload: Omit<Motor, 'id'> = {
        modelo: form.modelo, potencia: form.potencia,
        hp_value: parseInt(form.hp_value) || 0,
        tipo: form.tipo, cilindrada: form.cilindrada, peso_seco: form.peso_seco, sistema: form.sistema,
        badge_text: form.badge_text || 'JAPAN TECH', caracteristicas: form.caracteristicas,
        precio: parseFloat(form.precio), imagen: form.imagen,
        financiamiento_entrada: parseFloat(form.financiamiento_entrada) || 0,
        financiamiento_cuotas: parseInt(form.financiamiento_cuotas) || 30,
      };
      await createMotor(payload);
      toast.success('Motor creado correctamente');
      router.back();
    } catch {
      toast.error('No se pudo guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-full bg-slate-50">
      <header className="flex items-center justify-between border-b border-slate-100 bg-white p-4">
        <button onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-slate-100"><ArrowLeft size={22} className="text-[#0066cc]" /></button>
        <h1 className="text-[16px] font-extrabold text-slate-900">Agregar Motor</h1>
        <div className="w-9" />
      </header>

      <form onSubmit={submit} className="space-y-4 p-4 pb-10">
        <ImagePicker value={form.imagen} onChange={(v) => set('imagen', v)} aspectRatio="4/5" testID="motor-image-input" />

        {[
          ['Modelo *', 'modelo', 'Ej: Tohatsu MFS140A', 'text'],
          ['Potencia *', 'potencia', 'Ej: 148 HP', 'text'],
          ['HP (número) *', 'hp_value', 'Ej: 148', 'number'],
          ['Tipo', 'tipo', 'Ej: 4 Tiempos - Inyección Electrónica', 'text'],
          ['Cilindrada', 'cilindrada', 'Ej: 1995 cc', 'text'],
          ['Peso seco', 'peso_seco', 'Ej: 186 kg', 'text'],
          ['Sistema', 'sistema', 'Ej: EFI', 'text'],
          ['Texto del Badge', 'badge_text', 'Ej: JAPAN TECH', 'text'],
          ['Precio (USD) *', 'precio', 'Ej: 14998', 'number'],
          ['Entrada mínima', 'financiamiento_entrada', 'Ej: 2998', 'number'],
          ['Cuotas máximas', 'financiamiento_cuotas', 'Ej: 30', 'number'],
        ].map(([label, key, ph, type]) => (
          <div key={key as string}>
            <label className="label">{label}</label>
            <input className="input mt-1" type={type as string} value={(form as any)[key as string]} onChange={(e) => set(key as string, e.target.value)} placeholder={ph as string} data-testid={`motor-${key}`} />
          </div>
        ))}

        <div>
          <label className="label">Características</label>
          <textarea className="input mt-1 min-h-[100px]" value={form.caracteristicas} onChange={(e) => set('caracteristicas', e.target.value)} placeholder="Descripción detallada" data-testid="motor-caracteristicas" />
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full" data-testid="motor-submit">
          {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : (<><Save size={18} />CREAR MOTOR</>)}
        </button>
      </form>
    </div>
  );
}

export default function AddMotorPage() { return <AdminGuard><AddMotorInner /></AdminGuard>; }
