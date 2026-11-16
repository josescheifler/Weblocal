import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { exigirFiscal } from "../../../../lib/sesion";
import { datosEscrutinio } from "../../../../lib/escrutinio";
import { puedeOperarMesa } from "../../../../lib/fiscalizacion";
import { cambiarEstadoMesa, cargarEscrutinio, reportarIncidencia, reportarParticipacion } from "../../acciones";
import EncabezadoFiscal from "../../../components/fiscal/EncabezadoFiscal";
import PanelMesa from "../../../components/fiscal/PanelMesa";

type Props = { params: Promise<{ id: string }> };

async function Mesa({ params }: Props) {
  const fiscal = await exigirFiscal();
  const { id } = await params;
  const datos = await datosEscrutinio(id);
  if (!datos || !puedeOperarMesa(fiscal, datos.mesa)) notFound();
  const { mesa } = datos;

  return (
    <>
      <EncabezadoFiscal fiscal={fiscal} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        <Link href="/fiscal" className="font-bold text-par-celeste-oscuro">
          ← Mis mesas
        </Link>
        <div className="mb-6 mt-4">
          <h1 className="titular text-6xl text-par-tinta">Mesa {mesa.numero}</h1>
          <p className="mt-1 text-slate-600">
            {mesa.escuela.nombre}
            {mesa.escuela.direccion && ` · ${mesa.escuela.direccion}`}
            {mesa.electores ? ` · ${mesa.electores} electores` : ""}
          </p>
        </div>
        <PanelMesa
          datos={datos}
          acciones={{
            estado: cambiarEstadoMesa.bind(null, mesa.id),
            participacion: reportarParticipacion.bind(null, mesa.id),
            escrutinio: cargarEscrutinio.bind(null, mesa.id),
            incidencia: reportarIncidencia.bind(null, mesa.id),
          }}
          bloquearEscrutinio={mesa.verificada}
          avisoBloqueo={mesa.verificada ? "✓ El comando central verificó esta mesa. Si hay que corregir algo, hablá con tu coordinador." : undefined}
        />
      </main>
    </>
  );
}

export default function PaginaMesa({ params }: Props) {
  return (
    <Suspense fallback={<div className="h-screen animate-pulse bg-slate-200" />}>
      <Mesa params={params} />
    </Suspense>
  );
}
