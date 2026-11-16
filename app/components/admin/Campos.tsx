// Campos de formulario del panel. Sin estado: sirven en componentes de servidor y de cliente.

export const claseCampo =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 outline-none transition focus:border-par-celeste focus:ring-2 focus:ring-par-celeste/30";
const claseEtiqueta = "mb-1.5 block text-sm font-bold text-slate-700";

type Base = { etiqueta: string; nombre: string; ayuda?: string; opcional?: boolean; className?: string };

function Etiqueta({ etiqueta, opcional }: { etiqueta: string; opcional?: boolean }) {
  return (
    <span className={claseEtiqueta}>
      {etiqueta} {opcional && <span className="font-normal text-slate-500">(opcional)</span>}
    </span>
  );
}

function Ayuda({ texto }: { texto?: string }) {
  return texto ? <span className="mt-1.5 block text-xs text-slate-500">{texto}</span> : null;
}

export function Campo({
  etiqueta,
  nombre,
  ayuda,
  opcional,
  className = "",
  ...resto
}: Base & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={`block ${className}`}>
      <Etiqueta etiqueta={etiqueta} opcional={opcional} />
      <input name={nombre} className={claseCampo} required={!opcional && resto.type !== "checkbox"} {...resto} />
      <Ayuda texto={ayuda} />
    </label>
  );
}

export function AreaTexto({
  etiqueta,
  nombre,
  ayuda,
  opcional,
  className = "",
  ...resto
}: Base & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className={`block ${className}`}>
      <Etiqueta etiqueta={etiqueta} opcional={opcional} />
      <textarea name={nombre} className={`${claseCampo} leading-relaxed`} required={!opcional} rows={5} {...resto} />
      <Ayuda texto={ayuda} />
    </label>
  );
}

export function Selector({
  etiqueta,
  nombre,
  ayuda,
  opcional,
  className = "",
  opciones,
  ...resto
}: Base & React.SelectHTMLAttributes<HTMLSelectElement> & { opciones: readonly { valor: string; etiqueta: string }[] }) {
  return (
    <label className={`block ${className}`}>
      <Etiqueta etiqueta={etiqueta} opcional={opcional} />
      <select name={nombre} className={claseCampo} {...resto}>
        {opciones.map((o) => (
          <option key={o.valor} value={o.valor}>
            {o.etiqueta}
          </option>
        ))}
      </select>
      <Ayuda texto={ayuda} />
    </label>
  );
}

export function Casilla({
  etiqueta,
  nombre,
  ayuda,
  defaultChecked,
}: {
  etiqueta: string;
  nombre: string;
  ayuda?: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <input type="checkbox" name={nombre} defaultChecked={defaultChecked} className="mt-0.5 h-5 w-5 accent-par-celeste-oscuro" />
      <span>
        <span className="block font-bold text-slate-800">{etiqueta}</span>
        <Ayuda texto={ayuda} />
      </span>
    </label>
  );
}

export function Tarjeta({ titulo, children, acciones }: { titulo?: string; children: React.ReactNode; acciones?: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
      {(titulo || acciones) && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          {titulo && <h2 className="font-display text-2xl font-bold uppercase tracking-wide text-par-tinta">{titulo}</h2>}
          {acciones}
        </div>
      )}
      {children}
    </section>
  );
}

export function TituloPanel({ titulo, bajada, children }: { titulo: string; bajada?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="titular text-4xl text-par-tinta md:text-5xl">{titulo}</h1>
        {bajada && <p className="mt-2 max-w-2xl text-slate-600">{bajada}</p>}
      </div>
      {children && <div className="flex flex-wrap gap-3">{children}</div>}
    </div>
  );
}

export function Vacio({ children }: { children: React.ReactNode }) {
  return <p className="rounded-xl border-2 border-dashed border-slate-200 p-8 text-center text-slate-500">{children}</p>;
}

export const claseBotonPrimario =
  "inline-flex items-center gap-2 rounded-xl bg-par-amarillo px-5 py-3 font-display text-lg font-bold uppercase tracking-wider text-par-tinta shadow-sm transition hover:bg-par-tinta hover:text-par-amarillo";
export const claseBotonSecundario =
  "inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 font-display text-lg font-bold uppercase tracking-wider text-slate-700 transition hover:border-par-tinta hover:text-par-tinta";
