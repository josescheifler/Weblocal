/** Sol de rayos (inspirado en el del logo), decorativo. */
export default function Sol({ className = "", rayos = 32 }: { className?: string; rayos?: number }) {
  const lista = Array.from({ length: rayos }, (_, i) => {
    const angulo = (360 / rayos) * i;
    const largo = i % 2 === 0 ? 46 : 34;
    return (
      <path
        key={i}
        d={`M -2.2 -${100 - largo} L 0 -100 L 2.2 -${100 - largo} Z`}
        transform={`rotate(${angulo})`}
      />
    );
  });

  return (
    <svg viewBox="-100 -100 200 200" aria-hidden="true" className={className} fill="currentColor">
      <circle r="44" />
      {lista}
    </svg>
  );
}
