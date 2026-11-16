import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: { default: "Fiscalización", template: "%s · Fiscales PAR Los Charrúas" },
  robots: { index: false },
};

export const viewport: Viewport = { themeColor: "#073f55" };

export default function LayoutFiscal({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-screen flex-col bg-slate-100 text-slate-900">{children}</div>;
}
