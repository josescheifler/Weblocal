// Lógica de servidor de la fiscalización: guardado de datos de mesa y cálculo de resultados.
// La usan tanto los fiscales como el comando central (panel de administración).
import "server-only";
import { prisma } from "./prisma";
import type { EstadoFormulario } from "./formularios";
import { casilla, enteroOpcional, enlaceHttp, texto } from "./validacion";
import {
  CLAVES_ESPECIALES,
  VALORES_GRAVEDAD,
  VALORES_TIPO_INCIDENCIA,
  compararNumeroMesa,
  controlarCargo,
} from "./fiscalizacion";

const MAX_FOTO_BYTES = 3 * 1024 * 1024;

/** Valida la foto del acta: enlace https o imagen comprimida en data URL. Devuelve null si no es válida. */
function fotoValida(valor: string): string | null {
  if (valor.startsWith("data:")) {
    const m = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/.exec(valor);
    if (!m) return null;
    return (m[2].length * 3) / 4 <= MAX_FOTO_BYTES ? valor : null;
  }
  const url = enlaceHttp(valor);
  return url && url.startsWith("https://") ? url : null;
}

export async function guardarParticipacion(mesaId: string, form: FormData, fiscalId: string | null): Promise<EstadoFormulario> {
  const cantidad = enteroOpcional(form, "cantidad");
  if (cantidad === null || Number.isNaN(cantidad)) return { error: "Ingresá cuántas personas votaron hasta ahora." };
  const mesa = await prisma.mesa.findUnique({ where: { id: mesaId }, select: { electores: true, estado: true } });
  if (!mesa) return { error: "La mesa no existe." };
  if (mesa.electores && cantidad > mesa.electores) {
    return { error: `No puede ser: la mesa tiene ${mesa.electores} electores.` };
  }
  await prisma.$transaction([
    prisma.participacion.create({ data: { mesaId, cantidad, fiscalId } }),
    // Si informan votantes, la mesa ya está abierta
    ...(mesa.estado === "SIN_ABRIR" ? [prisma.mesa.update({ where: { id: mesaId }, data: { estado: "ABIERTA" } })] : []),
  ]);
  return { ok: `Listo: ${cantidad} votantes informados.` };
}

export async function guardarIncidencia(
  donde: { mesaId: string | null; escuelaId: string | null; fiscalId: string | null },
  form: FormData,
): Promise<EstadoFormulario> {
  const tipo = texto(form, "tipo");
  const gravedad = texto(form, "gravedad") || "MEDIA";
  const descripcion = texto(form, "descripcion", 2000);
  if (!VALORES_TIPO_INCIDENCIA.includes(tipo)) return { error: "Elegí qué tipo de problema es." };
  if (!VALORES_GRAVEDAD.includes(gravedad)) return { error: "Gravedad inválida." };
  if (descripcion.length < 5) return { error: "Contá brevemente qué pasó." };
  await prisma.incidencia.create({ data: { ...donde, tipo, gravedad, descripcion } });
  return { ok: "Incidencia enviada al comando central. Si es urgente, llamá también a tu coordinador." };
}

/** Datos para el formulario de escrutinio de una mesa */
export async function datosEscrutinio(mesaId: string) {
  const [mesa, cargos, listas] = await Promise.all([
    prisma.mesa.findUnique({
      where: { id: mesaId },
      include: {
        escuela: { select: { id: true, nombre: true, direccion: true } },
        fiscal: { select: { id: true, nombre: true, telefono: true } },
        votos: true,
        foto: { select: { id: true, url: true } },
        participaciones: { orderBy: { createdAt: "desc" }, take: 6, select: { id: true, cantidad: true, createdAt: true } },
        incidencias: { orderBy: { createdAt: "desc" }, select: { id: true, tipo: true, gravedad: true, descripcion: true, resuelta: true, createdAt: true } },
      },
    }),
    prisma.cargo.findMany({ orderBy: [{ orden: "asc" }, { nombre: "asc" }] }),
    prisma.lista.findMany({ orderBy: [{ orden: "asc" }, { numero: "asc" }] }),
  ]);
  if (!mesa) return null;
  const votos = Object.fromEntries(mesa.votos.map((v) => [`${v.cargoId}_${v.clave}`, v.cantidad]));
  return { mesa, cargos, listas, votos, tieneFoto: !!mesa.foto };
}

