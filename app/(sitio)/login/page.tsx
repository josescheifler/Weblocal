import type { Metadata } from "next";
import Sol from "../../components/Sol";
import FormularioLogin from "./FormularioLogin";

export const metadata: Metadata = {
  title: "Administración",
  robots: { index: false },
};

export default function LoginPage() {
  return (
    <section className="relative isolate flex min-h-[80vh] items-center justify-center overflow-hidden bg-par-tinta p-4 py-20">
      <Sol className="absolute left-1/2 top-1/2 -z-10 h-[56rem] w-[56rem] -translate-x-1/2 -translate-y-1/2 animate-girar text-par-amarillo/[0.08]" />
      <div className="w-full max-w-md rounded-[2rem] bg-white p-8 text-center shadow-2xl md:p-10">
        <img src="/marca/logo-tinta.webp" alt="PAR" width={160} height={82} className="mx-auto h-16 w-auto" />
        <h1 className="titular mt-8 text-4xl">Administración</h1>
        <p className="mb-8 mt-2 text-par-tinta/60">Panel del PAR Los Charrúas</p>
        <FormularioLogin />
        <p className="mt-8 text-sm text-par-tinta/55">
          ¿Sos fiscal?{" "}
          <a href="/fiscal/ingresar" className="font-bold text-par-celeste-oscuro underline-offset-4 hover:underline">
            Ingresá acá
          </a>
        </p>
      </div>
    </section>
  );
}
