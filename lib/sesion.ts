import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse, connection } from "next/server";
import { COOKIE_FISCAL, COOKIE_SESION, leerTokenFiscal, tokenSesionValido } from "./auth";
import { prisma } from "./prisma";

export async function estaAutenticado(): Promise<boolean> {
  await connection(); // la validez depende de la hora actual: siempre se evalúa en el pedido
  const token = (await cookies()).get(COOKIE_SESION)?.value;
  return tokenSesionValido(token);
}

/** Para Server Actions y páginas del panel: corta la ejecución y manda al login si no hay sesión válida. */
export async function exigirAdmin(): Promise<void> {
  if (!(await estaAutenticado())) redirect("/login");
}

/** Para rutas /api: devuelve una respuesta 401 si no hay sesión válida, o null si está todo bien. */
export async function rechazarSiNoEsAdmin(): Promise<NextResponse | null> {
  if (await estaAutenticado()) return null;
  return NextResponse.json({ error: "No autorizado" }, { status: 401 });
}

export type FiscalSesion = {
  id: string;
  nombre: string;
  dni: string;
  rol: string;
  escuelaId: string | null;
};

/** El fiscal con sesión abierta, o null. Verifica firma, que siga activo y que no le hayan cambiado la clave. */
export async function fiscalActual(): Promise<FiscalSesion | null> {
  await connection();
  const datos = await leerTokenFiscal((await cookies()).get(COOKIE_FISCAL)?.value);
  if (!datos) return null;
  const fiscal = await prisma.fiscal.findUnique({
    where: { id: datos.fiscalId },
    select: { id: true, nombre: true, dni: true, rol: true, escuelaId: true, activo: true, sesionVersion: true },
  });
  if (!fiscal || !fiscal.activo || fiscal.sesionVersion !== datos.version) return null;
  return { id: fiscal.id, nombre: fiscal.nombre, dni: fiscal.dni, rol: fiscal.rol, escuelaId: fiscal.escuelaId };
}

export async function exigirFiscal(): Promise<FiscalSesion> {
  const fiscal = await fiscalActual();
  if (!fiscal) redirect("/fiscal/ingresar");
  return fiscal;
}
