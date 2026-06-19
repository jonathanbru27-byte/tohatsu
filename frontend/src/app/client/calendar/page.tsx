'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, MapPin, Calendar as CalendarIcon } from 'lucide-react';
import { getCalendar, type CalendarioEvento } from '@/lib/api';
import { MES_NAMES_SHORT } from '@/lib/utils';

export default function CalendarPage() {
  const [eventos, setEventos] = useState<CalendarioEvento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCalendar()
      .then((data) => {
        const today = new Date().toISOString().split('T')[0];
        setEventos(data.filter((e) => e.fecha >= today).sort((a, b) => a.fecha.localeCompare(b.fecha)));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-full bg-brand-bg">
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-100 bg-white px-4 py-3">
        <Link href="/" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-slate-100">
          <ArrowLeft size={22} className="text-brand-navy" />
        </Link>
        <h1 className="flex-1 text-[16px] font-extrabold text-brand-navy">Campañas de Mantenimiento</h1>
      </header>

      <div className="p-4 space-y-3 pb-10">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-red border-t-transparent" />
          </div>
        ) : eventos.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <CalendarIcon size={56} className="text-slate-300" />
            <p className="mt-4 text-sm font-semibold text-slate-600">No hay campañas programadas</p>
            <p className="mt-1 text-xs text-slate-400">Vuelve pronto para ver nuevas fechas</p>
          </div>
        ) : (
          eventos.map((ev) => {
            const [_, m, d] = ev.fecha.split('-');
            const month = MES_NAMES_SHORT[parseInt(m, 10) - 1] || '';
            return (
              <div key={ev.id} className="card flex gap-4 p-4" data-testid={`event-${ev.id}`}>
                <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-brand-red text-white">
                  <span className="text-[24px] font-black leading-none">{d}</span>
                  <span className="mt-1 text-[10px] font-extrabold tracking-wider">{month}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-extrabold text-brand-navy">{ev.titulo || 'Mantenimiento Gratuito'}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                    {ev.hora && (
                      <span className="inline-flex items-center gap-1"><Clock size={12} /> {ev.hora}</span>
                    )}
                    <span className="inline-flex items-center gap-1"><MapPin size={12} /> {ev.localidad}</span>
                  </div>
                  {ev.descripcion && (
                    <p className="mt-2 text-[13px] leading-relaxed text-slate-700">{ev.descripcion}</p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
