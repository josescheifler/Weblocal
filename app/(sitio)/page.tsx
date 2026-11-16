import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "../../lib/prisma";
import { FOTO_GRUPAL, HISTORIA, PILARES, REFERENTE, SITIO } from "../../lib/sitio";
import { ordenCargo } from "../../lib/contenido";
import Sol from "../components/Sol";
import TarjetaNoticia from "../components/TarjetaNoticia";
import TarjetaCandidato from "../components/TarjetaCandidato";
import TarjetaPropuesta from "../components/TarjetaPropuesta";
import LineaDeTiempo from "../components/LineaDeTiempo";
import Indicadores from "../components/Indicadores";
import EncabezadoSeccion from "../components/EncabezadoSeccion";
import FormularioVoluntario from "../components/FormularioVoluntario";
import Compartir from "../components/Compartir";

const DESFILE = ["Los Charrúas", "Juventud", "Territorio", "Trabajo", "Gestión", "Esperanza"];

function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-par-tinta text-white">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_at_75%_45%,rgba(53,180,229,0.28),transparent_55%)]" />
      <Sol className="absolute -right-32 -top-24 -z-10 h-[26rem] w-[26rem] animate-girar text-par-amarillo/[0.13] md:hidden" />

      <div className="mx-auto grid min-h-[calc(100svh-74px)] max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 md:grid-cols-[1.35fr_1fr] md:py-24">
        <div className="animate-aparecer">
          <p className="antetitulo mb-6 text-par-celeste">
            {SITIO.espacioCompleto} · {SITIO.localidad}
          </p>
          <h1 className="titular text-[clamp(4rem,13vw,10.5rem)]">
            Nace una
            <span className="block italic text-par-amarillo">esperanza</span>
          </h1>
          <p className="mt-8 max-w-xl text-lg text-white/75 md:text-xl">{SITIO.bajada}</p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/propuestas"
              className="rounded-full bg-par-amarillo px-8 py-4 font-display text-xl font-bold uppercase tracking-wider text-par-tinta shadow-[0_12px_30px_-12px_rgba(255,192,0,0.9)] transition hover:-translate-y-0.5 hover:bg-white"
            >
              Nuestras propuestas
            </Link>
            <Link
              href="/construccion"
              className="rounded-full px-8 py-4 font-display text-xl font-bold uppercase tracking-wider text-white ring-2 ring-white/30 transition hover:bg-white/10 hover:ring-white"
            >
              Cómo viene la construcción
            </Link>
          </div>
        </div>

        <div className="relative hidden animate-aparecer [animation-delay:200ms] md:block">
          <Sol className="absolute left-1/2 top-[42%] -z-10 h-[150%] w-[150%] -translate-x-1/2 -translate-y-1/2 animate-girar text-par-amarillo/[0.12]" />
          <img
            src="/marca/logo-blanco.webp"
            alt="Logo del PAR"
            width={1400}
            height={715}
            fetchPriority="high"
            className="mx-auto w-full max-w-md drop-shadow-[0_30px_60px_rgba(0,0,0,0.5)]"
          />
          <p className="titular mt-6 text-center text-5xl tracking-wide lg:text-6xl">
            <span className="text-par-celeste">Los</span> Charrúas
          </p>
        </div>
      </div>

      {/* Cinta de valores en movimiento */}
      <div className="overflow-hidden border-y-4 border-par-tinta bg-par-amarillo py-3 text-par-tinta" aria-hidden="true">
        <div className="flex w-max animate-desfile">
          {[0, 1].map((copia) => (
            <div key={copia} className="flex shrink-0 items-center">
              {[...DESFILE, ...DESFILE].map((palabra, i) => (
                <span key={i} className="titular flex items-center gap-8 px-4 text-3xl md:text-4xl">
                  {palabra}
                  <Sol className="h-6 w-6" rayos={16} />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Manifiesto() {
  return (
    <>
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 md:py-32">
        <div className="grid items-start gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <div className="revelar lg:sticky lg:top-28">
            <p className="antetitulo mb-6 text-par-celeste-oscuro">Nuestra historia</p>
            <h2 className="titular text-5xl md:text-7xl">
              Así construimos en <span className="text-par-celeste-oscuro">Los Charrúas</span>
            </h2>
            <div className="relative mt-10">
              <img
                src={FOTO_GRUPAL}
                alt="El equipo del PAR en Los Charrúas"
                loading="lazy"
                decoding="async"
                className="aspect-[4/3] w-full rounded-[2rem] bg-par-tinta object-cover shadow-[0_40px_80px_-40px_rgba(7,63,85,0.6)]"
              />
              <span className="titular absolute -bottom-5 -right-2 rotate-[-4deg] rounded-2xl bg-par-amarillo px-5 py-2 text-3xl text-par-tinta shadow-xl md:-right-5">
                UB 238
              </span>
            </div>
          </div>
          <div className="revelar space-y-6 text-lg leading-relaxed text-par-tinta/75 md:text-xl lg:pt-14">
            {HISTORIA.map((parrafo, i) => (
              <p key={i} className={i === 0 ? "text-par-tinta" : ""}>
                {parrafo}
              </p>
            ))}
          </div>
        </div>

        <div className="mt-24 grid gap-px overflow-hidden rounded-[2rem] bg-par-tinta/10 ring-1 ring-par-tinta/10 sm:grid-cols-2 lg:grid-cols-4">
          {PILARES.map((pilar, i) => (
            <article key={pilar.titulo} className="revelar group relative bg-par-papel p-8 transition hover:bg-white md:p-10">
              <span className="titular text-7xl text-par-amarillo transition group-hover:text-par-celeste">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="titular mt-6 text-4xl">{pilar.titulo}</h3>
              <p className="mt-4 text-par-tinta/70">{pilar.texto}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Referente local */}
      <section className="relative isolate overflow-hidden bg-par-celeste py-24 md:py-32">
        <Sol className="absolute -left-48 -top-48 -z-10 h-[40rem] w-[40rem] animate-girar text-white/15" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div className="revelar relative mx-auto w-full max-w-md">
            <div className="aspect-[4/5] overflow-hidden rounded-[2rem] bg-par-tinta shadow-2xl">
              <img src={REFERENTE.foto} alt={REFERENTE.nombre} loading="lazy" decoding="async" className="h-full w-full object-cover" />
            </div>
            <div className="titular absolute -bottom-6 -right-2 rotate-[-4deg] rounded-2xl bg-par-amarillo px-6 py-3 text-3xl text-par-tinta shadow-xl md:-right-6 md:text-4xl">
              Referente
            </div>
          </div>
          <div className="revelar text-par-tinta">
            <p className="antetitulo mb-5">Conducción local</p>
            <blockquote className="border-l-[6px] border-par-amarillo pl-6 text-2xl font-medium leading-snug md:text-3xl">
              “{REFERENTE.cita}”
            </blockquote>
            <p className="titular mt-8 text-5xl md:text-6xl">{REFERENTE.nombre}</p>
            <p className="mt-2 font-display text-lg font-bold uppercase tracking-[0.18em] text-par-tinta/70">{REFERENTE.rol}</p>
          </div>
        </div>
      </section>
    </>
  );
}

async function ContenidoDinamico() {
  const [indicadores, hitos, candidatos, propuestas, noticias] = await Promise.all([
    prisma.indicador.findMany({ orderBy: [{ orden: "asc" }, { createdAt: "asc" }], take: 4 }),
    prisma.hito.findMany({ orderBy: [{ orden: "asc" }, { fecha: "asc" }] }),
    prisma.candidato.findMany({ where: { activo: true }, orderBy: [{ orden: "asc" }, { createdAt: "asc" }] }),
    prisma.propuesta.findMany({ where: { activo: true }, orderBy: [{ orden: "asc" }, { createdAt: "asc" }], take: 6 }),
    prisma.noticia.findMany({ orderBy: { createdAt: "desc" }, take: 4 }),
  ]);

  // Mostramos lo último logrado y lo que viene: el paso en curso y sus vecinos
  const pendiente = hitos.findIndex((h) => h.estado !== "HECHO");
  const inicio = Math.max(0, Math.min((pendiente === -1 ? hitos.length : pendiente) - 2, hitos.length - 4));
  const hitosVisibles = hitos.slice(inicio, inicio + 4);

  const candidatosOrdenados = [...candidatos].sort((a, b) => ordenCargo(a.cargo) - ordenCargo(b.cargo) || a.orden - b.orden);
  const [cabeza, ...equipo] = candidatosOrdenados;
  const [destacada, ...resto] = noticias;

  return (
    <>
      {/* CONSTRUCCIÓN */}
      {(indicadores.length > 0 || hitosVisibles.length > 0) && (
        <section className="relative isolate overflow-hidden bg-par-tinta py-24 text-white md:py-32">
          <Sol className="absolute -left-60 -top-60 -z-10 h-[44rem] w-[44rem] animate-girar text-par-amarillo/[0.07]" />
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <EncabezadoSeccion
              oscuro
              antetitulo="Paso a paso"
              titulo={
                <>
                  Cómo viene la <span className="italic text-par-amarillo">construcción</span>
                </>
              }
              enlace={{ href: "/construccion", texto: "Ver todo el recorrido" }}
            />
            <Indicadores indicadores={indicadores} oscuro />
            {hitosVisibles.length > 0 && (
              <div className="mt-16 max-w-3xl">
                <LineaDeTiempo hitos={hitosVisibles} oscuro />
              </div>
            )}
          </div>
        </section>
      )}

      {/* CANDIDATOS */}
      {cabeza && (
        <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 md:py-32">
          <EncabezadoSeccion
            antetitulo="Nuestro equipo"
            titulo={
              <>
                Los que dan <span className="text-par-celeste-oscuro">la cara</span>
              </>
            }
            enlace={{ href: "/candidatos", texto: "Conocé a todos" }}
          />
          <div className="revelar">
            <TarjetaCandidato candidato={cabeza} destacado />
          </div>
          {equipo.length > 0 && (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {equipo.slice(0, 4).map((c) => (
                <div key={c.id} className="revelar">
                  <TarjetaCandidato candidato={c} />
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* PROPUESTAS */}
      {propuestas.length > 0 && (
        <section className="bg-white py-24 md:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <EncabezadoSeccion
              antetitulo="Lo que vamos a hacer"
              titulo={
                <>
                  Propuestas para <span className="text-par-celeste-oscuro">Los Charrúas</span>
                </>
              }
              enlace={{ href: "/propuestas", texto: "Todas las propuestas" }}
            />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {propuestas.map((p, i) => (
                <div key={p.id} className="revelar">
                  <TarjetaPropuesta propuesta={p} numero={i + 1} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* NOTICIAS */}
      {destacada && (
        <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 md:py-32">
          <EncabezadoSeccion
            antetitulo="Últimas novedades"
            titulo={
              <>
                Lo que está <span className="text-par-celeste-oscuro">pasando</span>
              </>
            }
            enlace={{ href: "/noticias", texto: "Todas las noticias" }}
          />
          <div className="revelar">
            <TarjetaNoticia noticia={destacada} destacada />
          </div>
          {resto.length > 0 && (
            <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {resto.map((n) => (
                <div key={n.id} className="revelar">
                  <TarjetaNoticia noticia={n} />
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </>
  );
}

function CargandoContenido() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6" aria-label="Cargando contenido">
      <div className="mb-12 h-16 w-2/3 animate-pulse rounded-2xl bg-par-tinta/10" />
      <div className="grid gap-6 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="aspect-[4/5] animate-pulse rounded-[1.75rem] bg-par-tinta/10" />
        ))}
      </div>
    </div>
  );
}

function Fiscalizacion() {
  return (
    <section className="relative isolate overflow-hidden bg-par-celeste py-20 md:py-28">
      <Sol className="absolute -right-48 -top-48 -z-10 h-[40rem] w-[40rem] animate-girar text-white/15" />
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 text-par-tinta sm:px-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="revelar">
          <p className="antetitulo mb-5">Fiscalización</p>
          <h2 className="titular text-6xl md:text-8xl">Cuidemos cada voto</h2>
          <p className="mt-6 max-w-xl text-lg font-medium md:text-xl">
            La voluntad de los vecinos se defiende mesa por mesa. Sumate como fiscal: te capacitamos y te acompañamos
            durante toda la jornada.
          </p>
        </div>
        <div className="revelar flex flex-col gap-4 sm:flex-row lg:flex-col">
          <Link
            href="/fiscalizacion"
            className="rounded-full bg-par-tinta px-8 py-4 text-center font-display text-xl font-bold uppercase tracking-wider text-white transition hover:-translate-y-0.5 hover:bg-white hover:text-par-tinta"
          >
            Quiero ser fiscal
          </Link>
          <Link
            href="/fiscal"
            className="rounded-full bg-white/40 px-8 py-4 text-center font-display text-xl font-bold uppercase tracking-wider text-par-tinta ring-2 ring-par-tinta/20 transition hover:bg-white"
          >
            Ya soy fiscal: ingresar
          </Link>
        </div>
      </div>
    </section>
  );
}

function Sumate() {
  return (
    <section id="sumate" className="relative isolate overflow-hidden bg-par-tinta py-24 text-white md:py-32">
      <Sol className="absolute -bottom-72 left-1/2 -z-10 h-[46rem] w-[46rem] -translate-x-1/2 animate-girar text-par-amarillo/10" />
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
        <div className="revelar">
          <p className="antetitulo mb-6 text-par-celeste">Sumate</p>
          <h2 className="titular text-6xl md:text-8xl">
            Esto se construye <span className="italic text-par-amarillo">entre todos</span>
          </h2>
          <p className="mt-6 text-lg text-white/70 md:text-xl">
            No hace falta experiencia: hace falta ganas. Dejanos tus datos y te contactamos para que conozcas al equipo.
          </p>
          <div className="mt-10">
            <Compartir titulo={`Conocé el PAR ${SITIO.localidad}`} oscuro />
          </div>
        </div>
        <div className="revelar">
          <FormularioVoluntario />
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <Hero />
      <Manifiesto />
      <Suspense fallback={<CargandoContenido />}>
        <ContenidoDinamico />
      </Suspense>
      <Fiscalizacion />
      <Sumate />
    </>
  );
}
