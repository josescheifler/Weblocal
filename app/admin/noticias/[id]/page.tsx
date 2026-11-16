import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "../../../../lib/prisma";
import { CATEGORIAS, fechaParaInput } from "../../../../lib/noticias";
import { guardarNoticia, borrarNoticia } from "../../acciones";
import Formulario from "../../../components/admin/Formulario";
import CampoImagen from "../../../components/admin/CampoImagen";
import BotonConfirmar from "../../../components/admin/BotonConfirmar";
import { AreaTexto, Campo, Selector, Tarjeta, TituloPanel } from "../../../components/admin/Campos";

type Props = { params: Promise<{ id: string }> };

async function Editor({ params }: Props) {
  const { id } = await params;
  const nueva = id === "nueva";
  const noticia = nueva ? null : await prisma.noticia.findUnique({ where: { id } });
  if (!nueva && !noticia) notFound();

  return (
    <>
      <TituloPanel titulo={nueva ? "Nueva noticia" : "Editar noticia"}>
        {noticia && (
          <Link href={`/noticias/${noticia.id}`} target="_blank" className="rounded-xl px-4 py-3 font-bold text-par-celeste-oscuro hover:bg-white">
            Ver publicada ↗
          </Link>
        )}
      </TituloPanel>
      <Tarjeta>
        <Formulario accion={guardarNoticia.bind(null, noticia?.id ?? null)} textoBoton={nueva ? "Publicar" : "Guardar cambios"}>
          <Campo etiqueta="Título" nombre="titulo" defaultValue={noticia?.titulo} maxLength={300} />
          <div className="grid gap-5 md:grid-cols-2">
            <Selector
              etiqueta="Tipo de publicación"
              nombre="categoria"
              defaultValue={noticia?.categoria ?? "GENERAL"}
              opciones={CATEGORIAS.map((c) => ({ valor: c.valor, etiqueta: c.enFormulario }))}
              ayuda="Las de “Avance de la construcción” también aparecen en la sección Construcción."
            />
            <Campo
              etiqueta="Fecha"
              nombre="fecha"
              type="date"
              opcional
              defaultValue={noticia ? fechaParaInput(noticia.createdAt) : ""}
              ayuda="Si la dejás vacía, se usa la fecha de hoy."
            />
          </div>
          <CampoImagen nombre="imagenUrl" etiqueta="Imagen principal" valorInicial={noticia?.imagenUrl} />
          <AreaTexto
            etiqueta="Texto"
            nombre="contenido"
            rows={14}
            defaultValue={noticia?.contenido}
            ayuda="Dejá una línea en blanco entre párrafos."
          />
          <fieldset className="rounded-xl border border-dashed border-slate-300 p-4">
            <legend className="px-2 text-sm font-bold text-slate-600">Solo para “Nota de otro medio”</legend>
            <div className="grid gap-5 md:grid-cols-2">
              <Campo etiqueta="Medio" nombre="fuenteNombre" opcional defaultValue={noticia?.fuenteNombre ?? ""} placeholder="Ej: Diario Río Uruguay" />
              <Campo etiqueta="Enlace a la nota original" nombre="fuenteUrl" opcional defaultValue={noticia?.fuenteUrl ?? ""} placeholder="https://…" />
            </div>
          </fieldset>
        </Formulario>
      </Tarjeta>
      {noticia && (
        <form action={borrarNoticia} className="mt-6 text-right">
          <input type="hidden" name="id" value={noticia.id} />
          <BotonConfirmar mensaje="¿Borrar esta noticia? No se puede deshacer.">Borrar noticia</BotonConfirmar>
        </form>
      )}
    </>
  );
}

export default function EditorNoticia({ params }: Props) {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-slate-200" />}>
      <Editor params={params} />
    </Suspense>
  );
}
