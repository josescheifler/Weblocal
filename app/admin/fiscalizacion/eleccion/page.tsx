import { Suspense } from "react";
import { prisma } from "../../../../lib/prisma";
import { borrarCargo, borrarLista, guardarCargo, guardarLista } from "../acciones";
import Formulario from "../../../components/admin/Formulario";
import BotonConfirmar from "../../../components/admin/BotonConfirmar";
import { Campo, Casilla, Tarjeta, TituloPanel, Vacio } from "../../../components/admin/Campos";

function CamposLista({ l }: { l?: { numero: string; nombre: string; orden: number; propia: boolean; color: string | null } }) {
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-[6rem_1fr_5rem_5rem]">
        <Campo etiqueta="Número" nombre="numero" defaultValue={l?.numero} maxLength={20} />
        <Campo etiqueta="Nombre" nombre="nombre" defaultValue={l?.nombre} maxLength={120} />
        <Campo etiqueta="Orden" nombre="orden" type="number" opcional defaultValue={l?.orden ?? ""} />
        <Campo etiqueta="Color" nombre="color" type="color" opcional defaultValue={l?.color ?? "#94a3b8"} className="[&_input]:h-[50px] [&_input]:p-1" />
      </div>
      <Casilla etiqueta="Es nuestra lista" nombre="propia" defaultChecked={l?.propia} ayuda="Se resalta en la carga y en los resultados." />
    </>
  );
}

async function Contenido() {
  const [listas, cargos, votos] = await Promise.all([
    prisma.lista.findMany({ orderBy: [{ orden: "asc" }, { numero: "asc" }] }),
    prisma.cargo.findMany({ orderBy: [{ orden: "asc" }, { nombre: "asc" }] }),
    prisma.votoMesa.count(),
  ]);

  return (
    <div className="space-y-6">
      {votos > 0 && (
        <p className="rounded-xl bg-amber-50 p-4 font-semibold text-amber-900 ring-1 ring-amber-200">
          Ya hay escrutinios cargados. Si borrás una lista o un cargo, se borran también sus votos.
        </p>
      )}
      <div className="grid gap-6 xl:grid-cols-2">
        <Tarjeta titulo="Listas / agrupaciones">
          <div className="space-y-3">
            {listas.length === 0 && <Vacio>Cargá todas las listas que compiten, también las de los demás espacios.</Vacio>}
            {listas.map((l) => (
              <details key={l.id} className="group rounded-xl border border-slate-200">
                <summary className="flex cursor-pointer list-none items-center gap-3 p-3">
                  <span className="h-4 w-4 rounded-full" style={{ background: l.color ?? "#94a3b8" }} />
                  <span className="font-bold">
                    {l.numero} · {l.nombre}
                  </span>
                  {l.propia && <span className="rounded-full bg-par-amarillo px-2 py-0.5 text-xs font-bold">Nuestra</span>}
                </summary>
                <div className="border-t border-slate-100 p-3">
                  <Formulario accion={guardarLista.bind(null, l.id)}>
                    <CamposLista l={l} />
                  </Formulario>
                  <form action={borrarLista} className="mt-3 text-right">
                    <input type="hidden" name="id" value={l.id} />
                    <BotonConfirmar mensaje={`¿Borrar la lista ${l.numero} y sus votos cargados?`}>Borrar</BotonConfirmar>
                  </form>
                </div>
              </details>
            ))}
          </div>
          <div className="mt-5 rounded-xl bg-slate-50 p-4">
            <p className="mb-3 font-bold">Agregar lista</p>
            <Formulario accion={guardarLista.bind(null, null)} textoBoton="Agregar" limpiar>
              <CamposLista />
            </Formulario>
          </div>
        </Tarjeta>

        <Tarjeta titulo="Cargos que se votan">
          <p className="mb-4 text-sm text-slate-600">
            Cada cargo es una columna del acta (por ejemplo: Gobernador, Diputados, Presidente Municipal, Concejales). Cargá solo los que
            querés fiscalizar.
          </p>
          <div className="space-y-3">
            {cargos.length === 0 && <Vacio>Todavía no hay cargos.</Vacio>}
            {cargos.map((c) => (
              <div key={c.id} className="rounded-xl border border-slate-200 p-3">
                <Formulario accion={guardarCargo.bind(null, c.id)}>
                  <div className="grid grid-cols-[1fr_5rem] gap-3">
                    <Campo etiqueta="Cargo" nombre="nombre" defaultValue={c.nombre} />
                    <Campo etiqueta="Orden" nombre="orden" type="number" opcional defaultValue={c.orden} />
                  </div>
                </Formulario>
                <form action={borrarCargo} className="mt-2 text-right">
                  <input type="hidden" name="id" value={c.id} />
                  <BotonConfirmar mensaje={`¿Borrar el cargo ${c.nombre} y sus votos cargados?`}>Borrar</BotonConfirmar>
                </form>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-xl bg-slate-50 p-4">
            <p className="mb-3 font-bold">Agregar cargo</p>
            <Formulario accion={guardarCargo.bind(null, null)} textoBoton="Agregar" limpiar>
              <div className="grid grid-cols-[1fr_5rem] gap-3">
                <Campo etiqueta="Cargo" nombre="nombre" placeholder="Ej: Presidente Municipal" />
                <Campo etiqueta="Orden" nombre="orden" type="number" opcional />
              </div>
            </Formulario>
          </div>
        </Tarjeta>
      </div>
    </div>
  );
}

export default function AdminEleccion() {
  return (
    <>
      <TituloPanel titulo="Listas y cargos" bajada="Lo que tienen que cargar los fiscales en cada mesa. Configuralo antes de la elección." />
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-slate-200" />}>
        <Contenido />
      </Suspense>
    </>
  );
}
