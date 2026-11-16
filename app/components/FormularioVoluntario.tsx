"use client";

import { startTransition, useActionState } from "react";
import { sumarVoluntario } from "../(sitio)/acciones";

const campo =
  "w-full rounded-2xl border-2 border-white/10 bg-white/[0.07] px-5 py-4 text-lg text-white outline-none transition placeholder:text-white/40 focus:border-par-amarillo focus:bg-white/10";

/** Formulario de "Sumate". Con `fiscal` viene tildada la opción de ser fiscal. */
export default function FormularioVoluntario({ fiscal = false }: { fiscal?: boolean }) {
  const [estado, accion, enviando] = useActionState(sumarVoluntario, null);

  if (estado?.ok) {
    return (
      <div role="status" className="rounded-[1.75rem] bg-par-amarillo p-8 text-par-tinta md:p-10">
        <p className="titular text-5xl">¡Bienvenido/a!</p>
        <p className="mt-4 text-lg font-medium">{estado.ok}</p>
      </div>
    );
  }

  return (
    <form
      action={accion}
      onSubmit={(e) => {
        e.preventDefault();
        const datos = new FormData(e.currentTarget);
        startTransition(() => accion(datos));
      }}
      className="grid gap-4 rounded-[1.75rem] bg-white/[0.06] p-6 ring-1 ring-white/10 backdrop-blur md:grid-cols-2 md:p-8">
      <label className="md:col-span-2">
        <span className="mb-2 block font-display text-sm font-bold uppercase tracking-[0.18em] text-white/70">Nombre y apellido</span>
        <input name="nombre" required minLength={3} maxLength={120} autoComplete="name" className={campo} />
      </label>
      <label>
        <span className="mb-2 block font-display text-sm font-bold uppercase tracking-[0.18em] text-white/70">Teléfono / WhatsApp</span>
        <input name="telefono" required type="tel" inputMode="tel" autoComplete="tel" maxLength={40} className={campo} />
      </label>
      <label>
        <span className="mb-2 block font-display text-sm font-bold uppercase tracking-[0.18em] text-white/70">Barrio</span>
        <input name="barrio" maxLength={120} className={campo} />
      </label>
      <label className="md:col-span-2">
        <span className="mb-2 block font-display text-sm font-bold uppercase tracking-[0.18em] text-white/70">
          ¿Querés contarnos algo? <span className="normal-case tracking-normal text-white/40">(opcional)</span>
        </span>
        <textarea name="mensaje" rows={3} maxLength={1500} className={campo} />
      </label>
      {/* Campo trampa para robots */}
      <input type="text" name="sitio" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-white/[0.05] p-4 md:col-span-2">
        <input type="checkbox" name="quiereFiscal" defaultChecked={fiscal} className="mt-1 h-5 w-5 accent-par-amarillo" />
        <span>
          <span className="block font-bold">Quiero ser fiscal el día de la elección</span>
          <span className="text-sm text-white/60">Te capacitamos. Cuidar los votos es cuidar la voluntad de los vecinos.</span>
        </span>
      </label>
      {estado?.error && (
        <p role="alert" className="rounded-xl bg-red-500/15 p-3 font-semibold text-red-200 md:col-span-2">
          {estado.error}
        </p>
      )}
      <button
        type="submit"
        disabled={enviando}
        className="rounded-full bg-par-amarillo px-8 py-4 font-display text-xl font-bold uppercase tracking-wider text-par-tinta shadow-[0_12px_30px_-12px_rgba(255,192,0,0.9)] transition hover:-translate-y-0.5 hover:bg-white disabled:opacity-60 md:col-span-2"
      >
        {enviando ? "Enviando…" : "Me sumo"}
      </button>
      <p className="text-center text-xs text-white/45 md:col-span-2">
        Usamos tus datos solo para contactarte desde el PAR Los Charrúas. No los compartimos con nadie.
      </p>
    </form>
  );
}
