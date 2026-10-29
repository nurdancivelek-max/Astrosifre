import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BirthForm, type BirthData } from "@/components/BirthForm";
import { angles, risingTimeline, signOf, SIGNS, SIGN_GLYPHS, formatDeg } from "@/lib/astro";
import { RISING_TEXT } from "@/lib/astro-text";
import { formatInZone, localToUtc } from "@/lib/geo";

export const Route = createFileRoute("/yukselen")({
  head: () => ({
    meta: [
      { title: "Yükseleni Bul — Astrosifre" },
      { name: "description", content: "Yükselen burcunuzu hesaplayın. Doğum saatinizi bilmiyorsanız gün içindeki tüm yükselen pencerelerini görün." },
      { property: "og:title", content: "Yükseleni Bul — Astrosifre" },
      { property: "og:description", content: "Saat bilinmese bile yükselen burç pencereleri." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RisingPage,
});

function RisingPage() {
  const [data, setData] = useState<BirthData | null>(null);
  const [hasTime, setHasTime] = useState(true);

  let result: { asc: number } | null = null;
  let timeline: ReturnType<typeof risingTimeline> = [];
  if (data) {
    const { latitude, longitude, timezone } = data.place;
    if (hasTime) result = { asc: angles(localToUtc(data.date, data.time, timezone), latitude, longitude).asc };
    timeline = risingTimeline(localToUtc(data.date, "00:00", timezone), latitude, longitude);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="font-display text-4xl font-bold">Yükseleni <span className="text-gold">Bul</span></h1>
      <p className="mt-2 text-muted-foreground">Doğum saatiniz belirsizse boş bırakın: o gün doğan tüm yükselenleri saat aralıklarıyla gösteririz.</p>
      <div className="mt-8 rounded-xl border border-border bg-card/70 p-6">
        <BirthForm timeOptional onSubmit={(d) => { setHasTime(Boolean((document.getElementById("bf-time") as HTMLInputElement)?.value)); setData(d); }} />
      </div>

      {data && result && (
        <section className="mt-10 rounded-xl border border-primary/40 bg-card p-8 text-center shadow-glow">
          <p className="text-sm uppercase tracking-widest text-muted-foreground">Yükseleniniz</p>
          <div className="mt-2 text-6xl text-primary">{signOf(result.asc).glyph}</div>
          <h2 className="mt-2 font-display text-3xl font-bold">{signOf(result.asc).name}</h2>
          <p className="text-sm text-muted-foreground">{formatDeg(result.asc)}</p>
          <p className="mx-auto mt-4 max-w-xl">{RISING_TEXT[signOf(result.asc).index]}</p>
          {signOf(result.asc).degree < 2 || signOf(result.asc).degree > 28 ? (
            <p className="mt-3 text-sm text-primary">Yükseleniniz burç sınırına çok yakın — birkaç dakikalık saat farkı burcu değiştirebilir. Aşağıdaki zaman çizelgesine bakın.</p>
          ) : null}
        </section>
      )}

      {data && (
        <section className="mt-10">
          <h2 className="font-display text-2xl font-semibold">O gün doğan yükselenler</h2>
          <p className="text-sm text-muted-foreground">{data.place.name} · yerel saat</p>
          <ul className="mt-4 grid gap-2">
            {timeline.map((w, i) => {
              const mins = Math.round((w.end.getTime() - w.start.getTime()) / 60000);
              return (
                <li key={i} className="flex items-center gap-4 rounded-lg border border-border bg-card/60 px-4 py-3">
                  <span className="w-8 text-2xl text-primary">{SIGN_GLYPHS[w.signIndex]}</span>
                  <span className="w-24 font-semibold">{SIGNS[w.signIndex]}</span>
                  <span className="font-mono text-sm">{formatInZone(w.start, data.place.timezone)} – {formatInZone(w.end, data.place.timezone)}</span>
                  <div className="ml-auto hidden h-2 flex-1 max-w-48 overflow-hidden rounded bg-muted sm:block">
                    <div className="h-full bg-gold" style={{ width: `${Math.min(100, (mins / 180) * 100)}%` }} />
                  </div>
                  <span className="w-16 text-right text-xs text-muted-foreground">{Math.floor(mins / 60)}s {mins % 60}dk</span>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
