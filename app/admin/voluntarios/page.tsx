import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "../../../lib/prisma";
import { fechaCorta } from "../../../lib/formato";
import { borrarVoluntario, cambiarContactado } from "../acciones";
import BotonConfirmar from "../../components/admin/BotonConfirmar";
import { TituloPanel, Vacio, claseBotonSecundario } from "../../components/admin/Campos";

type Props = { searchParams: Promise<{ filtro?: string }> };

const FILTROS = [
  { valor: "", texto: "Todos" },
  { valor: "fiscales", texto: "Quieren ser fiscales" },
  { valor: "pendientes", texto: "Sin contactar" },
];

async function Lista({ searchParams }: Props) {
  const { filtro = "" } = await searchParams;
  const voluntarios = await prisma.voluntario.findMany({
    where: filtro === "fiscales" ? { quiereFiscal: true } : filtro === "pendientes" ? { contactado: false } : {},
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <nav className="mb-6 flex flex-wrap gap-2">
        {FILTROS.map((f) => (
          <Link
            key={f.valor}
            href={f.valor ? `/admin/voluntarios?filtro=${f.valor}` : "/admin/voluntarios"}
            className={`rounded-full px-4 py-2 text-sm font-bold ${filtro === f.valor ? "bg-par-tinta text-par-amarillo" : "bg-white text-slate-700 ring-1 ring-slate-200"}`}
          >
            {f.texto}
          </Link>
        ))}
      </nav>
      {voluntarios.length === 0 ? (
        <Vacio>No hay voluntarios en esta lista.</Vacio>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full min-w-[44rem] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="p-3">Nombre</th>
                <th className="p-3">Contacto</th>
                <th className="p-3">Barrio</th>
                <th className="p-3">Mensaje</th>
                <th className="p-3">Fecha</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {voluntarios.map((v) => {
                const tel = v.telefono.replace(/\D/g, "");
                return (
                  <tr key={v.id} className={v.contactado ? "bg-emerald-50/40" : ""}>
                    <td className="p-3 font-bold">
                      {v.nombre}
                      {v.quiereFiscal && (
                        <span className="ml-2 rounded-full bg-par-amarillo px-2 py-0.5 text-[10px] font-bold uppercase">Fiscal</span>
                      )}
                    </td>
                    <td className="p-3">
                      <a href={`https://wa.me/${tel.startsWith("54") ? tel : `549${tel.replace(/^0/, "")}`}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-par-celeste-oscuro hover:underline">
                        {v.telefono}
                      </a>
                      {v.dni && <span className="block text-xs text-slate-500">DNI {v.dni}</span>}
                    </td>
                    <td className="p-3">{v.barrio ?? "—"}</td>
                    <td className="max-w-xs p-3 text-slate-600">{v.mensaje ?? "—"}</td>
                    <td className="whitespace-nowrap p-3 text-slate-500">{fechaCorta(v.createdAt)}</td>
                    <td className="whitespace-nowrap p-3 text-right">
                      <form action={cambiarContactado} className="inline">
                        <input type="hidden" name="id" value={v.id} />
                        <button type="submit" className={`rounded-lg px-3 py-1.5 text-xs font-bold ${v.contactado ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>
                          {v.contactado ? "✓ Contactado" : "Marcar contactado"}
                        </button>
                      </form>
                      <form action={borrarVoluntario} className="inline">
                        <input type="hidden" name="id" value={v.id} />
                        <BotonConfirmar mensaje={`¿Borrar a ${v.nombre}?`} className="ml-1 rounded-lg px-2 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50">
                          Borrar
                        </BotonConfirmar>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export default function AdminVoluntarios({ searchParams }: Props) {
  return (
    <>
      <TituloPanel titulo="Voluntarios" bajada="Vecinos que se anotaron desde el sitio. Los que quieren ser fiscales tienen la etiqueta “Fiscal”.">
        <a href="/admin/voluntarios/csv" className={claseBotonSecundario}>
          Descargar planilla
        </a>
      </TituloPanel>
      <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-slate-200" />}>
        <Lista searchParams={searchParams} />
      </Suspense>
    </>
  );
}
