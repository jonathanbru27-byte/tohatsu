'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Edit2, Trash2, Users, MapPin, Phone, UserCircle } from 'lucide-react';
import { toast } from 'sonner';
import { AdminGuard } from '@/components/AdminGuard';
import { getAsesores, deleteAsesor, type Asesor } from '@/lib/api';

function AsesoresListInner() {
  const router = useRouter();
  const [items, setItems] = useState<Asesor[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => { setLoading(true); getAsesores().then(setItems).finally(() => setLoading(false)); };
  useEffect(load, []);

  const handleDelete = (a: Asesor) => {
    if (!confirm(`¿Eliminar al asesor "${a.nombre}"?`)) return;
    deleteAsesor(a.id!).then(() => { toast.success('Asesor eliminado'); load(); }).catch(() => toast.error('No se pudo eliminar'));
  };

  return (
    <div className="min-h-full bg-slate-50">
      <header className="flex items-center justify-between border-b border-slate-100 bg-white p-4">
        <button onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-slate-100"><ArrowLeft size={22} className="text-purple-600" /></button>
        <h1 className="text-[16px] font-extrabold text-slate-900">Asesores por Zona</h1>
        <Link href="/admin/asesores/add" className="flex h-10 w-10 items-center justify-center rounded-full text-purple-600 hover:bg-slate-100" data-testid="add-asesor-button"><Plus size={26} /></Link>
      </header>

      <div className="p-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-16"><div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" /></div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <Users size={56} className="text-slate-300" />
            <p className="mt-4 text-sm font-semibold text-slate-600">Aún no hay asesores</p>
            <p className="mt-1 max-w-[280px] text-xs text-slate-400">Agrega un asesor por provincia para enrutar correctamente los WhatsApp de los clientes.</p>
            <Link href="/admin/asesores/add" className="mt-4 rounded-full bg-brand-red px-5 py-2.5 text-sm font-bold text-white">Agregar primer asesor</Link>
          </div>
        ) : (
          items.map((a) => (
            <div key={a.id} className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-100" data-testid={`asesor-row-${a.id}`}>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50"><UserCircle size={26} className="text-brand-navy" /></div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-bold text-slate-900">{a.nombre}</p>
                <p className="flex items-center gap-1 text-[11px] text-slate-500"><MapPin size={11} />{a.provincia}</p>
                <p className="flex items-center gap-1 text-[11px] text-slate-700"><Phone size={11} className="text-emerald-500" />{a.whatsapp}</p>
              </div>
              <div className="flex flex-col gap-2">
                <Link href={`/admin/asesores/edit/${a.id}`} className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-brand-navy hover:bg-blue-100"><Edit2 size={16} /></Link>
                <button onClick={() => handleDelete(a)} className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100"><Trash2 size={16} /></button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
export default function AsesoresListPage() { return <AdminGuard><AsesoresListInner /></AdminGuard>; }
