import Sol from "./Sol";

export default function EncabezadoPagina({
  antetitulo,
  titulo,
  destacado,
  children,
}: {
  antetitulo: string;
  titulo: string;
  destacado?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-par-tinta text-white">
      <Sol className="absolute -right-56 top-1/2 -z-10 h-[44rem] w-[44rem] -translate-y-1/2 animate-girar text-par-amarillo/[0.08]" />
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-20 sm:px-6 md:pb-24 md:pt-28">
        <p className="antetitulo mb-6 animate-aparecer text-par-celeste">{antetitulo}</p>
        <h1 className="titular animate-aparecer text-6xl md:text-9xl">
          {titulo} {destacado && <span className="italic text-par-amarillo">{destacado}</span>}
        </h1>
        {children && <p className="mt-8 max-w-2xl animate-aparecer text-lg text-white/70 md:text-xl">{children}</p>}
      </div>
    </section>
  );
}
