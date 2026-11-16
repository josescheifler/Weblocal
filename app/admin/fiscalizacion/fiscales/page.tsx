import { Suspense } from "react";
import { connection } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { ROLES_FISCAL, compararNumeroMesa, etiquetaRol } from "../../../../lib/fiscalizacion";
import { fechaCorta, hora } from "../../../../lib/formato";
import { asignarMesaAFiscal, borrarFiscal, crearFiscal, editarFiscal, nuevaClaveFiscal, quitarMesaAFiscal } from "../acciones";
import Formulario from "../../../components/admin/Formulario";
import BotonConfirmar from "../../../components/admin/BotonConfirmar";
import { Campo, Casilla, Selector, Tarjeta, TituloPanel, Vacio } from "../../../components/admin/Campos";

type Props = { searchParams: Promise<{ voluntario?: string }> };

async function Contenido({ searchParams }: Props) {
  const { voluntario: voluntarioId } = await searchParams;
  await connection();
  const ahora = new Date();
  const [fiscales, escuelas, mesas, voluntarios] = await Promise.all([
    prisma.fiscal.findMany({
      orderBy: [{ activo: "desc" }, { nombre: "asc" }],
      include: { mesas: { select: { id: true, numero: true } }, escuela: { select: { nombre: true } } },
    }),
    prisma.escuela.findMany({ orderBy: [{ orden: "asc" }, { nombre: "asc" }], select: { id: true, nombre: true } }),
    prisma.mesa.findMany({ select: { id: true, numero: true, fiscalId: true, escuela: { select: { nombre: true } } } }),
    prisma.voluntario.findMany({ where: { quiereFiscal: true }, orderBy: { createdAt: "asc" } }),
  ]);
  mesas.sort((a, b) => compararNumeroMesa(a.numero, b.numero));
  const libres = mesas.filter((m) => !m.fiscalId);
  const dnisCargados = new Set(fiscales.map((f) => f.dni));
  const pendientes = voluntarios.filter((v) => !v.dni || !dnisCargados.has(v.dni));
  const desde = voluntarioId ? voluntarios.find((v) => v.id === voluntarioId) : undefined;

  const opcionesEscuela = [{ valor: "", etiqueta: "— Elegir (solo fiscal general) —" }, ...escuelas.map((e) => ({ valor: e.id, etiqueta: e.nombre }))];
  const opcionesMesaLibre = [
    { valor: "", etiqueta: libres.length ? "— Sin mesa por ahora —" : "— No hay mesas libres —" },
    ...libres.map((m) => ({ valor: m.id, etiqueta: `Mesa ${m.numero} · ${m.escuela.nombre}` })),
  ];

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_24rem]">
      <div className="space-y-4">
        <p className="text-slate-600">
          {fiscales.filter((f) => f.activo).length} fiscales activos · {mesas.length - libres.length} de {mesas.length} mesas con fiscal propio
        </p>
        {fiscales.length === 0 && <Vacio>Todavía no hay fiscales. Creá el primero con el formulario.</Vacio>}
        {fiscales.map((f) => (
          <details key={f.id} className={`group rounded-2xl border border-slate-200 bg-white ${f.activo ? "" : "opacity-60"}`}>
            <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 p-4">
              <span>
                <span className="font-bold">{f.nombre}</span>
                <span className="text-slate-500"> · DNI {f.dni}</span>
                {!f.activo && <span className="ml-2 rounded-full bg-slate-200 px-2 py-0.5 text-xs font-bold">Inactivo</span>}
                <span className="block text-sm text-slate-500">
                  {etiquetaRol(f.rol)}
                  {f.escuela && ` · ${f.escuela.nombre}`}
                  {f.mesas.length > 0 && ` · Mesa${f.mesas.length > 1 ? "s" : ""} ${f.mesas.map((m) => m.numero).join(", ")}`}
                  {f.telefono && ` · ${f.telefono}`}
                </span>
              </span>
              <span className="text-xs text-slate-500">
                {f.ultimoIngreso ? `Último ingreso: ${fechaCorta(f.ultimoIngreso)} ${hora(f.ultimoIngreso)}` : "Nunca ingresó"}
                {f.bloqueadoHasta && f.bloqueadoHasta > ahora && <span className="ml-2 font-bold text-red-600">Bloqueado</span>}
              </span>
            </summary>
            <div className="grid gap-6 border-t border-slate-100 p-4 lg:grid-cols-2">
              <Formulario accion={editarFiscal.bind(null, f.id)}>
                <Campo etiqueta="Nombre y apellido" nombre="nombre" defaultValue={f.nombre} />
                <Campo etiqueta="Teléfono" nombre="telefono" opcional defaultValue={f.telefono ?? ""} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Selector etiqueta="Rol" nombre="rol" defaultValue={f.rol} opciones={ROLES_FISCAL} />
                  <Selector etiqueta="Escuela" nombre="escuelaId" defaultValue={f.escuelaId ?? ""} opciones={opcionesEscuela} />
                </div>
                <Casilla etiqueta="Activo" nombre="activo" defaultChecked={f.activo} ayuda="Si lo desactivás, no puede entrar más." />
              </Formulario>
              <div className="space-y-5">
                <div>
                  <p className="mb-2 text-sm font-bold text-slate-700">Mesas asignadas</p>
                  {f.mesas.length === 0 && <p className="text-sm text-slate-500">Ninguna.</p>}
                  <ul className="mb-3 flex flex-wrap gap-2">
                    {f.mesas.map((m) => (
                      <li key={m.id} className="flex items-center gap-1 rounded-full bg-slate-100 py-1 pl-3 pr-1 text-sm font-semibold">
                        Mesa {m.numero}
                        <form action={quitarMesaAFiscal}>
                          <input type="hidden" name="mesaId" value={m.id} />
                          <BotonConfirmar mensaje={`¿Quitar la mesa ${m.numero} a ${f.nombre}?`} className="rounded-full px-2 text-red-600 hover:bg-red-100">
                            ✕
                          </BotonConfirmar>
                        </form>
                      </li>
                    ))}
                  </ul>
                  {libres.length > 0 && (
                    <Formulario accion={asignarMesaAFiscal.bind(null, f.id)} textoBoton="Asignar">
                      <Selector etiqueta="Agregar mesa libre" nombre="mesaId" opciones={opcionesMesaLibre.slice(1)} />
                    </Formulario>
                  )}
                </div>
                <div className="rounded-xl bg-amber-50 p-4">
                  <p className="mb-2 text-sm text-amber-900">¿Perdió la clave o quedó bloqueado? Generá una nueva y pasásela.</p>
                  <Formulario accion={nuevaClaveFiscal.bind(null, f.id)} textoBoton="Generar nueva clave" textoEnviando="Generando…">
                    {null}
                  </Formulario>
                </div>
                <form action={borrarFiscal} className="text-right">
                  <input type="hidden" name="id" value={f.id} />
                  <BotonConfirmar mensaje={`¿Borrar a ${f.nombre}? Sus mesas quedan sin fiscal.`}>Borrar fiscal</BotonConfirmar>
                </form>
              </div>
            </div>
          </details>
        ))}
      </div>

      <div className="space-y-6 xl:sticky xl:top-28 xl:self-start">
        <Tarjeta titulo="Nuevo fiscal">
          <Formulario accion={crearFiscal} textoBoton="Crear y generar clave" limpiar>
            {desde && <input type="hidden" name="voluntarioId" value={desde.id} />}
            <Campo etiqueta="Nombre y apellido" nombre="nombre" defaultValue={desde?.nombre} />
            <div className="grid grid-cols-2 gap-3">
              <Campo etiqueta="DNI" nombre="dni" inputMode="numeric" defaultValue={desde?.dni ?? ""} ayuda="Es su usuario." />
              <Campo etiqueta="Teléfono" nombre="telefono" opcional defaultValue={desde?.telefono ?? ""} />
            </div>
            <Selector etiqueta="Rol" nombre="rol" opciones={ROLES_FISCAL} />
            <Selector etiqueta="Escuela" nombre="escuelaId" opcional opciones={opcionesEscuela} ayuda="Solo para fiscales generales." />
            <Selector etiqueta="Mesa" nombre="mesaId" opcional opciones={opcionesMesaLibre} />
          </Formulario>
        </Tarjeta>

        {pendientes.length > 0 && (
          <Tarjeta titulo="Se ofrecieron desde el sitio">
            <ul className="space-y-2 text-sm">
              {pendientes.map((v) => (
                <li key={v.id} className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 p-2">
                  <span>
                    <strong>{v.nombre}</strong>
                    <span className="block text-xs text-slate-500">
                      {v.telefono}
                      {v.barrio && ` · ${v.barrio}`}
                    </span>
                  </span>
                  <a href={`/admin/fiscalizacion/fiscales?voluntario=${v.id}`} className="shrink-0 rounded-lg bg-par-tinta px-3 py-1.5 text-xs font-bold text-white">
                    Hacer fiscal
                  </a>
                </li>
              ))}
            </ul>
          </Tarjeta>
        )}
      </div>
    </div>
  );
}

export default function AdminFiscales({ searchParams }: Props) {
  return (
    <>
      <TituloPanel
        titulo="Fiscales"
        bajada="Cada fiscal entra con su DNI y una clave de 6 números que se genera acá. Los fiscales de mesa operan sus mesas; los generales, todas las de su escuela."
      />
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-slate-200" />}>
        <Contenido searchParams={searchParams} />
      </Suspense>
    </>
  );
}
