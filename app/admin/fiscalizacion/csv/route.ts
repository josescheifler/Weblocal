import { prisma } from "../../../../lib/prisma";
import { rechazarSiNoEsAdmin } from "../../../../lib/sesion";
import { aCsv, respuestaCsv } from "../../../../lib/csv";
import { CLAVES_ESPECIALES, compararNumeroMesa, datosEstadoMesa } from "../../../../lib/fiscalizacion";

/** Planilla con una fila por mesa y cargo: estado, votantes y votos de cada lista. */
export async function GET() {
  const rechazo = await rechazarSiNoEsAdmin();
  if (rechazo) return rechazo;

  const [mesas, cargos, listas] = await Promise.all([
    prisma.mesa.findMany({
      include: { escuela: { select: { nombre: true } }, fiscal: { select: { nombre: true } }, votos: true, foto: { select: { id: true } } },
    }),
    prisma.cargo.findMany({ orderBy: [{ orden: "asc" }, { nombre: "asc" }] }),
    prisma.lista.findMany({ orderBy: [{ orden: "asc" }, { numero: "asc" }] }),
  ]);
  mesas.sort((a, b) => compararNumeroMesa(a.numero, b.numero));

  const claves = [...listas.map((l) => ({ clave: l.id, titulo: `${l.numero} ${l.nombre}` })), ...CLAVES_ESPECIALES.map((e) => ({ clave: e.valor, titulo: e.etiqueta }))];
  const filas: (string | number | boolean | null)[][] = [
    ["Escuela", "Mesa", "Electores", "Estado", "Verificada", "Foto acta", "Fiscal", "Votantes", "Cargo", ...claves.map((c) => c.titulo), "Total"],
  ];
  for (const m of mesas) {
    for (const cargo of cargos.length ? cargos : [null]) {
      const votos = claves.map((c) => (cargo ? (m.votos.find((v) => v.cargoId === cargo.id && v.clave === c.clave)?.cantidad ?? null) : null));
      filas.push([
        m.escuela.nombre,
        m.numero,
        m.electores,
        datosEstadoMesa(m.estado).etiqueta,
        m.verificada,
        !!m.foto,
        m.fiscal?.nombre ?? "",
        m.votantes,
        cargo?.nombre ?? "",
        ...votos,
        m.estado === "ESCRUTADA" ? votos.reduce<number>((n, v) => n + (v ?? 0), 0) : null,
      ]);
    }
  }
  return respuestaCsv("resultados-por-mesa.csv", aCsv(filas));
}
