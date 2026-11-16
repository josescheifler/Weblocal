import type { Propuesta } from "@prisma/client";
import { datosEje } from "../../lib/contenido";
import IconoEje from "./IconoEje";

type Props = {
  propuesta: Pick<Propuesta, "id" | "eje" | "titulo" | "resumen" | "detalle">;
  numero: number;
  completa?: boolean;
};

export default function TarjetaPropuesta({ propuesta, numero, completa = false }: Props) {
  const medidas = (propuesta.detalle ?? "")
    .split("\n")
    .map((l) => l.replace(/^[-•*\d.)\s]+/, "").trim())
    .filter(Boolean);

  return (
    <article
      id={completa ? `propuesta-${propuesta.id}` : undefined}
      className="group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-white p-7 ring-1 ring-par-tinta/8 transition duration-500 hover:-translate-y-1 hover:shadow-[0_30px_60px_-30px_rgba(7,63,85,0.45)] md:p-9"
    >
      <span className="titular pointer-events-none absolute -right-2 -top-4 text-[7rem] text-par-tinta/[0.05]">
        {String(numero).padStart(2, "0")}
      </span>
      <div className="flex items-center gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-par-tinta text-par-amarillo transition group-hover:bg-par-amarillo group-hover:text-par-tinta">
          <IconoEje eje={propuesta.eje} />
        </span>
        <span className="antetitulo text-sm text-par-celeste-oscuro">{datosEje(propuesta.eje).etiqueta}</span>
      </div>
      <h3 className="titular mt-6 text-[2.1rem]">{propuesta.titulo}</h3>
      <p className="mt-4 text-par-tinta/70">{propuesta.resumen}</p>
      {completa && medidas.length > 0 && (
        <ul className="mt-6 space-y-3 border-t border-par-tinta/10 pt-6">
          {medidas.map((m, i) => (
            <li key={i} className="flex gap-3 text-par-tinta/85">
              <span className="mt-2 h-2 w-2 shrink-0 rotate-45 bg-par-amarillo" aria-hidden="true" />
              <span>{m}</span>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
