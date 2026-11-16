"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/** Vuelve a pedir los datos de la página cada tantos segundos (para el tablero del día de la elección). */
export default function AutoRefresco({ segundos = 30 }: { segundos?: number }) {
  const router = useRouter();
  const [activo, setActivo] = useState(true);
  const [ultima, setUltima] = useState<string>("");

  useEffect(() => {
    const marcar = () => setUltima(new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "America/Argentina/Buenos_Aires" }));
    marcar();
    if (!activo) return;
    const t = setInterval(() => {
      if (document.visibilityState === "visible") {
        router.refresh();
        marcar();
      }
    }, segundos * 1000);
    return () => clearInterval(t);
  }, [activo, segundos, router]);

  return (
    <button
      type="button"
      onClick={() => setActivo(!activo)}
      className={`inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold ring-1 ${
        activo ? "bg-emerald-50 text-emerald-800 ring-emerald-200" : "bg-white text-slate-600 ring-slate-200"
      }`}
      title="Pausar o reanudar la actualización automática"
    >
      <span className={`h-2.5 w-2.5 rounded-full ${activo ? "animate-pulse bg-emerald-500" : "bg-slate-400"}`} />
      {activo ? `En vivo · ${ultima}` : "Pausado"}
    </button>
  );
}
