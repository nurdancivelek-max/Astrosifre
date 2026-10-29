import { SIGN_GLYPHS, norm, type Chart } from "@/lib/astro";

export function ChartWheel({ chart, size = 420 }: { chart: Chart; size?: number }) {
  const c = size / 2;
  const R = c - 6, rSign = R - 34, rHouse = rSign - 4, rPlanet = rSign - 30, rInner = 70;
  const asc = chart.angles.asc;
  // Ascendant on the left (9 o'clock), zodiac runs counter-clockwise.
  const pt = (lon: number, r: number) => {
    const a = ((180 + (lon - asc)) * Math.PI) / 180;
    return [c + r * Math.cos(a), c - r * Math.sin(a)] as const;
  };

  // spread overlapping planets
  const sorted = [...chart.planets].sort((a, b) => a.lon - b.lon);
  const placed: { p: (typeof sorted)[number]; disp: number }[] = [];
  for (const p of sorted) {
    let d = p.lon;
    const prev = placed[placed.length - 1];
    if (prev && norm(d - prev.disp) < 7) d = prev.disp + 7;
    placed.push({ p, disp: d });
  }

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="h-auto w-full max-w-[460px]" role="img" aria-label="Doğum haritası çarkı">
      <circle cx={c} cy={c} r={R} className="fill-card stroke-primary" strokeWidth={1.5} />
      <circle cx={c} cy={c} r={rSign} className="fill-none stroke-primary/60" />
      <circle cx={c} cy={c} r={rInner} className="fill-background stroke-primary/40" />
      {Array.from({ length: 12 }, (_, i) => {
        const [x1, y1] = pt(i * 30, rSign), [x2, y2] = pt(i * 30, R);
        const [gx, gy] = pt(i * 30 + 15, (R + rSign) / 2);
        return (
          <g key={i}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} className="stroke-primary/60" />
            <text x={gx} y={gy} textAnchor="middle" dominantBaseline="central" className="fill-primary text-[18px]">
              {SIGN_GLYPHS[i]}
            </text>
          </g>
        );
      })}
      {chart.cusps.map((cu, i) => {
        const [x1, y1] = pt(cu, rInner), [x2, y2] = pt(cu, rHouse);
        const [nx, ny] = pt(cu + norm(chart.cusps[(i + 1) % 12] - cu) / 2, rInner + 12);
        const angular = i % 3 === 0;
        return (
          <g key={i}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} className={angular ? "stroke-primary" : "stroke-muted-foreground/40"} strokeWidth={angular ? 1.5 : 1} />
            <text x={nx} y={ny} textAnchor="middle" dominantBaseline="central" className="fill-muted-foreground text-[10px]">{i + 1}</text>
          </g>
        );
      })}
      {chart.aspects.filter((a) => a.type.angle !== 0).map((a, i) => {
        const A = chart.planets.find((p) => p.key === a.a)!, B = chart.planets.find((p) => p.key === a.b)!;
        const [x1, y1] = pt(A.lon, rInner), [x2, y2] = pt(B.lon, rInner);
        const hard = a.type.angle === 90 || a.type.angle === 180;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} className={hard ? "stroke-destructive/60" : "stroke-chart-2/60"} />;
      })}
      {placed.map(({ p, disp }) => {
        const [x, y] = pt(disp, rPlanet);
        const [tx, ty] = pt(p.lon, rSign);
        const [tx2, ty2] = pt(p.lon, rSign - 8);
        return (
          <g key={p.key}>
            <line x1={tx} y1={ty} x2={tx2} y2={ty2} className="stroke-foreground" />
            <text x={x} y={y} textAnchor="middle" dominantBaseline="central" className="fill-foreground text-[17px]">
              <title>{p.name}</title>{p.glyph}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
