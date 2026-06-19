import { useEffect } from 'react';
import { Platform } from 'react-native';

/**
 * Inicializa los recursos PWA en la web:
 *  - Inyecta <link rel="manifest"> y los <meta>/<link> para iOS/Apple.
 *  - Registra el service worker (/sw.js).
 *  - Configura el listener beforeinstallprompt -> window.__pwaInstallPrompt.
 *
 * No hace nada en nativo.
 */
export function usePWA() {
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    if (typeof document === 'undefined') return;

    const head = document.head;
    if (!head) return;

    const ensureTag = (
      tag: 'link' | 'meta',
      selector: string,
      attrs: Record<string, string>
    ) => {
      let el = head.querySelector(selector) as HTMLElement | null;
      if (!el) {
        el = document.createElement(tag);
        head.appendChild(el);
      }
      Object.entries(attrs).forEach(([k, v]) => el!.setAttribute(k, v));
    };

    // ---- Manifest + theme ----
    ensureTag('link', 'link[rel="manifest"]', {
      rel: 'manifest',
      href: '/manifest.json',
    });
    ensureTag('meta', 'meta[name="theme-color"]', {
      name: 'theme-color',
      content: '#0A1628',
    });
    ensureTag('meta', 'meta[name="application-name"]', {
      name: 'application-name',
      content: 'Tohatsu Motors',
    });
    ensureTag('meta', 'meta[name="mobile-web-app-capable"]', {
      name: 'mobile-web-app-capable',
      content: 'yes',
    });

    // ---- iOS / Apple ----
    ensureTag('meta', 'meta[name="apple-mobile-web-app-capable"]', {
      name: 'apple-mobile-web-app-capable',
      content: 'yes',
    });
    ensureTag('meta', 'meta[name="apple-mobile-web-app-title"]', {
      name: 'apple-mobile-web-app-title',
      content: 'Tohatsu',
    });
    ensureTag(
      'meta',
      'meta[name="apple-mobile-web-app-status-bar-style"]',
      {
        name: 'apple-mobile-web-app-status-bar-style',
        content: 'black-translucent',
      }
    );
    ensureTag('link', 'link[rel="apple-touch-icon"]', {
      rel: 'apple-touch-icon',
      href: '/apple-touch-icon.png',
    });
    ensureTag('link', 'link[rel="apple-touch-icon"][sizes="180x180"]', {
      rel: 'apple-touch-icon',
      sizes: '180x180',
      href: '/apple-touch-icon.png',
    });
    ensureTag('link', 'link[rel="apple-touch-icon"][sizes="152x152"]', {
      rel: 'apple-touch-icon',
      sizes: '152x152',
      href: '/icons/icon-152.png',
    });

    // ---- Favicons ----
    ensureTag('link', 'link[rel="icon"][sizes="32x32"]', {
      rel: 'icon',
      type: 'image/png',
      sizes: '32x32',
      href: '/favicon-32.png',
    });
    ensureTag('link', 'link[rel="icon"][sizes="16x16"]', {
      rel: 'icon',
      type: 'image/png',
      sizes: '16x16',
      href: '/favicon-16.png',
    });

    // ---- MS Tile ----
    ensureTag('meta', 'meta[name="msapplication-TileColor"]', {
      name: 'msapplication-TileColor',
      content: '#0A1628',
    });
    ensureTag('meta', 'meta[name="msapplication-TileImage"]', {
      name: 'msapplication-TileImage',
      content: '/icons/icon-144.png',
    });

    // ---- Viewport with viewport-fit (for iOS safe areas) ----
    const viewportMeta = head.querySelector(
      'meta[name="viewport"]'
    ) as HTMLMetaElement | null;
    if (
      viewportMeta &&
      !/viewport-fit/i.test(viewportMeta.getAttribute('content') || '')
    ) {
      viewportMeta.setAttribute(
        'content',
        'width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover'
      );
    }

    // ---- beforeinstallprompt capture (run early) ----
    if (!(window as any).__pwaInstallListenerAttached) {
      (window as any).__pwaInstallListenerAttached = true;
      (window as any).__pwaInstallPrompt = null;
      window.addEventListener('beforeinstallprompt', (e: any) => {
        e.preventDefault();
        (window as any).__pwaInstallPrompt = e;
        window.dispatchEvent(new CustomEvent('pwa-install-available'));
      });
      window.addEventListener('appinstalled', () => {
        (window as any).__pwaInstallPrompt = null;
        window.dispatchEvent(new CustomEvent('pwa-installed'));
      });
    }

    // ---- Service worker registration ----
    if ('serviceWorker' in navigator) {
      const register = () => {
        navigator.serviceWorker
          .register('/sw.js', { scope: '/' })
          .then((reg) => {
            // eslint-disable-next-line no-console
            console.log('[PWA] Service Worker registrado:', reg.scope);
          })
          .catch((err) => {
            // eslint-disable-next-line no-console
            console.warn('[PWA] Error registrando SW:', err);
          });
      };
      if (document.readyState === 'complete') {
        register();
      } else {
        window.addEventListener('load', register, { once: true });
      }
    }
  }, []);
}
