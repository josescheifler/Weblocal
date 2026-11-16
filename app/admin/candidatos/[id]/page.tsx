import { Suspense } from "react";
import { notFound } from "next/navigation";
import { prisma } from "../../../../lib/prisma";
import { CARGOS_SUGERIDOS } from "../../../../lib/contenido";
import { guardarCandidato, borrarCandidato } from "../../acciones";
import Formulario from "../../../components/admin/Formulario";
import CampoImagen from "../../../components/admin/CampoImagen";
import BotonConfirmar from "../../../components/admin/BotonConfirmar";
import { AreaTexto, Campo, Casilla, Tarjeta, TituloPanel } from "../../../components/admin/Campos";

type Props = { params: Promise<{ id: string }> };

async function Editor({ params }: Props) {
  const { id } = await params;
  const nuevo = id === "nuevo";
  const c = nuevo ? null : await prisma.candidato.findUnique({ where: { id } });
  if (!nuevo && !c) notFound();

  return (
    <>
      <TituloPanel titulo={nuevo ? "Nuevo candidato" : c!.nombre} />
      <Tarjeta>
        <Formulario accion={guardarCandidato.bind(null, c?.id ?? null)} textoBoton={nuevo ? "Agregar" : "Guardar cambios"}>
          <div className="grid gap-5 md:grid-cols-[2fr_2fr_1fr]">
            <Campo etiqueta="Nombre y apellido" nombre="nombre" defaultValue={c?.nombre} maxLength={120} />
            <Campo
              etiqueta="Cargo"
              nombre="cargo"
              list="cargos-sugeridos"
              defaultValue={c?.cargo ?? "Concejal"}
              maxLength={80}
              ayuda="Elegí de la lista o escribí otro."
            />
            <Campo etiqueta="Nº en la lista" nombre="orden" type="number" min={0} opcional defaultValue={c?.orden ?? ""} />
            <datalist id="cargos-sugeridos">
              {CARGOS_SUGERIDOS.map((cargo) => (
                <option key={cargo} value={cargo} />
              ))}
            </datalist>
          </div>
          <CampoImagen nombre="fotoUrl" etiqueta="Foto" valorInicial={c?.fotoUrl} ayuda="Ideal: vertical, de frente, con buena luz." />
          <Campo etiqueta="Frase" nombre="cita" opcional defaultValue={c?.cita ?? ""} maxLength={300} placeholder="Una frase corta que lo/la represente" />
          <AreaTexto etiqueta="Quién es" nombre="bio" opcional rows={5} defaultValue={c?.bio ?? ""} ayuda="Trayectoria, barrio, a qué se dedica." />
          <div className="grid gap-5 md:grid-cols-2">
            <Campo etiqueta="Instagram" nombre="instagram" opcional defaultValue={c?.instagram ?? ""} placeholder="https://instagram.com/…" />
            <Campo etiqueta="Facebook" nombre="facebook" opcional defaultValue={c?.facebook ?? ""} placeholder="https://facebook.com/…" />
          </div>
          <Casilla etiqueta="Mostrar en el sitio" nombre="activo" defaultChecked={c?.activo ?? true} ayuda="Destildalo para ocultarlo sin borrarlo." />
        </Formulario>
      </Tarjeta>
      {c && (
        <form action={borrarCandidato} className="mt-6 text-right">
          <input type="hidden" name="id" value={c.id} />
          <BotonConfirmar mensaje={`¿Borrar a ${c.nombre}? No se puede deshacer.`}>Borrar candidato</BotonConfirmar>
        </form>
      )}
    </>
  );
}

export default function EditorCandidato({ params }: Props) {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-slate-200" />}>
      <Editor params={params} />
    </Suspense>
  );
}
