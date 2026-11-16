import type { Metadata } from "next";
import Link from "next/link";
import EncabezadoPagina from "../../components/EncabezadoPagina";
import FormularioVoluntario from "../../components/FormularioVoluntario";
import Sol from "../../components/Sol";

export const metadata: Metadata = {
  title: "Fiscalización",
  description: "Sumate como fiscal del PAR en Los Charrúas. Cuidemos cada voto, mesa por mesa.",
};

const PASOS = [
  {
    titulo: "Te anotás",
    texto: "Completás el formulario y un coordinador te llama para confirmar tu lugar.",
  },
  {
    titulo: "Te capacitamos",
    texto: "Aprendés qué controlar en la apertura, durante la votación y en el escrutinio. Te damos todo el material.",
  },
  {
    titulo: "Recibís tu acceso",
    texto: "Antes de la elección te damos tu usuario (tu DNI) y una clave para entrar al sistema de fiscalización.",
  },
  {
    titulo: "Cuidás tu mesa",
    texto: "El día de la elección cargás desde el celular la apertura, la participación, el resultado y la foto del acta.",
  },
];

const FUNCIONES = [
  "Ver tu escuela y tu mesa asignada",
  "Avisar apertura y cierre de la mesa",
  "Informar cuántos votaron durante el día",
  "Cargar el escrutinio con control automático de sumas",
  "Subir la foto del acta firmada",
  "Reportar cualquier irregularidad al instante",
];

export default function FiscalizacionPage() {
  return (
    <>
      <EncabezadoPagina antetitulo="Fiscalización" titulo="Cuidemos" destacado="cada voto">
        La voluntad de los vecinos de Los Charrúas se defiende mesa por mesa. Sumate al equipo de fiscales del PAR.
      </EncabezadoPagina>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28">
        <p className="antetitulo mb-6 text-par-celeste-oscuro">¿Cómo funciona?</p>
        <ol className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {PASOS.map((p, i) => (
            <li key={p.titulo} className="revelar rounded-[1.75rem] bg-white p-8 ring-1 ring-par-tinta/8">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-par-amarillo font-display text-2xl font-bold">
                {i + 1}
              </span>
              <h2 className="titular mt-6 text-3xl">{p.titulo}</h2>
              <p className="mt-3 text-par-tinta/70">{p.texto}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="relative isolate overflow-hidden bg-par-celeste py-20 md:py-24">
        <Sol className="absolute -left-48 -top-48 -z-10 h-[36rem] w-[36rem] animate-girar text-white/15" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 text-par-tinta sm:px-6 lg:grid-cols-2">
          <div className="revelar">
            <p className="antetitulo mb-5">Sistema de fiscalización</p>
            <h2 className="titular text-5xl md:text-7xl">Todo desde tu celular</h2>
            <ul className="mt-8 space-y-3 text-lg font-medium">
              {FUNCIONES.map((f) => (
                <li key={f} className="flex gap-3">
                  <span className="mt-2 h-2.5 w-2.5 shrink-0 rotate-45 bg-par-tinta" aria-hidden="true" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <div className="revelar rounded-[2rem] bg-par-tinta p-8 text-white shadow-2xl md:p-12">
            <p className="antetitulo text-par-celeste">¿Ya sos fiscal?</p>
            <p className="titular mt-4 text-5xl">Ingresá con tu DNI</p>
            <p className="mt-4 text-white/70">
              Usá la clave que te dio tu coordinador. Si no la tenés o la perdiste, pedila a tu coordinador.
            </p>
            <Link
              href="/fiscal/ingresar"
              className="mt-8 inline-block rounded-full bg-par-amarillo px-8 py-4 font-display text-xl font-bold uppercase tracking-wider text-par-tinta transition hover:bg-white"
            >
              Ingresar al sistema
            </Link>
          </div>
        </div>
      </section>

      <section className="relative isolate overflow-hidden bg-par-tinta py-24 text-white md:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <div className="revelar">
            <p className="antetitulo mb-6 text-par-celeste">Anotate</p>
            <h2 className="titular text-6xl md:text-7xl">
              Quiero ser <span className="italic text-par-amarillo">fiscal</span>
            </h2>
            <p className="mt-6 text-lg text-white/70">
              No hace falta experiencia: te capacitamos. Solo necesitás estar en el padrón y tener ganas de cuidar la
              democracia en tu pueblo.
            </p>
          </div>
          <div className="revelar">
            <FormularioVoluntario fiscal />
          </div>
        </div>
      </section>
    </>
  );
}
