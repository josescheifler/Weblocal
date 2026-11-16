import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "../../../../lib/prisma";
import { datosGravedad, etiquetaIncidencia } from "../../../../lib/fiscalizacion";
import { fechaCorta, hora } from "../../../../lib/formato";
import { cambiarResuelta } from "../acciones";
import AutoRefresco from "../../../components/admin/AutoRefresco";
import { TituloPanel, Vacio } from "../../../components/admin/Campos";

const ORDEN_GRAVEDAD: Record<string, number> = { ALTA: 0, MEDIA: 1, BAJA: 2 };

async function Lista() {
  const incidencias = await prisma.incidencia.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      mesa: { select: { id: true, numero: true } },
      escuela: { select: { nombre: true } },
      fiscal: { select: { nombre: true, telefono: true } },
    },
  });
  if (incidencias.length === 0) return <Vacio>No hay incidencias reportadas. 🎉</Vacio>;
  incidencias.sort((a, b) => Number(a.resuelta) - Number(b.resuelta) || (ORDEN_GRAVEDAD[a.gravedad] ?? 1) - (ORDEN_GRAVEDAD[b.gravedad] ?? 1));

  return (
    <ul className="space-y-3">
      {incidencias.map((i) => (
        <li key={i.id} className={`rounded-2xl border bg-white p-4 ${i.resuelta ? "border-slate-200 opacity-60" : i.gravedad === "ALTA" ? "border-red-300" : "border-slate-200"}`}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <span className={`mr-2 rounded-full px-2 py-0.5 text-xs font-bold ${datosGravedad(i.gravedad).color}`}>{datosGravedad(i.gravedad).etiqueta}</span>
              <strong>{etiquetaIncidencia(i.tipo)}</strong>
              <p className="mt-1 text-sm text-slate-500">
                {i.mesa ? (
                  <Link href={`/admin/fiscalizacion/mesas/${i.mesa.id}`} className="font-bold text-par-celeste-oscuro">
                    Mesa {i.mesa.numero}
                  </Link>
                ) : (
                  "Sin mesa"
                )}
                {i.escuela && ` · ${i.escuela.nombre}`} · {fechaCorta(i.createdAt)} {hora(i.createdAt)}
                {i.fiscal && (
                  <>
                    {" "}
                    · {i.fiscal.nombre}
                    {i.fiscal.telefono && (
                      <a href={`tel:${i.fiscal.telefono}`} className="ml-1 font-bold text-par-celeste-oscuro">
                        📞 {i.fiscal.telefono}
                      </a>
                    )}
                  </>
                )}
              </p>
            </div>
            <form action={cambiarResuelta}>
              <input type="hidden" name="id" value={i.id} />
              <button type="submit" className={`rounded-lg px-3 py-2 text-sm font-bold ${i.resuelta ? "bg-slate-100" : "bg-emerald-600 text-white hover:bg-emerald-700"}`}>
                {i.resuelta ? "Reabrir" : "✓ Resuelta"}
              </button>
            </form>
          </div>
          <p className="mt-3 whitespace-pre-line">{i.descripcion}</p>
        </li>
      ))}
    </ul>
  );
}

export default function AdminIncidencias() {
  return (
    <>
      <TituloPanel titulo="Incidencias" bajada="Problemas reportados por los fiscales. Las urgentes sin resolver aparecen primero.">
        <AutoRefresco segundos={30} />
      </TituloPanel>
      <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-slate-200" />}>
        <Lista />
      </Suspense>
    </>
  );
}
