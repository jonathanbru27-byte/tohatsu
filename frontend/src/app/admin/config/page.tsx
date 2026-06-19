'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, User, Wrench, Hammer } from 'lucide-react';
import { toast } from 'sonner';
import { AdminGuard } from '@/components/AdminGuard';
import { getConfig, updateConfig, type Configuracion } from '@/lib/api';

function ConfigInner() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Configuracion>({ whatsapp_ventas: '', whatsapp_repuestos: '', whatsapp_servicio: '' });

  useEffect(() => {
    getConfig().then(setForm).catch(() => toast.error('Error al cargar')).finally(() => setLoading(false));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.whatsapp_ventas || !form.whatsapp_repuestos || !form.whatsapp_servicio) {
      toast.error('Completa todos los campos');
      return;
    }
    setSaving(true);
    try { await updateConfig(form); toast.success('Configuración guardada'); }
    catch { toast.error('No se pudo guardar'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" /></div>;

  const fields = [
    { key: 'whatsapp_ventas' as const, label: 'Ventas / Asesores', icon: User, color: 'text-[#0066cc]' },
    { key: 'whatsapp_repuestos' as const, label: 'Repuestos', icon: Wrench, color: 'text-emerald-600' },
    { key: 'whatsapp_servicio' as const, label: 'Servicio Técnico', icon: Hammer, color: 'text-orange-500' },
  ];

  return (
    <div className="min-h-full bg-slate-50">
      <header className="flex items-center justify-between border-b border-slate-100 bg-white p-4">
        <button onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-slate-100"><ArrowLeft size={22} className="text-orange-500" /></button>
        <h1 className="text-[16px] font-extrabold text-slate-900">Configuración</h1>
        <div className="w-9" />
      </header>

      <form onSubmit={submit} className="p-4">
        <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-100">
          <p className="text-[16px] font-bold text-slate-900">Números de WhatsApp generales</p>
          <p className="mt-1 text-[12px] text-slate-500">Estos son los números de respaldo. Si hay un asesor para la provincia del cliente, ese tendrá prioridad.</p>

          <div className="mt-5 space-y-4">
            {fields.map(({ key, label, icon: Icon, color }) => (
              <div key={key}>
                <div className="flex items-center gap-2">
                  <Icon size={18} className={color} />
                  <span className="text-[14px] font-bold text-slate-800">{label}</span>
                </div>
                <input className="input mt-2" inputMode="tel" value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} placeholder="593999999999" data-testid={`config-${key}`} />
              </div>
            ))}
          </div>
        </div>

        <button type="submit" disabled={saving} className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0066cc] py-4 text-[15px] font-bold text-white disabled:opacity-70" data-testid="config-save">
          {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : (<><Save size={18} />Guardar Configuración</>)}
        </button>
      </form>
    </div>
  );
}
export default function ConfigPage() { return <AdminGuard><ConfigInner /></AdminGuard>; }
