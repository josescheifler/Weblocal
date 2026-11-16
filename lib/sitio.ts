// Datos generales del sitio. Todo el texto institucional que no se carga desde el panel vive acá,
// para poder corregirlo en un solo lugar.

export const SITIO = {
  localidad: "Los Charrúas",
  departamento: "Concordia",
  provincia: "Entre Ríos",
  espacio: "PAR",
  espacioCompleto: "Peronismo Amplio Renovador",
  lema: "Nace una esperanza",
  // Bajada del inicio
  bajada:
    "Un equipo de vecinos y vecinas que se organiza para transformar Los Charrúas con trabajo, territorio y la fuerza de la juventud.",
  // Enlace a la web provincial del PAR
  webProvincial: "https://parentrerios.netlify.app",
  // Contacto (dejar vacío lo que no se use)
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP || "", // solo números, con código de país. Ej: 5493454000000
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM || "", // enlace completo
  facebook: process.env.NEXT_PUBLIC_FACEBOOK || "", // enlace completo
} as const;

export const URL_SITIO = (process.env.NEXT_PUBLIC_SITE_URL || "https://parloscharruas.netlify.app").replace(/\/$/, "");

/** Valores del PAR que se repiten en el sitio */
export const PILARES = [
  {
    titulo: "Juventud",
    texto: "Los pibes y las pibas de Los Charrúas no son el futuro: son el presente. Queremos que se queden y crezcan acá.",
  },
  {
    titulo: "Territorio",
    texto: "Caminamos cada barrio y cada calle. Las respuestas salen de escuchar a los vecinos, no de un escritorio.",
  },
  {
    titulo: "Trabajo",
    texto: "Producción, comercio y empleo local. Un pueblo con trabajo es un pueblo con oportunidades.",
  },
  {
    titulo: "Gestión",
    texto: "Transparencia, cuentas claras y obras que se terminan. Gestión eficiente con empatía.",
  },
] as const;

/** Secciones del menú principal (las usan el menú y el pie) */
export const SECCIONES = [
  { href: "/", texto: "Inicio" },
  { href: "/construccion", texto: "Construcción" },
  { href: "/noticias", texto: "Noticias" },
  { href: "/candidatos", texto: "Candidatos" },
  { href: "/propuestas", texto: "Propuestas" },
  { href: "/fiscalizacion", texto: "Fiscalización" },
] as const;
