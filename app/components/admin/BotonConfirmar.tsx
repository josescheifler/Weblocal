"use client";

import { useFormStatus } from "react-dom";

/** Botón de envío que pide confirmación antes (para borrar, resetear claves, etc.). */
export default function BotonConfirmar({
  children,
  mensaje,
  className = "rounded-lg px-3 py-2 text-sm font-bold text-red-600 transition hover:bg-red-50",
}: {
  children: React.ReactNode;
  mensaje: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`${className} disabled:opacity-50`}
      onClick={(e) => {
        if (!window.confirm(mensaje)) e.preventDefault();
      }}
    >
      {pending ? "…" : children}
    </button>
  );
}
