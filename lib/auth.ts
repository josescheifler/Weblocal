// Firma y verificación de tokens de sesión (panel de administración y fiscales).
// Usa solo Web Crypto para poder ejecutarse tanto en proxy.ts como en el servidor.

export const COOKIE_SESION = "admin_session";
export const COOKIE_FISCAL = "fiscal_session";
export const DURACION_SESION_SEG = 60 * 60 * 24; // 24 horas
export const DURACION_SESION_FISCAL_SEG = 60 * 60 * 36; // cubre toda la jornada electoral y el escrutinio

const encoder = new TextEncoder();

async function obtenerClave(): Promise<CryptoKey> {
  const secreto = process.env.SESSION_SECRET;
  if (!secreto || secreto.length < 32) {
    throw new Error("SESSION_SECRET no está configurado o tiene menos de 32 caracteres");
  }
  return crypto.subtle.importKey("raw", encoder.encode(secreto), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);
}

export function aHex(buffer: ArrayBuffer | Uint8Array): string {
  return Array.from(buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
}

export function desdeHex(hex: string): Uint8Array<ArrayBuffer> | null {
  if (!/^[0-9a-f]+$/.test(hex) || hex.length % 2 !== 0) return null;
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return bytes;
}

/** Firma "<datos>.<vencimiento>" y devuelve "<datos>.<vencimiento>.<firma>". Los datos no pueden tener puntos. */
async function firmar(datos: string, duracionSeg: number): Promise<string> {
  const cuerpo = `${datos}.${Date.now() + duracionSeg * 1000}`;
  const firma = await crypto.subtle.sign("HMAC", await obtenerClave(), encoder.encode(cuerpo));
  return `${cuerpo}.${aHex(firma)}`;
}

/** Devuelve las partes de datos si la firma es válida y no venció; si no, null. */
async function verificar(token: string | undefined): Promise<string[] | null> {
  if (!token) return null;
  const partes = token.split(".");
  if (partes.length < 3) return null;
  const firmaHex = partes.pop()!;
  const vencimiento = partes[partes.length - 1];
  if (!/^\d+$/.test(vencimiento) || Number(vencimiento) < Date.now()) return null;

  const firma = desdeHex(firmaHex);
  if (!firma) return null;
  try {
    const ok = await crypto.subtle.verify("HMAC", await obtenerClave(), firma, encoder.encode(partes.join(".")));
    return ok ? partes.slice(0, -1) : null;
  } catch (error) {
    console.error("No se pudo verificar la sesión:", error);
    return null;
  }
}

// ── Panel de administración ──────────────────────────────────

export async function crearTokenSesion(): Promise<string> {
  return firmar("admin", DURACION_SESION_SEG);
}

export async function tokenSesionValido(token: string | undefined): Promise<boolean> {
  const datos = await verificar(token);
  return datos?.[0] === "admin";
}

/** Compara la contraseña ingresada con ADMIN_PASSWORD en tiempo constante. */
export async function passwordCorrecta(ingresada: string): Promise<boolean> {
  const esperada = process.env.ADMIN_PASSWORD;
  if (!esperada) return false;
  const [a, b] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(ingresada)),
    crypto.subtle.digest("SHA-256", encoder.encode(esperada)),
  ]);
  return igualesEnTiempoConstante(new Uint8Array(a), new Uint8Array(b));
}

// ── Fiscales ─────────────────────────────────────────────────

export async function crearTokenFiscal(fiscalId: string, version: number): Promise<string> {
  return firmar(`fiscal.${fiscalId}.${version}`, DURACION_SESION_FISCAL_SEG);
}

/** Devuelve { fiscalId, version } si el token es válido (no consulta la base). */
export async function leerTokenFiscal(token: string | undefined): Promise<{ fiscalId: string; version: number } | null> {
  const datos = await verificar(token);
  if (!datos || datos.length !== 3 || datos[0] !== "fiscal") return null;
  const version = Number(datos[2]);
  if (!Number.isInteger(version)) return null;
  return { fiscalId: datos[1], version };
}

// ── Claves de fiscales (PBKDF2) ──────────────────────────────

const ITERACIONES = 120_000;

export async function hashearClave(clave: string, saltHex?: string): Promise<{ hash: string; salt: string }> {
  const salt = saltHex ? desdeHex(saltHex)! : crypto.getRandomValues(new Uint8Array(16));
  const material = await crypto.subtle.importKey("raw", encoder.encode(clave), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations: ITERACIONES },
    material,
    256,
  );
  return { hash: aHex(bits), salt: aHex(salt) };
}

export async function claveCorrecta(clave: string, hash: string, salt: string): Promise<boolean> {
  const calculado = await hashearClave(clave, salt);
  const a = desdeHex(calculado.hash);
  const b = desdeHex(hash);
  if (!a || !b) return false;
  return igualesEnTiempoConstante(a, b);
}

/** Clave numérica de 6 dígitos, fácil de dictar por teléfono. */
export function generarClave(): string {
  const n = crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000;
  return String(n).padStart(6, "0");
}

function igualesEnTiempoConstante(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diferencia = 0;
  for (let i = 0; i < a.length; i++) diferencia |= a[i] ^ b[i];
  return diferencia === 0;
}
