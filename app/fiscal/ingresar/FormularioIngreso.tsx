"use client";

import { startTransition, useActionState } from "react";
import { ingresarFiscal } from "../acciones";

export default function FormularioIngreso() {
  const [estado, accion, enviando] = useActionState(ingresarFiscal, null);
  const campo =
    "w-full rounded-2xl border-2 border-par-tinta/10 bg-par-papel p-4 text-center font-display text-3xl font-bold tracking-[0.2em] outline-none transition focus:border-par-celeste";

  return (
    <form
      action={accion}
      onSubmit={(e) => {
        e.preventDefault();
        const datos = new FormData(e.currentTarget);
        startTransition(() => accion(datos));
      }}
      className="flex flex-col gap-4 text-left"
    >
      <label>
        <span className="mb-2 block font-display text-sm font-bold uppercase tracking-[0.18em] text-par-tinta/70">DNI (sin puntos)</span>
        <input name="dni" inputMode="numeric" pattern="[0-9.]*" autoComplete="username" required maxLength={12} className={campo} />
      </label>
      <label>
        <span className="mb-2 block font-display text-sm font-bold uppercase tracking-[0.18em] text-par-tinta/70">Clave</span>
        <input
          name="clave"
          type="password"
          inputMode="numeric"
          autoComplete="current-password"
          required
          maxLength={64}
          className={campo}
        />
      </label>
      {estado?.error && (
        <p role="alert" className="rounded-xl bg-red-50 p-3 text-center font-bold text-red-700">
          {estado.error}
        </p>
      )}
      <button
        type="submit"
        disabled={enviando}
        className="mt-2 w-full rounded-2xl bg-par-amarillo p-4 font-display text-2xl font-bold uppercase tracking-wider text-par-tinta transition hover:bg-par-tinta hover:text-par-amarillo disabled:opacity-60"
      >
        {enviando ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
