import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "../../lib/prisma";
import { fechaCorta } from "../../lib/formato";
import { TituloPanel } from "../components/admin/Campos";
import Formulario from "../components/admin/Formulario";
import { cargarInicial } from "./acciones";

function Acceso({ href, titulo, valor, detalle }: { href: string; titulo: string; valor: string | number; detalle?: string }) {
  return (
    <Link href={href} className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-par-celeste hover:shadow-md">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{titulo}</p>
      <p className="mt-1 font-display text-4xl font-bold text-par-tinta">{valor}</p>
      {detalle && <p className="mt-1 text-sm text-slate-500">{detalle}</p>}
      <p className="mt-3 text-sm font-bold text-par-celeste-oscuro group-hover:underline">Gestionar →</p>
    </Link>
  );
}

type Props = { searchParams: Promise<{ inicial?: string }> };

async function Resumen({ searchParams }: Props) {
  const { inicial } = await searchParams;
  const [noticias, ultimaNoticia, candidatos, propuestas, hitos, voluntarios, sinContactar, quierenFiscal, mesas, fiscales, mesasConFiscal, indicadores] =
    await Promise.all([
      prisma.noticia.count(),
      prisma.noticia.findFirst({ orderBy: { createdAt: "desc" }, select: { createdAt: true } }),
      prisma.candidato.count({ where: { activo: true } }),
      prisma.propuesta.count({ where: { activo: true } }),
      prisma.hito.groupBy({ by: ["estado"], _count: true }),
      prisma.voluntario.count(),
      prisma.voluntario.count({ where: { contactado: false } }),
      prisma.voluntario.count({ where: { quiereFiscal: true } }),
      prisma.mesa.count(),
      prisma.fiscal.count({ where: { activo: true } }),
      prisma.mesa.count({ where: { fiscalId: { not: null } } }),
      prisma.indicador.count(),
    ]);
  const faltaContenido = noticias === 0 || propuestas === 0 || hitos.length === 0 || indicadores === 0;
  const hechos = hitos.find((h) => h.estado === "HECHO")?._count ?? 0;
  const totalHitos = hitos.reduce((n, h) => n + h._count, 0);

  return (
    <div className="space-y-8">
      {inicial && (
        <p role="status" className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 font-semibold text-emerald-800">
          ✓ Contenido inicial cargado. Revisalo en Construcción, Propuestas y Noticias y editalo a gusto.
        </p>
      )}
      {faltaContenido && (
        <section className="rounded-2xl border-2 border-dashed border-par-celeste bg-white p-6">
          <h2 className="font-display text-2xl font-bold uppercase text-par-tinta">¿Arrancamos con un borrador?</h2>
          <p className="mb-4 mt-1 max-w-2xl text-slate-600">
            Carga una hoja de ruta (con la recuperación de la UB 238 y el lanzamiento en el Camping Municipal), los números del
            armado, seis propuestas de base y la noticia del lanzamiento. Solo completa lo que esté vacío y después se edita todo.
          </p>
          <Formulario accion={cargarInicial} textoBoton="Cargar contenido inicial" textoEnviando="Cargando…">
            {null}
          </Formulario>
        </section>
      )}
      <section>
        <h2 className="mb-3 font-display text-xl font-bold uppercase tracking-wider text-slate-500">Sitio público</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <Acceso href="/admin/noticias" titulo="Noticias" valor={noticias} detalle={ultimaNoticia ? `Última: ${fechaCorta(ultimaNoticia.createdAt)}` : "Ninguna todavía"} />
          <Acceso href="/admin/candidatos" titulo="Candidatos visibles" valor={candidatos} />
          <Acceso href="/admin/propuestas" titulo="Propuestas visibles" valor={propuestas} />
          <Acceso href="/admin/construccion" titulo="Hoja de ruta" valor={`${hechos}/${totalHitos}`} detalle="pasos logrados" />
          <Acceso href="/admin/voluntarios" titulo="Voluntarios" valor={voluntarios} detalle={`${sinContactar} sin contactar · ${quierenFiscal} quieren fiscalizar`} />
        </div>
      </section>
      <section>
        <h2 className="mb-3 font-display text-xl font-bold uppercase tracking-wider text-slate-500">Fiscalización</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <Acceso href="/admin/fiscalizacion" titulo="Tablero en vivo" valor={mesas ? `${mesasConFiscal}/${mesas}` : "—"} detalle="mesas con fiscal propio" />
          <Acceso href="/admin/fiscalizacion/fiscales" titulo="Fiscales activos" valor={fiscales} />
          <Acceso href="/admin/fiscalizacion/mesas" titulo="Mesas" valor={mesas} />
        </div>
      </section>
      <section className="rounded-2xl bg-par-tinta p-6 text-white">
        <h2 className="titular text-3xl text-par-amarillo">Antes de la elección</h2>
        <ol className="mt-3 list-decimal space-y-1 pl-5 text-white/85">
          <li>Cargá las escuelas y mesas (podés pegarlas desde una planilla).</li>
          <li>Cargá las listas que compiten y los cargos que se votan.</li>
          <li>Creá los fiscales: cada uno recibe una clave de 6 números. Asignales su mesa.</li>
          <li>Hacé una prueba con un fiscal real y después borrá el escrutinio de prueba.</li>
        </ol>
      </section>
    </div>
  );
}

export default function AdminInicio({ searchParams }: Props) {
  return (
    <>
      <TituloPanel titulo="Panel de control" bajada="PAR Los Charrúas: contenido del sitio y sistema de fiscalización." />
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-slate-200" />}>
        <Resumen searchParams={searchParams} />
      </Suspense>
    </>
  );
}
