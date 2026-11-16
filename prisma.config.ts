// Configuración del CLI de Prisma 7 (se busca automáticamente como prisma.config.ts)
// Carga las variables de .env para los comandos de Prisma
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
