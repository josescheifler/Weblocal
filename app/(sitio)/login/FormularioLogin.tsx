"use client";

import { useActionState } from "react";
import { iniciarSesion } from "./acciones";

export default function FormularioLogin() {
  const [error, accion, enviando] = useActionState(iniciarSesion, null);

  return (
    <form action={accion} className="flex flex-col gap-4">
      <input
        type="password"
        name="password"
        placeholder="Contraseña"
        required
        autoComplete="current-password"
        className="w-full rounded-2xl border-2 border-par-tinta/10 bg-par-papel p-4 text-center text-lg tracking-widest outline-none transition focus:border-par-celeste"
      />
      <button
        type="submit"
        disabled={enviando}
        className="w-full rounded-2xl bg-par-amarillo p-4 font-display text-xl font-bold uppercase tracking-wider text-par-tinta transition hover:bg-par-tinta hover:text-par-amarillo disabled:opacity-60"
      >
        {enviando ? "Entrando..." : "Entrar"}
      </button>
      {error && (
        <p role="alert" className="text-red-600 font-bold">
          {error}
        </p>
      )}
    </form>
  );
}
