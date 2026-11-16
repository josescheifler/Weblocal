import { Suspense } from "react";
import Navbar from "../components/Navbar";
import Pie from "../components/Pie";
import Marca from "../components/Marca";

// Mientras se resuelve la ruta actual (el menú la usa para marcar la sección activa) mostramos el encabezado sin interacción
function NavbarFallback() {
  return (
    <header className="sticky top-0 z-50 bg-par-papel">
      <div className="franja" />
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Marca />
        <span className="h-11 w-11 rounded-full bg-par-tinta lg:hidden" />
      </div>
    </header>
  );
}

export default function LayoutSitio({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#contenido"
        className="sr-only z-[100] rounded-full bg-par-amarillo px-5 py-3 font-bold text-par-tinta focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Saltar al contenido
      </a>
      <Suspense fallback={<NavbarFallback />}>
        <Navbar />
      </Suspense>
      <main id="contenido" className="flex-grow">
        {children}
      </main>
      <Pie />
    </>
  );
}
