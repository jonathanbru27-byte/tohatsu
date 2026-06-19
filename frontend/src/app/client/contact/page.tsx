'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, MessageCircle, Wrench, Headset, Phone } from 'lucide-react';
import { getConfig, type Configuracion } from '@/lib/api';
import { ContactModal } from '@/components/ContactModal';

export default function ContactPage() {
  const [config, setConfig] = useState<Configuracion | null>(null);
  const [open, setOpen] = useState<null | { kind: 'motor' | 'repuesto' | 'servicio'; title: string; phone: string }>(null);

  useEffect(() => {
    getConfig().then(setConfig).catch(() => {});
  }, []);

  const cards = [
    { kind: 'motor' as const, title: 'Asesoría y Ventas', desc: 'Hablar con un asesor sobre motores y financiamiento', icon: MessageCircle, color: 'bg-brand-red', phone: config?.whatsapp_ventas || '' },
    { kind: 'repuesto' as const, title: 'Solicitar Repuestos', desc: 'Cotizar repuestos originales con stock disponible', icon: Wrench, color: 'bg-brand-navy', phone: config?.whatsapp_repuestos || '' },
    { kind: 'servicio' as const, title: 'Servicio Técnico', desc: 'Reparaciones, mantenimientos y soporte técnico', icon: Headset, color: 'bg-orange-500', phone: config?.whatsapp_servicio || '' },
  ];

  return (
    <div className="min-h-full bg-brand-bg">
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-100 bg-white px-4 py-3">
        <Link href="/" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-slate-100">
          <ArrowLeft size={22} className="text-brand-navy" />
        </Link>
        <h1 className="flex-1 text-[16px] font-extrabold text-brand-navy">Contactar</h1>
      </header>

      <div className="p-4 space-y-3">
        <div className="card flex items-center gap-3 p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100"><Phone size={22} className="text-emerald-600" /></div>
          <div>
            <p className="text-[13px] font-extrabold text-brand-navy">Llámanos por WhatsApp</p>
            <p className="text-xs text-slate-500">Te conectamos con un asesor de tu zona</p>
          </div>
        </div>

        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <button
              key={c.kind}
              onClick={() => setOpen({ kind: c.kind, title: c.title, phone: c.phone })}
              className="card flex w-full items-center gap-3.5 p-4 text-left transition hover:-translate-y-0.5"
              data-testid={`contact-card-${c.kind}`}
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-full ${c.color}`}>
                <Icon size={22} className="text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-extrabold text-brand-navy">{c.title}</p>
                <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{c.desc}</p>
              </div>
              <MessageCircle size={20} className="text-emerald-500" />
            </button>
          );
        })}
      </div>

      {open && (
        <ContactModal
          open={!!open}
          onClose={() => setOpen(null)}
          title={open.title}
          phoneNumber={open.phone}
          interes={open.kind}
          detalle={open.title}
        />
      )}
    </div>
  );
}
