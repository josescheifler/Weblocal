// Carga contenido inicial de ejemplo en una base vacía.
//
//   npm run sembrar                      → contenido del sitio (construcción, propuestas, candidatos de muestra, una noticia)
//   npm run sembrar -- --fiscalizacion   → además, escuelas, mesas, listas y un fiscal DE PRUEBA
//
// Todo lo que carga se puede editar o borrar desde el panel (/admin). Solo carga cada tipo de
// dato si esa tabla está vacía, así que se puede correr más de una vez sin duplicar nada.
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashearClave } from "../lib/auth.ts";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const conFiscalizacion = process.argv.includes("--fiscalizacion");

async function siVacia(nombre: string, cantidad: Promise<number>, cargar: () => Promise<unknown>) {
  if ((await cantidad) > 0) {
    console.log(`· ${nombre}: ya tiene datos, no se toca`);
    return;
  }
  await cargar();
  console.log(`✓ ${nombre}: cargado`);
}

const fecha = (s: string) => new Date(`${s}T12:00:00-03:00`);

async function main() {
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

  await siVacia("Candidatos", prisma.candidato.count(), () =>
    prisma.candidato.createMany({
      data: [
        { nombre: "Nombre a confirmar", cargo: "Presidente Municipal", orden: 1, cita: "Reemplazá esta ficha desde el panel con los datos reales.", bio: "Ficha de ejemplo. Cargá la foto, la frase y la trayectoria desde /admin/candidatos." },
        { nombre: "Nombre a confirmar", cargo: "Concejal", orden: 1 },
        { nombre: "Nombre a confirmar", cargo: "Concejal", orden: 2 },
        { nombre: "Nombre a confirmar", cargo: "Concejal", orden: 3 },
        { nombre: "Nombre a confirmar", cargo: "Concejal", orden: 4 },
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

  if (conFiscalizacion) {
    console.log("\nCargando datos DE PRUEBA de fiscalización…");
    await siVacia("Cargos", prisma.cargo.count(), () =>
      prisma.cargo.createMany({ data: [{ nombre: "Presidente Municipal", orden: 1 }, { nombre: "Concejales", orden: 2 }] }),
    );
    await siVacia("Listas", prisma.lista.count(), () =>
      prisma.lista.createMany({
        data: [
          { numero: "1", nombre: "PAR (prueba)", propia: true, color: "#35b4e5", orden: 1 },
          { numero: "2", nombre: "Lista B (prueba)", color: "#64748b", orden: 2 },
          { numero: "3", nombre: "Lista C (prueba)", color: "#a855f7", orden: 3 },
        ],
      }),
    );
    await siVacia("Escuelas y mesas", prisma.escuela.count(), async () => {
      const e1 = await prisma.escuela.create({ data: { nombre: "Escuela de prueba 1", direccion: "Dirección a confirmar", orden: 1 } });
      const e2 = await prisma.escuela.create({ data: { nombre: "Escuela de prueba 2", direccion: "Dirección a confirmar", orden: 2 } });
      await prisma.mesa.createMany({
        data: [
          { numero: "901", escuelaId: e1.id, electores: 340 },
          { numero: "902", escuelaId: e1.id, electores: 338 },
          { numero: "903", escuelaId: e1.id, electores: 342 },
          { numero: "904", escuelaId: e2.id, electores: 336 },
          { numero: "905", escuelaId: e2.id, electores: 330 },
        ],
      });
    });
    await siVacia("Fiscales", prisma.fiscal.count(), async () => {
      const { hash, salt } = await hashearClave("123456");
      const fiscal = await prisma.fiscal.create({
        data: { nombre: "Fiscal de prueba", dni: "11111111", rol: "MESA", claveHash: hash, claveSalt: salt },
      });
      await prisma.mesa.updateMany({ where: { numero: { in: ["901", "902"] } }, data: { fiscalId: fiscal.id } });
      console.log("  Fiscal de prueba → DNI 11111111, clave 123456 (borralo antes de la elección)");
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
