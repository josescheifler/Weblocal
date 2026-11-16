import Link from "next/link";
import Marca from "../Marca";
import { salirFiscal } from "../../fiscal/acciones";
import { etiquetaRol } from "../../../lib/fiscalizacion";
import type { FiscalSesion } from "../../../lib/sesion";

const TELEFONO_COMANDO = process.env.NEXT_PUBLIC_TELEFONO_COMANDO || "";

export default function EncabezadoFiscal({ fiscal }: { fiscal: FiscalSesion }) {
  return (
    <header className="sticky top-0 z-40 bg-par-tinta text-white shadow-lg">
      <div className="franja" />
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/fiscal" aria-label="Mis mesas">
          <Marca claro />
        </Link>
        <form action={salirFiscal}>
          <button type="submit" className="rounded-lg bg-white/10 px-3 py-2 text-sm font-bold hover:bg-white/20">
            Salir
          </button>
        </form>
      </div>
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-2 px-4 pb-3 text-sm">
        <p>
          <span className="font-bold">{fiscal.nombre}</span>
          <span className="text-white/60"> · {etiquetaRol(fiscal.rol)}</span>
        </p>
        {TELEFONO_COMANDO && (
          <a href={`tel:${TELEFONO_COMANDO}`} className="rounded-full bg-par-amarillo px-3 py-1 font-bold text-par-tinta">
            📞 Comando central
          </a>
        )}
      </div>
    </header>
  );
}
