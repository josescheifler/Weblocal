"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_SESION, DURACION_SESION_SEG, crearTokenSesion, passwordCorrecta } from "../../../lib/auth";

// Freno contra adivinar la contraseña: 8 intentos fallidos por dirección cada 15 minutos (por proceso)
const fallidos = new Map<string, number[]>();
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
  const ahora = Date.now();
  const recientes = (fallidos.get(ip) ?? []).filter((t) => ahora - t < VENTANA);
  if (recientes.length >= 8) return "Demasiados intentos. Esperá unos minutos y volvé a probar.";

  const password = String(formData.get("password") ?? "");
  if (!(await passwordCorrecta(password))) {
    fallidos.set(ip, [...recientes, ahora]);
    return "Contraseña incorrecta.";
  }
  fallidos.delete(ip);

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
