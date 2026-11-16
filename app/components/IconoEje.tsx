import { datosEje } from "../../lib/contenido";

export default function IconoEje({ eje, className = "h-7 w-7" }: { eje: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={datosEje(eje).icono} />
    </svg>
  );
}
