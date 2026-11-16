"use server";

import { redirect } from "next/navigation";
import { refresh } from "next/cache";
import { prisma } from "../../../lib/prisma";
import { exigirAdmin } from "../../../lib/sesion";
import { generarClave, hashearClave } from "../../../lib/auth";
import type { EstadoFormulario } from "../../../lib/formularios";
import { casilla, enteroOpcional, esDuplicado, normalizarDni, texto, textoOpcional } from "../../../lib/validacion";
import { VALORES_ESTADO_MESA } from "../../../lib/fiscalizacion";
import { guardarEscrutinio, guardarIncidencia, guardarParticipacion } from "../../../lib/escrutinio";

function idDe(form: FormData): string {
  const id = form.get("id");
  return typeof id === "string" ? id : "";
}

// ── Escuelas y mesas ─────────────────────────────────────────

export async function guardarEscuela(id: string | null, _p: EstadoFormulario, form: FormData): Promise<EstadoFormulario> {
  await exigirAdmin();
  const nombre = texto(form, "nombre", 160);
  const orden = enteroOpcional(form, "orden");
  if (!nombre) return { error: "El nombre de la escuela es obligatorio." };
  if (Number.isNaN(orden)) return { error: "El orden debe ser un número." };
  const data = { nombre, direccion: textoOpcional(form, "direccion", 200), orden: orden ?? 0 };
  if (id) await prisma.escuela.update({ where: { id }, data });
  else await prisma.escuela.create({ data });
  refresh();
  return { ok: id ? "Escuela actualizada." : "Escuela agregada." };
}

export async function borrarEscuela(form: FormData) {
  await exigirAdmin();
  await prisma.escuela.deleteMany({ where: { id: idDe(form) } });
  refresh();
}

/**
 * Carga masiva del padrón. Una mesa por renglón: "Escuela; Dirección; Número de mesa; Electores".
 * Acepta punto y coma, tabulación (copiado de una planilla) o coma como separador.
 */
export async function importarPadron(_p: EstadoFormulario, form: FormData): Promise<EstadoFormulario> {
  await exigirAdmin();
  const renglones = texto(form, "padron", 200_000)
    .split(/\r?\n/)
    .map((r) => r.trim())
    .filter(Boolean);
  if (renglones.length === 0) return { error: "Pegá al menos un renglón." };

  const filas: { escuela: string; direccion: string | null; numero: string; electores: number | null }[] = [];
  for (const [i, renglon] of renglones.entries()) {
    const sep = renglon.includes(";") ? ";" : renglon.includes("\t") ? "\t" : ",";
    const [escuela = "", direccion = "", numero = "", electores = ""] = renglon.split(sep).map((c) => c.trim());
    // Saltea el encabezado si lo pegaron
    if (i === 0 && /escuela/i.test(escuela) && /mesa/i.test(numero)) continue;
    if (!escuela || !numero) return { error: `Renglón ${i + 1}: falta la escuela o el número de mesa.` };
    if (!/^[\w-]{1,12}$/.test(numero)) return { error: `Renglón ${i + 1}: el número de mesa “${numero}” no es válido.` };
    if (electores && !/^\d{1,5}$/.test(electores)) return { error: `Renglón ${i + 1}: los electores deben ser un número.` };
    filas.push({ escuela, direccion: direccion || null, numero, electores: electores ? Number(electores) : null });
  }

  let escuelasNuevas = 0;
  let mesasNuevas = 0;
  let mesasActualizadas = 0;
  await prisma.$transaction(async (tx) => {
    const existentes = await tx.escuela.findMany({ select: { id: true, nombre: true } });
    const porNombre = new Map(existentes.map((e) => [e.nombre.toLowerCase(), e.id]));
    let orden = existentes.length;
    for (const f of filas) {
      let escuelaId = porNombre.get(f.escuela.toLowerCase());
      if (!escuelaId) {
        escuelaId = (await tx.escuela.create({ data: { nombre: f.escuela, direccion: f.direccion, orden: ++orden } })).id;
        porNombre.set(f.escuela.toLowerCase(), escuelaId);
        escuelasNuevas++;
      }
      const previa = await tx.mesa.findUnique({ where: { numero: f.numero }, select: { id: true } });
      if (previa) {
        await tx.mesa.update({ where: { id: previa.id }, data: { escuelaId, ...(f.electores !== null ? { electores: f.electores } : {}) } });
        mesasActualizadas++;
      } else {
        await tx.mesa.create({ data: { numero: f.numero, escuelaId, electores: f.electores } });
        mesasNuevas++;
      }
    }
  });
  refresh();
  return { ok: `Listo: ${escuelasNuevas} escuelas nuevas, ${mesasNuevas} mesas nuevas y ${mesasActualizadas} mesas actualizadas.` };
}

