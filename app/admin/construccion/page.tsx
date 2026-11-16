import { Suspense } from "react";
import { prisma } from "../../../lib/prisma";
import { ESTADOS_HITO, etiquetaEstadoHito } from "../../../lib/contenido";
import { fechaParaInput } from "../../../lib/noticias";
import { borrarHito, borrarIndicador, guardarHito, guardarIndicador } from "../acciones";
import Formulario from "../../components/admin/Formulario";
import BotonConfirmar from "../../components/admin/BotonConfirmar";
import { AreaTexto, Campo, Selector, Tarjeta, TituloPanel, Vacio } from "../../components/admin/Campos";

function CamposIndicador({ i }: { i?: { etiqueta: string; valor: number; meta: number | null; orden: number } }) {
  return (
    <div className="grid gap-4 sm:grid-cols-[2fr_1fr_1fr_5rem]">
      <Campo etiqueta="Qué medimos" nombre="etiqueta" defaultValue={i?.etiqueta} placeholder="Ej: Barrios recorridos" maxLength={120} />
      <Campo etiqueta="Valor actual" nombre="valor" type="number" min={0} defaultValue={i?.valor ?? 0} />
      <Campo etiqueta="Meta" nombre="meta" type="number" min={0} opcional defaultValue={i?.meta ?? ""} />
      <Campo etiqueta="Orden" nombre="orden" type="number" min={0} opcional defaultValue={i?.orden ?? ""} />
    </div>
  );
}

function CamposHito({
  h,
}: {
  h?: { titulo: string; descripcion: string | null; fecha: Date | null; estado: string; orden: number };
}) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-[2fr_1fr_1fr_5rem]">
        <Campo etiqueta="Paso" nombre="titulo" defaultValue={h?.titulo} placeholder="Ej: Lanzamiento del PAR en Los Charrúas" maxLength={200} />
        <Selector etiqueta="Estado" nombre="estado" defaultValue={h?.estado ?? "PROXIMO"} opciones={ESTADOS_HITO} />
        <Campo etiqueta="Fecha" nombre="fecha" type="date" opcional defaultValue={h?.fecha ? fechaParaInput(h.fecha) : ""} />
        <Campo etiqueta="Orden" nombre="orden" type="number" min={0} opcional defaultValue={h?.orden ?? ""} />
      </div>
      <AreaTexto etiqueta="Descripción" nombre="descripcion" opcional rows={2} defaultValue={h?.descripcion ?? ""} maxLength={1500} />
    </>
  );
}

async function Contenido() {
  const [indicadores, hitos] = await Promise.all([
    prisma.indicador.findMany({ orderBy: [{ orden: "asc" }, { createdAt: "asc" }] }),
    prisma.hito.findMany({ orderBy: [{ orden: "asc" }, { fecha: "asc" }] }),
  ]);

  return (
    <div className="space-y-8">
      <Tarjeta titulo="El armado en números">
        <p className="mb-5 text-sm text-slate-600">
          Se muestran en el inicio (los primeros 4) y en la página Construcción. Si cargás una meta, aparece una barra de avance.
        </p>
        <div className="space-y-4">
          {indicadores.length === 0 && <Vacio>Todavía no hay números cargados.</Vacio>}
          {indicadores.map((i) => (
            <details key={i.id} className="group rounded-xl border border-slate-200">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4">
                <span>
                  <span className="font-display text-3xl font-bold text-par-tinta">{i.valor}</span>
                  {i.meta ? <span className="text-slate-400"> / {i.meta}</span> : null}
                  <span className="ml-3 font-semibold">{i.etiqueta}</span>
                </span>
                <span className="text-sm font-bold text-par-celeste-oscuro group-open:hidden">Editar</span>
              </summary>
              <div className="border-t border-slate-100 p-4">
                <Formulario accion={guardarIndicador.bind(null, i.id)}>
                  <CamposIndicador i={i} />
                </Formulario>
                <form action={borrarIndicador} className="mt-3 text-right">
                  <input type="hidden" name="id" value={i.id} />
                  <BotonConfirmar mensaje="¿Borrar este número?">Borrar</BotonConfirmar>
                </form>
              </div>
            </details>
          ))}
        </div>
        <div className="mt-6 rounded-xl bg-slate-50 p-4">
          <p className="mb-4 font-bold">Agregar número</p>
          <Formulario accion={guardarIndicador.bind(null, null)} textoBoton="Agregar" limpiar>
            <CamposIndicador />
          </Formulario>
        </div>
      </Tarjeta>

      <Tarjeta titulo="Hoja de ruta">
        <p className="mb-5 text-sm text-slate-600">
          Los pasos de la construcción, en orden. Marcá cada uno como “Logrado”, “En marcha” o “Próximo paso”.
        </p>
        <div className="space-y-3">
          {hitos.length === 0 && <Vacio>Todavía no hay pasos cargados.</Vacio>}
          {hitos.map((h) => (
            <details key={h.id} className="group rounded-xl border border-slate-200">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4">
                <span className="min-w-0">
                  <span
                    className={`mr-3 rounded-full px-2.5 py-1 text-xs font-bold uppercase ${
                      h.estado === "HECHO" ? "bg-par-amarillo" : h.estado === "EN_CURSO" ? "bg-par-celeste/30" : "bg-slate-100"
                    }`}
                  >
                    {etiquetaEstadoHito(h.estado)}
                  </span>
                  <span className="font-semibold">{h.titulo}</span>
                </span>
                <span className="shrink-0 text-sm font-bold text-par-celeste-oscuro group-open:hidden">Editar</span>
              </summary>
              <div className="border-t border-slate-100 p-4">
                <Formulario accion={guardarHito.bind(null, h.id)}>
                  <CamposHito h={h} />
                </Formulario>
                <form action={borrarHito} className="mt-3 text-right">
                  <input type="hidden" name="id" value={h.id} />
                  <BotonConfirmar mensaje="¿Borrar este paso?">Borrar</BotonConfirmar>
                </form>
              </div>
            </details>
          ))}
        </div>
        <div className="mt-6 rounded-xl bg-slate-50 p-4">
          <p className="mb-4 font-bold">Agregar paso</p>
          <Formulario accion={guardarHito.bind(null, null)} textoBoton="Agregar" limpiar>
            <CamposHito />
          </Formulario>
        </div>
      </Tarjeta>
    </div>
  );
}

export default function AdminConstruccion() {
  return (
    <>
      <TituloPanel
        titulo="Construcción"
        bajada="Contale a los vecinos cómo viene el armado: los números y los pasos dados. Para contar un avance con fotos, publicá una noticia de tipo “Avance de la construcción”."
      />
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-slate-200" />}>
        <Contenido />
      </Suspense>
    </>
  );
}
