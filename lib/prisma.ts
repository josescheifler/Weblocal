import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

function crearCliente() {
  // Si hay una conexión "pooled" (recomendada en Vercel), la usamos para el sitio; si no, la común
  const url = process.env.DATABASE_POOLED_URL || process.env.DATABASE_URL;
  if (!url) {
    console.error("Falta la variable de entorno DATABASE_URL: no se va a poder conectar a la base de datos");
  }
  // Pocas conexiones por instancia: en Vercel corren varias instancias a la vez y las bases gratuitas aceptan pocas
  const adapter = new PrismaPg({ connectionString: url, max: Number(process.env.DATABASE_POOL_MAX) || 3 });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Reutiliza el mismo cliente (y pool) entre pedidos y recargas
export const prisma = globalForPrisma.prisma ?? crearCliente();
globalForPrisma.prisma = prisma;
