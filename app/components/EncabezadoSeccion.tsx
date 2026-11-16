import Link from "next/link";

export default function EncabezadoSeccion({
  antetitulo,
  titulo,
  enlace,
  oscuro = false,
}: {
  antetitulo: string;
  titulo: React.ReactNode;
  enlace?: { href: string; texto: string };
  oscuro?: boolean;
}) {
  return (
    <div className="revelar mb-12 flex flex-col gap-6 md:mb-16 md:flex-row md:items-end md:justify-between">
      <div>
        <p className={`antetitulo mb-5 ${oscuro ? "text-par-celeste" : "text-par-celeste-oscuro"}`}>{antetitulo}</p>
        <h2 className="titular text-5xl md:text-7xl">{titulo}</h2>
      </div>
      {enlace && (
        <Link
          href={enlace.href}
          className={`group inline-flex shrink-0 items-center gap-3 font-display text-lg font-bold uppercase tracking-wider ${
            oscuro ? "text-white" : "text-par-tinta"
          }`}
        >
          {enlace.texto}
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-par-amarillo text-par-tinta transition group-hover:translate-x-1">
            →
          </span>
        </Link>
      )}
    </div>
  );
}
