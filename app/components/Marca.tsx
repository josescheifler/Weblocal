import { SITIO } from "../../lib/sitio";

/** Logo del PAR con el nombre de la localidad al lado. */
export default function Marca({ claro = false, grande = false }: { claro?: boolean; grande?: boolean }) {
  return (
    <span className="flex items-center gap-3">
      <img
        src={claro ? "/marca/logo-blanco.webp" : "/marca/logo-tinta.webp"}
        alt="PAR"
        width={120}
        height={61}
        className={grande ? "h-16 w-auto md:h-20" : "h-11 w-auto"}
      />
      <span
        className={`border-l-2 pl-3 font-display font-extrabold uppercase leading-[0.9] tracking-wide ${
          claro ? "border-white/25 text-white" : "border-par-tinta/15 text-par-tinta"
        } ${grande ? "text-2xl md:text-3xl" : "text-lg"}`}
      >
        <span className={`block text-[0.62em] tracking-[0.2em] ${claro ? "text-par-celeste" : "text-par-celeste-oscuro"}`}>
          {SITIO.provincia}
        </span>
        {SITIO.localidad}
      </span>
    </span>
  );
}
