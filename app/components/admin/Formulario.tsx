"use client";

import { startTransition, useActionState, useEffect, useRef } from "react";
import type { EstadoFormulario } from "../../../lib/formularios";

type Props = {
  accion: (previo: EstadoFormulario, form: FormData) => Promise<EstadoFormulario>;
  children: React.ReactNode;
  textoBoton?: string;
  textoEnviando?: string;
  className?: string;
  /** Vuelve a dejar el formulario vacío después de guardar bien (para altas rápidas) */
  limpiar?: boolean;
  botonSecundario?: React.ReactNode;
};

/** Formulario del panel: muestra el error o la confirmación que devuelve la Server Action. */
export default function Formulario({
  accion,
  children,
  textoBoton = "Guardar",
  textoEnviando = "Guardando…",
  className = "",
  limpiar = false,
  botonSecundario,
}: Props) {
  const [estado, ejecutar, enviando] = useActionState(accion, null);
  const formRef = useRef<HTMLFormElement>(null);

  // En altas rápidas, dejamos el formulario vacío para cargar el siguiente
  useEffect(() => {
    if (limpiar && estado?.ok) formRef.current?.reset();
  }, [estado, limpiar]);

  return (
    <form
      ref={formRef}
      action={ejecutar}
      className={`space-y-5 ${className}`}
      // Enviamos a mano para que React no vacíe los campos (si hay un error, no se pierde lo escrito)
      onSubmit={(e) => {
        e.preventDefault();
        const datos = new FormData(e.currentTarget);
        startTransition(() => ejecutar(datos));
      }}
    >
      {children}
      {estado?.error && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 font-semibold text-red-700">
          {estado.error}
        </p>
      )}
      {estado?.ok && (
        <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 font-semibold text-emerald-800">
          {estado.ok}
          {estado.extra && <p className="mt-2 font-mono text-2xl tracking-widest text-emerald-900">{estado.extra}</p>}
        </div>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={enviando}
          className="rounded-xl bg-par-tinta px-6 py-3 font-display text-lg font-bold uppercase tracking-wider text-white transition hover:bg-par-celeste-oscuro disabled:opacity-60"
        >
          {enviando ? textoEnviando : textoBoton}
        </button>
        {botonSecundario}
      </div>
    </form>
  );
}
