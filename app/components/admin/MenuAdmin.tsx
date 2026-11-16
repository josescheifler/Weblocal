"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const GRUPOS = [
  {
    titulo: "Sitio",
    enlaces: [
      { href: "/admin", texto: "Resumen" },
      { href: "/admin/noticias", texto: "Noticias" },
      { href: "/admin/candidatos", texto: "Candidatos" },
      { href: "/admin/propuestas", texto: "Propuestas" },
      { href: "/admin/construccion", texto: "Construcción" },
      { href: "/admin/voluntarios", texto: "Voluntarios" },
    ],
  },
  {
    titulo: "Fiscalización",
    enlaces: [
      { href: "/admin/fiscalizacion", texto: "Tablero en vivo" },
      { href: "/admin/fiscalizacion/mesas", texto: "Escuelas y mesas" },
      { href: "/admin/fiscalizacion/fiscales", texto: "Fiscales" },
      { href: "/admin/fiscalizacion/incidencias", texto: "Incidencias" },
      { href: "/admin/fiscalizacion/eleccion", texto: "Listas y cargos" },
    ],
  },
];

export default function MenuAdmin() {
  const pathname = usePathname();
  const [abierto, setAbierto] = useState(false);
  const activo = (href: string) =>
    href === "/admin" || href === "/admin/fiscalizacion" ? pathname === href : pathname.startsWith(href);

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(!abierto)}
        aria-expanded={abierto}
        className="mb-4 w-full rounded-xl bg-par-tinta px-4 py-3 text-left font-display text-lg font-bold uppercase tracking-wider text-white lg:hidden"
      >
        {abierto ? "Cerrar menú ✕" : "Menú del panel ☰"}
      </button>
      <nav aria-label="Panel" className={`${abierto ? "block" : "hidden"} space-y-6 lg:block`}>
        {GRUPOS.map((g) => (
          <div key={g.titulo}>
            <p className="mb-2 px-3 font-display text-sm font-bold uppercase tracking-[0.18em] text-slate-400">{g.titulo}</p>
            <ul className="space-y-1">
              {g.enlaces.map((e) => (
                <li key={e.href}>
                  <Link
                    href={e.href}
                    onClick={() => setAbierto(false)}
                    aria-current={activo(e.href) ? "page" : undefined}
                    className={`block rounded-xl px-3 py-2.5 font-semibold transition ${
                      activo(e.href) ? "bg-par-tinta text-par-amarillo" : "text-slate-700 hover:bg-white hover:text-par-tinta"
                    }`}
                  >
                    {e.texto}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </>
  );
}
