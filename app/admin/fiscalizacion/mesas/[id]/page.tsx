import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "../../../../../lib/prisma";
import { datosEscrutinio } from "../../../../../lib/escrutinio";
import { fechaCorta, hora } from "../../../../../lib/formato";
import {
  borrarMesa,
  cambiarVerificacion,
  escrutinioAdmin,
  estadoMesaAdmin,
  guardarMesa,
  incidenciaAdmin,
  participacionAdmin,
  reiniciarEscrutinio,
} from "../../acciones";
import Formulario from "../../../../components/admin/Formulario";
import BotonConfirmar from "../../../../components/admin/BotonConfirmar";
import { Campo, Selector, Tarjeta, TituloPanel } from "../../../../components/admin/Campos";
import PanelMesa from "../../../../components/fiscal/PanelMesa";

type Props = { params: Promise<{ id: string }> };

async function Detalle({ params }: Props) {
  const { id } = await params;
  const [datos, escuelas, fiscales] = await Promise.all([
    datosEscrutinio(id),
    prisma.escuela.findMany({ orderBy: [{ orden: "asc" }, { nombre: "asc" }], select: { id: true, nombre: true } }),
    prisma.fiscal.findMany({ where: { activo: true }, orderBy: { nombre: "asc" }, select: { id: true, nombre: true, dni: true } }),
  ]);
  if (!datos) notFound();
  const { mesa } = datos;
  const escrutada = mesa.estado === "ESCRUTADA";

  return (
    <>
      <Link href="/admin/fiscalizacion" className="text-sm font-bold text-par-celeste-oscuro">
        ← Tablero
      </Link>
      <TituloPanel
        titulo={`Mesa ${mesa.numero}`}
        bajada={`${mesa.escuela.nombre}${mesa.electores ? ` · ${mesa.electores} electores` : ""} · Fiscal: ${mesa.fiscal?.nombre ?? "sin asignar"}${
          mesa.fiscal?.telefono ? ` (${mesa.fiscal.telefono})` : ""
        }`}
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
        <PanelMesa
          datos={datos}
          acciones={{
            estado: estadoMesaAdmin.bind(null, mesa.id),
            participacion: participacionAdmin.bind(null, mesa.id),
            escrutinio: escrutinioAdmin.bind(null, mesa.id),
            incidencia: incidenciaAdmin.bind(null, mesa.id),
          }}
        />

        <div className="space-y-6">
          {escrutada && (
            <Tarjeta titulo="Control">
              <p className="mb-3 text-sm text-slate-600">
                Cargada el {mesa.escrutadaAt ? `${fechaCorta(mesa.escrutadaAt)} a las ${hora(mesa.escrutadaAt)}` : "—"}.
                {mesa.verificada
                  ? " Verificada: el fiscal ya no puede modificarla."
                  : " Compará con la foto del acta y marcala como verificada."}
              </p>
              {datos.tieneFoto && (
                <a href={`/actas/${mesa.id}`} target="_blank" className="mb-4 block overflow-hidden rounded-xl ring-1 ring-slate-200">
                  <img src={`/actas/${mesa.id}?v=${mesa.updatedAt.getTime()}`} alt={`Acta de la mesa ${mesa.numero}`} className="w-full" />
                </a>
              )}
              <form action={cambiarVerificacion}>
                <input type="hidden" name="id" value={mesa.id} />
                <button
                  type="submit"
                  className={`w-full rounded-xl px-4 py-3 font-bold ${mesa.verificada ? "bg-slate-100 text-slate-700" : "bg-emerald-600 text-white hover:bg-emerald-700"}`}
                >
                  {mesa.verificada ? "Quitar verificación" : "✓ Marcar como verificada"}
                </button>
              </form>
              <form action={reiniciarEscrutinio} className="mt-3 text-center">
                <input type="hidden" name="id" value={mesa.id} />
                <BotonConfirmar mensaje="¿Borrar el escrutinio cargado y la foto? La mesa vuelve a quedar como Cerrada.">
                  Borrar escrutinio cargado
                </BotonConfirmar>
              </form>
            </Tarjeta>
          )}

          <Tarjeta titulo="Datos de la mesa">
            <Formulario accion={guardarMesa.bind(null, mesa.id)}>
              <div className="grid grid-cols-2 gap-3">
                <Campo etiqueta="Número" nombre="numero" defaultValue={mesa.numero} maxLength={12} />
                <Campo etiqueta="Electores" nombre="electores" type="number" min={0} opcional defaultValue={mesa.electores ?? ""} />
              </div>
              <Selector etiqueta="Escuela" nombre="escuelaId" defaultValue={mesa.escuela.id} opciones={escuelas.map((e) => ({ valor: e.id, etiqueta: e.nombre }))} />
              <Selector
                etiqueta="Fiscal de mesa"
                nombre="fiscalId"
                opcional
                defaultValue={mesa.fiscal?.id ?? ""}
                opciones={[{ valor: "", etiqueta: "— Sin asignar —" }, ...fiscales.map((f) => ({ valor: f.id, etiqueta: `${f.nombre} (${f.dni})` }))]}
              />
            </Formulario>
            <form action={borrarMesa} className="mt-4 text-right">
              <input type="hidden" name="id" value={mesa.id} />
              <BotonConfirmar mensaje={`¿Borrar la mesa ${mesa.numero} con todos sus datos?`}>Borrar mesa</BotonConfirmar>
            </form>
          </Tarjeta>
        </div>
      </div>
    </>
  );
}

export default function MesaAdmin({ params }: Props) {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-slate-200" />}>
      <Detalle params={params} />
    </Suspense>
  );
}
