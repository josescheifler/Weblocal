import Link from "next/link";
import { cacheLife } from "next/cache";
import Sol from "./Sol";
import Marca from "./Marca";
import { SECCIONES, SITIO } from "../../lib/sitio";

// El año se calcula en caché (se renueva cada día) para poder prerenderizar el pie
async function AnioActual() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}

const REDES = [
  { nombre: "WhatsApp", url: SITIO.whatsapp ? `https://wa.me/${SITIO.whatsapp}` : "" },
  { nombre: "Instagram", url: SITIO.instagram },
  { nombre: "Facebook", url: SITIO.facebook },
].filter((r) => r.url);

export default function Pie() {
  return (
    <footer className="relative isolate overflow-hidden bg-par-tinta text-white">
      <div className="franja" />
      <Sol className="absolute -right-40 -top-40 -z-10 h-[34rem] w-[34rem] animate-girar text-par-amarillo/[0.06]" />

      <div className="mx-auto max-w-7xl px-4 pb-10 pt-16 sm:px-6 md:pt-20">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Marca claro grande />
            <p className="titular mt-8 text-4xl text-par-amarillo md:text-5xl">{SITIO.lema}</p>
            <p className="mt-4 max-w-sm text-white/65">
              {SITIO.espacioCompleto} en {SITIO.localidad}, departamento {SITIO.departamento}. Construcción colectiva,
              territorio y juventud para transformar nuestro pueblo.
            </p>
          </div>

          <div>
            <p className="antetitulo mb-5 text-par-celeste">Secciones</p>
            <ul className="space-y-3 font-display text-xl font-bold uppercase tracking-wider">
              {SECCIONES.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="transition hover:text-par-amarillo">
                    {l.texto}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="antetitulo mb-5 text-par-celeste">Participá</p>
            <p className="text-white/65">
              Hay lugar para todos los que quieran construir. Dejanos tus datos y te contactamos.
            </p>
            <Link
              href="/#sumate"
              className="mt-6 inline-block rounded-full bg-par-amarillo px-6 py-3 font-display text-lg font-bold uppercase tracking-wider text-par-tinta transition hover:bg-white"
            >
              Quiero sumarme
            </Link>
            {REDES.length > 0 && (
              <ul className="mt-6 flex flex-wrap gap-3">
                {REDES.map((r) => (
                  <li key={r.nombre}>
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-par-amarillo hover:text-par-tinta"
                    >
                      {r.nombre}
                    </a>
                  </li>
                ))}
              </ul>
            )}
            <a
              href={SITIO.webProvincial}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 block text-sm font-semibold text-par-celeste underline-offset-4 hover:underline"
            >
              PAR en todo Entre Ríos ↗
            </a>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-white/10 pt-8 text-sm text-white/45 md:flex-row md:items-center md:justify-between">
          <p>
            © <AnioActual /> {SITIO.espacioCompleto} · {SITIO.localidad}, {SITIO.provincia}.
          </p>
          <div className="flex gap-6">
            <Link href="/fiscal" className="transition hover:text-white">
              Ingreso de fiscales
            </Link>
            <Link href="/login" className="transition hover:text-white">
              Administración
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
