type Indicador = { id: string; etiqueta: string; valor: number; meta: number | null };

/** Números del armado, con barra de avance cuando tienen meta */
export default function Indicadores({ indicadores, oscuro = false }: { indicadores: Indicador[]; oscuro?: boolean }) {
  if (indicadores.length === 0) return null;
  return (
    <div className={`grid gap-px overflow-hidden rounded-[2rem] sm:grid-cols-2 lg:grid-cols-4 ${oscuro ? "bg-white/10" : "bg-par-tinta/10 ring-1 ring-par-tinta/10"}`}>
      {indicadores.map((ind) => {
        const avance = ind.meta ? Math.min(100, Math.round((ind.valor / ind.meta) * 100)) : null;
        return (
          <div key={ind.id} className={`revelar p-8 md:p-10 ${oscuro ? "bg-par-tinta" : "bg-par-papel"}`}>
            <p className="titular text-7xl text-par-amarillo md:text-8xl">
              {ind.valor.toLocaleString("es-AR")}
              {ind.meta ? (
                <span className={`ml-2 text-3xl ${oscuro ? "text-white/40" : "text-par-tinta/35"}`}>/ {ind.meta.toLocaleString("es-AR")}</span>
              ) : null}
            </p>
            <p className={`mt-3 font-display text-xl font-bold uppercase tracking-wider ${oscuro ? "text-white" : "text-par-tinta"}`}>
              {ind.etiqueta}
            </p>
            {avance !== null && (
              <div className="mt-5">
                <div
                  className={`h-2.5 overflow-hidden rounded-full ${oscuro ? "bg-white/10" : "bg-par-tinta/10"}`}
                  role="progressbar"
                  aria-valuenow={avance}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${ind.etiqueta}: ${avance}% de la meta`}
                >
                  <div className="h-full rounded-full bg-gradient-to-r from-par-celeste to-par-amarillo" style={{ width: `${avance}%` }} />
                </div>
                <p className={`mt-2 text-sm font-semibold ${oscuro ? "text-white/55" : "text-par-tinta/55"}`}>{avance}% de la meta</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
