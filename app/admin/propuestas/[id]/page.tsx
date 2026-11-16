import { Suspense } from "react";
import { notFound } from "next/navigation";
import { prisma } from "../../../../lib/prisma";
import { EJES } from "../../../../lib/contenido";
import { guardarPropuesta, borrarPropuesta } from "../../acciones";
import Formulario from "../../../components/admin/Formulario";
import BotonConfirmar from "../../../components/admin/BotonConfirmar";
import { AreaTexto, Campo, Casilla, Selector, Tarjeta, TituloPanel } from "../../../components/admin/Campos";

type Props = { params: Promise<{ id: string }> };

async function Editor({ params }: Props) {
  const { id } = await params;
  const nueva = id === "nueva";
  const p = nueva ? null : await prisma.propuesta.findUnique({ where: { id } });
  if (!nueva && !p) notFound();

  return (
    <>
      <TituloPanel titulo={nueva ? "Nueva propuesta" : "Editar propuesta"} />
      <Tarjeta>
        <Formulario accion={guardarPropuesta.bind(null, p?.id ?? null)} textoBoton={nueva ? "Agregar" : "Guardar cambios"}>
          <div className="grid gap-5 md:grid-cols-[1fr_2fr_8rem]">
            <Selector etiqueta="Eje" nombre="eje" defaultValue={p?.eje ?? EJES[0].valor} opciones={EJES} />
            <Campo etiqueta="Título" nombre="titulo" defaultValue={p?.titulo} maxLength={200} />
            <Campo etiqueta="Orden" nombre="orden" type="number" min={0} opcional defaultValue={p?.orden ?? ""} />
          </div>
          <AreaTexto etiqueta="Resumen" nombre="resumen" rows={3} maxLength={600} defaultValue={p?.resumen} ayuda="Dos o tres líneas: el problema y qué vamos a hacer." />
          <AreaTexto
            etiqueta="Medidas concretas"
            nombre="detalle"
            opcional
            rows={8}
            defaultValue={p?.detalle ?? ""}
            ayuda="Una medida por renglón. Se muestran como lista en la página de propuestas."
          />
          <Casilla etiqueta="Mostrar en el sitio" nombre="activo" defaultChecked={p?.activo ?? true} />
        </Formulario>
      </Tarjeta>
      {p && (
        <form action={borrarPropuesta} className="mt-6 text-right">
          <input type="hidden" name="id" value={p.id} />
          <BotonConfirmar mensaje="¿Borrar esta propuesta? No se puede deshacer.">Borrar propuesta</BotonConfirmar>
        </form>
      )}
    </>
  );
}

export default function EditorPropuesta({ params }: Props) {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-slate-200" />}>
      <Editor params={params} />
    </Suspense>
  );
}
