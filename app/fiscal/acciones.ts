"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { refresh } from "next/cache";
import { prisma } from "../../lib/prisma";
import { COOKIE_FISCAL, DURACION_SESION_FISCAL_SEG, claveCorrecta, crearTokenFiscal, hashearClave } from "../../lib/auth";
import { exigirFiscal, type FiscalSesion } from "../../lib/sesion";
import type { EstadoFormulario } from "../../lib/formularios";
import { normalizarDni, texto } from "../../lib/validacion";
import { puedeOperarMesa, VALORES_ESTADO_MESA } from "../../lib/fiscalizacion";
import { guardarEscrutinio, guardarIncidencia, guardarParticipacion } from "../../lib/escrutinio";

const MAX_INTENTOS = 5;
const BLOQUEO_MIN = 15;

// Clave de relleno: si el DNI no existe igual calculamos un hash, para que la demora no delate qué DNI están cargados
const RELLENO = hashearClave("relleno-para-tiempo-constante");

export async function ingresarFiscal(_previo: EstadoFormulario, form: FormData): Promise<EstadoFormulario> {
  if (!process.env.SESSION_SECRET) return { error: "El sistema no está configurado todavía." };
  const dni = normalizarDni(texto(form, "dni", 20));
  const clave = texto(form, "clave", 64);
  if (!dni || !clave) return { error: "Ingresá tu DNI (solo números) y tu clave." };

  const fiscal = await prisma.fiscal.findUnique({ where: { dni } });
  if (!fiscal || !fiscal.activo) {
    const r = await RELLENO;
    await claveCorrecta(clave, r.hash, r.salt);
    return { error: "DNI o clave incorrectos. Si no tenés clave, pedila a tu coordinador." };
  }
  if (fiscal.bloqueadoHasta && fiscal.bloqueadoHasta > new Date()) {
    const minutos = Math.ceil((fiscal.bloqueadoHasta.getTime() - Date.now()) / 60000);
    return { error: `Por seguridad, el acceso quedó bloqueado. Probá de nuevo en ${minutos} min o pedile ayuda a tu coordinador.` };
  }

  if (!(await claveCorrecta(clave, fiscal.claveHash, fiscal.claveSalt))) {
    const intentos = fiscal.intentosFallidos + 1;
    await prisma.fiscal.update({
      where: { id: fiscal.id },
      data:
        intentos >= MAX_INTENTOS
          ? { intentosFallidos: 0, bloqueadoHasta: new Date(Date.now() + BLOQUEO_MIN * 60000) }
          : { intentosFallidos: intentos },
    });
    const restantes = MAX_INTENTOS - intentos;
    return {
      error:
        restantes > 0
          ? `DNI o clave incorrectos. Te quedan ${restantes} ${restantes === 1 ? "intento" : "intentos"}.`
          : `Demasiados intentos. El acceso quedó bloqueado ${BLOQUEO_MIN} minutos.`,
    };
  }

  await prisma.fiscal.update({
    where: { id: fiscal.id },
    data: { intentosFallidos: 0, bloqueadoHasta: null, ultimoIngreso: new Date() },
  });
  (await cookies()).set(COOKIE_FISCAL, await crearTokenFiscal(fiscal.id, fiscal.sesionVersion), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DURACION_SESION_FISCAL_SEG,
  });
  redirect("/fiscal");
}

export async function salirFiscal() {
  (await cookies()).delete(COOKIE_FISCAL);
  redirect("/fiscal/ingresar");
}

/** Trae la mesa y verifica que este fiscal pueda operarla. */
async function mesaPermitida(fiscal: FiscalSesion, mesaId: string) {
  const mesa = await prisma.mesa.findUnique({
    where: { id: mesaId },
    select: { id: true, fiscalId: true, escuelaId: true, estado: true, verificada: true },
  });
  if (!mesa || !puedeOperarMesa(fiscal, mesa)) return null;
  return mesa;
}

const SIN_PERMISO: EstadoFormulario = { error: "No tenés permiso para operar esta mesa." };

export async function cambiarEstadoMesa(mesaId: string, _previo: EstadoFormulario, form: FormData): Promise<EstadoFormulario> {
  const fiscal = await exigirFiscal();
  const mesa = await mesaPermitida(fiscal, mesaId);
  if (!mesa) return SIN_PERMISO;
  const estado = texto(form, "estado");
  if (!VALORES_ESTADO_MESA.includes(estado) || estado === "ESCRUTADA") return { error: "Estado inválido." };
  if (mesa.estado === "ESCRUTADA") return { error: "La mesa ya tiene el escrutinio cargado." };
  await prisma.mesa.update({ where: { id: mesaId }, data: { estado } });
  refresh();
  return { ok: "Estado actualizado." };
}

export async function reportarParticipacion(mesaId: string, _previo: EstadoFormulario, form: FormData): Promise<EstadoFormulario> {
  const fiscal = await exigirFiscal();
  if (!(await mesaPermitida(fiscal, mesaId))) return SIN_PERMISO;
  const resultado = await guardarParticipacion(mesaId, form, fiscal.id);
  if (resultado?.ok) refresh();
  return resultado;
}

export async function cargarEscrutinio(mesaId: string, _previo: EstadoFormulario, form: FormData): Promise<EstadoFormulario> {
  const fiscal = await exigirFiscal();
  const mesa = await mesaPermitida(fiscal, mesaId);
  if (!mesa) return SIN_PERMISO;
  if (mesa.verificada) return { error: "El comando central ya verificó esta mesa. Para corregir algo, comunicate con tu coordinador." };
  const resultado = await guardarEscrutinio(mesaId, form);
  if (resultado?.ok) refresh();
  return resultado;
}

export async function reportarIncidencia(mesaId: string, _previo: EstadoFormulario, form: FormData): Promise<EstadoFormulario> {
  const fiscal = await exigirFiscal();
  const mesa = await mesaPermitida(fiscal, mesaId);
  if (!mesa) return SIN_PERMISO;
  const resultado = await guardarIncidencia({ mesaId, escuelaId: mesa.escuelaId, fiscalId: fiscal.id }, form);
  if (resultado?.ok) refresh();
  return resultado;
}
