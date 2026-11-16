import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "../../../lib/prisma";
import { CATEGORIA_CONSTRUCCION } from "../../../lib/noticias";
import EncabezadoPagina from "../../components/EncabezadoPagina";
import Indicadores from "../../components/Indicadores";
import LineaDeTiempo from "../../components/LineaDeTiempo";
import TarjetaNoticia from "../../components/TarjetaNoticia";

export const metadata: Metadata = {
  title: "Cómo viene la construcción",
  description: "El recorrido del PAR en Los Charrúas: lo que ya logramos, lo que estamos haciendo y los próximos pasos.",
};

async function Contenido() {
  const [indicadores, hitos, novedades] = await Promise.all([
    prisma.indicador.findMany({ orderBy: [{ orden: "asc" }, { createdAt: "asc" }] }),
    prisma.hito.findMany({ orderBy: [{ orden: "asc" }, { fecha: "asc" }] }),
    prisma.noticia.findMany({ where: { categoria: CATEGORIA_CONSTRUCCION }, orderBy: { createdAt: "desc" }, take: 3 }),
  ]);

  const hechos = hitos.filter((h) => h.estado === "HECHO").length;

  if (indicadores.length === 0 && hitos.length === 0) {
    return (
      <p className="rounded-3xl border-2 border-dashed border-par-tinta/15 p-12 text-center text-lg text-par-tinta/60">
        Muy pronto vas a poder seguir acá, paso a paso, cómo crece el PAR en Los Charrúas.
      </p>
    );
  }

  return (
    <>
      {indicadores.length > 0 && (
        <div className="mb-20">
          <p className="antetitulo mb-8 text-par-celeste-oscuro">El armado en números</p>
          <Indicadores indicadores={indicadores} />
        </div>
      )}

      {hitos.length > 0 && (
        <div className="grid gap-12 lg:grid-cols-[1fr_2fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="antetitulo mb-5 text-par-celeste-oscuro">Hoja de ruta</p>
            <h2 className="titular text-5xl md:text-6xl">
              {hechos} de {hitos.length} <span className="text-par-celeste-oscuro">pasos cumplidos</span>
            </h2>
            <div
              className="mt-6 h-3 overflow-hidden rounded-full bg-par-tinta/10"
              role="progressbar"
              aria-valuenow={Math.round((hechos / hitos.length) * 100)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Avance de la hoja de ruta"
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-par-celeste to-par-amarillo"
                style={{ width: `${(hechos / hitos.length) * 100}%` }}
              />
            </div>
            <p className="mt-6 text-par-tinta/70">
              Cada paso lo damos con los vecinos. ¿Querés ser parte del próximo?{" "}
              <Link href="/#sumate" className="font-bold text-par-celeste-oscuro underline-offset-4 hover:underline">
                Sumate
              </Link>
              .
            </p>
          </div>
          <LineaDeTiempo hitos={hitos} />
        </div>
      )}

      {novedades.length > 0 && (
        <div className="mt-24">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <h2 className="titular text-4xl md:text-6xl">
              Novedades de la <span className="text-par-celeste-oscuro">construcción</span>
            </h2>
            <Link
              href={`/noticias?categoria=${CATEGORIA_CONSTRUCCION}`}
              className="font-display text-lg font-bold uppercase tracking-wider hover:text-par-celeste-oscuro"
            >
              Ver todas →
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {novedades.map((n) => (
              <TarjetaNoticia key={n.id} noticia={n} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default function ConstruccionPage() {
  return (
    <>
      <EncabezadoPagina antetitulo="Paso a paso" titulo="Cómo viene la" destacado="construcción">
        Lo que ya logramos, lo que estamos haciendo y lo que viene. Un recorrido abierto, para que cada vecino sepa en qué
        estamos.
      </EncabezadoPagina>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24">
        <Suspense fallback={<div className="h-96 animate-pulse rounded-[2rem] bg-par-tinta/10" />}>
          <Contenido />
        </Suspense>
      </section>
    </>
  );
}
