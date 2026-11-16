import { prisma } from "../../../lib/prisma";
import { estaAutenticado, fiscalActual } from "../../../lib/sesion";
import { puedeOperarMesa } from "../../../lib/fiscalizacion";

type Contexto = { params: Promise<{ mesaId: string }> };

/** Foto del acta de una mesa. Solo para el comando central o el fiscal que opera esa mesa. */
export async function GET(_request: Request, { params }: Contexto) {
  const { mesaId } = await params;
  const mesa = await prisma.mesa.findUnique({
    where: { id: mesaId },
    select: { fiscalId: true, escuelaId: true, foto: { select: { url: true } } },
  });
  if (!mesa?.foto) return new Response("No encontrada", { status: 404 });

  if (!(await estaAutenticado())) {
    const fiscal = await fiscalActual();
    if (!fiscal || !puedeOperarMesa(fiscal, mesa)) return new Response("No autorizado", { status: 401 });
  }

  const { url } = mesa.foto;
  if (url.startsWith("https://")) return Response.redirect(url, 302);

  const m = /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/.exec(url);
  if (!m) return new Response("Formato inválido", { status: 500 });
  return new Response(Buffer.from(m[2], "base64"), {
    headers: { "Content-Type": m[1], "Cache-Control": "private, max-age=300", "X-Content-Type-Options": "nosniff" },
  });
}
