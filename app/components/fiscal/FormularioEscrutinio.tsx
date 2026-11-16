"use client";

import { startTransition, useActionState, useMemo, useState } from "react";
import type { EstadoFormulario } from "../../../lib/formularios";
import { controlarCargo } from "../../../lib/fiscalizacion";
import CampoFotoActa from "./CampoFotoActa";

type Props = {
  accion: (previo: EstadoFormulario, form: FormData) => Promise<EstadoFormulario>;
  cargos: { id: string; nombre: string }[];
  listas: { id: string; numero: string; nombre: string; propia: boolean; color: string | null }[];
  especiales: readonly { valor: string; etiqueta: string }[];
  votosIniciales: Record<string, number>;
  votantesIniciales: number | null;
  electores: number | null;
  observaciones: string | null;
  fotoUrl: string | null;
  bloqueado?: boolean;
};

const COLOR_CONTROL = {
  ok: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  aviso: "bg-amber-50 text-amber-800 ring-amber-200",
  error: "bg-red-50 text-red-700 ring-red-200",
} as const;

/** Carga del escrutinio de una mesa, con sumas y controles en vivo para evitar errores de tipeo. */
export default function FormularioEscrutinio(props: Props) {
  const { cargos, listas, especiales, electores, bloqueado } = props;
  const [estado, ejecutar, enviando] = useActionState(props.accion, null);
  const [valores, setValores] = useState<Record<string, string>>(() =>
    Object.fromEntries(Object.entries(props.votosIniciales).map(([k, v]) => [k, String(v)])),
  );
  const [votantes, setVotantes] = useState(props.votantesIniciales?.toString() ?? "");

  const numVotantes = votantes === "" ? null : Number(votantes);
  const sumas = useMemo(() => {
    const claves = [...listas.map((l) => l.id), ...especiales.map((e) => e.valor)];
    return Object.fromEntries(
      cargos.map((c) => [c.id, claves.reduce((n, k) => n + (Number(valores[`${c.id}_${k}`]) || 0), 0)]),
    );
  }, [valores, cargos, listas, especiales]);

  const hayDiferencias = cargos.some((c) => controlarCargo(sumas[c.id], numVotantes, electores).nivel !== "ok");

  const campoNumero = (nombre: string, etiqueta: string, destacado = false) => (
    <label key={nombre} className={`flex items-center justify-between gap-3 rounded-xl px-3 py-2 ${destacado ? "bg-par-amarillo/25" : "bg-slate-50"}`}>
      <span className="min-w-0 text-sm font-semibold leading-tight">{etiqueta}</span>
      <input
        name={`v_${nombre}`}
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={5}
        value={valores[nombre] ?? ""}
        onChange={(e) => setValores((v) => ({ ...v, [nombre]: e.target.value.replace(/\D/g, "") }))}
        disabled={bloqueado}
        placeholder="0"
        className="w-24 shrink-0 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-right font-display text-2xl font-bold outline-none focus:border-par-celeste focus:ring-2 focus:ring-par-celeste/30"
        aria-label={etiqueta}
      />
    </label>
  );

  return (
    <form
      action={ejecutar}
      onSubmit={(e) => {
        e.preventDefault();
        const datos = new FormData(e.currentTarget);
        startTransition(() => ejecutar(datos));
      }}
      className="space-y-6"
    >
      <label className="block rounded-2xl bg-par-tinta p-4 text-white">
        <span className="block font-display text-lg font-bold uppercase tracking-wider">¿Cuántas personas votaron?</span>
        <span className="block text-sm text-white/65">
          Dato del acta (sobres / votantes){electores ? ` · la mesa tiene ${electores} electores` : ""}
        </span>
        <input
          name="votantes"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={5}
          value={votantes}
          onChange={(e) => setVotantes(e.target.value.replace(/\D/g, ""))}
          disabled={bloqueado}
          required
          className="mt-3 w-full rounded-xl bg-white px-4 py-3 text-center font-display text-4xl font-bold text-par-tinta outline-none"
        />
      </label>

      {cargos.map((c) => {
        const control = controlarCargo(sumas[c.id], numVotantes, electores);
        return (
          <fieldset key={c.id} className="rounded-2xl border border-slate-200 bg-white p-4">
            <legend className="px-2 font-display text-2xl font-bold uppercase text-par-tinta">{c.nombre}</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {listas.map((l) => campoNumero(`${c.id}_${l.id}`, `${l.numero} · ${l.nombre}`, l.propia))}
            </div>
            <div className="mt-3 grid gap-2 border-t border-slate-100 pt-3 sm:grid-cols-2">
              {especiales.map((e) => campoNumero(`${c.id}_${e.valor}`, e.etiqueta))}
            </div>
            <p className={`mt-3 rounded-xl px-3 py-2 text-sm font-semibold ring-1 ${COLOR_CONTROL[control.nivel]}`}>
              Suma: {sumas[c.id]} {numVotantes !== null && `de ${numVotantes}`} — {control.mensaje}
            </p>
          </fieldset>
        );
      })}

      <CampoFotoActa urlActual={props.fotoUrl} />

      <label className="block">
        <span className="mb-1.5 block text-sm font-bold text-slate-700">Observaciones (opcional)</span>
        <textarea
          name="observaciones"
          rows={3}
          maxLength={2000}
          defaultValue={props.observaciones ?? ""}
          disabled={bloqueado}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-par-celeste"
          placeholder="Algo que el comando tenga que saber sobre esta mesa"
        />
      </label>

      {hayDiferencias && !bloqueado && (
        <label className="flex items-start gap-3 rounded-xl bg-amber-50 p-4 ring-1 ring-amber-200">
          <input type="checkbox" name="confirmarDiferencias" className="mt-1 h-5 w-5 accent-amber-600" />
          <span className="text-sm">
            <strong className="block">El acta tiene estas diferencias</strong>
            Tildalo solo si revisaste y los números son exactamente los del acta.
          </span>
        </label>
      )}

      {estado?.error && (
        <p role="alert" className="rounded-xl bg-red-50 p-4 font-semibold text-red-700 ring-1 ring-red-200">
          {estado.error}
        </p>
      )}
      {estado?.ok && (
        <p role="status" className="rounded-xl bg-emerald-50 p-4 font-semibold text-emerald-800 ring-1 ring-emerald-200">
          {estado.ok}
        </p>
      )}

      {!bloqueado && (
        <button
          type="submit"
          disabled={enviando}
          className="w-full rounded-2xl bg-par-amarillo px-6 py-5 font-display text-2xl font-bold uppercase tracking-wider text-par-tinta shadow-lg transition active:scale-[0.99] disabled:opacity-60"
        >
          {enviando ? "Guardando…" : "Guardar escrutinio"}
        </button>
      )}
    </form>
  );
}
