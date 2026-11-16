import type { Metadata, Viewport } from "next";
import "@fontsource/barlow-condensed/600.css";
import "@fontsource/barlow-condensed/700.css";
import "@fontsource/barlow-condensed/800.css";
import "@fontsource/barlow-condensed/800-italic.css";
import "@fontsource-variable/public-sans/wght.css";
import "./globals.css";
import { SITIO, URL_SITIO } from "../lib/sitio";

export const metadata: Metadata = {
  metadataBase: new URL(URL_SITIO),
  title: {
    default: `PAR ${SITIO.localidad} · ${SITIO.lema}`,
    template: `%s · PAR ${SITIO.localidad}`,
  },
  description: `${SITIO.espacioCompleto} en ${SITIO.localidad}, ${SITIO.provincia}. Cómo viene la construcción, noticias, candidatos y propuestas para nuestro pueblo.`,
  applicationName: `PAR ${SITIO.localidad}`,
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: `PAR ${SITIO.localidad} · ${SITIO.espacioCompleto}`,
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#073f55",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR">
      <body className="flex min-h-screen flex-col antialiased">{children}</body>
    </html>
  );
}
