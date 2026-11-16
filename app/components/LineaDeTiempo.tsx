import type { Hito } from "@prisma/client";
import { etiquetaEstadoHito } from "../../lib/contenido";
import { mesAnio } from "../../lib/formato";

type Props = { hitos: Pick<Hito, "id" | "titulo" | "descripcion" | "fecha" | "estado">[]; oscuro?: boolean };

const ESTILO = {
  HECHO: { punto: "bg-par-amarillo ring-par-amarillo/30", etiqueta: "bg-par-amarillo text-par-tinta" },
  EN_CURSO: { punto: "bg-par-celeste ring-par-celeste/30 animate-pulse", etiqueta: "bg-par-celeste text-par-tinta" },
  PROXIMO: { punto: "border-[3px] border-par-celeste bg-white ring-transparent", etiqueta: "bg-white text-par-tinta ring-1 ring-par-tinta/15" },
} as const;

/** Línea de tiempo vertical con los pasos de la construcción */
export default function LineaDeTiempo({ hitos, oscuro = false }: Props) {
  if (hitos.length === 0) return null;
  return (
    <ol className={`relative space-y-10 border-l-2 pl-8 md:pl-12 ${oscuro ? "border-white/15" : "border-par-tinta/15"}`}>
      {hitos.map((h) => {
        const estilo = ESTILO[h.estado as keyof typeof ESTILO] ?? ESTILO.PROXIMO;
        return (
          <li key={h.id} className="revelar relative">
            <span
              className={`absolute -left-[calc(2rem+9px)] top-1.5 h-4 w-4 rounded-full ring-4 md:-left-[calc(3rem+9px)] ${estilo.punto}`}
              aria-hidden="true"
            />
            <div className="flex flex-wrap items-center gap-3">
              <span className={`rounded-full px-3 py-1 font-display text-sm font-bold uppercase tracking-wider ${estilo.etiqueta}`}>
                {etiquetaEstadoHito(h.estado)}
              </span>
              {h.fecha && (
                <span className={`font-display text-sm font-bold uppercase tracking-[0.18em] ${oscuro ? "text-white/55" : "text-par-tinta/55"}`}>
                  {mesAnio(h.fecha)}
                </span>
              )}
            </div>
            <h3 className={`titular mt-3 text-3xl md:text-4xl ${h.estado === "PROXIMO" ? "opacity-75" : ""}`}>{h.titulo}</h3>
            {h.descripcion && (
              <p className={`mt-2 max-w-2xl ${oscuro ? "text-white/70" : "text-par-tinta/70"}`}>{h.descripcion}</p>
            )}
          </li>
        );
      })}
    </ol>
  );
}
