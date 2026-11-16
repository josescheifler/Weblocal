// Se corre en cada build (por ejemplo en Vercel): crea o actualiza las tablas de la base
// aplicando las migraciones de prisma/migrations. Nunca borra datos.
import { execSync } from "node:child_process";

if (!process.env.DATABASE_URL) {
  console.warn("⚠ DATABASE_URL no está configurada: se saltea la migración de la base.");
  process.exit(0);
}
execSync("npx prisma migrate deploy", { stdio: "inherit" });
