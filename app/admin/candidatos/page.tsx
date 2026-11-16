import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "../../../lib/prisma";
import { ordenCargo } from "../../../lib/contenido";
import { iniciales } from "../../../lib/formato";
import { TituloPanel, Vacio, claseBotonPrimario } from "../../components/admin/Campos";

async function Lista() {
  const candidatos = await prisma.candidato.findMany({ orderBy: [{ orden: "asc" }, { createdAt: "asc" }] });
  if (candidatos.length === 0) return <Vacio>Todavía no cargaste candidatos.</Vacio>;
  const ordenados = [...candidatos].sort((a, b) => ordenCargo(a.cargo) - ordenCargo(b.cargo) || a.orden - b.orden);
  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {ordenados.map((c) => (
        <li key={c.id}>
          <Link
            href={`/admin/candidatos/${c.id}`}
            className={`flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-par-celeste ${c.activo ? "" : "opacity-50"}`}
          >
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-par-tinta">
              {c.fotoUrl ? (
                <img src={c.fotoUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full items-center justify-center font-display text-xl font-bold text-white">{iniciales(c.nombre)}</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate font-bold">{c.nombre}</p>
              <p className="text-sm text-slate-500">
                {c.cargo}
                {c.orden > 0 && ` · Nº ${c.orden}`}
                {!c.activo && " · Oculto"}
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function AdminCandidatos() {
  return (
    <>
      <TituloPanel titulo="Candidatos" bajada="Se muestran agrupados por cargo y ordenados por su número en la lista.">
        <Link href="/admin/candidatos/nuevo" className={claseBotonPrimario}>
          + Nuevo candidato
        </Link>
      </TituloPanel>
      <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-slate-200" />}>
        <Lista />
      </Suspense>
    </>
  );
}
