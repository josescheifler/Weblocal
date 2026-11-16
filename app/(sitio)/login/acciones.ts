"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_SESION, DURACION_SESION_SEG, crearTokenSesion, passwordCorrecta } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";

// Freno contra adivinar la contraseña: 8 intentos fallidos por dirección cada 15 minutos.
// Se guarda en la base para que valga aunque el sitio corra en varias instancias (Vercel).
const MAX_FALLIDOS = 8;
const VENTANA = 15 * 60 * 1000;

async function ipDelPedido(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "desconocida";
}

export async function iniciarSesion(_estadoPrevio: string | null, formData: FormData): Promise<string | null> {
  if (!process.env.ADMIN_PASSWORD || !process.env.SESSION_SECRET) {
    console.error("Faltan ADMIN_PASSWORD o SESSION_SECRET en las variables de entorno");
    return "El acceso no está configurado en el servidor.";
  }

  const ip = await ipDelPedido();
  const desde = new Date(Date.now() - VENTANA);
  const recientes = await prisma.intentoAcceso.count({ where: { clave: ip, createdAt: { gte: desde } } });
  if (recientes >= MAX_FALLIDOS) return "Demasiados intentos. Esperá unos minutos y volvé a probar.";

  const password = String(formData.get("password") ?? "");
  if (!(await passwordCorrecta(password))) {
    await prisma.intentoAcceso.create({ data: { clave: ip } });
    // Limpieza de intentos viejos
    await prisma.intentoAcceso.deleteMany({ where: { createdAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } } });
    return "Contraseña incorrecta.";
  }
  await prisma.intentoAcceso.deleteMany({ where: { clave: ip } });

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_SESION, await crearTokenSesion(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DURACION_SESION_SEG,
  });
  redirect("/admin");
}

export async function cerrarSesion() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_SESION);
  redirect("/login");
}
