import Link from "next/link";
import Sol from "./components/Sol";
import Marca from "./components/Marca";

export default function NoEncontrado() {
  return (
    <section className="relative isolate flex min-h-screen flex-col overflow-hidden bg-par-tinta text-white">
      <div className="franja" />
      <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6">
        <Link href="/" aria-label="Volver al inicio">
          <Marca claro />
        </Link>
      </div>
      <Sol className="absolute left-1/2 top-1/2 -z-10 h-[60rem] w-[60rem] -translate-x-1/2 -translate-y-1/2 animate-girar text-par-amarillo/[0.08]" />
      <div className="mx-auto my-auto max-w-3xl px-4 py-24 text-center sm:px-6">
        <p className="titular text-[clamp(7rem,30vw,16rem)] leading-none text-par-amarillo">404</p>
        <h1 className="titular mt-4 text-4xl md:text-6xl">Esta página no existe</h1>
        <p className="mt-6 text-lg text-white/70">Puede que se haya movido o que el enlace esté mal escrito.</p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/"
            className="rounded-full bg-par-amarillo px-8 py-4 font-display text-xl font-bold uppercase tracking-wider text-par-tinta transition hover:bg-white"
          >
            Volver al inicio
          </Link>
          <Link
            href="/noticias"
            className="rounded-full px-8 py-4 font-display text-xl font-bold uppercase tracking-wider ring-2 ring-white/30 transition hover:ring-white"
          >
            Ver noticias
          </Link>
        </div>
      </div>
    </section>
  );
}
