import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "../../../lib/prisma";
import { datosEje } from "../../../lib/contenido";
import IconoEje from "../../components/IconoEje";
import { TituloPanel, Vacio, claseBotonPrimario } from "../../components/admin/Campos";

async function Lista() {
  const propuestas = await prisma.propuesta.findMany({ orderBy: [{ orden: "asc" }, { createdAt: "asc" }] });
  if (propuestas.length === 0) return <Vacio>Todavía no cargaste propuestas.</Vacio>;
  return (
    <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white">
      {propuestas.map((p) => (
        <li key={p.id}>
          <Link href={`/admin/propuestas/${p.id}`} className={`flex items-center gap-4 p-4 transition hover:bg-slate-50 ${p.activo ? "" : "opacity-50"}`}>
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-par-tinta text-par-amarillo">
              <IconoEje eje={p.eje} className="h-6 w-6" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold">{p.titulo}</p>
              <p className="text-sm text-slate-500">
                {datosEje(p.eje).etiqueta} · orden {p.orden}
                {!p.activo && " · Oculta"}
              </p>
            </div>
            <span className="text-sm font-bold text-par-celeste-oscuro">Editar →</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function AdminPropuestas() {
  return (
    <>
      <TituloPanel titulo="Propuestas" bajada="Una propuesta por eje, con un resumen y la lista de medidas concretas.">
        <Link href="/admin/propuestas/nueva" className={claseBotonPrimario}>
          + Nueva propuesta
        </Link>
      </TituloPanel>
      <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-slate-200" />}>
        <Lista />
      </Suspense>
    </>
  );
}
