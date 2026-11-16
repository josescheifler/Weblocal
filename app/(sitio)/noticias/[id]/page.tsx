import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "../../../../lib/prisma";
import { etiquetaCategoria, extracto, fechaLarga, minutosDeLectura } from "../../../../lib/formato";
import { CATEGORIA_MEDIOS } from "../../../../lib/noticias";
import Compartir from "../../../components/Compartir";
import TarjetaNoticia from "../../../components/TarjetaNoticia";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const noticia = await prisma.noticia.findUnique({
    where: { id },
    select: { titulo: true, contenido: true, imagenUrl: true, createdAt: true },
  });
  if (!noticia) return { title: "Noticia no encontrada" };

  const descripcion = extracto(noticia.contenido, 160);
  return {
    title: noticia.titulo,
    description: descripcion,
    openGraph: {
      type: "article",
      title: noticia.titulo,
      description: descripcion,
      publishedTime: noticia.createdAt.toISOString(),
      ...(noticia.imagenUrl ? { images: [noticia.imagenUrl] } : {}),
    },
  };
}

async function DetalleNoticia({ params }: Props) {
  const { id } = await params;
  const noticia = await prisma.noticia.findUnique({ where: { id } });
  if (!noticia) notFound();

  const seccion = { href: "/noticias", texto: "Noticias" };
  // Nota de otro medio: mostramos un resumen propio y mandamos a leerla en su sitio
  const fuente =
    noticia.categoria === CATEGORIA_MEDIOS && noticia.fuenteNombre && noticia.fuenteUrl
      ? { nombre: noticia.fuenteNombre, url: noticia.fuenteUrl }
      : null;

  const relacionadas = await prisma.noticia.findMany({
    where: { id: { not: noticia.id } },
    orderBy: [{ createdAt: "desc" }],
    take: 12,
  });
  // Primero las de la misma categoría, después las más recientes
  const sugeridas = [
    ...relacionadas.filter((n) => n.categoria === noticia.categoria),
    ...relacionadas.filter((n) => n.categoria !== noticia.categoria),
  ].slice(0, 3);

  return (
    <>
      <article>
        <header className="bg-par-tinta text-white">
          <div className="mx-auto max-w-4xl px-4 pb-14 pt-16 sm:px-6 md:pb-20 md:pt-24">
            <Link
              href={seccion.href}
              className="mb-10 flex w-fit items-center gap-2 font-display text-base font-bold uppercase tracking-wider text-white/70 transition hover:text-par-amarillo"
            >
              ← {seccion.texto}
            </Link>
            <div className="mb-6 flex flex-wrap items-center gap-4">
              <Link
                href={`/noticias?categoria=${noticia.categoria}`}
                className="rounded-full bg-par-amarillo px-4 py-1.5 font-display text-sm font-bold uppercase tracking-wider text-par-tinta"
              >
                {etiquetaCategoria(noticia.categoria)}
              </Link>
              <span className="font-display text-base font-bold uppercase tracking-[0.15em] text-white/60">
                <time dateTime={noticia.createdAt.toISOString()}>{fechaLarga(noticia.createdAt)}</time>
                {" · "}
                {minutosDeLectura(noticia.contenido)} min de lectura
              </span>
            </div>
            <h1 className="titular animate-aparecer text-5xl md:text-7xl lg:text-8xl">{noticia.titulo}</h1>
          </div>
        </header>
        <div className="franja" />

        {noticia.imagenUrl && (
          <div className="mx-auto -mb-4 max-w-6xl px-4 pt-10 sm:px-6 md:pt-14">
            <img
              src={noticia.imagenUrl}
              alt={noticia.titulo}
              fetchPriority="high"
              className="max-h-[75vh] w-full rounded-[2rem] object-cover shadow-[0_40px_80px_-40px_rgba(7,63,85,0.6)]"
            />
          </div>
        )}

        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 md:py-20">
          {fuente && (
            <p className="mb-10 rounded-2xl border-l-[6px] border-par-celeste bg-white p-6 text-lg text-par-tinta/75">
              Nota publicada por <strong className="text-par-tinta">{fuente.nombre}</strong>. Acá te contamos de qué
              trata; el texto completo está en el sitio del medio.
            </p>
          )}
          <div className="prosa text-par-tinta/85">{noticia.contenido}</div>
          {fuente && (
            <a
              href={fuente.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-10 inline-flex items-center gap-3 rounded-full bg-par-tinta px-8 py-4 font-display text-xl font-bold uppercase tracking-wider text-white transition hover:-translate-y-0.5 hover:bg-par-amarillo hover:text-par-tinta"
            >
              Leer la nota completa en {fuente.nombre} <span aria-hidden="true">↗</span>
            </a>
          )}
          <div className="mt-14 flex flex-col gap-6 border-t border-par-tinta/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
            <Compartir titulo={noticia.titulo} />
            <Link href={seccion.href} className="font-display text-lg font-bold uppercase tracking-wider hover:text-par-celeste-oscuro">
              ← Más noticias
            </Link>
          </div>
        </div>
      </article>

      {sugeridas.length > 0 && (
        <section className="bg-white py-20 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <h2 className="titular mb-10 text-4xl md:text-6xl">
              Seguí <span className="text-par-celeste-oscuro">leyendo</span>
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {sugeridas.map((n) => (
                <TarjetaNoticia key={n.id} noticia={n} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

export default function NoticiaPage({ params }: Props) {
  return (
    <Suspense fallback={<div className="h-[50vh] animate-pulse bg-par-tinta" />}>
      <DetalleNoticia params={params} />
    </Suspense>
  );
}
