/** Arma un CSV (separado por punto y coma, como lo abre Excel en español) con BOM para que respete los acentos. */
export function aCsv(filas: (string | number | boolean | null | undefined)[][]): string {
  const celda = (v: string | number | boolean | null | undefined) => {
    let t = v === null || v === undefined ? "" : typeof v === "boolean" ? (v ? "Sí" : "No") : String(v);
    // Evita que Excel interprete el contenido como fórmula
    if (/^[=+\-@]/.test(t)) t = `'${t}`;
    return /[";\n\r]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
  };
  return "﻿" + filas.map((f) => f.map(celda).join(";")).join("\r\n");
}

export function respuestaCsv(nombre: string, contenido: string): Response {
  return new Response(contenido, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${nombre}"`,
      "Cache-Control": "no-store",
    },
  });
}
