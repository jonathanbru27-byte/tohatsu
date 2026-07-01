'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Megaphone, Clock, MapPin, ChevronRight, Anchor, Wrench, Phone, Calendar } from 'lucide-react';
import { getMotors, getCalendar, type Motor, type CalendarioEvento } from '@/lib/api';
import { MES_NAMES_SHORT, formatCurrency, cn } from '@/lib/utils';
import { TohatsuLogo } from '@/components/TohatsuLogo';

export default function HomePage() {
  const [motors, setMotors] = useState<Motor[]>([]);
  const [eventos, setEventos] = useState<CalendarioEvento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getMotors(), getCalendar()])
      .then(([m, ev]) => {
        setMotors(m.slice(0, 6));
        const today = new Date().toISOString().split('T')[0];
        setEventos(ev.filter((e) => e.fecha >= today).sort((a, b) => a.fecha.localeCompare(b.fecha)));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-full bg-brand-bg">
      <div className="bg-brand-navydark rounded-b-[28px]">
        <div className="sticky top-0 z-20 px-3 pt-3 pb-2">
          <header 
            className="flex items-center gap-2.5 rounded-full bg-white px-4 py-2.5 shadow-lg shadow-black/15" 
            data-testid="top-navbar"
          >
            <TohatsuLogo size={28} color="navy" showText={false} />
            <span className="text-[15px] font-black tracking-wide text-brand-navy">TOHATSU EC.</span>
          </header>
        </div>

        <div className="px-6 pb-8 pt-3 text-white">
          <p className="text-[11px] font-extrabold tracking-[0.2em] text-brand-red">MOTORES FUERA DE BORDA</p>
          <h1 className="mt-2 text-[30px] font-black leading-tight">Calidad Japonesa</h1>
          <p className="mt-2 text-[13px] leading-relaxed text-brand-slate">
            Más de 60 años de innovación marina al servicio de tu navegación
          </p>
          <Link href="/client" className="btn-primary mt-4" data-testid="hero-explore-button">
            EXPLORAR CATÁLOGO
            <ArrowRight size={16} />
          </Link>

          

          {eventos.length > 0 && (
            <div className="mt-6">
              <div className="mb-3 flex items-center gap-2">
                <Megaphone size={14} className="text-brand-red" />
                <span className="text-[11px] font-extrabold tracking-[0.15em] text-brand-red">
                  PRÓXIMAS CAMPAÑAS GRATUITAS
                </span>
              </div>
              <div className="space-y-2">
                {eventos.slice(0, 3).map((ev, idx) => {
                  const [_, m, d] = ev.fecha.split('-');
                  const month = MES_NAMES_SHORT[parseInt(m, 10) - 1] || '';
                  return (
                    <Link
                      key={ev.id}
                      href="/client/calendar"
                      className={cn(
                        'flex items-center gap-3 rounded-2xl border p-3 transition',
                        idx === 0
                          ? 'border-brand-red/40 bg-brand-red/15 hover:bg-brand-red/20'
                          : 'border-white/10 bg-white/8 hover:bg-white/12'
                      )}
                      data-testid={`campaign-${ev.id}`}
                    >
                      <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-brand-red">
                        <span className="text-[22px] font-black leading-none text-white">{d}</span>
                        <span className="mt-0.5 text-[10px] font-extrabold tracking-wider text-white">{month}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14px] font-extrabold text-white">{ev.titulo || 'Mantenimiento Gratuito'}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-brand-slate">
                          {ev.hora && (
                            <>
                              <Clock size={11} />
                              <span>{ev.hora}</span>
                              <span className="h-1 w-1 rounded-full bg-brand-slate" />
                            </>
                          )}
                          <MapPin size={11} />
                          <span className="truncate">{ev.localidad}</span>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-brand-slate" />
                    </Link>
                  );
                })}
              </div>
              {eventos.length > 3 && (
                <Link
                  href="/client/calendar"
                  className="mt-2 flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-white hover:underline"
                  data-testid="view-all-campaigns"
                >
                  Ver todas las campañas ({eventos.length})
                  <ArrowRight size={14} />
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      <section className="bg-brand-bg px-4 pt-6">
        <div className="section-title">
          <span className="text-[13px] font-extrabold tracking-widest text-brand-navy">ACCIONES RÁPIDAS</span>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-2">
          {[
            { name: 'Motores', href: '/client', icon: Anchor, bg: 'bg-red-50', color: 'text-brand-red', testID: 'action-motors' },
            { name: 'Repuestos', href: '/client/repuestos', icon: Wrench, bg: 'bg-blue-50', color: 'text-brand-navy', testID: 'action-repuestos' },
            { name: 'Contactar', href: '/client/contact', icon: Phone, bg: 'bg-orange-50', color: 'text-orange-500', testID: 'action-contact' },
            { name: 'Calendario', href: '/client/calendar', icon: Calendar, bg: 'bg-emerald-50', color: 'text-emerald-600', testID: 'action-calendar' },
          ].map((a) => {
            const Icon = a.icon;
            return (
              <Link key={a.href} href={a.href} className="card flex flex-col items-center gap-2 p-3 hover:-translate-y-0.5 transition" data-testid={a.testID}>
                <div className={cn('flex h-12 w-12 items-center justify-center rounded-full', a.bg)}>
                  <Icon size={24} className={a.color} />
                </div>
                <span className="text-[11px] font-bold text-brand-navy">{a.name}</span>
              </Link>
            );
          })}
        </div>

        <Link
          href="/client/repuestos"
          className="mt-5 flex items-center gap-3.5 rounded-2xl bg-brand-navy p-4 shadow-lg shadow-blue-900/25 transition hover:brightness-110"
          data-testid="repuestos-banner"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15">
            <Wrench size={32} className="text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-extrabold tracking-wide text-white">CATÁLOGO DE REPUESTOS</p>
            <p className="mt-0.5 text-xs text-brand-slate">Repuestos originales Tohatsu con stock disponible</p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white">
            <ArrowRight size={18} className="text-brand-navy" />
          </div>
        </Link>

        <div className="section-title mt-7">
          <span className="text-[13px] font-extrabold tracking-widest text-brand-navy">MODELOS DESTACADOS</span>
        </div>

        {loading ? (
          <div className="my-10 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-red border-t-transparent" />
          </div>
        ) : (
          <div className="no-scrollbar mt-4 flex gap-3 overflow-x-auto pb-2">
            {motors.map((m) => (
              <Link
                key={m.id}
                href={`/client/motor/${m.id}`}
                className="card relative shrink-0 overflow-hidden"
                style={{ width: 180 }}
                data-testid={`featured-${m.id}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.imagen} alt={m.modelo} className="aspect-[4/5] w-full bg-slate-200 object-cover" />
                <span className="absolute right-2 top-2 rounded-md bg-brand-red px-2.5 py-1 text-[11px] font-extrabold text-white">
                  {m.potencia}
                </span>
                <div className="p-3">
                  <p className="truncate text-[13px] font-bold text-brand-navy">{m.modelo}</p>
                  <p className="mt-1 text-[16px] font-extrabold text-brand-red">{formatCurrency(m.precio)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
        <div className="h-6" />
      </section>
    </div>
  );
}
