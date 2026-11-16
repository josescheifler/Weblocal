// Listas fijas que usan las secciones de contenido (propuestas, construcción, candidatos).
// Sin dependencias del servidor.

/** Ejes temáticos de las propuestas, con el dibujo (trazos SVG en una grilla de 24x24) que los representa. */
export const EJES = [
  { valor: "TRABAJO", etiqueta: "Trabajo y producción", icono: "M4 8h16v11H4zM9 8V5h6v3M4 13h16" },
  { valor: "SALUD", etiqueta: "Salud", icono: "M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10zM12 9v5M9.5 11.5h5" },
  { valor: "EDUCACION", etiqueta: "Educación", icono: "M3 9l9-4 9 4-9 4-9-4zM7 11v5c3 2 7 2 10 0v-5M21 9v6" },
  { valor: "JUVENTUD", etiqueta: "Juventud", icono: "M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.9z" },
  { valor: "OBRAS", etiqueta: "Obras y servicios", icono: "M3 20h18M5 20V10l7-5 7 5v10M9 20v-5h6v5" },
  { valor: "SEGURIDAD", etiqueta: "Seguridad", icono: "M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6zM9 12l2 2 4-4" },
  { valor: "AMBIENTE", etiqueta: "Ambiente", icono: "M5 19c0-8 5-13 14-14 0 9-5 14-13 14M5 19c3-4 6-6 9-8" },
  { valor: "DEPORTE", etiqueta: "Deporte y cultura", icono: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7l4 3-1.5 4.5h-5L8 10zM12 3v4M21 11l-5-1M3 11l5-1M9.5 14.5 7 19M14.5 14.5 17 19" },
  { valor: "SOCIAL", etiqueta: "Desarrollo social", icono: "M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM16 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM2 20c0-3.3 2.7-6 6-6s6 2.7 6 6M14 14.3A6 6 0 0 1 22 20" },
  { valor: "TRANSPARENCIA", etiqueta: "Transparencia", icono: "M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" },
] as const;

export const VALORES_EJE: readonly string[] = EJES.map((e) => e.valor);

export function datosEje(valor: string) {
  return EJES.find((e) => e.valor === valor) ?? EJES[0];
}

export const ESTADOS_HITO = [
  { valor: "HECHO", etiqueta: "Logrado" },
  { valor: "EN_CURSO", etiqueta: "En marcha" },
  { valor: "PROXIMO", etiqueta: "Próximo paso" },
] as const;

export const VALORES_ESTADO_HITO: readonly string[] = ESTADOS_HITO.map((e) => e.valor);

export function etiquetaEstadoHito(valor: string): string {
  return ESTADOS_HITO.find((e) => e.valor === valor)?.etiqueta ?? valor;
}

/** Cargos sugeridos al cargar un candidato (se puede escribir otro). El orden define cómo se agrupan en la web. */
export const CARGOS_SUGERIDOS = [
  "Presidente Municipal",
  "Vicepresidente Municipal",
  "Concejal",
  "Concejal suplente",
] as const;

export function ordenCargo(cargo: string): number {
  const i = CARGOS_SUGERIDOS.findIndex((c) => c.toLowerCase() === cargo.trim().toLowerCase());
  return i === -1 ? CARGOS_SUGERIDOS.length : i;
}

/** "Concejal" → "Concejales" para los títulos de grupo */
export function pluralCargo(cargo: string, cantidad: number): string {
  if (cantidad === 1) return cargo;
  const [primera, ...resto] = cargo.split(" ");
  const plural = /[aeiouáéó]$/i.test(primera) ? `${primera}s` : `${primera}es`;
  return [plural, ...resto.map((p) => (/[aeiou]$/i.test(p) ? `${p}s` : `${p}es`))].join(" ");
}
