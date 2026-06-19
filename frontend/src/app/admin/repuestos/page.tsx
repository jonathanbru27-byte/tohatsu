'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Edit2, Trash2, Wrench, Package } from 'lucide-react';
import { toast } from 'sonner';
import { AdminGuard } from '@/components/AdminGuard';
import { getRepuestos, deleteRepuesto, type Repuesto } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

function RepuestosListInner() {
  const router = useRouter();
  const [items, setItems] = useState<Repuesto[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => { setLoading(true); getRepuestos().then(setItems).catch(() => toast.error('Error al cargar')).finally(() => setLoading(false)); };
  useEffect(load, []);

  const handleDelete = (id: string) => {
    if (!confirm('¿Eliminar este repuesto?')) return;
    deleteRepuesto(id).then(() => { toast.success('Repuesto eliminado'); load(); }).catch(() => toast.error('No se pudo eliminar'));
  };

  return (
    <div className="min-h-full bg-slate-50">
      <header className="flex items-center justify-between border-b border-slate-100 bg-white p-4">
        <button onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-slate-100"><ArrowLeft size={22} className="text-[#0066cc]" /></button>
        <h1 className="text-[16px] font-extrabold text-slate-900">Gestionar Repuestos</h1>
        <Link href="/admin/repuestos/add" className="flex h-10 w-10 items-center justify-center rounded-full text-[#0066cc] hover:bg-slate-100" data-testid="add-repuesto-button"><Plus size={26} /></Link>
      </header>

      <div className="p-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-16"><div className="h-10 w-10 animate-spin rounded-full border-4 border-[#0066cc] border-t-transparent" /></div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center py-16">
            <Wrench size={56} className="text-slate-300" />
            <p className="mt-4 text-sm font-semibold text-slate-600">No hay repuestos registrados</p>
            <Link href="/admin/repuestos/add" className="mt-4 rounded-full bg-[#0066cc] px-5 py-2.5 text-sm font-bold text-white">Agregar repuesto</Link>
          </div>
        ) : (
          items.map((r) => (
            <div key={r.id} className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-100">
              {r.imagen ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={r.imagen} alt="" className="h-16 w-16 rounded-lg bg-slate-100 object-cover" />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-slate-100"><Package size={24} className="text-slate-400" /></div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-bold text-slate-900">{r.nombre}</p>
                <p className="text-[11px] text-slate-500">{r.categoria || 'General'} • Stock: {r.stock || 0}</p>
                <p className="mt-0.5 text-[14px] font-extrabold text-[#0066cc]">{formatCurrency(r.precio)}</p>
              </div>
              <div className="flex flex-col gap-2">
                <Link href={`/admin/repuestos/edit/${r.id}`} className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-[#0066cc] hover:bg-blue-100"><Edit2 size={16} /></Link>
                <button onClick={() => handleDelete(r.id!)} className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100"><Trash2 size={16} /></button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
export default function RepuestosListPage() { return <AdminGuard><RepuestosListInner /></AdminGuard>; }
