import type { CldUploadWidgetResults } from "next-cloudinary";

/** Devuelve la URL segura de una imagen subida con el widget de Cloudinary, o "" si no vino. */
export function urlSubida(resultado: CldUploadWidgetResults): string {
  return typeof resultado.info === "object" && resultado.info ? resultado.info.secure_url : "";
}

/** Arma un mensaje de error legible a partir de la respuesta de la API. */
export async function mensajeDeError(res: Response, porDefecto: string): Promise<string> {
  if (res.status === 401) return "Tu sesión venció. Volvé a iniciar sesión.";
  try {
    const datos = await res.json();
    if (datos?.error) return `${porDefecto} (${datos.error})`;
  } catch {
    // la respuesta no era JSON
  }
  return porDefecto;
}
