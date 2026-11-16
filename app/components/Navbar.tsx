"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Marca from "./Marca";
import { SECCIONES } from "../../lib/sitio";


export default function Navbar() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [conSombra, setConSombra] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const alScrollear = () => setConSombra(window.scrollY > 8);
    alScrollear();
    window.addEventListener("scroll", alScrollear, { passive: true });
    return () => window.removeEventListener("scroll", alScrollear);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuAbierto ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuAbierto]);

  const activo = (ruta: string) => (ruta === "/" ? pathname === "/" : pathname.startsWith(ruta));
  const claseLink = (ruta: string) =>
    `relative py-2 transition hover:text-par-celeste-oscuro after:absolute after:inset-x-0 after:-bottom-0.5 after:h-[3px] after:origin-left after:bg-par-amarillo after:transition ${
      activo(ruta) ? "after:scale-x-100" : "after:scale-x-0 hover:after:scale-x-100"
    }`;
  const cerrar = () => setMenuAbierto(false);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        conSombra
          ? "border-par-tinta/10 bg-par-papel/85 shadow-[0_10px_30px_-20px_rgba(7,63,85,0.5)] backdrop-blur-xl"
          : "border-transparent bg-par-papel"
      }`}
    >
      <div className="franja" />
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-3 sm:px-6" aria-label="Principal">
        <Link href="/" onClick={cerrar} className="shrink-0" aria-label="PAR Los Charrúas - Inicio">
          <Marca />
        </Link>

        <div className="hidden items-center gap-6 font-display text-lg font-bold uppercase tracking-wider text-par-tinta lg:flex xl:gap-8">
          {SECCIONES.map((s) => (
            <Link key={s.href} href={s.href} className={claseLink(s.href)} aria-current={activo(s.href) ? "page" : undefined}>
              {s.texto}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/#sumate"
            onClick={cerrar}
            className="hidden rounded-full bg-par-amarillo px-6 py-2.5 font-display text-lg font-bold uppercase tracking-wider text-par-tinta shadow-[0_8px_20px_-10px_rgba(255,192,0,0.9)] transition hover:-translate-y-0.5 hover:bg-par-tinta hover:text-par-amarillo sm:inline-block"
          >
            Sumate
          </Link>
          <Link
            href="/fiscal"
            aria-label="Ingreso de fiscales"
            title="Ingreso de fiscales"
            className="hidden h-11 w-11 items-center justify-center rounded-full text-par-tinta/50 transition hover:bg-par-tinta/5 hover:text-par-tinta lg:flex"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="5" y="11" width="14" height="10" rx="2" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" />
            </svg>
          </Link>
          <button
            type="button"
            onClick={() => setMenuAbierto(!menuAbierto)}
            aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuAbierto}
            className="flex h-11 w-11 flex-col items-center justify-center gap-1.5 rounded-full bg-par-tinta lg:hidden"
          >
            <span className={`h-0.5 w-5 bg-white transition ${menuAbierto ? "translate-y-2 rotate-45" : ""}`} />
            <span className={`h-0.5 w-5 bg-white transition ${menuAbierto ? "opacity-0" : ""}`} />
            <span className={`h-0.5 w-5 bg-white transition ${menuAbierto ? "-translate-y-2 -rotate-45" : ""}`} />
          </button>
        </div>
      </nav>

      {/* Menú móvil a pantalla completa */}
      {menuAbierto && (
        <div className="fixed inset-x-0 bottom-0 top-[74px] z-40 overflow-y-auto bg-par-tinta px-6 pb-10 pt-6 text-white lg:hidden">
          <div className="flex flex-col">
            {SECCIONES.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={cerrar}
                className={`titular border-b border-white/10 py-4 text-5xl transition hover:text-par-amarillo ${
                  activo(item.href) ? "text-par-amarillo" : ""
                }`}
              >
                {item.texto}
              </Link>
            ))}
          </div>

          <Link
            href="/#sumate"
            onClick={cerrar}
            className="titular mt-10 block rounded-2xl bg-par-amarillo py-5 text-center text-3xl text-par-tinta"
          >
            Sumate
          </Link>
          <Link
            href="/fiscal"
            onClick={cerrar}
            className="titular mt-3 block rounded-2xl py-4 text-center text-2xl ring-2 ring-white/25"
          >
            Ingreso de fiscales
          </Link>
        </div>
      )}
    </header>
  );
}