export async function guardarMesa(id: string | null, _p: EstadoFormulario, form: FormData): Promise<EstadoFormulario> {
  await exigirAdmin();
  const numero = texto(form, "numero", 12);
  const escuelaId = texto(form, "escuelaId");
  const electores = enteroOpcional(form, "electores");
  const fiscalId = texto(form, "fiscalId") || null;
  if (!/^[\w-]{1,12}$/.test(numero)) return { error: "Número de mesa inválido." };
  if (!escuelaId) return { error: "Elegí la escuela." };
  if (Number.isNaN(electores)) return { error: "Los electores deben ser un número." };
  const data = { numero, escuelaId, electores, fiscalId };
  try {
    if (id) await prisma.mesa.update({ where: { id }, data });
    else await prisma.mesa.create({ data });
  } catch (error) {
    if (esDuplicado(error)) return { error: `Ya existe la mesa ${numero}.` };
    throw error;
  }
  refresh();
  return { ok: id ? "Mesa actualizada." : `Mesa ${numero} agregada.` };
}

export async function borrarMesa(form: FormData) {
  await exigirAdmin();
  await prisma.mesa.deleteMany({ where: { id: idDe(form) } });
  redirect("/admin/fiscalizacion/mesas");
}

// ── Fiscales ─────────────────────────────────────────────────

function datosFiscal(form: FormData) {
  const nombre = texto(form, "nombre", 120);
  const rol = texto(form, "rol") === "GENERAL" ? "GENERAL" : "MESA";
  const escuelaId = rol === "GENERAL" ? texto(form, "escuelaId") || null : null;
  if (nombre.length < 3) return { error: "Escribí nombre y apellido." } as const;
  if (rol === "GENERAL" && !escuelaId) return { error: "El fiscal general necesita una escuela." } as const;
  return { data: { nombre, rol, escuelaId, telefono: textoOpcional(form, "telefono", 40) } } as const;
}

export async function crearFiscal(_p: EstadoFormulario, form: FormData): Promise<EstadoFormulario> {
  await exigirAdmin();
  const r = datosFiscal(form);
  if ("error" in r) return { error: r.error };
  const dni = normalizarDni(texto(form, "dni", 20));
  if (!dni) return { error: "El DNI debe tener entre 7 y 9 números." };
  const mesaId = texto(form, "mesaId") || null;

  const clave = generarClave();
  const { hash, salt } = await hashearClave(clave);
  try {
    await prisma.$transaction(async (tx) => {
      const fiscal = await tx.fiscal.create({ data: { ...r.data, dni, claveHash: hash, claveSalt: salt } });
      if (mesaId) await tx.mesa.update({ where: { id: mesaId }, data: { fiscalId: fiscal.id } });
      const voluntarioId = texto(form, "voluntarioId");
      if (voluntarioId) await tx.voluntario.updateMany({ where: { id: voluntarioId }, data: { contactado: true } });
    });
  } catch (error) {
    if (esDuplicado(error)) return { error: `Ya hay un fiscal con el DNI ${dni}.` };
    throw error;
  }
  refresh();
  return {
    ok: `Fiscal creado. Pasale su usuario (DNI ${dni}) y esta clave. Anotala ahora: por seguridad no se vuelve a mostrar.`,
    extra: clave,
  };
}

export async function editarFiscal(id: string, _p: EstadoFormulario, form: FormData): Promise<EstadoFormulario> {
  await exigirAdmin();
  const r = datosFiscal(form);
  if ("error" in r) return { error: r.error };
  const activo = casilla(form, "activo");
  await prisma.fiscal.update({
    where: { id },
    // Desactivar invalida las sesiones abiertas
    data: { ...r.data, activo, ...(activo ? {} : { sesionVersion: { increment: 1 } }) },
  });
  refresh();
  return { ok: "Datos guardados." };
}

export async function nuevaClaveFiscal(id: string, _p: EstadoFormulario): Promise<EstadoFormulario> {
  await exigirAdmin();
  const clave = generarClave();
  const { hash, salt } = await hashearClave(clave);
  await prisma.fiscal.update({
    where: { id },
    data: { claveHash: hash, claveSalt: salt, sesionVersion: { increment: 1 }, intentosFallidos: 0, bloqueadoHasta: null },
  });
  refresh();
  return { ok: "Nueva clave generada (la anterior dejó de funcionar y se cerraron sus sesiones):", extra: clave };
}

export async function borrarFiscal(form: FormData) {
  await exigirAdmin();
  await prisma.fiscal.deleteMany({ where: { id: idDe(form) } });
  refresh();
}

export async function asignarMesaAFiscal(fiscalId: string, _p: EstadoFormulario, form: FormData): Promise<EstadoFormulario> {
  await exigirAdmin();
  const mesaId = texto(form, "mesaId");
  if (!mesaId) return { error: "Elegí una mesa." };
  await prisma.mesa.update({ where: { id: mesaId }, data: { fiscalId } });
  refresh();
  return { ok: "Mesa asignada." };
}

export async function quitarMesaAFiscal(form: FormData) {
  await exigirAdmin();
  await prisma.mesa.updateMany({ where: { id: texto(form, "mesaId") }, data: { fiscalId: null } });
  refresh();
}

