import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

function crearCliente() {
  if (!process.env.DATABASE_URL) {
    console.error("Falta la variable de entorno DATABASE_URL: no se va a poder conectar a la base de datos");
  }
  // El adaptador crea su propio pool de conexiones
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Reutiliza el mismo cliente (y pool) entre recargas en desarrollo
export const prisma = globalForPrisma.prisma ?? crearCliente();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
