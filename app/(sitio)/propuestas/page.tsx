import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "../../../lib/prisma";
import { datosEje } from "../../../lib/contenido";
import EncabezadoPagina from "../../components/EncabezadoPagina";
import TarjetaPropuesta from "../../components/TarjetaPropuesta";
import IconoEje from "../../components/IconoEje";

export const metadata: Metadata = {
  title: "Propuestas",
  description: "Las propuestas del PAR para Los Charrúas: trabajo, salud, educación, juventud, obras y más.",
};

async function Lista() {
  const propuestas = await prisma.propuesta.findMany({
    where: { activo: true },
    orderBy: [{ orden: "asc" }, { createdAt: "asc" }],
  });

  if (propuestas.length === 0) {
    return (
      <p className="rounded-3xl border-2 border-dashed border-par-tinta/15 p-12 text-center text-lg text-par-tinta/60">
        Estamos terminando de escribir las propuestas junto a los vecinos. Muy pronto las vas a encontrar acá.
      </p>
    );
  }

  return (
    <>
      <nav aria-label="Ejes" className="mb-12 flex flex-wrap gap-3">
        {propuestas.map((p) => (
          <a
            key={p.id}
            href={`#propuesta-${p.id}`}
            className="flex items-center gap-2 rounded-full bg-white px-5 py-2.5 font-display text-base font-bold uppercase tracking-wider ring-1 ring-par-tinta/10 transition hover:bg-par-tinta hover:text-par-amarillo"
          >
            <IconoEje eje={p.eje} className="h-5 w-5" />
            {datosEje(p.eje).etiqueta}
          </a>
        ))}
      </nav>
      <div className="grid gap-6 md:grid-cols-2">
        {propuestas.map((p, i) => (
          <div key={p.id} className="revelar scroll-mt-28">
            <TarjetaPropuesta propuesta={p} numero={i + 1} completa />
          </div>
        ))}
      </div>
    </>
  );
}

export default function PropuestasPage() {
  return (
    <>
      <EncabezadoPagina antetitulo="Lo que vamos a hacer" titulo="Propuestas para" destacado="Los Charrúas">
        Ideas concretas que salen de escuchar a los vecinos. Si tenés una propuesta, también queremos escucharla.
      </EncabezadoPagina>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24">
        <Suspense fallback={<div className="h-96 animate-pulse rounded-[2rem] bg-par-tinta/10" />}>
          <Lista />
        </Suspense>
        <div className="mt-16 flex flex-col items-start gap-6 rounded-[1.75rem] bg-par-tinta p-8 text-white md:flex-row md:items-center md:justify-between md:p-12">
          <div>
            <p className="antetitulo text-par-celeste">Tu voz cuenta</p>
            <p className="titular mt-3 text-4xl md:text-5xl">¿Qué le falta a tu barrio?</p>
          </div>
          <Link
            href="/#sumate"
            className="rounded-full bg-par-amarillo px-8 py-4 font-display text-xl font-bold uppercase tracking-wider text-par-tinta transition hover:bg-white"
          >
            Contanos tu idea
          </Link>
        </div>
      </section>
    </>
  );
}
