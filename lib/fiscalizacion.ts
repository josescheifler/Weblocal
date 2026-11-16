// Constantes y reglas de la fiscalización. Sin dependencias del servidor.

export const ROLES_FISCAL = [
  { valor: "MESA", etiqueta: "Fiscal de mesa", ayuda: "Opera solo las mesas que tiene asignadas." },
  { valor: "GENERAL", etiqueta: "Fiscal general", ayuda: "Opera todas las mesas de su escuela." },
] as const;

export function etiquetaRol(valor: string): string {
  return ROLES_FISCAL.find((r) => r.valor === valor)?.etiqueta ?? valor;
}

export const ESTADOS_MESA = [
  { valor: "SIN_ABRIR", etiqueta: "Sin abrir", color: "bg-slate-200 text-slate-700" },
  { valor: "ABIERTA", etiqueta: "Abierta", color: "bg-par-celeste/20 text-par-celeste-oscuro" },
  { valor: "CERRADA", etiqueta: "Cerrada", color: "bg-par-amarillo/30 text-par-tinta" },
  { valor: "ESCRUTADA", etiqueta: "Escrutada", color: "bg-emerald-100 text-emerald-800" },
] as const;

export const VALORES_ESTADO_MESA: readonly string[] = ESTADOS_MESA.map((e) => e.valor);

export function datosEstadoMesa(valor: string) {
  return ESTADOS_MESA.find((e) => e.valor === valor) ?? ESTADOS_MESA[0];
}

/** Votos que no van a ninguna lista. Se guardan con estas claves en VotoMesa.clave */
export const CLAVES_ESPECIALES = [
  { valor: "BLANCO", etiqueta: "Votos en blanco" },
  { valor: "NULO", etiqueta: "Votos nulos" },
  { valor: "RECURRIDO", etiqueta: "Votos recurridos" },
  { valor: "IMPUGNADO", etiqueta: "Identidad impugnada" },
] as const;

export const VALORES_CLAVE_ESPECIAL: readonly string[] = CLAVES_ESPECIALES.map((c) => c.valor);

export const TIPOS_INCIDENCIA = [
  { valor: "APERTURA", etiqueta: "Demora en la apertura" },
  { valor: "BOLETAS", etiqueta: "Faltan boletas / boletas adulteradas" },
  { valor: "AUTORIDADES", etiqueta: "Problema con autoridades de mesa" },
  { valor: "FISCAL", etiqueta: "No dejan fiscalizar" },
  { valor: "PADRON", etiqueta: "Problema con el padrón" },
  { valor: "PROSELITISMO", etiqueta: "Proselitismo / boca de urna" },
  { valor: "VIOLENCIA", etiqueta: "Violencia o amenazas" },
  { valor: "ESCRUTINIO", etiqueta: "Irregularidad en el escrutinio" },
  { valor: "OTRO", etiqueta: "Otro" },
] as const;

export const VALORES_TIPO_INCIDENCIA: readonly string[] = TIPOS_INCIDENCIA.map((t) => t.valor);

export function etiquetaIncidencia(valor: string): string {
  return TIPOS_INCIDENCIA.find((t) => t.valor === valor)?.etiqueta ?? valor;
}

export const GRAVEDADES = [
  { valor: "BAJA", etiqueta: "Baja", color: "bg-slate-100 text-slate-700" },
  { valor: "MEDIA", etiqueta: "Media", color: "bg-amber-100 text-amber-800" },
  { valor: "ALTA", etiqueta: "Urgente", color: "bg-red-100 text-red-700" },
] as const;

export function datosGravedad(valor: string) {
  return GRAVEDADES.find((g) => g.valor === valor) ?? GRAVEDADES[1];
}

/** ¿Puede este fiscal operar esta mesa? */
export function puedeOperarMesa(
  fiscal: { id: string; rol: string; escuelaId: string | null },
  mesa: { fiscalId: string | null; escuelaId: string },
): boolean {
  if (mesa.fiscalId === fiscal.id) return true;
  return fiscal.rol === "GENERAL" && !!fiscal.escuelaId && fiscal.escuelaId === mesa.escuelaId;
}

/** Ordena números de mesa como números cuando se puede ("2" antes que "10") */
export function compararNumeroMesa(a: string, b: string): number {
  return a.localeCompare(b, "es", { numeric: true });
}

export type ControlEscrutinio = { nivel: "ok" | "aviso" | "error"; mensaje: string };

/**
 * Controles de consistencia de un cargo: la suma de votos (listas + especiales)
 * debería coincidir con la cantidad de votantes, que a su vez no puede superar a los electores.
 */
export function controlarCargo(suma: number, votantes: number | null, electores: number | null): ControlEscrutinio {
  if (electores && votantes && votantes > electores) {
    return { nivel: "error", mensaje: `Votaron ${votantes} pero la mesa tiene ${electores} electores.` };
  }
  if (votantes === null) return { nivel: "aviso", mensaje: "Falta cargar cuántas personas votaron." };
  if (suma > votantes) return { nivel: "error", mensaje: `Hay ${suma - votantes} votos de más respecto de los votantes.` };
  if (suma < votantes) return { nivel: "aviso", mensaje: `Faltan ${votantes - suma} votos para llegar a los votantes.` };
  return { nivel: "ok", mensaje: "La suma coincide con la cantidad de votantes." };
}

export const VALORES_GRAVEDAD: readonly string[] = GRAVEDADES.map((g) => g.valor);
