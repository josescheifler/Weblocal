import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "../../../lib/prisma";
import { CATEGORIAS } from "../../../lib/noticias";
import EncabezadoPagina from "../../components/EncabezadoPagina";
import TarjetaNoticia from "../../components/TarjetaNoticia";

export const metadata: Metadata = {
  title: "Noticias",
  description: "Novedades, actividades, comunicados y lo que publican otros medios sobre el PAR en Los Charrúas.",
};

type Props = { searchParams: Promise<{ categoria?: string }> };

async function ListaNoticias({ searchParams }: Props) {
  const categoriasDeNoticias = CATEGORIAS;
  const { categoria: pedida } = await searchParams;
  const categoria = categoriasDeNoticias.find((c) => c.valor === pedida)?.valor;

  const noticias = await prisma.noticia.findMany({
    where: categoria ? { categoria } : {},
    orderBy: { createdAt: "desc" },
  });

  const filtros = [
    { valor: undefined, texto: "Todas" },
    ...categoriasDeNoticias.map((c) => ({ valor: c.valor, texto: c.etiqueta })),
  ];

  return (
    <>
      <nav aria-label="Filtrar por categoría" className="mb-12 flex flex-wrap gap-3">
        {filtros.map((f) => {
          const activo = f.valor === categoria;
          return (
            <Link
              key={f.texto}
              href={f.valor ? `/noticias?categoria=${f.valor}` : "/noticias"}
              aria-current={activo ? "page" : undefined}
              scroll={false}
              className={`rounded-full px-6 py-2.5 font-display text-lg font-bold uppercase tracking-wider transition ${
                activo ? "bg-par-tinta text-par-amarillo" : "bg-white text-par-tinta ring-1 ring-par-tinta/10 hover:ring-par-tinta"
              }`}
            >
              {f.texto}
            </Link>
          );
        })}
      </nav>

      {noticias.length === 0 ? (
        <p className="rounded-3xl border-2 border-dashed border-par-tinta/15 p-12 text-center text-lg text-par-tinta/60">
          {categoria ? "Todavía no hay publicaciones en esta categoría." : "Muy pronto vas a encontrar acá nuestras novedades."}
        </p>
      ) : (
        <>
          <div className="revelar">
            <TarjetaNoticia noticia={noticias[0]} destacada />
          </div>
          {noticias.length > 1 && (
            <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {noticias.slice(1).map((n) => (
                <div key={n.id} className="revelar">
                  <TarjetaNoticia noticia={n} />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}

export default function NoticiasPage({ searchParams }: Props) {
  return (
    <>
      <EncabezadoPagina antetitulo="Novedades" titulo="Todas las" destacado="noticias">
        Recorridas, avances de la construcción, comunicados y lo que dicen los medios sobre el PAR en Los Charrúas.
      </EncabezadoPagina>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20">
        <Suspense
          fallback={
            <div className="space-y-6">
              <div className="h-12 w-96 max-w-full animate-pulse rounded-full bg-par-tinta/10" />
              <div className="aspect-[16/7] animate-pulse rounded-[1.75rem] bg-par-tinta/10" />
            </div>
          }
        >
          <ListaNoticias searchParams={searchParams} />
        </Suspense>
      </section>
    </>
  );
}
