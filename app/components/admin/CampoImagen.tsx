"use client";

import { useState } from "react";
import { CldUploadWidget } from "next-cloudinary";
import { useMontado } from "../../../lib/useMontado";
import { urlSubida } from "../../../lib/cliente";
import { claseCampo } from "./Campos";

const NUBE = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "par_uploads";

/** Imagen por enlace, con botón para subirla a Cloudinary si está configurado. */
export default function CampoImagen({
  nombre,
  etiqueta,
  valorInicial = "",
  ayuda,
}: {
  nombre: string;
  etiqueta: string;
  valorInicial?: string | null;
  ayuda?: string;
}) {
  const [url, setUrl] = useState(valorInicial ?? "");
  const montado = useMontado();

  return (
    <div>
      <span className="mb-1.5 block text-sm font-bold text-slate-700">
        {etiqueta} <span className="font-normal text-slate-500">(opcional)</span>
      </span>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="h-28 w-28 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
          {url ? (
            <img src={url} alt="Vista previa" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full items-center justify-center text-xs text-slate-400">Sin imagen</span>
          )}
        </div>
        <div className="flex-1 space-y-2">
          <input
            name={nombre}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://…"
            className={claseCampo}
            inputMode="url"
          />
          <div className="flex flex-wrap gap-2">
            {montado && NUBE && (
              <CldUploadWidget
                uploadPreset={PRESET}
                options={{ multiple: false, sources: ["local", "camera", "url"], language: "es" }}
                onSuccess={(resultado) => {
                  const subida = urlSubida(resultado);
                  if (subida) setUrl(subida);
                }}
              >
                {({ open }) => (
                  <button
                    type="button"
                    onClick={() => open()}
                    className="rounded-lg bg-par-celeste-oscuro px-4 py-2 text-sm font-bold text-white hover:bg-par-tinta"
                  >
                    Subir foto
                  </button>
                )}
              </CldUploadWidget>
            )}
            {url && (
              <button type="button" onClick={() => setUrl("")} className="rounded-lg px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">
                Quitar
              </button>
            )}
          </div>
          {ayuda && <p className="text-xs text-slate-500">{ayuda}</p>}
          {!NUBE && <p className="text-xs text-slate-500">Pegá el enlace de la imagen (configurá Cloudinary para subir fotos desde acá).</p>}
        </div>
      </div>
    </div>
  );
}
