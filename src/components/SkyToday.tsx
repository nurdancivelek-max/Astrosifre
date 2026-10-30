import { useEffect, useMemo, useState } from "react";
import { ChartWheel } from "@/components/ChartWheel";
import { PlaceSearch } from "@/components/PlaceSearch";
import { computeChart, formatDeg, moonVoidOfCourse, PLANETS, signOf, type Chart } from "@/lib/astro";
import { formatInZone, type Place } from "@/lib/geo";
import { ASPECT_TONE, aspectAdvice, aspectRemainingDays, aspectSentence, aspectStrength, formatDuration, PLANET_THEME } from "@/lib/sky-text";

const ISTANBUL: Place = { name: "İstanbul", latitude: 41.0082, longitude: 28.9784, timezone: "Europe/Istanbul" };
const nameOf = (k: string) => PLANETS.find((p) => p.key === k)!;

export function SkyToday() {
  const [now, setNow] = useState<Date | null>(null);
  const [place, setPlace] = useState<Place>(ISTANBUL);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 5 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const chart = useMemo<Chart | null>(() => (now ? computeChart(now, place.latitude, place.longitude) : null), [now, place]);
  const voc = useMemo(() => (now ? moonVoidOfCourse(now) : null), [now]);

  if (!chart || !now || !voc) {
    return <div className="flex h-[520px] items-center justify-center rounded-xl border border-border bg-card/50 text-muted-foreground">Gökyüzü hesaplanıyor…</div>;
  }

  const sun = chart.planets.find((p) => p.key === "Sun")!;
  const moon = chart.planets.find((p) => p.key === "Moon")!;
  const spd = (k: string) => chart.planets.find((p) => p.key === k)?.speed ?? 0;
  const retros = chart.planets.filter((p) => p.retro);
  const asc = signOf(chart.angles.asc);
  const top = chart.aspects.filter((a) => a.applying)[0] ?? chart.aspects[0];
  const harmonious = chart.aspects.filter((a) => ASPECT_TONE[a.type.name].kind === "uyumlu").length;
  const tense = chart.aspects.filter((a) => ASPECT_TONE[a.type.name].kind === "zorlayıcı").length;
  const mood = harmonious > tense ? "akıcı ve destekleyici" : tense > harmonious ? "hareketli ve zorlayıcı" : "dengeli";

  return (
    <section className="py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-primary">Bugünün Gökyüzü</p>
          <h1 className="mt-2 font-display text-3xl font-bold sm:text-5xl">
            Şu an <span className="text-gold">gökyüzünde</span> neler var?
          </h1>
          <p className="mt-2 text-muted-foreground">{new Intl.DateTimeFormat("tr-TR", { timeZone: place.timezone, weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(now)} · {formatInZone(now, place.timezone)} · {place.name}</p>
        </div>
        <div className="w-full sm:w-72">
          <PlaceSearch value={place} onChange={setPlace} />
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-primary/40 bg-card/70 p-5 shadow-glow">
        <p className="text-lg leading-relaxed">
          Güneş <b className="text-gold">{signOf(sun.lon).name}</b>, Ay <b className="text-gold">{signOf(moon.lon).name}</b> burcunda.
          Gökyüzünde {harmonious} uyumlu, {tense} zorlayıcı açı var; günün genel tonu <b>{mood}</b>.
          {top && <> Öne çıkan açı: <b>{nameOf(top.a).name} {top.type.name.toLowerCase()} {nameOf(top.b).name}</b> — {aspectSentence(top)}</>}
        </p>
        {top && <Advice text={aspectAdvice(top)} duration={formatDuration(aspectRemainingDays(top, spd(top.a), spd(top.b)), now, place.timezone)} />}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="flex justify-center rounded-xl border border-border bg-card/50 p-4">
          <div className="w-full max-w-[460px] [&_svg]:h-auto [&_svg]:w-full">
            <ChartWheel chart={chart} size={460} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Ay" value={formatDeg(moon.lon)} sub={voc.voc ? "Boşlukta (VOC)" : `Son açısına doğru`} />
            <Stat label="Yükselen" value={`${asc.glyph} ${asc.name}`} sub={place.name} />
            <Stat label="Ay burç değiştirir" value={`~${voc.signChangeHours} saat`} sub="sonra" />
            <Stat label="Retro" value={retros.length ? retros.map((r) => r.glyph).join(" ") : "Yok"} sub={retros.map((r) => r.name).join(", ") || "Tüm gezegenler direkt"} />
          </div>

          <div className="rounded-xl border border-border bg-card/50 p-4">
            <h2 className="font-display text-lg font-semibold">Gezegen Konumları</h2>
            <ul className="mt-3 grid grid-cols-1 gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
              {chart.planets.map((p) => (
                <li key={p.key} className="flex justify-between border-b border-border/40 py-1">
                  <span><span className="text-primary">{p.glyph}</span> {p.name}</span>
                  <span className="text-muted-foreground">{formatDeg(p.lon)}{p.retro && <span className="ml-1 text-destructive">℞</span>}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-border bg-card/50 p-5">
        <h2 className="font-display text-2xl font-semibold">Gökyüzündeki Tüm Açılar <span className="text-base text-muted-foreground">({chart.aspects.length})</span></h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {chart.aspects.map((a, i) => {
            const tone = ASPECT_TONE[a.type.name];
            const color = tone.kind === "uyumlu" ? "border-primary/50" : tone.kind === "zorlayıcı" ? "border-destructive/60" : "border-border";
            return (
              <div key={i} className={`rounded-lg border-l-4 ${color} bg-background/40 p-3`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold">
                    {nameOf(a.a).glyph} {nameOf(a.a).name} <span className="text-primary">{a.type.glyph} {a.type.name}</span> {nameOf(a.b).glyph} {nameOf(a.b).name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {a.orb.toFixed(1)}° · {aspectStrength(a.orb)} · {a.applying ? "Yaklaşan" : "Uzaklaşan"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{aspectSentence(a)}</p>
                <Advice text={aspectAdvice(a)} duration={formatDuration(aspectRemainingDays(a, spd(a.a), spd(a.b)), now, place.timezone)} />
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Temalar: {Object.entries(PLANET_THEME).slice(0, 5).map(([k, v]) => `${nameOf(k).name} = ${v}`).join(" · ")}…
        </p>
      </div>
    </section>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl border border-border bg-card/50 p-3">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-lg font-semibold text-gold">{value}</p>
      <p className="text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}

function Advice({ text, duration }: { text: string; duration: string }) {
  return (
    <div className="mt-2 rounded-md bg-advice px-3 py-2 text-sm text-advice-foreground">
      <p><b>Günün enerjisi:</b> {text}</p>
      <p className="mt-0.5 text-xs opacity-80">⏳ {duration}</p>
    </div>
  );
}
