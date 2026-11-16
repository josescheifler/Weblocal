// Carga contenido inicial de ejemplo en una base vacía.
//
//   npm run sembrar                      → contenido del sitio (hoja de ruta, números, propuestas y una noticia)
//   npm run sembrar -- --fiscalizacion   → además, escuelas, mesas, listas y un fiscal DE PRUEBA
//
// Todo lo que carga se puede editar o borrar desde el panel (/admin). Solo carga cada tipo de
// dato si esa tabla está vacía, así que se puede correr más de una vez sin duplicar nada.
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashearClave } from "../lib/auth.ts";
import { cargarContenidoInicial } from "../lib/contenidoInicial.ts";

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

async function main() {
  const cargados = await cargarContenidoInicial(prisma);
  console.log(cargados.length ? `✓ Contenido cargado: ${cargados.join(", ")}` : "· El contenido ya existía, no se tocó nada");

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