export async function guardarEscrutinio(mesaId: string, form: FormData): Promise<EstadoFormulario> {
  const [mesa, cargos, listas] = await Promise.all([
    prisma.mesa.findUnique({ where: { id: mesaId }, select: { id: true, electores: true } }),
    prisma.cargo.findMany({ select: { id: true, nombre: true } }),
    prisma.lista.findMany({ select: { id: true } }),
  ]);
  if (!mesa) return { error: "La mesa no existe." };
  if (cargos.length === 0 || listas.length === 0) {
    return { error: "Todavía no están cargadas las listas y los cargos de la elección. Avisá al comando central." };
  }

  const votantes = enteroOpcional(form, "votantes");
  if (votantes === null || Number.isNaN(votantes)) return { error: "Cargá cuántas personas votaron en la mesa (dato del acta)." };
  if (mesa.electores && votantes > mesa.electores) {
    return { error: `Votaron ${votantes} pero la mesa tiene ${mesa.electores} electores. Revisá el dato.` };
  }

  const claves = [...listas.map((l) => l.id), ...CLAVES_ESPECIALES.map((c) => c.valor)];
  const filas: { mesaId: string; cargoId: string; clave: string; cantidad: number }[] = [];
  const avisos: string[] = [];
  for (const cargo of cargos) {
    let suma = 0;
    for (const clave of claves) {
      const cantidad = enteroOpcional(form, `v_${cargo.id}_${clave}`);
      if (Number.isNaN(cantidad)) return { error: `Hay un número inválido en ${cargo.nombre}.` };
      suma += cantidad ?? 0;
      filas.push({ mesaId, cargoId: cargo.id, clave, cantidad: cantidad ?? 0 });
    }
    const control = controlarCargo(suma, votantes, mesa.electores);
    if (control.nivel !== "ok") avisos.push(`${cargo.nombre}: ${control.mensaje}`);
  }

  // Si las sumas no cierran, pedimos que lo confirmen (a veces el acta misma tiene diferencias)
  if (avisos.length > 0 && !casilla(form, "confirmarDiferencias")) {
    return {
      error: `Revisá los números. ${avisos.join(" ")} Si el acta realmente dice eso, tildá “El acta tiene estas diferencias” y volvé a guardar.`,
    };
  }

  const fotoTexto = texto(form, "foto", 6_000_000);
  const foto = fotoTexto ? fotoValida(fotoTexto) : null;
  if (fotoTexto && !foto) return { error: "La foto del acta no es válida o es demasiado grande. Probá sacarla de nuevo." };

  const observaciones = texto(form, "observaciones", 2000) || null;

  await prisma.$transaction([
    prisma.votoMesa.deleteMany({ where: { mesaId } }),
    prisma.votoMesa.createMany({ data: filas }),
    prisma.mesa.update({
      where: { id: mesaId },
      data: { votantes, observaciones, estado: "ESCRUTADA", escrutadaAt: new Date(), verificada: false },
    }),
    ...(foto
      ? [prisma.fotoActa.upsert({ where: { mesaId }, create: { mesaId, url: foto }, update: { url: foto, createdAt: new Date() } })]
      : []),
  ]);

  return {
    ok: avisos.length > 0 ? "Escrutinio guardado con diferencias (quedan marcadas para revisar)." : "¡Escrutinio guardado! Gracias por cuidar los votos.",
  };
}

// ── Tablero del comando central ──────────────────────────────

export type ResultadoLista = { id: string; numero: string; nombre: string; propia: boolean; color: string | null; votos: number };
export type ResultadoCargo = {
  id: string;
  nombre: string;
  listas: ResultadoLista[];
  especiales: { clave: string; etiqueta: string; votos: number }[];
  afirmativos: number;
  emitidos: number;
};

