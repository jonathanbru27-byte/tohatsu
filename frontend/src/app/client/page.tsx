'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search } from 'lucide-react';
import { getMotors, type Motor } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

export default function CatalogPage() {
  const [motors, setMotors] = useState<Motor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getMotors().then(setMotors).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = motors.filter((m) =>
    `${m.modelo} ${m.potencia} ${m.tipo || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-full bg-brand-bg">
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-100 bg-white px-4 py-3">
        <Link href="/" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-slate-100">
          <ArrowLeft size={22} className="text-brand-navy" />
        </Link>
        <h1 className="flex-1 text-[16px] font-extrabold text-brand-navy">Catálogo de Motores</h1>
      </header>

      <div className="px-4 pt-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar motor por modelo o potencia"
            className="input pl-10"
            data-testid="search-input"
          />
        </div>
      </div>

      <div className="p-4 pb-8">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-red border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-16 text-center text-sm text-slate-500">No se encontraron motores</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((m) => (
              <Link
                key={m.id}
                href={`/client/motor/${m.id}`}
                className="card group relative overflow-hidden"
                data-testid={`motor-card-${m.id}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.imagen} alt={m.modelo} className="aspect-[4/5] w-full bg-slate-200 object-cover transition group-hover:scale-105" />
                <span className="absolute right-2 top-2 rounded-md bg-brand-red px-2 py-0.5 text-[11px] font-extrabold text-white">
                  {m.potencia}
                </span>
                <div className="p-3">
                  <p className="truncate text-[13px] font-bold text-brand-navy">{m.modelo}</p>
                  <div className="mt-2 flex items-end justify-between gap-2">
                    <div>
                      <p className="text-[9px] font-bold tracking-wider text-slate-400">PRECIO REF.</p>
                      <p className="text-[15px] font-extrabold text-brand-red">{formatCurrency(m.precio)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-bold tracking-wider text-slate-400">ENTRADA MÍN.</p>
                      <p className="text-[13px] font-bold text-brand-navy">{formatCurrency(m.financiamiento_entrada)}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
