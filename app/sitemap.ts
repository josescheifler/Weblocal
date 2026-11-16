import type { MetadataRoute } from "next";
import { connection } from "next/server";
import { prisma } from "../lib/prisma";
import { URL_SITIO } from "../lib/sitio";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection(); // se arma en cada pedido, con los datos actuales
  const noticias = await prisma.noticia.findMany({ select: { id: true, updatedAt: true } });
  return [
    { url: `${URL_SITIO}/`, changeFrequency: "daily", priority: 1 },
    { url: `${URL_SITIO}/construccion`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${URL_SITIO}/noticias`, changeFrequency: "daily", priority: 0.9 },
    { url: `${URL_SITIO}/candidatos`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${URL_SITIO}/propuestas`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${URL_SITIO}/fiscalizacion`, changeFrequency: "monthly", priority: 0.6 },
    ...noticias.map((n) => ({ url: `${URL_SITIO}/noticias/${n.id}`, lastModified: n.updatedAt, priority: 0.7 })),
  ];
}
