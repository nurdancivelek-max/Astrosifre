import { PLANETS, formatDeg, type Chart } from "@/lib/astro";
import { HOUSE_TOPICS } from "@/lib/astro-text";

const pname = (k: string) => PLANETS.find((p) => p.key === k)!;

export function ChartDetails({ chart }: { chart: Chart }) {
  return (
    <div className="grid gap-6">
      <div className="rounded-xl border border-border bg-card/70 p-5">
        <h3 className="font-display text-lg font-semibold">Gezegenler</h3>
        <table className="mt-3 w-full text-sm">
          <tbody>
            <tr className="border-b border-border"><td className="py-1.5 text-primary">AC</td><td>Yükselen</td><td>{formatDeg(chart.angles.asc)}</td><td /></tr>
            <tr className="border-b border-border"><td className="py-1.5 text-primary">MC</td><td>Tepe Noktası</td><td>{formatDeg(chart.angles.mc)}</td><td /></tr>
            {chart.planets.map((p) => (
              <tr key={p.key} className="border-b border-border last:border-0">
                <td className="py-1.5 text-lg text-primary">{p.glyph}</td>
                <td>{p.name}{p.retro && <span className="ml-1 text-xs text-destructive">R</span>}</td>
                <td>{formatDeg(p.lon)}</td>
                <td className="text-right text-muted-foreground">{p.house}. ev</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="rounded-xl border border-border bg-card/70 p-5">
        <h3 className="font-display text-lg font-semibold">Evler <span className="text-xs font-normal text-muted-foreground">({chart.houseSystem})</span></h3>
        <ul className="mt-3 grid gap-1 text-sm sm:grid-cols-2">
          {chart.cusps.map((c, i) => (
            <li key={i} className="flex justify-between gap-2"><span className="text-muted-foreground">{i + 1}. {HOUSE_TOPICS[i]}</span><span>{formatDeg(c)}</span></li>
          ))}
        </ul>
      </div>
      <div className="rounded-xl border border-border bg-card/70 p-5">
        <h3 className="font-display text-lg font-semibold">Açılar</h3>
        <ul className="mt-3 grid gap-1 text-sm sm:grid-cols-2">
          {chart.aspects.map((a, i) => (
            <li key={i}>
              {pname(a.a).glyph} {a.type.glyph} {pname(a.b).glyph} <span className="text-muted-foreground">{pname(a.a).name} {a.type.name} {pname(a.b).name} · {a.orb.toFixed(1)}°</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
