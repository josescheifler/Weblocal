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
    "Familias rurales, comerciantes, productores y jóvenes que nos organizamos para poner primero a Los Charrúas: menos política de escritorio, más presencia en cada barrio.",
  // Enlace a la web provincial del PAR
  webProvincial: "https://parentrerios.netlify.app",
  // Ficha de Los Charrúas en la web provincial
  fichaProvincial: "https://parentrerios.netlify.app/localidades/cmvpry1io0000owur4or7zu64",
  // Contacto (dejar vacío lo que no se use)
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP || "", // solo números, con código de país. Ej: 5493454000000
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM || "", // enlace completo
  facebook: process.env.NEXT_PUBLIC_FACEBOOK || "", // enlace completo
} as const;

export const URL_SITIO = (process.env.NEXT_PUBLIC_SITE_URL || "https://parloscharruas.netlify.app").replace(/\/$/, "");

/** Conducción local (datos tomados de la ficha de Los Charrúas en la web provincial) */
export const REFERENTE = {
  nombre: "José Scheifler",
  rol: "Referente local · Unidad Básica 238",
  foto: "https://res.cloudinary.com/cyj3xo7a/image/upload/v1793050439/i8xjlfbh6rmvkp8vdj8u.jpg",
  cita: "Nace una esperanza no significa quedarnos esperando a que las cosas cambien solas o lleguen tiempos mejores. Es hacer exactamente lo que hicieron nuestros viejos y abuelos: lavarnos la cara, darnos aliento, salir bien temprano de casa y ponernos el trabajo al hombro. Así se levantó este pueblo y de esa misma manera vamos a poner primero a Los Charrúas.",
} as const;

export const FOTO_GRUPAL = "https://res.cloudinary.com/cyj3xo7a/image/upload/v1793050430/acqs6g9yw7qlimujjg1k.jpg";

/** "Así construimos en Los Charrúas" */
export const HISTORIA = [
  "Los Charrúas es una localidad entrerriana cuyo dinamismo social y económico radica en el esfuerzo diario de las familias rurales, los comerciantes y los productores locales. La comunidad se apoya en una red activa de instituciones intermedias y comunitarias, pero enfrenta continuamente el desafío del desarraigo de su juventud, que muchas veces debe buscar alternativas de desarrollo fuera del pueblo.",
  "En este escenario, el PAR se organiza en el territorio con la conducción de José Scheifler, referente local y militante de la Unidad Básica 238. Buscamos ser una alternativa de renovación generacional dentro del justicialismo: lejos de la política de escritorio, cerca de la organización comunitaria y presentes en cada barrio. El lanzamiento oficial fue en el Camping Municipal, y ahí empezó nuestra actividad pública.",
  "Nuestra mejor credencial es la gestión: recuperamos la sede partidaria, la saneamos y cancelamos años de deudas históricas. Lo hicimos con orden y trabajo, y así queremos gestionar para todo el pueblo.",
] as const;

/** Valores del PAR que se repiten en el sitio */
export const PILARES = [
  {
    titulo: "Juventud",
    texto: "Que los pibes y las pibas no tengan que irse a buscar su futuro afuera. Queremos que se queden y crezcan acá.",
  },
  {
    titulo: "Territorio",
    texto: "Lejos de la política de escritorio: presencia en cada barrio y organización comunitaria junto a las instituciones.",
  },
  {
    titulo: "Trabajo",
    texto: "Familias rurales, comerciantes y productores: el esfuerzo diario que mueve al pueblo merece respaldo.",
  },
  {
    titulo: "Gestión",
    texto: "Recuperamos y saneamos nuestra sede y cancelamos deudas históricas. Así vamos a gestionar: con orden y cuentas claras.",
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
