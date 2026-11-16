import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "../../../lib/prisma";
import { etiquetaCategoria, fechaCorta } from "../../../lib/formato";
import { TituloPanel, Vacio, claseBotonPrimario } from "../../components/admin/Campos";

async function Lista() {
  const noticias = await prisma.noticia.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, titulo: true, categoria: true, createdAt: true, imagenUrl: true },
  });
  if (noticias.length === 0) return <Vacio>Todavía no hay noticias. Publicá la primera.</Vacio>;
  return (
    <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white">
      {noticias.map((n) => (
        <li key={n.id}>
          <Link href={`/admin/noticias/${n.id}`} className="flex items-center gap-4 p-4 transition hover:bg-slate-50">
            <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-par-tinta">
              {n.imagenUrl && <img src={n.imagenUrl} alt="" className="h-full w-full object-cover" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold text-slate-900">{n.titulo}</p>
              <p className="text-sm text-slate-500">
                {etiquetaCategoria(n.categoria)} · {fechaCorta(n.createdAt)}
              </p>
            </div>
            <span className="text-sm font-bold text-par-celeste-oscuro">Editar →</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function AdminNoticias() {
  return (
    <>
      <TituloPanel titulo="Noticias" bajada="Novedades, avances de la construcción, actividades, comunicados y notas de otros medios.">
        <Link href="/admin/noticias/nueva" className={claseBotonPrimario}>
          + Nueva noticia
        </Link>
      </TituloPanel>
      <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-slate-200" />}>
        <Lista />
      </Suspense>
    </>
  );
}
