import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "../../../lib/prisma";
import { resumenTablero } from "../../../lib/escrutinio";
import { datosEstadoMesa, datosGravedad, etiquetaIncidencia } from "../../../lib/fiscalizacion";
import { hora, porcentaje } from "../../../lib/formato";
import AutoRefresco from "../../components/admin/AutoRefresco";
import { Tarjeta, TituloPanel, Vacio, claseBotonSecundario } from "../../components/admin/Campos";

function Kpi({ etiqueta, valor, detalle, alerta = false }: { etiqueta: string; valor: string; detalle?: string; alerta?: boolean }) {
  return (
    <div className={`rounded-2xl p-5 ring-1 ${alerta ? "bg-red-50 ring-red-200" : "bg-white ring-slate-200"}`}>
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{etiqueta}</p>
      <p className={`mt-1 font-display text-4xl font-bold ${alerta ? "text-red-700" : "text-par-tinta"}`}>{valor}</p>
      {detalle && <p className="mt-1 text-sm text-slate-500">{detalle}</p>}
    </div>
  );
}

async function Tablero() {
  const [{ escuelas, totales: t, resultados, ultimaParticipacion, hayEleccion }, incidencias] = await Promise.all([
    resumenTablero(),
    prisma.incidencia.findMany({
      where: { resuelta: false },
      orderBy: [{ createdAt: "desc" }],
      take: 6,
      include: { mesa: { select: { id: true, numero: true } }, fiscal: { select: { nombre: true } } },
    }),
  ]);

  if (t.mesas === 0) {
    return (
      <Vacio>
        Todavía no hay mesas cargadas. Empezá por{" "}
        <Link href="/admin/fiscalizacion/mesas" className="font-bold text-par-celeste-oscuro underline">
          cargar escuelas y mesas
        </Link>{" "}
        y después{" "}
        <Link href="/admin/fiscalizacion/eleccion" className="font-bold text-par-celeste-oscuro underline">
          las listas y cargos
        </Link>
        .
      </Vacio>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi etiqueta="Mesas cubiertas" valor={`${t.cubiertas}/${t.mesas}`} detalle={`${t.conFiscal} con fiscal propio · ${t.fiscalesActivos} fiscales`} alerta={t.cubiertas < t.mesas} />
        <Kpi etiqueta="Mesas abiertas" valor={`${t.abiertas}/${t.mesas}`} detalle={porcentaje(t.abiertas, t.mesas, 0)} />
        <Kpi
          etiqueta="Participación"
          valor={t.electoresConReporte ? porcentaje(t.votantesReportados, t.electoresConReporte) : "—"}
          detalle={`${t.votantesReportados.toLocaleString("es-AR")} votantes en mesas con reporte`}
        />
        <Kpi etiqueta="Escrutadas" valor={`${t.escrutadas}/${t.mesas}`} detalle={`${t.verificadas} verificadas · ${t.conFoto} con foto`} />
      </div>
      {t.incidenciasAbiertas > 0 && (
        <Link
          href="/admin/fiscalizacion/incidencias"
          className="flex items-center justify-between rounded-2xl bg-red-600 px-5 py-4 font-bold text-white shadow-lg hover:bg-red-700"
        >
          <span>⚠ {t.incidenciasAbiertas} incidencia(s) sin resolver</span>
          <span>Ver →</span>
        </Link>
      )}

      {/* Resultados */}
      {hayEleccion ? (
        <div className="grid gap-6 xl:grid-cols-2">
          {resultados.map((r) => (
            <Tarjeta key={r.id} titulo={r.nombre}>
              <p className="mb-4 text-sm text-slate-500">
                {t.escrutadas} de {t.mesas} mesas ({porcentaje(t.escrutadas, t.mesas, 0)}) · {r.emitidos.toLocaleString("es-AR")} votos emitidos ·
                porcentajes sobre votos afirmativos
              </p>
              <ul className="space-y-3">
                {r.listas.map((l) => (
                  <li key={l.id}>
                    <div className="mb-1 flex items-baseline justify-between gap-3">
                      <span className={`font-semibold ${l.propia ? "text-par-tinta" : "text-slate-700"}`}>
                        {l.propia && "★ "}
                        {l.numero} · {l.nombre}
                      </span>
                      <span className="shrink-0 font-display text-xl font-bold">
                        {porcentaje(l.votos, r.afirmativos)}{" "}
                        <span className="text-sm font-normal text-slate-500">({l.votos.toLocaleString("es-AR")})</span>
                      </span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: r.afirmativos ? `${(l.votos / r.afirmativos) * 100}%` : "0%",
                          background: l.color ?? (l.propia ? "var(--color-par-celeste)" : "#94a3b8"),
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
              <dl className="mt-5 grid grid-cols-2 gap-2 border-t border-slate-100 pt-4 text-sm sm:grid-cols-4">
                {r.especiales.map((e) => (
                  <div key={e.clave} className="rounded-lg bg-slate-50 p-2">
                    <dt className="text-xs text-slate-500">{e.etiqueta}</dt>
                    <dd className="font-bold">{e.votos.toLocaleString("es-AR")}</dd>
                  </div>
                ))}
              </dl>
            </Tarjeta>
          ))}
        </div>
      ) : (
        <Vacio>
          Para ver resultados, cargá{" "}
          <Link href="/admin/fiscalizacion/eleccion" className="font-bold text-par-celeste-oscuro underline">
            las listas y los cargos
          </Link>
          .
        </Vacio>
      )}

      {/* Mesas por escuela */}
      <Tarjeta titulo="Mesa por mesa">
        <div className="mb-4 flex flex-wrap gap-2 text-xs">
          {["SIN_ABRIR", "ABIERTA", "CERRADA", "ESCRUTADA"].map((e) => (
            <span key={e} className={`rounded-full px-2.5 py-1 font-bold ${datosEstadoMesa(e).color}`}>
              {datosEstadoMesa(e).etiqueta}
            </span>
          ))}
          <span className="rounded-full px-2.5 py-1 font-bold ring-2 ring-red-400">Sin fiscal</span>
        </div>
        <div className="space-y-6">
          {escuelas.map((e) => (
            <div key={e.id}>
              <p className="mb-2 font-bold">
                {e.nombre}
                <span className="font-normal text-slate-500">
                  {" "}
                  · Fiscal general: {e.generales.length ? e.generales.map((g) => g.nombre).join(", ") : "sin asignar"}
                </span>
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
                {e.mesas.map((m) => {
                  const estado = datosEstadoMesa(m.estado);
                  const part = ultimaParticipacion.get(m.id);
                  const sinCobertura = !m.fiscalId && e.generales.length === 0;
                  return (
                    <Link
                      key={m.id}
                      href={`/admin/fiscalizacion/mesas/${m.id}`}
                      className={`rounded-xl p-3 text-sm transition hover:scale-[1.02] ${estado.color} ${sinCobertura ? "ring-2 ring-red-400" : ""}`}
                    >
                      <span className="flex items-center justify-between">
                        <span className="font-display text-xl font-bold">{m.numero}</span>
                        <span className="text-xs">
                          {m.verificada && "✓"}
                          {m._count.incidencias > 0 && " ⚠"}
                          {m.estado === "ESCRUTADA" && !m.foto && " 📷?"}
                        </span>
                      </span>
                      <span className="block truncate text-xs opacity-80">{m.fiscal?.nombre ?? "Sin fiscal"}</span>
                      <span className="block text-xs font-semibold">
                        {m.estado === "ESCRUTADA"
                          ? `${m.votantes ?? "?"} votaron`
                          : part
                            ? `${part.cantidad}${m.electores ? `/${m.electores}` : ""} · ${hora(part.createdAt)}`
                            : estado.etiqueta}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Tarjeta>

      {incidencias.length > 0 && (
        <Tarjeta
          titulo="Últimas incidencias"
          acciones={
            <Link href="/admin/fiscalizacion/incidencias" className="text-sm font-bold text-par-celeste-oscuro">
              Ver todas →
            </Link>
          }
        >
          <ul className="space-y-2">
            {incidencias.map((i) => (
              <li key={i.id} className="rounded-xl bg-slate-50 p-3 text-sm">
                <span className={`mr-2 rounded-full px-2 py-0.5 text-xs font-bold ${datosGravedad(i.gravedad).color}`}>{datosGravedad(i.gravedad).etiqueta}</span>
                <strong>{etiquetaIncidencia(i.tipo)}</strong>
                {i.mesa && <> · Mesa {i.mesa.numero}</>} · {hora(i.createdAt)}
                {i.fiscal && <span className="text-slate-500"> · {i.fiscal.nombre}</span>}
                <p className="mt-1 text-slate-600">{i.descripcion}</p>
              </li>
            ))}
          </ul>
        </Tarjeta>
      )}
    </div>
  );
}

export default function TableroFiscalizacion() {
  return (
    <>
      <TituloPanel titulo="Tablero en vivo" bajada="Cobertura de mesas, participación y resultados a medida que los fiscales cargan los datos.">
        <AutoRefresco segundos={30} />
        <a href="/admin/fiscalizacion/csv" className={claseBotonSecundario}>
          Descargar resultados
        </a>
      </TituloPanel>
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-slate-200" />}>
        <Tablero />
      </Suspense>
    </>
  );
}
