'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Calendar, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const TABS = [
  { name: 'Inicio', path: '/', icon: Home },
  { name: 'Motores', path: '/client', icon: Compass },
  { name: 'Servicio', path: '/client/contact', icon: Calendar },
  { name: 'Admin', path: '/admin/login', icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname() || '/';

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    if (path === '/client') return pathname === '/client' || pathname.startsWith('/client/motor');
    if (path === '/client/contact') return pathname === '/client/contact' || pathname === '/client/calendar';
    if (path === '/admin/login') return pathname.startsWith('/admin');
    return false;
  };

  // Hide bottom nav inside admin pages (full-screen experience)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') return null;

  return (
    <nav
      className="sticky bottom-0 z-30 flex h-[68px] items-stretch border-t border-slate-100 bg-white pb-[max(0px,env(safe-area-inset-bottom))]"
      data-testid="bottom-tab-bar"
    >
      {TABS.map((tab) => {
        const active = isActive(tab.path);
        const Icon = tab.icon;
        return (
          <Link
            key={tab.path}
            href={tab.path}
            className="flex flex-1 flex-col items-center justify-center gap-1 select-none"
            data-testid={`tab-${tab.name.toLowerCase()}`}
          >
            <Icon
              size={24}
              strokeWidth={active ? 2.5 : 2}
              className={cn(active ? 'text-brand-red' : 'text-slate-400')}
            />
            <span
              className={cn(
                'text-[10px] font-bold tracking-wide',
                active ? 'text-brand-red' : 'text-slate-400'
              )}
            >
              {tab.name.toUpperCase()}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
