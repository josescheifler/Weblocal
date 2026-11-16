import type { EstadoFormulario } from "../../../lib/formularios";
import type { datosEscrutinio } from "../../../lib/escrutinio";
import { CLAVES_ESPECIALES, GRAVEDADES, TIPOS_INCIDENCIA, datosEstadoMesa, datosGravedad, etiquetaIncidencia } from "../../../lib/fiscalizacion";
import { hora } from "../../../lib/formato";
import Formulario from "../admin/Formulario";
import { AreaTexto, Selector } from "../admin/Campos";
import FormularioEscrutinio from "./FormularioEscrutinio";

type Accion = (previo: EstadoFormulario, form: FormData) => Promise<EstadoFormulario>;
type Datos = NonNullable<Awaited<ReturnType<typeof datosEscrutinio>>>;

function Bloque({ numero, titulo, children, ayuda }: { numero: number; titulo: string; ayuda?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 md:p-7">
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-par-amarillo font-display text-xl font-bold text-par-tinta">
          {numero}
        </span>
        <div>
          <h2 className="titular text-3xl text-par-tinta">{titulo}</h2>
          {ayuda && <p className="mt-1 text-sm text-slate-600">{ayuda}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

/** Todo lo que se hace sobre una mesa: estado, participación, escrutinio e incidencias. */
export default function PanelMesa({
  datos,
  acciones,
  bloquearEscrutinio = false,
  avisoBloqueo,
}: {
  datos: Datos;
  acciones: { estado: Accion; participacion: Accion; escrutinio: Accion; incidencia: Accion };
  bloquearEscrutinio?: boolean;
  avisoBloqueo?: string;
}) {
  const { mesa, cargos, listas, votos } = datos;
  const estadoMesa = datosEstadoMesa(mesa.estado);
  const escrutada = mesa.estado === "ESCRUTADA";

  return (
    <div className="space-y-5">
      <Bloque numero={1} titulo="Estado de la mesa" ayuda="Avisá cuando la mesa abre y cuando cierra.">
        <p className="mb-4">
          Estado actual:{" "}
          <span className={`rounded-full px-3 py-1 text-sm font-bold ${estadoMesa.color}`}>{estadoMesa.etiqueta}</span>
        </p>
        {!escrutada && (
          <div className="grid gap-3 sm:grid-cols-2">
            <Formulario accion={acciones.estado} textoBoton="✔ Abrió la mesa" textoEnviando="Enviando…">
              <input type="hidden" name="estado" value="ABIERTA" />
            </Formulario>
            <Formulario accion={acciones.estado} textoBoton="■ Cerró la mesa" textoEnviando="Enviando…">
              <input type="hidden" name="estado" value="CERRADA" />
            </Formulario>
          </div>
        )}
      </Bloque>

      {!escrutada && (
        <Bloque numero={2} titulo="¿Cuántos votaron?" ayuda="Informá cada tanto (por ejemplo a las 10, 12, 14 y 16 h) cuántas personas votaron hasta ahora.">
          <Formulario accion={acciones.participacion} textoBoton="Informar" limpiar>
            <input
              name="cantidad"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={5}
              required
              placeholder="Cantidad de votantes hasta ahora"
              aria-label="Cantidad de votantes hasta ahora"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-center font-display text-3xl font-bold outline-none focus:border-par-celeste"
            />
          </Formulario>
          {mesa.participaciones.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2 text-sm">
              {mesa.participaciones.map((p) => (
                <li key={p.id} className="rounded-full bg-slate-100 px-3 py-1">
                  <strong>{p.cantidad}</strong> a las {hora(p.createdAt)}
                </li>
              ))}
            </ul>
          )}
        </Bloque>
      )}

      <Bloque
        numero={escrutada ? 2 : 3}
        titulo="Escrutinio"
        ayuda="Cuando termine el conteo, copiá los números del acta exactamente como figuran y sacale una foto."
      >
        {avisoBloqueo && <p className="mb-4 rounded-xl bg-emerald-50 p-3 font-semibold text-emerald-800 ring-1 ring-emerald-200">{avisoBloqueo}</p>}
        {cargos.length === 0 || listas.length === 0 ? (
          <p className="rounded-xl bg-amber-50 p-4 font-semibold text-amber-800">
            El comando central todavía no cargó las listas y los cargos de la elección.
          </p>
        ) : (
          <FormularioEscrutinio
            accion={acciones.escrutinio}
            cargos={cargos}
            listas={listas}
            especiales={CLAVES_ESPECIALES}
            votosIniciales={votos}
            votantesIniciales={mesa.votantes}
            electores={mesa.electores}
            observaciones={mesa.observaciones}
            fotoUrl={datos.tieneFoto ? `/actas/${mesa.id}?v=${mesa.updatedAt.getTime()}` : null}
            bloqueado={bloquearEscrutinio}
          />
        )}
      </Bloque>

      <Bloque numero={escrutada ? 3 : 4} titulo="Reportar un problema" ayuda="Cualquier irregularidad: avisá acá y, si es urgente, llamá también a tu coordinador.">
        <Formulario accion={acciones.incidencia} textoBoton="Enviar reporte" limpiar>
          <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
            <Selector etiqueta="¿Qué pasó?" nombre="tipo" opciones={TIPOS_INCIDENCIA} />
            <Selector etiqueta="Gravedad" nombre="gravedad" defaultValue="MEDIA" opciones={GRAVEDADES} />
          </div>
          <AreaTexto etiqueta="Contá brevemente" nombre="descripcion" rows={3} maxLength={2000} />
        </Formulario>
        {mesa.incidencias.length > 0 && (
          <ul className="mt-5 space-y-2">
            {mesa.incidencias.map((i) => (
              <li key={i.id} className="rounded-xl bg-slate-50 p-3 text-sm">
                <span className={`mr-2 rounded-full px-2 py-0.5 text-xs font-bold ${datosGravedad(i.gravedad).color}`}>
                  {datosGravedad(i.gravedad).etiqueta}
                </span>
                <strong>{etiquetaIncidencia(i.tipo)}</strong> · {hora(i.createdAt)}
                {i.resuelta && <span className="ml-2 font-bold text-emerald-700">✓ Resuelta</span>}
                <p className="mt-1 text-slate-600">{i.descripcion}</p>
              </li>
            ))}
          </ul>
        )}
      </Bloque>
    </div>
  );
}
