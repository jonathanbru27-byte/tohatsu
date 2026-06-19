'use client';

import { Toaster as Sonner } from 'sonner';

export function Toaster() {
  return (
    <Sonner
      position="top-center"
      richColors
      closeButton
      toastOptions={{
        style: {
          background: '#fff',
          color: '#0A1F44',
          border: '1px solid #e6e8eb',
          fontWeight: 600,
        },
      }}
    />
  );
}
