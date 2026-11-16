// Categorías y utilidades de las noticias. Sin dependencias del servidor:
// se puede importar tanto desde páginas como desde componentes "use client".

export const CATEGORIAS = [
  { valor: "GENERAL", etiqueta: "Noticia", enFormulario: "Noticia" },
  { valor: "CONSTRUCCION", etiqueta: "Construcción", enFormulario: "Avance de la construcción" },
  { valor: "ACTIVIDAD", etiqueta: "Actividad", enFormulario: "Actividad / recorrida" },
  { valor: "MEDIOS", etiqueta: "En los medios", enFormulario: "Nota de otro medio" },
  { valor: "COMUNICADO", etiqueta: "Comunicado", enFormulario: "Comunicado" },
] as const;

export type Categoria = (typeof CATEGORIAS)[number]["valor"];

/** Nota publicada por otro medio: guardamos un resumen propio y el enlace al original. */
export const CATEGORIA_MEDIOS: Categoria = "MEDIOS";
export const CATEGORIA_COMUNICADO: Categoria = "COMUNICADO";
export const CATEGORIA_CONSTRUCCION: Categoria = "CONSTRUCCION";

export const VALORES_CATEGORIA: readonly string[] = CATEGORIAS.map((c) => c.valor);

export function etiquetaCategoria(valor: string): string {
  return CATEGORIAS.find((c) => c.valor === valor)?.etiqueta ?? valor;
}

const ZONA = "America/Argentina/Buenos_Aires";

/** "16 de marzo de 2025" */
export function fechaLarga(fecha: Date): string {
  return new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "long", year: "numeric", timeZone: ZONA }).format(fecha);
}

/** "2025-03-16", el formato de <input type="date">, en hora argentina */
export function fechaParaInput(fecha: Date): string {
  return new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: ZONA }).format(fecha);
}

/** Convierte "2025-03-16" al mediodía argentino de ese día; null si no es una fecha válida. */
export function fechaDesdeInput(valor: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) return null;
  const fecha = new Date(`${valor}T12:00:00-03:00`);
  return Number.isNaN(fecha.getTime()) || fechaParaInput(fecha) !== valor ? null : fecha;
}

/** "14:35" en hora argentina */
export function hora(fecha: Date): string {
  return new Intl.DateTimeFormat("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: ZONA }).format(fecha);
}
