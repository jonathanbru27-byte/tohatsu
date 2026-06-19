'use client';

import { useState } from 'react';
import { X, Loader2, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { PROVINCIAS, cleanPhone, cn } from '@/lib/utils';
import { createLead, getAsesorByProvincia } from '@/lib/api';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  /** WhatsApp fallback general si no hay asesor por provincia */
  phoneNumber: string;
  interes: 'motor' | 'repuesto' | 'servicio';
  detalle?: string;
}

export function ContactModal({ open, onClose, title, phoneNumber, interes, detalle = '' }: Props) {
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [provincia, setProvincia] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const reset = () => {
    setNombre('');
    setTelefono('');
    setProvincia('');
    setSubmitting(false);
  };

  const close = () => {
    if (submitting) return;
    reset();
    onClose();
  };

  const submit = async () => {
    if (!nombre.trim() || !telefono.trim() || !provincia) {
      toast.error('Completa nombre, teléfono y selecciona provincia');
      return;
    }
    setSubmitting(true);

    // 1. Registrar lead (no bloquear flujo si falla)
    try {
      await createLead({
        nombre: nombre.trim(),
        telefono: telefono.trim(),
        provincia,
        interes,
        detalle,
      });
    } catch {}

    // 2. Resolver asesor de la provincia o fallback general
    let asesorWhatsapp = phoneNumber;
    let asesorNombre = '';
    try {
      const asesor = await getAsesorByProvincia(provincia);
      if (asesor?.whatsapp) {
        asesorWhatsapp = asesor.whatsapp;
        asesorNombre = asesor.nombre || '';
      }
    } catch {}

    // 3. Abrir WhatsApp
    const saludo = asesorNombre ? `Hola ${asesorNombre}!` : 'Hola!';
    const detalleLinea = detalle ? `\n${detalle}` : '';
    const msg =
      `${saludo} Solicito información sobre: ${title}${detalleLinea}\n\n` +
      `Nombre: ${nombre.trim()}\n` +
      `Teléfono: ${telefono.trim()}\n` +
      `Provincia: ${provincia}`;
    const phone = cleanPhone(asesorWhatsapp);
    if (!phone) {
      toast.error('No hay asesor disponible en este momento');
      setSubmitting(false);
      return;
    }
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
    reset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" data-testid="contact-modal">
      <div className="absolute inset-0 bg-black/55" onClick={close} />
      <div className="relative z-10 w-full max-w-[480px] rounded-t-3xl bg-white px-5 pb-5 pt-3 shadow-2xl sm:max-h-[90vh] sm:rounded-3xl">
        <div className="mx-auto mb-3 h-1 w-10 rounded bg-slate-200" />
        <div className="mb-4 flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-[18px] font-extrabold text-slate-900">{title}</h3>
            <p className="mt-1 text-xs font-medium text-slate-500">
              Te conectaremos con el asesor de tu zona
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100"
            data-testid="modal-close-button"
          >
            <X size={20} />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto pr-1">
          <div className="space-y-1">
            <label className="label">Nombre</label>
            <input
              type="text"
              className="input"
              placeholder="Tu nombre completo"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              autoComplete="name"
              data-testid="modal-nombre-input"
            />
          </div>
          <div className="mt-3 space-y-1">
            <label className="label">Teléfono</label>
            <input
              type="tel"
              className="input"
              placeholder="Ej. 0991234567"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              inputMode="tel"
              data-testid="modal-telefono-input"
            />
          </div>

          <div className="mt-3 space-y-1">
            <label className="label">Provincia</label>
            <div className="flex flex-wrap gap-2">
              {PROVINCIAS.map((prov) => {
                const selected = provincia === prov;
                return (
                  <button
                    key={prov}
                    type="button"
                    onClick={() => setProvincia(prov)}
                    className={cn(
                      'rounded-full border-[1.5px] px-3 py-1.5 text-xs font-semibold transition',
                      selected
                        ? 'border-brand-red bg-red-50 text-brand-red'
                        : 'border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-200'
                    )}
                    data-testid={`provincia-${prov}`}
                  >
                    {prov}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            disabled={submitting}
            onClick={submit}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] py-3.5 text-sm font-extrabold tracking-wide text-white shadow-lg shadow-emerald-400/30 transition hover:brightness-105 disabled:opacity-60"
            data-testid="modal-submit-button"
          >
            {submitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Phone size={18} />
                ENVIAR POR WHATSAPP
              </>
            )}
          </button>
          <p className="mt-3 text-center text-[11px] leading-snug text-slate-400">
            Tus datos se usarán únicamente para contactarte sobre tu solicitud.
          </p>
        </div>
      </div>
    </div>
  );
}