export async function resumenTablero() {
  const [escuelas, cargos, listas, votos, participaciones, incidenciasAbiertas, fiscalesActivos] = await Promise.all([
    prisma.escuela.findMany({
      orderBy: [{ orden: "asc" }, { nombre: "asc" }],
      include: {
        mesas: {
          select: {
            id: true,
            numero: true,
            electores: true,
            estado: true,
            votantes: true,
            verificada: true,
            fiscalId: true,
            fiscal: { select: { nombre: true, telefono: true, ultimoIngreso: true } },
            foto: { select: { id: true } },
            _count: { select: { incidencias: { where: { resuelta: false } } } },
          },
        },
        generales: { where: { activo: true }, select: { id: true, nombre: true, telefono: true, ultimoIngreso: true } },
      },
    }),
    prisma.cargo.findMany({ orderBy: [{ orden: "asc" }, { nombre: "asc" }] }),
    prisma.lista.findMany({ orderBy: [{ orden: "asc" }, { numero: "asc" }] }),
    prisma.votoMesa.groupBy({
      by: ["cargoId", "clave"],
      where: { mesa: { estado: "ESCRUTADA" } },
      _sum: { cantidad: true },
    }),
    prisma.participacion.findMany({ orderBy: { createdAt: "desc" }, select: { mesaId: true, cantidad: true, createdAt: true } }),
    prisma.incidencia.count({ where: { resuelta: false } }),
    prisma.fiscal.count({ where: { activo: true } }),
  ]);

  for (const e of escuelas) e.mesas.sort((a, b) => compararNumeroMesa(a.numero, b.numero));

  // Último reporte de participación de cada mesa
  const ultimaParticipacion = new Map<string, { cantidad: number; createdAt: Date }>();
  for (const p of participaciones) if (!ultimaParticipacion.has(p.mesaId)) ultimaParticipacion.set(p.mesaId, p);

  const mesas = escuelas.flatMap((e) => e.mesas);
  const totales = {
    mesas: mesas.length,
    conFiscal: mesas.filter((m) => m.fiscalId).length,
    // Una mesa sin fiscal propio igual está cubierta si su escuela tiene fiscal general
    cubiertas: escuelas.reduce((n, e) => n + (e.generales.length > 0 ? e.mesas.length : e.mesas.filter((m) => m.fiscalId).length), 0),
    abiertas: mesas.filter((m) => m.estado !== "SIN_ABRIR").length,
    escrutadas: mesas.filter((m) => m.estado === "ESCRUTADA").length,
    verificadas: mesas.filter((m) => m.verificada).length,
    conFoto: mesas.filter((m) => m.foto).length,
    electores: mesas.reduce((n, m) => n + (m.electores ?? 0), 0),
    electoresEscrutados: mesas.filter((m) => m.estado === "ESCRUTADA").reduce((n, m) => n + (m.electores ?? 0), 0),
    votantesEscrutados: mesas.filter((m) => m.estado === "ESCRUTADA").reduce((n, m) => n + (m.votantes ?? 0), 0),
    // Participación estimada: dato final si está escrutada, si no el último reporte
    votantesReportados: mesas.reduce(
      (n, m) => n + (m.estado === "ESCRUTADA" ? (m.votantes ?? 0) : (ultimaParticipacion.get(m.id)?.cantidad ?? 0)),
      0,
    ),
    electoresConReporte: mesas
      .filter((m) => m.estado === "ESCRUTADA" || ultimaParticipacion.has(m.id))
      .reduce((n, m) => n + (m.electores ?? 0), 0),
    incidenciasAbiertas,
    fiscalesActivos,
  };

  const suma = new Map(votos.map((v) => [`${v.cargoId}_${v.clave}`, v._sum.cantidad ?? 0]));
  const resultados: ResultadoCargo[] = cargos.map((c) => {
    const porLista = listas
      .map((l) => ({ id: l.id, numero: l.numero, nombre: l.nombre, propia: l.propia, color: l.color, votos: suma.get(`${c.id}_${l.id}`) ?? 0 }))
      .sort((a, b) => b.votos - a.votos);
    const especiales = CLAVES_ESPECIALES.map((e) => ({ clave: e.valor, etiqueta: e.etiqueta, votos: suma.get(`${c.id}_${e.valor}`) ?? 0 }));
    const afirmativos = porLista.reduce((n, l) => n + l.votos, 0);
    return {
      id: c.id,
      nombre: c.nombre,
      listas: porLista,
      especiales,
      afirmativos,
      emitidos: afirmativos + especiales.reduce((n, e) => n + e.votos, 0),
    };
  });

  return { escuelas, totales, resultados, ultimaParticipacion, hayEleccion: cargos.length > 0 && listas.length > 0 };
}
