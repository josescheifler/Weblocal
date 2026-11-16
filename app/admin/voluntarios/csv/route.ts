import { prisma } from "../../../../lib/prisma";
import { rechazarSiNoEsAdmin } from "../../../../lib/sesion";
import { aCsv, respuestaCsv } from "../../../../lib/csv";
import { fechaParaInput } from "../../../../lib/noticias";

export async function GET() {
  const rechazo = await rechazarSiNoEsAdmin();
  if (rechazo) return rechazo;
  const voluntarios = await prisma.voluntario.findMany({ orderBy: { createdAt: "asc" } });
  const filas = [
    ["Nombre", "Teléfono", "DNI", "Barrio", "Quiere ser fiscal", "Contactado", "Mensaje", "Fecha"],
    ...voluntarios.map((v) => [v.nombre, v.telefono, v.dni, v.barrio, v.quiereFiscal, v.contactado, v.mensaje, fechaParaInput(v.createdAt)]),
  ];
  return respuestaCsv("voluntarios-par-los-charruas.csv", aCsv(filas));
}
