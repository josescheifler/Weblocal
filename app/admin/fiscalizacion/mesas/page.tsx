import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "../../../../lib/prisma";
import { compararNumeroMesa, datosEstadoMesa } from "../../../../lib/fiscalizacion";
import { borrarEscuela, guardarEscuela, guardarMesa, importarPadron } from "../acciones";
import Formulario from "../../../components/admin/Formulario";
import BotonConfirmar from "../../../components/admin/BotonConfirmar";
import { AreaTexto, Campo, Selector, Tarjeta, TituloPanel, Vacio } from "../../../components/admin/Campos";

async function Contenido() {
  const [escuelas, fiscales] = await Promise.all([
    prisma.escuela.findMany({
      orderBy: [{ orden: "asc" }, { nombre: "asc" }],
      include: { mesas: { select: { id: true, numero: true, electores: true, estado: true, fiscal: { select: { nombre: true } } } } },
    }),
    prisma.fiscal.findMany({ where: { activo: true }, orderBy: { nombre: "asc" }, select: { id: true, nombre: true } }),
  ]);
  const totalMesas = escuelas.reduce((n, e) => n + e.mesas.length, 0);
  const totalElectores = escuelas.reduce((n, e) => n + e.mesas.reduce((m, x) => m + (x.electores ?? 0), 0), 0);

  return (
    <div className="space-y-6">
      <p className="text-slate-600">
        {escuelas.length} escuelas · {totalMesas} mesas · {totalElectores.toLocaleString("es-AR")} electores
      </p>

      {escuelas.length === 0 && <Vacio>Todavía no hay escuelas. Usá la carga rápida de abajo o agregalas una por una.</Vacio>}

      {escuelas.map((e) => {
        e.mesas.sort((a, b) => compararNumeroMesa(a.numero, b.numero));
        return (
          <Tarjeta
            key={e.id}
            titulo={e.nombre}
            acciones={
              <form action={borrarEscuela}>
                <input type="hidden" name="id" value={e.id} />
                <BotonConfirmar mensaje={`¿Borrar ${e.nombre} y TODAS sus mesas con sus datos? No se puede deshacer.`}>Borrar escuela</BotonConfirmar>
              </form>
            }
          >
            {e.direccion && <p className="-mt-2 mb-4 text-sm text-slate-500">{e.direccion}</p>}
            {e.mesas.length > 0 ? (
              <div className="mb-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {e.mesas.map((m) => (
                  <Link
                    key={m.id}
                    href={`/admin/fiscalizacion/mesas/${m.id}`}
                    className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 p-3 transition hover:border-par-celeste"
                  >
                    <span>
                      <span className="font-display text-xl font-bold">Mesa {m.numero}</span>
                      <span className="block text-xs text-slate-500">
                        {m.electores ?? "?"} electores · {m.fiscal?.nombre ?? <span className="font-bold text-red-600">sin fiscal</span>}
                      </span>
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${datosEstadoMesa(m.estado).color}`}>{datosEstadoMesa(m.estado).etiqueta}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="mb-5 text-sm text-slate-500">Sin mesas.</p>
            )}
            <details className="rounded-xl bg-slate-50 p-4">
              <summary className="cursor-pointer font-bold text-par-celeste-oscuro">+ Agregar mesa / editar escuela</summary>
              <div className="mt-4 grid gap-6 lg:grid-cols-2">
                <Formulario accion={guardarMesa.bind(null, null)} textoBoton="Agregar mesa" limpiar>
                  <input type="hidden" name="escuelaId" value={e.id} />
                  <div className="grid grid-cols-2 gap-3">
                    <Campo etiqueta="Número" nombre="numero" maxLength={12} />
                    <Campo etiqueta="Electores" nombre="electores" type="number" min={0} opcional />
                  </div>
                  <Selector
                    etiqueta="Fiscal"
                    nombre="fiscalId"
                    opcional
                    opciones={[{ valor: "", etiqueta: "— Sin asignar —" }, ...fiscales.map((f) => ({ valor: f.id, etiqueta: f.nombre }))]}
                  />
                </Formulario>
                <Formulario accion={guardarEscuela.bind(null, e.id)} textoBoton="Guardar escuela">
                  <Campo etiqueta="Nombre" nombre="nombre" defaultValue={e.nombre} />
                  <div className="grid grid-cols-[1fr_6rem] gap-3">
                    <Campo etiqueta="Dirección" nombre="direccion" opcional defaultValue={e.direccion ?? ""} />
                    <Campo etiqueta="Orden" nombre="orden" type="number" opcional defaultValue={e.orden} />
                  </div>
                </Formulario>
              </div>
            </details>
          </Tarjeta>
        );
      })}

      <div className="grid gap-6 lg:grid-cols-2">
        <Tarjeta titulo="Carga rápida desde planilla">
          <Formulario accion={importarPadron} textoBoton="Importar" limpiar>
            <AreaTexto
              etiqueta="Una mesa por renglón"
              nombre="padron"
              rows={8}
              className="font-mono"
              placeholder={"Escuela N° 1; Calle 123; 101; 340\nEscuela N° 1; Calle 123; 102; 338\nEscuela N° 2; Av. Principal s/n; 103; 345"}
              ayuda="Formato: Escuela; Dirección; Número de mesa; Electores. Podés copiar y pegar las columnas directo desde Excel o Google Sheets. Si la mesa ya existe, se actualiza."
            />
          </Formulario>
        </Tarjeta>
        <Tarjeta titulo="Agregar escuela">
          <Formulario accion={guardarEscuela.bind(null, null)} textoBoton="Agregar escuela" limpiar>
            <Campo etiqueta="Nombre" nombre="nombre" placeholder="Ej: Escuela N° 15 …" />
            <div className="grid grid-cols-[1fr_6rem] gap-3">
              <Campo etiqueta="Dirección" nombre="direccion" opcional />
              <Campo etiqueta="Orden" nombre="orden" type="number" opcional />
            </div>
          </Formulario>
        </Tarjeta>
      </div>
    </div>
  );
}

export default function AdminMesas() {
  return (
    <>
      <TituloPanel titulo="Escuelas y mesas" bajada="El padrón de Los Charrúas: dónde se vota, cuántas mesas hay y quién fiscaliza cada una." />
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-slate-200" />}>
        <Contenido />
      </Suspense>
    </>
  );
}
