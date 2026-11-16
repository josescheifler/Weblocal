import { Suspense } from "react";
import type { Metadata } from "next";
import { prisma } from "../../../lib/prisma";
import { ordenCargo, pluralCargo } from "../../../lib/contenido";
import EncabezadoPagina from "../../components/EncabezadoPagina";
import TarjetaCandidato from "../../components/TarjetaCandidato";

export const metadata: Metadata = {
  title: "Candidatos",
  description: "Conocé a los candidatos y candidatas del PAR en Los Charrúas.",
};

async function Lista() {
  const candidatos = await prisma.candidato.findMany({
    where: { activo: true },
    orderBy: [{ orden: "asc" }, { createdAt: "asc" }],
  });

  if (candidatos.length === 0) {
    return (
      <p className="rounded-3xl border-2 border-dashed border-par-tinta/15 p-12 text-center text-lg text-par-tinta/60">
        Muy pronto vas a conocer acá a nuestros candidatos y candidatas.
      </p>
    );
  }

  // Agrupamos por cargo, en el orden de la boleta
  const grupos = new Map<string, typeof candidatos>();
  for (const c of [...candidatos].sort((a, b) => ordenCargo(a.cargo) - ordenCargo(b.cargo))) {
    const clave = c.cargo.trim();
    grupos.set(clave, [...(grupos.get(clave) ?? []), c]);
  }
  const [primero, ...demas] = [...grupos.entries()];

  return (
    <div className="space-y-24">
      {/* El primer cargo (normalmente Presidente Municipal) va destacado */}
      <div className="space-y-6">
        {primero[1].map((c) => (
          <div key={c.id} className="revelar">
            <TarjetaCandidato candidato={c} destacado conBio />
          </div>
        ))}
      </div>

      {demas.map(([cargo, lista]) => (
        <div key={cargo}>
          <div className="revelar mb-10 flex items-end gap-6">
            <h2 className="titular text-5xl md:text-7xl">{pluralCargo(cargo, lista.length)}</h2>
            <span className="mb-2 h-[3px] flex-1 bg-par-amarillo" />
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {lista.map((c) => (
              <div key={c.id} className="revelar">
                <TarjetaCandidato candidato={c} conBio />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CandidatosPage() {
  return (
    <>
      <EncabezadoPagina antetitulo="Nuestro equipo" titulo="Candidatos y" destacado="candidatas">
        Vecinos y vecinas de Los Charrúas que conocen el pueblo porque lo caminan todos los días.
      </EncabezadoPagina>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24">
        <Suspense fallback={<div className="aspect-[16/7] animate-pulse rounded-[2rem] bg-par-tinta/10" />}>
          <Lista />
        </Suspense>
      </section>
    </>
  );
}
