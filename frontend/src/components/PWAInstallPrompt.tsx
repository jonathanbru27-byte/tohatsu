'use client';

import { useEffect, useState } from 'react';
import { X, Download, Smartphone } from 'lucide-react';

const STORAGE_KEY = 'pwa_install_dismissed_at';
const REMIND_AFTER_MS = 1000 * 60 * 60 * 24 * 3;

function isStandalone() {
  if (typeof window === 'undefined') return false;
  // @ts-ignore Safari
  if (window.navigator?.standalone) return true;
  return window.matchMedia?.('(display-mode: standalone)')?.matches === true;
}

function isIOSWeb() {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator?.userAgent || '';
  return /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
}

export function PWAInstallPrompt() {
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<'native' | 'ios'>('native');
  const [deferred, setDeferred] = useState<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isStandalone()) return;

    try {
      const dismissedAt = localStorage.getItem(STORAGE_KEY);
      if (dismissedAt && Date.now() - parseInt(dismissedAt, 10) < REMIND_AFTER_MS) return;
    } catch {}

    const onAvailable = (e: any) => {
      e.preventDefault();
      setDeferred(e);
      setMode('native');
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', onAvailable);

    const onInstalled = () => {
      setVisible(false);
      try { localStorage.removeItem(STORAGE_KEY); } catch {}
    };
    window.addEventListener('appinstalled', onInstalled);

    let iosTimer: any = null;
    if (isIOSWeb()) {
      iosTimer = setTimeout(() => {
        setMode('ios');
        setVisible(true);
      }, 3000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onAvailable);
      window.removeEventListener('appinstalled', onInstalled);
      if (iosTimer) clearTimeout(iosTimer);
    };
  }, []);

  const handleInstall = async () => {
    if (mode !== 'native' || !deferred) {
      handleClose();
      return;
    }
    try {
      deferred.prompt();
      await deferred.userChoice;
    } catch {}
    handleClose(false);
  };

  const handleClose = (persist = true) => {
    setVisible(false);
    if (persist) {
      try { localStorage.setItem(STORAGE_KEY, String(Date.now())); } catch {}
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-3 left-3 right-3 z-[9999] animate-slide-up" data-testid="pwa-install-prompt">
      <div className="mx-auto max-w-[456px] rounded-2xl border border-white/10 bg-brand-navydark px-4 py-3 shadow-2xl ring-1 ring-black/40">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-red">
            <Smartphone className="h-6 w-6 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-extrabold text-white">Instala Tohatsu Motors</p>
            {mode === 'native' ? (
              <p className="mt-0.5 text-xs leading-snug text-white/85">
                Agrégala a tu pantalla de inicio y úsala como una app nativa.
              </p>
            ) : (
              <p className="mt-0.5 text-xs leading-snug text-white/85">
                Toca <b>Compartir</b> y luego <b>«Agregar a pantalla de inicio»</b>.
              </p>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {mode === 'native' && (
              <button
                type="button"
                onClick={handleInstall}
                className="inline-flex items-center gap-1 rounded-full bg-brand-red px-3 py-2 text-xs font-bold text-white transition hover:brightness-110"
                data-testid="pwa-install-button"
              >
                <Download size={14} />
                Instalar
              </button>
            )}
            <button
              type="button"
              onClick={() => handleClose(true)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
              data-testid="pwa-dismiss-button"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
