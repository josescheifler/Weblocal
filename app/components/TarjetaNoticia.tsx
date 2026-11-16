import Link from "next/link";
import type { Noticia } from "@prisma/client";
import { etiquetaCategoria, extracto, fechaCorta } from "../../lib/formato";
import { CATEGORIA_COMUNICADO, CATEGORIA_MEDIOS } from "../../lib/noticias";

type Props = {
  noticia: Pick<Noticia, "id" | "titulo" | "contenido" | "categoria" | "imagenUrl" | "createdAt" | "fuenteNombre">;
  destacada?: boolean;
};

/** Tarjeta de una noticia, nota de otro medio o comunicado. Siempre lleva a su página dentro del sitio. */
export default function TarjetaNoticia({ noticia, destacada = false }: Props) {
  const medio = noticia.categoria === CATEGORIA_MEDIOS ? noticia.fuenteNombre : null;
  const llamado = medio
    ? "Ver resumen y nota original"
    : noticia.categoria === CATEGORIA_COMUNICADO
      ? "Leer comunicado"
      : "Leer nota";

  return (
    <Link
      href={`/noticias/${noticia.id}`}
      className={`group relative flex flex-col overflow-hidden rounded-[1.75rem] bg-white ring-1 ring-par-tinta/8 transition duration-500 hover:-translate-y-1.5 hover:shadow-[0_30px_60px_-30px_rgba(7,63,85,0.45)] ${
        destacada ? "lg:flex-row" : ""
      }`}
    >
      <div
        className={`relative overflow-hidden bg-par-tinta ${
          destacada ? "aspect-[16/10] lg:aspect-auto lg:w-3/5" : "aspect-[16/10]"
        }`}
      >
        {noticia.imagenUrl ? (
          <img
            src={noticia.imagenUrl}
            alt=""
            loading={destacada ? "eager" : "lazy"}
            decoding="async"
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-par-tinta to-par-tinta-2">
            <img src="/marca/logo-blanco.webp" alt="" className="w-2/5 opacity-25" />
          </div>
        )}
        <span className="absolute left-4 top-4 rounded-full bg-par-amarillo px-3 py-1 font-display text-sm font-bold uppercase tracking-wider text-par-tinta">
          {etiquetaCategoria(noticia.categoria)}
        </span>
      </div>

      <div className={`flex flex-1 flex-col p-6 md:p-7 ${destacada ? "lg:justify-center lg:p-12" : ""}`}>
        <time
          dateTime={noticia.createdAt.toISOString()}
          className="mb-3 font-display text-sm font-bold uppercase tracking-[0.18em] text-par-celeste-oscuro"
        >
          {fechaCorta(noticia.createdAt)}
        </time>
        <h3
          className={`titular text-par-tinta transition-colors group-hover:text-par-celeste-oscuro ${
            destacada ? "text-4xl md:text-5xl lg:text-6xl" : "text-[1.9rem]"
          }`}
        >
          {noticia.titulo}
        </h3>
        {medio && (
          <p className="mt-3 font-display text-base font-bold uppercase tracking-wider text-par-tinta/55">
            Publicado por {medio}
          </p>
        )}
        <p className={`mt-4 text-par-tinta/70 ${destacada ? "text-lg" : "line-clamp-3"}`}>
          {extracto(noticia.contenido, destacada ? 260 : 150)}
        </p>
        <span className="mt-auto pt-6 font-display text-base font-bold uppercase tracking-wider text-par-tinta">
          {llamado}{" "}
          <span aria-hidden="true" className="inline-block transition group-hover:translate-x-1.5">
            →
          </span>
        </span>
      </div>
    </Link>
  );
}
