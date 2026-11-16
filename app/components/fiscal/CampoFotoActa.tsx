"use client";

import { useRef, useState } from "react";

const NUBE = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "par_uploads";
const LADO_MAX = 1800;

/** Achica la foto en el celular antes de enviarla (las de las cámaras pesan varios MB) */
async function comprimir(archivo: File): Promise<string> {
  const bitmap = await createImageBitmap(archivo);
  const escala = Math.min(1, LADO_MAX / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * escala);
  canvas.height = Math.round(bitmap.height * escala);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.72);
}

async function subirACloudinary(dataUrl: string): Promise<string | null> {
  if (!NUBE) return null;
  try {
    const datos = new FormData();
    datos.append("file", dataUrl);
    datos.append("upload_preset", PRESET);
    datos.append("folder", "actas");
    const res = await fetch(`https://api.cloudinary.com/v1_1/${NUBE}/image/upload`, { method: "POST", body: datos });
    if (!res.ok) return null;
    const json = await res.json();
    return typeof json.secure_url === "string" ? json.secure_url : null;
  } catch {
    return null;
  }
}

/** Foto del acta: se saca con la cámara, se comprime y se manda en el campo oculto "foto". */
export default function CampoFotoActa({ urlActual }: { urlActual?: string | null }) {
  const [valor, setValor] = useState("");
  const [vista, setVista] = useState<string | null>(urlActual ?? null);
  const [estado, setEstado] = useState<"" | "procesando" | "error">("");
  const entrada = useRef<HTMLInputElement>(null);

  async function alElegir(archivo: File | undefined) {
    if (!archivo) return;
    setEstado("procesando");
    try {
      const comprimida = await comprimir(archivo);
      setVista(comprimida);
      // Si hay Cloudinary, guardamos ahí; si no (o falla), la mandamos comprimida con el formulario
      setValor((await subirACloudinary(comprimida)) ?? comprimida);
      setEstado("");
    } catch {
      setEstado("error");
    }
  }

  return (
    <div className="rounded-2xl border-2 border-dashed border-par-tinta/20 bg-white p-4">
      <input type="hidden" name="foto" value={valor} />
      <input
        ref={entrada}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => alElegir(e.target.files?.[0])}
      />
      <div className="flex items-center gap-4">
        <div className="h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100">
          {vista ? (
            <img src={vista} alt="Foto del acta" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full items-center justify-center text-3xl" aria-hidden="true">📄</span>
          )}
        </div>
        <div className="flex-1">
          <p className="font-bold">Foto del acta firmada</p>
          <p className="text-sm text-slate-600">
            {estado === "procesando"
              ? "Preparando la foto…"
              : estado === "error"
                ? "No se pudo leer la foto. Probá de nuevo."
                : valor
                  ? "Foto lista. Se guarda al tocar “Guardar escrutinio”."
                  : vista
                    ? "Ya hay una foto cargada. Podés reemplazarla."
                    : "Sacala con buena luz, que se lean todos los números."}
          </p>
          <button
            type="button"
            onClick={() => entrada.current?.click()}
            disabled={estado === "procesando"}
            className="mt-2 rounded-xl bg-par-celeste-oscuro px-4 py-2.5 font-bold text-white disabled:opacity-60"
          >
            {vista ? "Sacar otra foto" : "Sacar foto"}
          </button>
        </div>
      </div>
    </div>
  );
}
