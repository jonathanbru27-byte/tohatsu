'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Wrench, Package } from 'lucide-react';
import { getRepuestos, getConfig, type Repuesto, type Configuracion } from '@/lib/api';
import { ContactModal } from '@/components/ContactModal';
import { CATEGORIAS_REPUESTO, formatCurrency, cn } from '@/lib/utils';

export default function RepuestosPage() {
  const [items, setItems] = useState<Repuesto[]>([]);
  const [config, setConfig] = useState<Configuracion | null>(null);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState<string>('Todos');
  const [selected, setSelected] = useState<Repuesto | null>(null);

  useEffect(() => {
    Promise.all([getRepuestos(), getConfig()])
      .then(([r, c]) => { setItems(r); setConfig(c); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = cat === 'Todos' ? items : items.filter((r) => (r.categoria || 'General') === cat);

  return (
    <div className="min-h-full bg-brand-bg">
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-100 bg-white px-4 py-3">
        <Link href="/" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-slate-100">
          <ArrowLeft size={22} className="text-brand-navy" />
        </Link>
        <h1 className="flex-1 text-[16px] font-extrabold text-brand-navy">Repuestos Originales</h1>
      </header>

      <div className="px-4 pt-4">
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-2">
          {['Todos', ...CATEGORIAS_REPUESTO].map((c) => {
            const active = cat === c;
            return (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={cn(
                  'whitespace-nowrap rounded-full border-[1.5px] px-3.5 py-1.5 text-xs font-bold transition',
                  active ? 'border-brand-navy bg-brand-navy text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                )}
                data-testid={`cat-filter-${c}`}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-4 pb-10">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-red border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <Wrench size={56} className="text-slate-300" />
            <p className="mt-4 text-sm font-semibold text-slate-600">No hay repuestos en esta categoría</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((r) => (
              <div key={r.id} className="card flex flex-col overflow-hidden" data-testid={`repuesto-${r.id}`}>
                {r.imagen ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={r.imagen} alt={r.nombre} className="aspect-square w-full bg-slate-100 object-cover" />
                ) : (
                  <div className="flex aspect-square w-full items-center justify-center bg-slate-100"><Package size={32} className="text-slate-300" /></div>
                )}
                <div className="flex flex-1 flex-col gap-1.5 p-3">
                  <p className="line-clamp-2 text-[13px] font-bold text-brand-navy">{r.nombre}</p>
                  <p className="text-[10px] uppercase tracking-wide text-slate-400">{r.categoria || 'General'}</p>
                  {r.modelos_compatibles && (
  <p className="text-[10px] text-slate-500">
    <span className="font-bold">Modelos:</span> {r.modelos_compatibles}
  </p>
)}
                  <p className="text-[15px] font-extrabold text-brand-red">{formatCurrency(r.precio)}</p>
                  <button
                    onClick={() => setSelected(r)}
                    className="mt-auto rounded-full bg-brand-navy px-3 py-2 text-[11px] font-extrabold tracking-wider text-white transition hover:brightness-110"
                    data-testid={`cotizar-repuesto-${r.id}`}
                  >
                    COTIZAR
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <ContactModal
          open={!!selected}
          onClose={() => setSelected(null)}
          title={`Repuesto: ${selected.nombre}`}
          phoneNumber={config?.whatsapp_repuestos || ''}
          interes="repuesto"
          detalle={`${selected.nombre} - ${formatCurrency(selected.precio)} (${selected.categoria || 'General'})`}
        />
      )}
    </div>
  );
}
