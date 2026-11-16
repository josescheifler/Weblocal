import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Marca from "../components/Marca";
import MenuAdmin from "../components/admin/MenuAdmin";
import { cerrarSesion } from "../(sitio)/login/acciones";

export const metadata: Metadata = {
  title: { default: "Panel", template: "%s · Panel PAR Los Charrúas" },
  robots: { index: false },
};

export default function LayoutAdmin({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-100 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="franja" />
        <div className="mx-auto flex max-w-[90rem] items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/admin" aria-label="Panel - inicio">
            <Marca />
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/" className="hidden rounded-lg px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 sm:block">
              Ver sitio ↗
            </Link>
            <form action={cerrarSesion}>
              <button
                type="submit"
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-600 transition hover:bg-red-100"
              >
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      </header>
      <div className="mx-auto grid w-full max-w-[90rem] flex-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[15rem_1fr] lg:py-10">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <Suspense fallback={<div className="h-12 rounded-xl bg-slate-200 lg:h-96" />}>
            <MenuAdmin />
          </Suspense>
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
