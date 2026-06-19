// @ts-nocheck
// NOTA: con expo.web.output = "single" (SPA), Expo genera el HTML automáticamente
// y NO usa este componente. Los meta tags PWA y el registro del Service Worker
// se inyectan en runtime desde el hook `usePWA` en /src/hooks/usePWA.ts
// (llamado desde app/_layout.tsx).
//
// Este archivo se mantiene como fallback por si en el futuro se cambia a
// `output: "static"`, donde sí se usa para envolver cada página.
import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="es" style={{ height: "100%" }}>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />
        <title>Tohatsu Motors</title>
        <meta
          name="description"
          content="App oficial de Tohatsu Motors: catálogo de motores fuera de borda, repuestos y servicio técnico."
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0A1628" />
        <meta name="application-name" content="Tohatsu Motors" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Tohatsu" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png" />

        <ScrollViewStyleReset />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              html, body { background-color: #0A1628; }
              body > div:first-child { position: fixed !important; top: 0; left: 0; right: 0; bottom: 0; }
              [role="tablist"] [role="tab"] * { overflow: visible !important; }
              [role="heading"], [role="heading"] * { overflow: visible !important; }
            `,
          }}
        />
      </head>
      <body
        style={{
          margin: 0,
          height: "100%",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#0A1628",
        }}
      >
        {children}
      </body>
    </html>
  );
}
