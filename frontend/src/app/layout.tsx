import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth';
import { Toaster } from '@/components/Toaster';
import { PWARegister } from '@/components/PWARegister';
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt';
import { BottomNav } from '@/components/BottomNav';

export const metadata: Metadata = {
  title: 'Tohatsu Motors',
  description:
    'App oficial de Tohatsu Motors: catálogo de motores fuera de borda, repuestos, servicio técnico y campañas de mantenimiento gratuito.',
  manifest: '/manifest.json',
  applicationName: 'Tohatsu Motors',
  appleWebApp: {
    capable: true,
    title: 'Tohatsu',
    statusBarStyle: 'black-translucent',
  },
  icons: {
    icon: [
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      { url: '/icons/icon-152.png', sizes: '152x152', type: 'image/png' },
    ],
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'msapplication-TileColor': '#0A1628',
    'msapplication-TileImage': '/icons/icon-144.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#0A1628',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  userScalable: true,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-EC">
      <body className="antialiased">
        <AuthProvider>
          <div className="app-shell flex flex-col">
            <main className="flex-1">{children}</main>
            <BottomNav />
          </div>
          <Toaster />
          <PWAInstallPrompt />
          <PWARegister />
        </AuthProvider>
      </body>
    </html>
  );
}
