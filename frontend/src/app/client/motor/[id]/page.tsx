'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MessageCircle, Fuel, Gauge, Weight, Cog } from 'lucide-react';
import { getMotor, getConfig, type Motor, type Configuracion } from '@/lib/api';
import { ContactModal } from '@/components/ContactModal';
import { formatCurrency } from '@/lib/utils';

export default function MotorDetailPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const [motor, setMotor] = useState<Motor | null>(null);
  const [config, setConfig] = useState<Configuracion | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    Promise.all([getMotor(id), getConfig()])
      .then(([m, c]) => {
        setMotor(m);
        setConfig(c);
      })
      .catch(() => router.replace('/client'))
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-red border-t-transparent" />
      </div>
    );
  }
  if (!motor) return null;

  return (
    <div className="min-h-full bg-white">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3">
        <Link href="/client" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-slate-100" data-testid="back-button">
          <ArrowLeft size={22} className="text-brand-navy" />
        </Link>
        <h1 className="text-[15px] font-extrabold text-brand-navy">{motor.modelo}</h1>
        <div className="w-9" />
      </header>

      <div className="relative bg-brand-bg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={motor.imagen} alt={motor.modelo} className="mx-auto aspect-[4/5] w-full max-w-[420px] object-cover" />
        {motor.badge_text && (
          <span className="absolute left-4 top-4 rounded-md bg-brand-red px-3 py-1.5 text-[11px] font-extrabold tracking-wider text-white shadow">
            {motor.badge_text}
          </span>
        )}
        <span className="absolute right-4 top-4 rounded-md bg-brand-navy px-3 py-1.5 text-[14px] font-extrabold text-white shadow">
          {motor.potencia}
        </span>
      </div>

      <div className="px-5 pb-32 pt-5">
        <p className="text-[11px] font-extrabold tracking-[0.2em] text-brand-red">TOHATSU</p>
        <h2 className="text-[26px] font-black text-brand-navy">{motor.modelo}</h2>
        <p className="mt-1 text-[13px] text-slate-600">{motor.tipo}</p>

        {/* Price card */}
        <div className="card mt-5 p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold tracking-wider text-slate-500">PRECIO REF.</span>
            <span className="text-[18px] font-black text-brand-red">{formatCurrency(motor.precio)} USD</span>
          </div>
          <div className="my-3 h-px bg-slate-100" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold tracking-wider text-slate-500">ENTRADA MÍNIMA</span>
            <span className="text-[16px] font-extrabold text-brand-navy">{formatCurrency(motor.financiamiento_entrada)}</span>
          </div>
        </div>

        {/* Specs */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="card flex items-center gap-3 p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50"><Gauge size={18} className="text-brand-red" /></div>
            <div>
              <p className="text-[10px] font-bold text-slate-400">CILINDRADA</p>
              <p className="text-[13px] font-bold text-brand-navy">{motor.cilindrada || '—'}</p>
            </div>
          </div>
          <div className="card flex items-center gap-3 p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50"><Weight size={18} className="text-brand-navy" /></div>
            <div>
              <p className="text-[10px] font-bold text-slate-400">PESO SECO</p>
              <p className="text-[13px] font-bold text-brand-navy">{motor.peso_seco || '—'}</p>
            </div>
          </div>
          <div className="card flex items-center gap-3 p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50"><Fuel size={18} className="text-emerald-600" /></div>
            <div>
              <p className="text-[10px] font-bold text-slate-400">SISTEMA</p>
              <p className="text-[13px] font-bold text-brand-navy">{motor.sistema || '—'}</p>
            </div>
          </div>
          <div className="card flex items-center gap-3 p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50"><Cog size={18} className="text-orange-500" /></div>
            <div>
              <p className="text-[10px] font-bold text-slate-400">HP</p>
              <p className="text-[13px] font-bold text-brand-navy">{motor.hp_value || '—'}</p>
            </div>
          </div>
        </div>

        {motor.caracteristicas && (
          <>
            <h3 className="mt-7 text-[13px] font-extrabold tracking-widest text-brand-navy">CARACTERÍSTICAS</h3>
            <p className="mt-3 whitespace-pre-line text-[14px] leading-relaxed text-slate-700">{motor.caracteristicas}</p>
          </>
        )}

        {/* Distribuidores autorizados */}
<div className="mt-7">
  <h3 className="text-[13px] font-extrabold tracking-widest text-brand-navy">DISPONIBLE EN</h3>
  <div className="mt-3 grid grid-cols-2 gap-3">
    
    <div className="card flex items-center justify-center p-3 h-24">
      <img 
        src="https://i.ibb.co/dsyFHSvy/Gemini-Generated-Image-ipkaaqipkaaqipka.png" 
        alt="La Ganga" 
        className="max-w-full max-h-full object-contain" 
      />
    </div>
    
    <div className="card flex items-center justify-center p-3 h-24">
      <img 
        src="https://i.ibb.co/4R0ZcnZk/Gemini-Generated-Image-2xtr0t2xtr0t2xtr.png" 
        alt="Al Precio" 
        className="max-w-full max-h-full object-contain" 
      />
    </div>
    
    <div className="card flex items-center justify-center p-3 h-24">
      <img 
        src="https://i.ibb.co/BH0RKZRb/Gemini-Generated-Image-7h7ofb7h7ofb7h7o.png" 
        alt="Crecos" 
        className="max-w-full max-h-full object-contain" 
      />
    </div>
    
    <div className="card flex items-center justify-center p-3 h-24">
      <img 
        src="https://i.ibb.co/Tqdd4B5g/Gemini-Generated-Image-fagmzzfagmzzfagm.png" 
        alt="Artefacta" 
        className="max-w-full max-h-full object-contain" 
      />
    </div>
    </div>
 </div>
</div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-1/2 z-30 w-full max-w-[480px] -translate-x-1/2 border-t border-slate-100 bg-white/95 px-4 py-3 backdrop-blur">
        <button
          onClick={() => setModalOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-red py-3.5 text-[14px] font-extrabold tracking-wide text-white shadow-lg shadow-red-500/30"
          data-testid="cotizar-button"
        >
          <MessageCircle size={18} />
          COTIZAR AHORA
        </button>
      </div>

      <ContactModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Cotización ${motor.modelo}`}
        phoneNumber={config?.whatsapp_ventas || ''}
        interes="motor"
        detalle={`Motor: ${motor.modelo} (${motor.potencia}) - Precio ref. ${formatCurrency(motor.precio)}`}
      />
    </div>
  );
}
