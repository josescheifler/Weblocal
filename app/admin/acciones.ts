"use server";

import { redirect } from "next/navigation";
import { refresh } from "next/cache";
import { prisma } from "../../lib/prisma";
import { exigirAdmin } from "../../lib/sesion";
import type { EstadoFormulario } from "../../lib/formularios";
import { cargarContenidoInicial } from "../../lib/contenidoInicial";
import {
  esNoEncontrado,
  validarCandidato,
  validarHito,
  validarIndicador,
  validarNoticia,
  validarPropuesta,
} from "../../lib/validacion";

function idDe(form: FormData): string {
  const id = form.get("id");
  return typeof id === "string" ? id : "";
}

async function intentar(operacion: () => Promise<unknown>, mensajeError: string): Promise<EstadoFormulario | null> {
  try {
    await operacion();
    return null;
  } catch (error) {
    if (esNoEncontrado(error)) return { error: "El registro ya no existe (¿lo borró otra persona?)" };
    console.error(mensajeError, error);
    return { error: mensajeError };
  }
}

// ── Noticias ─────────────────────────────────────────────────

export async function guardarNoticia(id: string | null, _p: EstadoFormulario, form: FormData): Promise<EstadoFormulario> {
  await exigirAdmin();
  const r = validarNoticia(form);
  if ("error" in r) return { error: r.error };
  const data = { ...r.data, ...(r.fecha ? { createdAt: r.fecha } : {}) };

  const fallo = await intentar(
    () => (id ? prisma.noticia.update({ where: { id }, data }) : prisma.noticia.create({ data })),
    "No se pudo guardar la noticia",
  );
  if (fallo) return fallo;
  if (!id) redirect("/admin/noticias");
  refresh();
  return { ok: "Cambios guardados." };
}

export async function borrarNoticia(form: FormData) {
  await exigirAdmin();
  await prisma.noticia.deleteMany({ where: { id: idDe(form) } });
  redirect("/admin/noticias");
}

// ── Candidatos ───────────────────────────────────────────────

export async function guardarCandidato(id: string | null, _p: EstadoFormulario, form: FormData): Promise<EstadoFormulario> {
  await exigirAdmin();
  const r = validarCandidato(form);
  if ("error" in r) return { error: r.error };
  const fallo = await intentar(
    () => (id ? prisma.candidato.update({ where: { id }, data: r.data }) : prisma.candidato.create({ data: r.data })),
    "No se pudo guardar el candidato",
  );
  if (fallo) return fallo;
  if (!id) redirect("/admin/candidatos");
  refresh();
  return { ok: "Cambios guardados." };
}

export async function borrarCandidato(form: FormData) {
  await exigirAdmin();
  await prisma.candidato.deleteMany({ where: { id: idDe(form) } });
  redirect("/admin/candidatos");
}

// ── Propuestas ───────────────────────────────────────────────

export async function guardarPropuesta(id: string | null, _p: EstadoFormulario, form: FormData): Promise<EstadoFormulario> {
  await exigirAdmin();
  const r = validarPropuesta(form);
  if ("error" in r) return { error: r.error };
  const fallo = await intentar(
    () => (id ? prisma.propuesta.update({ where: { id }, data: r.data }) : prisma.propuesta.create({ data: r.data })),
    "No se pudo guardar la propuesta",
  );
  if (fallo) return fallo;
  if (!id) redirect("/admin/propuestas");
  refresh();
  return { ok: "Cambios guardados." };
}

export async function borrarPropuesta(form: FormData) {
  await exigirAdmin();
  await prisma.propuesta.deleteMany({ where: { id: idDe(form) } });
  redirect("/admin/propuestas");
}

// ── Construcción: hitos e indicadores ────────────────────────

export async function guardarHito(id: string | null, _p: EstadoFormulario, form: FormData): Promise<EstadoFormulario> {
  await exigirAdmin();
  const r = validarHito(form);
  if ("error" in r) return { error: r.error };
  const fallo = await intentar(
    () => (id ? prisma.hito.update({ where: { id }, data: r.data }) : prisma.hito.create({ data: r.data })),
    "No se pudo guardar el paso",
  );
  if (fallo) return fallo;
  refresh();
  return { ok: id ? "Paso actualizado." : "Paso agregado." };
}

export async function borrarHito(form: FormData) {
  await exigirAdmin();
  await prisma.hito.deleteMany({ where: { id: idDe(form) } });
  refresh();
}

export async function guardarIndicador(id: string | null, _p: EstadoFormulario, form: FormData): Promise<EstadoFormulario> {
  await exigirAdmin();
  const r = validarIndicador(form);
  if ("error" in r) return { error: r.error };
  const fallo = await intentar(
    () => (id ? prisma.indicador.update({ where: { id }, data: r.data }) : prisma.indicador.create({ data: r.data })),
    "No se pudo guardar el número",
  );
  if (fallo) return fallo;
  refresh();
  return { ok: id ? "Número actualizado." : "Número agregado." };
}

export async function borrarIndicador(form: FormData) {
  await exigirAdmin();
  await prisma.indicador.deleteMany({ where: { id: idDe(form) } });
  refresh();
}

// ── Voluntarios ──────────────────────────────────────────────

export async function cambiarContactado(form: FormData) {
  await exigirAdmin();
  const id = idDe(form);
  const voluntario = await prisma.voluntario.findUnique({ where: { id }, select: { contactado: true } });
  if (voluntario) await prisma.voluntario.update({ where: { id }, data: { contactado: !voluntario.contactado } });
  refresh();
}

export async function borrarVoluntario(form: FormData) {
  await exigirAdmin();
  await prisma.voluntario.deleteMany({ where: { id: idDe(form) } });
  refresh();
}

// ── Contenido inicial ────────────────────────────────────────

export async function cargarInicial(): Promise<EstadoFormulario> {
  await exigirAdmin();
  await cargarContenidoInicial(prisma);
  redirect("/admin?inicial=1");
}
