import type { Candidato } from "@prisma/client";
import { iniciales } from "../../lib/formato";
import Sol from "./Sol";

type Props = {
  candidato: Pick<Candidato, "id" | "nombre" | "cargo" | "orden" | "fotoUrl" | "bio" | "cita" | "instagram" | "facebook">;
  destacado?: boolean;
  conBio?: boolean;
};

function Foto({ candidato, className }: { candidato: Props["candidato"]; className: string }) {
  return candidato.fotoUrl ? (
    <img src={candidato.fotoUrl} alt={candidato.nombre} loading="lazy" decoding="async" className={`object-cover ${className}`} />
  ) : (
    <div className={`relative isolate flex items-center justify-center overflow-hidden bg-gradient-to-br from-par-tinta to-par-tinta-2 ${className}`}>
      <Sol className="absolute -right-1/4 -top-1/4 -z-10 h-[90%] w-[90%] text-par-amarillo/15" />
      <span className="titular text-[5rem] text-white/80">{iniciales(candidato.nombre)}</span>
    </div>
  );
}

function Redes({ candidato, claro = false }: { candidato: Props["candidato"]; claro?: boolean }) {
  const redes = [
    { nombre: "Instagram", url: candidato.instagram },
    { nombre: "Facebook", url: candidato.facebook },
  ].filter((r) => r.url);
  if (redes.length === 0) return null;
  return (
    <div className="mt-5 flex flex-wrap gap-2">
      {redes.map((r) => (
        <a
          key={r.nombre}
          href={r.url!}
          target="_blank"
          rel="noopener noreferrer"
          className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
            claro ? "bg-white/10 text-white hover:bg-par-amarillo hover:text-par-tinta" : "bg-par-tinta/5 hover:bg-par-tinta hover:text-white"
          }`}
        >
          {r.nombre}
        </a>
      ))}
    </div>
  );
}

export default function TarjetaCandidato({ candidato, destacado = false, conBio = false }: Props) {
  if (destacado) {
    return (
      <article
        id={`candidato-${candidato.id}`}
        className="relative isolate grid overflow-hidden rounded-[2rem] bg-par-tinta text-white shadow-[0_40px_80px_-40px_rgba(7,63,85,0.7)] md:grid-cols-[0.9fr_1.1fr]"
      >
        <Foto candidato={candidato} className="aspect-[4/5] h-full w-full md:aspect-auto md:min-h-[32rem]" />
        <div className="flex flex-col justify-center p-8 md:p-12 lg:p-16">
          <p className="antetitulo text-par-amarillo">{candidato.cargo}</p>
          <h3 className="titular mt-4 text-6xl md:text-7xl lg:text-8xl">{candidato.nombre}</h3>
          {candidato.cita && (
            <blockquote className="mt-8 border-l-[6px] border-par-amarillo pl-6 text-xl font-medium leading-snug text-white/90 md:text-2xl">
              “{candidato.cita}”
            </blockquote>
          )}
          {conBio && candidato.bio && <p className="mt-6 whitespace-pre-line text-lg text-white/70">{candidato.bio}</p>}
          <Redes candidato={candidato} claro />
        </div>
      </article>
    );
  }

  return (
    <article id={`candidato-${candidato.id}`} className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-white ring-1 ring-par-tinta/8">
      <div className="relative overflow-hidden">
        <Foto candidato={candidato} className="aspect-[4/5] w-full transition duration-700 group-hover:scale-105" />
        {candidato.orden > 0 && (
          <span className="titular absolute left-4 top-4 flex h-12 w-12 items-center justify-center rounded-full bg-par-amarillo text-2xl text-par-tinta shadow-lg">
            {candidato.orden}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="antetitulo text-sm text-par-celeste-oscuro">{candidato.cargo}</p>
        <h3 className="titular mt-2 text-4xl">{candidato.nombre}</h3>
        {candidato.cita && <p className="mt-3 text-par-tinta/70 italic">“{candidato.cita}”</p>}
        {conBio && candidato.bio && <p className="mt-3 whitespace-pre-line text-par-tinta/70">{candidato.bio}</p>}
        <Redes candidato={candidato} />
      </div>
    </article>
  );
}
