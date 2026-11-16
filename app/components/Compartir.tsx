"use client";

import { useState } from "react";

const redes = [
  {
    nombre: "WhatsApp",
    url: (u: string, t: string) => `https://wa.me/?text=${encodeURIComponent(`${t} ${u}`)}`,
    icono: (
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.3 14.2c-.2.6-1.3 1.2-1.8 1.3-.5 0-1 .2-3.2-.7-2.7-1.1-4.4-3.9-4.5-4.1-.1-.2-1.1-1.4-1.1-2.7s.7-1.9.9-2.2c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.4.6-.4.4c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1.1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.2.1.7-.1 1.3Z" />
    ),
  },
  {
    nombre: "Facebook",
    url: (u: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}`,
    icono: (
      <path d="M13.5 22v-8h2.7l.4-3.2h-3.1V8.8c0-.9.3-1.5 1.6-1.5h1.7V4.5c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.1v2.3H7.6V14h2.8v8h3.1Z" />
    ),
  },
  {
    nombre: "X",
    url: (u: string, t: string) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(u)}&text=${encodeURIComponent(t)}`,
    icono: (
      <path d="M17.8 3h3l-6.6 7.6L22 21h-6.1l-4.8-6.2L5.6 21h-3l7.1-8.1L2.2 3h6.2l4.3 5.7L17.8 3Zm-1 16.2h1.7L7.3 4.7H5.5l11.3 14.5Z" />
    ),
  },
];

export default function Compartir({ titulo, oscuro = false }: { titulo: string; oscuro?: boolean }) {
  const [copiado, setCopiado] = useState(false);

  const urlActual = () => (typeof window === "undefined" ? "" : window.location.href);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(urlActual());
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // el navegador no permite copiar
    }
  };

  const base = oscuro
    ? "bg-white/10 text-white hover:bg-par-amarillo hover:text-par-tinta"
    : "bg-par-tinta/5 text-par-tinta hover:bg-par-tinta hover:text-white";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className={`mr-1 font-display text-sm font-bold uppercase tracking-[0.18em] ${oscuro ? "text-white/70" : "text-par-tinta/60"}`}>
        Compartir
      </span>
      {redes.map((red) => (
        <button
          key={red.nombre}
          type="button"
          onClick={() => window.open(red.url(urlActual(), titulo), "_blank", "noopener,noreferrer")}
          aria-label={`Compartir en ${red.nombre}`}
          className={`flex h-11 w-11 items-center justify-center rounded-full transition ${base}`}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
            {red.icono}
          </svg>
        </button>
      ))}
      <button
        type="button"
        onClick={copiar}
        className={`h-11 rounded-full px-4 font-display text-sm font-bold uppercase tracking-wider transition ${base}`}
      >
        {copiado ? "¡Copiado!" : "Copiar enlace"}
      </button>
    </div>
  );
}
