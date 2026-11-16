// Contenido inicial de ejemplo para arrancar el sitio (hoja de ruta, números, propuestas y una noticia).
// Lo usan el botón "Cargar contenido inicial" del panel y el script `npm run sembrar`.
// Solo carga cada tipo de dato si esa tabla está vacía: nunca pisa ni duplica lo que ya existe.
import type { PrismaClient } from "@prisma/client";

const fecha = (s: string) => new Date(`${s}T12:00:00-03:00`);

export async function cargarContenidoInicial(prisma: PrismaClient): Promise<string[]> {
  const cargados: string[] = [];
  async function siVacia(nombre: string, cantidad: Promise<number>, cargar: () => Promise<unknown>) {
    if ((await cantidad) > 0) return;
    await cargar();
    cargados.push(nombre);
  }

  await siVacia("Indicadores", prisma.indicador.count(), () =>
    prisma.indicador.createMany({
      data: [
        { etiqueta: "Vecinos sumados", valor: 0, meta: 300, orden: 1 },
        { etiqueta: "Barrios recorridos", valor: 0, meta: 12, orden: 2 },
        { etiqueta: "Reuniones con vecinos", valor: 0, orden: 3 },
        { etiqueta: "Fiscales confirmados", valor: 0, orden: 4 },
      ],
    }),
  );

  await siVacia("Hoja de ruta", prisma.hito.count(), () =>
    prisma.hito.createMany({
      data: [
        { titulo: "Nace el PAR en Entre Ríos", estado: "HECHO", fecha: fecha("2025-03-15"), orden: 1, descripcion: "El Peronismo Amplio Renovador se presenta en la provincia con la juventud y el territorio como banderas." },
        { titulo: "Recuperamos la sede de la Unidad Básica 238", estado: "HECHO", orden: 2, descripcion: "La saneamos y cancelamos años de deudas históricas: nuestra primera prueba de gestión." },
        { titulo: "Lanzamiento oficial en el Camping Municipal", estado: "HECHO", orden: 3, descripcion: "El PAR Los Charrúas se presenta públicamente con la conducción de José Scheifler." },
        { titulo: "Recorrida barrio por barrio", estado: "EN_CURSO", orden: 4, descripcion: "Escuchamos a familias, comerciantes, productores e instituciones para armar las propuestas desde abajo." },
        { titulo: "Presentación de propuestas", estado: "PROXIMO", orden: 5 },
        { titulo: "Presentación de candidatos", estado: "PROXIMO", orden: 6 },
        { titulo: "Capacitación de fiscales", estado: "PROXIMO", orden: 7 },
        { titulo: "Elecciones", estado: "PROXIMO", orden: 8, descripcion: "Cuidamos cada voto, mesa por mesa." },
      ],
    }),
  );

  await siVacia("Propuestas", prisma.propuesta.count(), () =>
    prisma.propuesta.createMany({
      data: [
        {
          eje: "TRABAJO",
          orden: 1,
          titulo: "Trabajo local para que nadie tenga que irse",
          resumen: "Respaldar a las familias rurales, los comerciantes y los productores que sostienen al pueblo, para que el trabajo y la plata queden acá.",
          detalle: "Oficina municipal de empleo y capacitación en oficios\nCompras del municipio a proveedores locales\nFeria permanente de productores y emprendedores\nAcompañamiento para acceder a créditos y programas provinciales",
        },
        {
          eje: "JUVENTUD",
          orden: 2,
          titulo: "Que los jóvenes no tengan que irse",
          resumen: "El desarraigo de la juventud es nuestro mayor desafío. Oportunidades de estudio, trabajo y participación para que los pibes y las pibas elijan quedarse.",
          detalle: "Consejo de la Juventud con voz en las decisiones del municipio\nBecas y transporte para estudiar\nPrimer empleo en articulación con comercios y productores",
        },
        {
          eje: "SALUD",
          orden: 3,
          titulo: "Salud cerca de cada vecino",
          resumen: "Más horas de atención, especialistas que vengan al pueblo y traslados garantizados cuando hacen falta.",
          detalle: "Ampliación de horarios de atención primaria\nOperativos periódicos de especialistas\nSistema de turnos sin filas",
        },
        {
          eje: "OBRAS",
          orden: 4,
          titulo: "Obras que se terminan",
          resumen: "Calles, alumbrado, agua y desagües: un plan de obras público, con plazos y avances a la vista de todos.",
          detalle: "Plan de mejorado y mantenimiento de calles por barrio\nAlumbrado LED en todo el pueblo\nTablero público de avance de obras",
        },
        {
          eje: "DEPORTE",
          orden: 5,
          titulo: "Deporte y cultura para todos",
          resumen: "Clubes fuertes y actividades culturales todo el año, como espacios de encuentro y contención.",
          detalle: "Apoyo a clubes e instituciones\nEscuelas deportivas municipales gratuitas\nAgenda cultural anual",
        },
        {
          eje: "TRANSPARENCIA",
          orden: 6,
          titulo: "Cuentas claras",
          resumen: "Un municipio abierto: que cada vecino pueda ver en qué se gasta cada peso.",
          detalle: "Presupuesto y gastos publicados en internet\nAudiencias públicas por barrio\nRespuesta a reclamos con seguimiento",
        },
      ],
    }),
  );

  await siVacia("Noticias", prisma.noticia.count(), () =>
    prisma.noticia.create({
      data: {
        titulo: "Lanzamos el PAR en Los Charrúas",
        categoria: "CONSTRUCCION",
        contenido:
          "Con un acto en el Camping Municipal, el Peronismo Amplio Renovador presentó oficialmente su armado en Los Charrúas, bajo la conducción de José Scheifler, referente local y militante de la Unidad Básica 238.\n\nEl espacio se propone como una alternativa de renovación generacional dentro del justicialismo, enfocada en la organización comunitaria y la presencia directa en los barrios.\n\nComo carta de presentación, el equipo destacó la recuperación de la sede partidaria, que fue saneada y liberada de años de deudas históricas.\n\n(Revisá y completá esta nota desde el panel: fecha del acto, fotos y detalles.)",
      },
    }),
  );

  return cargados;
}
