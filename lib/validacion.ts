import { Prisma } from "@prisma/client";
import { CATEGORIA_MEDIOS, VALORES_CATEGORIA, fechaDesdeInput } from "./noticias";
import { VALORES_EJE, VALORES_ESTADO_HITO } from "./contenido";

// ── Lectura de formularios ───────────────────────────────────

export function texto(form: FormData, campo: string, max = 10_000): string {
  const valor = form.get(campo);
  return typeof valor === "string" ? valor.trim().slice(0, max) : "";
}

export function textoOpcional(form: FormData, campo: string, max = 10_000): string | null {
  return texto(form, campo, max) || null;
}

/** Entero >= 0, o null si está vacío. NaN si no es un número válido. */
export function enteroOpcional(form: FormData, campo: string): number | null {
  const valor = texto(form, campo);
  if (!valor) return null;
  if (!/^\d{1,7}$/.test(valor)) return NaN;
  return Number(valor);
}

export function casilla(form: FormData, campo: string): boolean {
  const valor = form.get(campo);
  return valor === "on" || valor === "true" || valor === "1";
}

/** Acepta solo enlaces http(s) absolutos; devuelve el enlace normalizado o null. */
export function enlaceHttp(valor: string): string | null {
  if (!valor) return null;
  try {
    const url = new URL(valor);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export type Resultado<T> = { error: string } | { data: T };

// ── Contenido ────────────────────────────────────────────────

export function validarNoticia(form: FormData) {
  const titulo = texto(form, "titulo", 300);
  const contenido = texto(form, "contenido", 50_000);
  const categoria = texto(form, "categoria");
  if (!titulo) return { error: "El título es obligatorio" } as const;
  if (!contenido) return { error: "El contenido es obligatorio" } as const;
  if (!VALORES_CATEGORIA.includes(categoria)) return { error: "Categoría inválida" } as const;

  const imagenTexto = texto(form, "imagenUrl");
  const imagenUrl = enlaceHttp(imagenTexto);
  if (imagenTexto && !imagenUrl) return { error: "La imagen debe ser un enlace que empiece con https://" } as const;

  let fuenteNombre: string | null = null;
  let fuenteUrl: string | null = null;
  if (categoria === CATEGORIA_MEDIOS) {
    fuenteNombre = textoOpcional(form, "fuenteNombre", 120);
    fuenteUrl = enlaceHttp(texto(form, "fuenteUrl"));
    if (!fuenteNombre) return { error: "Indicá el medio que publicó la nota" } as const;
    if (!fuenteUrl) return { error: "El enlace a la nota original debe empezar con http:// o https://" } as const;
  }

  const fechaTexto = texto(form, "fecha");
  const fecha = fechaTexto ? fechaDesdeInput(fechaTexto) : undefined;
  if (fecha === null) return { error: "La fecha no es válida" } as const;

  return { data: { titulo, contenido, categoria, imagenUrl, fuenteNombre, fuenteUrl }, fecha } as const;
}

export function validarCandidato(form: FormData) {
  const nombre = texto(form, "nombre", 120);
  const cargo = texto(form, "cargo", 80);
  const orden = enteroOpcional(form, "orden");
  if (!nombre) return { error: "El nombre es obligatorio" } as const;
  if (!cargo) return { error: "El cargo es obligatorio" } as const;
  if (Number.isNaN(orden)) return { error: "El orden debe ser un número" } as const;

  const fotoTexto = texto(form, "fotoUrl");
  const fotoUrl = enlaceHttp(fotoTexto);
  if (fotoTexto && !fotoUrl) return { error: "La foto debe ser un enlace que empiece con https://" } as const;
  const instagram = enlaceHttp(texto(form, "instagram"));
  const facebook = enlaceHttp(texto(form, "facebook"));
  if (texto(form, "instagram") && !instagram) return { error: "El enlace de Instagram no es válido" } as const;
  if (texto(form, "facebook") && !facebook) return { error: "El enlace de Facebook no es válido" } as const;

  return {
    data: {
      nombre,
      cargo,
      orden: orden ?? 0,
      fotoUrl,
      bio: textoOpcional(form, "bio", 3000),
      cita: textoOpcional(form, "cita", 300),
      instagram,
      facebook,
      activo: casilla(form, "activo"),
    },
  } as const;
}

export function validarPropuesta(form: FormData) {
  const eje = texto(form, "eje");
  const titulo = texto(form, "titulo", 200);
  const resumen = texto(form, "resumen", 600);
  const orden = enteroOpcional(form, "orden");
  if (!VALORES_EJE.includes(eje)) return { error: "Elegí un eje válido" } as const;
  if (!titulo) return { error: "El título es obligatorio" } as const;
  if (!resumen) return { error: "El resumen es obligatorio" } as const;
  if (Number.isNaN(orden)) return { error: "El orden debe ser un número" } as const;
  return {
    data: {
      eje,
      titulo,
      resumen,
      detalle: textoOpcional(form, "detalle", 5000),
      orden: orden ?? 0,
      activo: casilla(form, "activo"),
    },
  } as const;
}

export function validarHito(form: FormData) {
  const titulo = texto(form, "titulo", 200);
  const estado = texto(form, "estado");
  const orden = enteroOpcional(form, "orden");
  if (!titulo) return { error: "El título es obligatorio" } as const;
  if (!VALORES_ESTADO_HITO.includes(estado)) return { error: "Estado inválido" } as const;
  if (Number.isNaN(orden)) return { error: "El orden debe ser un número" } as const;
  const fechaTexto = texto(form, "fecha");
  const fecha = fechaTexto ? fechaDesdeInput(fechaTexto) : null;
  if (fechaTexto && !fecha) return { error: "La fecha no es válida" } as const;
  return {
    data: { titulo, estado, orden: orden ?? 0, fecha, descripcion: textoOpcional(form, "descripcion", 1500) },
  } as const;
}

export function validarIndicador(form: FormData) {
  const etiqueta = texto(form, "etiqueta", 120);
  const valor = enteroOpcional(form, "valor");
  const meta = enteroOpcional(form, "meta");
  const orden = enteroOpcional(form, "orden");
  if (!etiqueta) return { error: "La etiqueta es obligatoria" } as const;
  if (valor === null || Number.isNaN(valor)) return { error: "El valor debe ser un número" } as const;
  if (Number.isNaN(meta)) return { error: "La meta debe ser un número" } as const;
  if (Number.isNaN(orden)) return { error: "El orden debe ser un número" } as const;
  return { data: { etiqueta, valor, meta: meta || null, orden: orden ?? 0 } } as const;
}

export function validarVoluntario(form: FormData) {
  const nombre = texto(form, "nombre", 120);
  const telefono = texto(form, "telefono", 40);
  if (nombre.length < 3) return { error: "Contanos tu nombre y apellido" } as const;
  if (telefono.replace(/\D/g, "").length < 8) return { error: "Dejanos un teléfono válido para contactarte" } as const;
  const dni = texto(form, "dni", 15).replace(/\D/g, "") || null;
  if (dni && (dni.length < 7 || dni.length > 9)) return { error: "El DNI no parece válido" } as const;
  return {
    data: {
      nombre,
      telefono,
      dni,
      barrio: textoOpcional(form, "barrio", 120),
      mensaje: textoOpcional(form, "mensaje", 1500),
      quiereFiscal: casilla(form, "quiereFiscal"),
    },
  } as const;
}

/** DNI sin puntos ni espacios; null si no tiene entre 7 y 9 dígitos */
export function normalizarDni(valor: string): string | null {
  const dni = valor.replace(/\D/g, "");
  return dni.length >= 7 && dni.length <= 9 ? dni : null;
}

export function esNoEncontrado(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025";
}

export function esDuplicado(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}
