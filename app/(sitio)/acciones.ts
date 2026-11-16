"use server";


import { headers } from "next/headers";
import { prisma } from "../../lib/prisma";
import { validarVoluntario } from "../../lib/validacion";

import type { EstadoFormulario } from "../../lib/formularios";

// Freno simple contra envíos repetidos: máximo 5 por dirección cada 10 minutos (por proceso)
const envios = new Map<string, number[]>();

async function demasiadosEnvios(): Promise<boolean> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "desconocida";
  const ahora = Date.now();
  const recientes = (envios.get(ip) ?? []).filter((t) => ahora - t < 10 * 60 * 1000);
  recientes.push(ahora);
  envios.set(ip, recientes);
  return recientes.length > 5;
}

export async function sumarVoluntario(_previo: EstadoFormulario, form: FormData): Promise<EstadoFormulario> {
  // Campo trampa: los humanos no lo ven; los robots lo completan
  if (String(form.get("sitio") ?? "")) return { ok: "¡Gracias! Te vamos a contactar." };
  if (await demasiadosEnvios()) return { error: "Recibimos muchos envíos seguidos. Probá de nuevo en unos minutos." };

  const resultado = validarVoluntario(form);
  if ("error" in resultado) return { error: resultado.error };

  try {
    await prisma.voluntario.create({ data: resultado.data });
  } catch (error) {
    console.error("No se pudo guardar el voluntario:", error);
    return { error: "No pudimos guardar tus datos. Probá de nuevo en un rato." };
  }
  return {
    ok: resultado.data.quiereFiscal
      ? "¡Gracias por sumarte a cuidar los votos! Te vamos a contactar para la capacitación de fiscales."
      : "¡Gracias por sumarte! Un compañero o compañera te va a contactar muy pronto.",
  };
}
