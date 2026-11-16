import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "../../lib/prisma";
import { exigirFiscal } from "../../lib/sesion";
import { compararNumeroMesa, datosEstadoMesa } from "../../lib/fiscalizacion";
import EncabezadoFiscal from "../components/fiscal/EncabezadoFiscal";

async function MisMesas() {
  const fiscal = await exigirFiscal();
  const mesas = await prisma.mesa.findMany({
    where:
      fiscal.rol === "GENERAL" && fiscal.escuelaId
        ? { OR: [{ escuelaId: fiscal.escuelaId }, { fiscalId: fiscal.id }] }
        : { fiscalId: fiscal.id },
    select: {
      id: true,
      numero: true,
      estado: true,
      electores: true,
      verificada: true,
      escuela: { select: { nombre: true, direccion: true } },
      fiscal: { select: { nombre: true } },
      foto: { select: { id: true } },
    },
  });
  mesas.sort((a, b) => compararNumeroMesa(a.numero, b.numero));
  const escuelas = [...new Set(mesas.map((m) => `${m.escuela.nombre}|${m.escuela.direccion ?? ""}`))];

  return (
    <>
      <EncabezadoFiscal fiscal={fiscal} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        <h1 className="titular text-5xl text-par-tinta">{mesas.length === 1 ? "Tu mesa" : "Tus mesas"}</h1>
        {escuelas.map((e) => {
          const [nombre, direccion] = e.split("|");
          return (
            <p key={e} className="mt-2 text-slate-600">
              <strong className="text-slate-800">{nombre}</strong>
              {direccion && ` · ${direccion}`}
            </p>
          );
        })}

        {mesas.length === 0 ? (
          <p className="mt-8 rounded-2xl border-2 border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
            Todavía no tenés mesas asignadas. Tu coordinador te las va a asignar antes de la elección.
          </p>
        ) : (
          <ul className="mt-6 space-y-3">
            {mesas.map((m) => {
              const estado = datosEstadoMesa(m.estado);
              return (
                <li key={m.id}>
                  <Link
                    href={`/fiscal/mesa/${m.id}`}
                    className="flex items-center gap-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition active:scale-[0.99]"
                  >
                    <span className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-par-tinta text-white">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-white/60">Mesa</span>
                      <span className="font-display text-2xl font-bold leading-none">{m.numero}</span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${estado.color}`}>{estado.etiqueta}</span>
                      {m.verificada && <span className="ml-2 text-xs font-bold text-emerald-700">✓ Verificada</span>}
                      <span className="mt-1 block text-sm text-slate-600">
                        {m.electores ? `${m.electores} electores` : "Electores sin cargar"}
                        {m.estado === "ESCRUTADA" && (m.foto ? " · con foto del acta" : " · falta foto del acta")}
                      </span>
                      {fiscal.rol === "GENERAL" && (
                        <span className="block text-xs text-slate-500">Fiscal: {m.fiscal?.nombre ?? "sin asignar"}</span>
                      )}
                    </span>
                    <span className="text-2xl text-par-celeste-oscuro" aria-hidden="true">
                      →
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-8 rounded-3xl bg-par-tinta p-6 text-white">
          <p className="titular text-3xl text-par-amarillo">Recordá</p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-white/80">
            <li>Llegá antes de las 7:30 y presentate con las autoridades de mesa.</li>
            <li>Controlá que estén todas las boletas en el cuarto oscuro durante toda la jornada.</li>
            <li>No te vayas sin firmar el acta y sacarle una foto.</li>
          </ul>
        </div>
      </main>
    </>
  );
}

export default function PanelFiscal() {
  return (
    <Suspense fallback={<div className="h-screen animate-pulse bg-slate-200" />}>
      <MisMesas />
    </Suspense>
  );
}
