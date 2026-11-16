import type { Metadata } from "next";
import Link from "next/link";
import Sol from "../../components/Sol";
import Marca from "../../components/Marca";
import FormularioIngreso from "./FormularioIngreso";

export const metadata: Metadata = { title: "Ingreso de fiscales" };

export default function IngresoFiscal() {
  return (
    <section className="relative isolate flex min-h-screen flex-col items-center justify-center overflow-hidden bg-par-tinta p-4 py-12">
      <Sol className="absolute left-1/2 top-1/2 -z-10 h-[56rem] w-[56rem] -translate-x-1/2 -translate-y-1/2 animate-girar text-par-amarillo/[0.08]" />
      <div className="w-full max-w-md rounded-[2rem] bg-white p-7 text-center shadow-2xl md:p-10">
        <div className="flex justify-center">
          <Marca />
        </div>
        <h1 className="titular mt-8 text-5xl">Fiscales</h1>
        <p className="mb-8 mt-2 text-par-tinta/60">Ingresá con tu DNI y la clave que te dio tu coordinador.</p>
        <FormularioIngreso />
      </div>
      <Link href="/fiscalizacion" className="mt-8 text-sm font-semibold text-white/60 underline-offset-4 hover:text-white hover:underline">
        ¿Todavía no sos fiscal? Anotate acá
      </Link>
    </section>
  );
}