// ── Listas y cargos ──────────────────────────────────────────

export async function guardarLista(id: string | null, _p: EstadoFormulario, form: FormData): Promise<EstadoFormulario> {
  await exigirAdmin();
  const numero = texto(form, "numero", 20);
  const nombre = texto(form, "nombre", 120);
  const orden = enteroOpcional(form, "orden");
  const color = texto(form, "color", 7);
  if (!numero || !nombre) return { error: "Completá número y nombre de la lista." };
  if (Number.isNaN(orden)) return { error: "El orden debe ser un número." };
  if (color && !/^#[0-9a-fA-F]{6}$/.test(color)) return { error: "Color inválido." };
  const data = { numero, nombre, orden: orden ?? 0, propia: casilla(form, "propia"), color: color || null };
  if (id) await prisma.lista.update({ where: { id }, data });
  else await prisma.lista.create({ data });
  refresh();
  return { ok: id ? "Lista actualizada." : "Lista agregada." };
}

export async function borrarLista(form: FormData) {
  await exigirAdmin();
  const id = idDe(form);
  await prisma.$transaction([prisma.votoMesa.deleteMany({ where: { clave: id } }), prisma.lista.deleteMany({ where: { id } })]);
  refresh();
}

export async function guardarCargo(id: string | null, _p: EstadoFormulario, form: FormData): Promise<EstadoFormulario> {
  await exigirAdmin();
  const nombre = texto(form, "nombre", 80);
  const orden = enteroOpcional(form, "orden");
  if (!nombre) return { error: "Escribí el nombre del cargo." };
  if (Number.isNaN(orden)) return { error: "El orden debe ser un número." };
  if (id) await prisma.cargo.update({ where: { id }, data: { nombre, orden: orden ?? 0 } });
  else await prisma.cargo.create({ data: { nombre, orden: orden ?? 0 } });
  refresh();
  return { ok: id ? "Cargo actualizado." : "Cargo agregado." };
}

export async function borrarCargo(form: FormData) {
  await exigirAdmin();
  await prisma.cargo.deleteMany({ where: { id: idDe(form) } });
  refresh();
}

// ── Operación de mesas desde el comando central ──────────────

export async function estadoMesaAdmin(mesaId: string, _p: EstadoFormulario, form: FormData): Promise<EstadoFormulario> {
  await exigirAdmin();
  const estado = texto(form, "estado");
  if (!VALORES_ESTADO_MESA.includes(estado) || estado === "ESCRUTADA") return { error: "Estado inválido." };
  await prisma.mesa.update({ where: { id: mesaId }, data: { estado } });
  refresh();
  return { ok: "Estado actualizado." };
}

export async function participacionAdmin(mesaId: string, _p: EstadoFormulario, form: FormData): Promise<EstadoFormulario> {
  await exigirAdmin();
  const r = await guardarParticipacion(mesaId, form, null);
  if (r?.ok) refresh();
  return r;
}

export async function escrutinioAdmin(mesaId: string, _p: EstadoFormulario, form: FormData): Promise<EstadoFormulario> {
  await exigirAdmin();
  const r = await guardarEscrutinio(mesaId, form);
  if (r?.ok) refresh();
  return r;
}

export async function incidenciaAdmin(mesaId: string, _p: EstadoFormulario, form: FormData): Promise<EstadoFormulario> {
  await exigirAdmin();
  const mesa = await prisma.mesa.findUnique({ where: { id: mesaId }, select: { escuelaId: true } });
  const r = await guardarIncidencia({ mesaId, escuelaId: mesa?.escuelaId ?? null, fiscalId: null }, form);
  if (r?.ok) refresh();
  return r;
}

export async function cambiarVerificacion(form: FormData) {
  await exigirAdmin();
  const id = idDe(form);
  const mesa = await prisma.mesa.findUnique({ where: { id }, select: { verificada: true, estado: true } });
  if (mesa && mesa.estado === "ESCRUTADA") await prisma.mesa.update({ where: { id }, data: { verificada: !mesa.verificada } });
  refresh();
}

/** Borra el escrutinio cargado y deja la mesa como "Cerrada" para volver a cargarla */
export async function reiniciarEscrutinio(form: FormData) {
  await exigirAdmin();
  const id = idDe(form);
  await prisma.$transaction([
    prisma.votoMesa.deleteMany({ where: { mesaId: id } }),
    prisma.fotoActa.deleteMany({ where: { mesaId: id } }),
    prisma.mesa.update({ where: { id }, data: { estado: "CERRADA", votantes: null, verificada: false, escrutadaAt: null } }),
  ]);
  refresh();
}

export async function cambiarResuelta(form: FormData) {
  await exigirAdmin();
  const id = idDe(form);
  const inc = await prisma.incidencia.findUnique({ where: { id }, select: { resuelta: true } });
  if (inc) await prisma.incidencia.update({ where: { id }, data: { resuelta: !inc.resuelta } });
  refresh();
}
