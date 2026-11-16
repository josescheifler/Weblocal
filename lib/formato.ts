export { URL_SITIO } from "./sitio";

// Categorías y fecha larga viven en lib/noticias.ts; se re-exportan para usarlas desde un solo lugar
export { etiquetaCategoria, fechaLarga, hora } from "./noticias";

export function fechaCorta(fecha: Date): string {
  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "America/Argentina/Buenos_Aires",
  })
    .format(fecha)
    .replace(/\./g, "")
    .replace(/ de /g, " ");
}

/** "mar 2025" */
export function mesAnio(fecha: Date): string {
  return new Intl.DateTimeFormat("es-AR", { month: "short", year: "numeric", timeZone: "America/Argentina/Buenos_Aires" })
    .format(fecha)
    .replace(/\./g, "")
    .replace(/ de /g, " ");
}

export function minutosDeLectura(texto: string): number {
  const palabras = texto.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(palabras / 200));
}

export function extracto(texto: string, largo = 180): string {
  const limpio = texto.replace(/\s+/g, " ").trim();
  if (limpio.length <= largo) return limpio;
  return limpio.slice(0, limpio.lastIndexOf(" ", largo)).replace(/[,.;:]$/, "") + "…";
}

export function porcentaje(parte: number, total: number, decimales = 1): string {
  if (!total) return "0%";
  return `${((parte / total) * 100).toFixed(decimales).replace(".", ",")}%`;
}

export function iniciales(nombre: string): string {
  return nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}
