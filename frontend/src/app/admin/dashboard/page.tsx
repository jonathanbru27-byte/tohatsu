'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, Anchor, Wrench, Calendar as CalendarIcon, Users, Settings, Cloud, Loader2, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { AdminGuard } from '@/components/AdminGuard';
import { useAuth } from '@/lib/auth';
import { downloadLeadsExcel } from '@/lib/api';

const MENU = [
  { id: 'motors', title: 'Gestionar Motores', desc: 'Agregar, editar o eliminar motores del catálogo', icon: Anchor, href: '/admin/motors', color: 'bg-[#0066cc]' },
  { id: 'repuestos', title: 'Gestionar Repuestos', desc: 'Repuestos con imagen, precio y stock', icon: Wrench, href: '/admin/repuestos', color: 'bg-[#0A1F44]' },
  { id: 'calendar', title: 'Gestionar Calendario', desc: 'Programar campañas de mantenimiento', icon: CalendarIcon, href: '/admin/calendar', color: 'bg-emerald-600' },
  { id: 'asesores', title: 'Asesores por Zona', desc: 'Asesores por provincia para enrutar leads', icon: Users, href: '/admin/asesores', color: 'bg-purple-600' },
  { id: 'config', title: 'Configuración', desc: 'Números de WhatsApp generales', icon: Settings, href: '/admin/config', color: 'bg-orange-500' },
];

function DashboardInner() {
  const router = useRouter();
  const { logout } = useAuth();
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      await downloadLeadsExcel();
      toast.success('Archivo de leads descargado');
    } catch (e: any) {
      toast.error('No se pudo descargar el archivo');
    } finally {
      setDownloading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.replace('/');
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-[#0066cc] to-[#004999]">
      <div className="flex items-center justify-between p-6 pt-10">
        <div className="text-white">
          <h1 className="text-[20px] font-bold">Panel de Administración</h1>
          <p className="mt-1 text-sm opacity-90">Tohatsu Motors</p>
        </div>
        <button onClick={handleLogout} className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-white" data-testid="logout-button">
          <LogOut size={20} />
        </button>
      </div>

      <div className="space-y-3 px-5 pb-10">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex w-full items-center gap-3.5 rounded-2xl bg-brand-red p-4 text-left shadow-lg shadow-red-500/30 transition hover:brightness-110 disabled:opacity-70"
          data-testid="download-leads-button"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
            {downloading ? <Loader2 className="h-6 w-6 animate-spin text-white" /> : <Cloud className="h-6 w-6 text-white" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-extrabold text-white">Descargar Leads (Excel)</p>
            <p className="mt-0.5 text-xs text-white/90">{downloading ? 'Descargando archivo...' : 'Exporta todos los clientes registrados'}</p>
          </div>
          <ChevronRight className="h-5 w-5 text-white" />
        </button>

        <p className="px-1 pt-3 text-[11px] font-extrabold tracking-[0.15em] text-white/85">GESTIÓN</p>

        {MENU.map((m) => {
          const Icon = m.icon;
          return (
            <Link
              key={m.id}
              href={m.href}
              className="flex items-center gap-3.5 rounded-2xl bg-white p-4 shadow-md transition hover:-translate-y-0.5"
              data-testid={`menu-${m.id}`}
            >
              <div className={`flex h-13 w-13 h-[52px] w-[52px] items-center justify-center rounded-full ${m.color}`}>
                <Icon size={26} className="text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-bold text-slate-900">{m.title}</p>
                <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{m.desc}</p>
              </div>
              <ChevronRight size={20} className="text-[#0066cc]" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return <AdminGuard><DashboardInner /></AdminGuard>;
}
