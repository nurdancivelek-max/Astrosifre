import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlaceSearch } from "@/components/PlaceSearch";
import { ChartWheel } from "@/components/ChartWheel";
import { computeChart, formatDeg, PLANETS, type Chart } from "@/lib/astro";
import { judgeHorary, QUESTION_TYPES, type HoraryResult } from "@/lib/horary";
import type { Place } from "@/lib/geo";

export const Route = createFileRoute("/horary")({
  head: () => ({
    meta: [
      { title: "Horary Astroloji — Sorunuzun Haritası | Astrosifre" },
      { name: "description", content: "Sorunuzu sorduğunuz anın haritasını çıkarıp klasik horary kurallarıyla yorumlayın: uygulayan açılar, boşta Ay, uyarılar." },
      { property: "og:title", content: "Horary · Soru Astrolojisi — Astrosifre" },
      { property: "og:description", content: "Bir soru sorun, gökyüzü yanıtlasın." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HoraryPage,
});

const VERDICT = {
  olumlu: { title: "Evet'e yakın", cls: "text-chart-4" },
  olumsuz: { title: "Hayır'a yakın", cls: "text-destructive" },
  belirsiz: { title: "Belirsiz / şartlı", cls: "text-primary" },
};

function HoraryPage() {
  const [question, setQuestion] = useState("");
  const [type, setType] = useState<string>(QUESTION_TYPES[0].id);
  const [place, setPlace] = useState<Place | null>(null);
  const [res, setRes] = useState<{ chart: Chart; judge: HoraryResult; q: string } | null>(null);
  const [err, setErr] = useState("");

  const ask = () => {
    if (!question.trim() || !place) return setErr("Sorunuzu yazın ve bulunduğunuz şehri seçin.");
    setErr("");
    const chart = computeChart(new Date(), place.latitude, place.longitude);
    const house = QUESTION_TYPES.find((t) => t.id === type)!.house;
    setRes({ chart, judge: judgeHorary(chart, house), q: question });
  };
  const pn = (k: string) => PLANETS.find((p) => p.key === k)!;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="font-display text-4xl font-bold">Horary · <span className="text-gold">Soru Astrolojisi</span></h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">Horary'de doğum haritası gerekmez. Sorunun içtenlikle sorulduğu an ve yer, cevabın haritasıdır. Aynı soruyu tekrar tekrar sormayın.</p>
      <div className="mt-8 grid gap-4 rounded-xl border border-border bg-card/70 p-6">
        <div className="grid gap-1.5">
          <Label htmlFor="q">Sorunuz</Label>
          <Textarea id="q" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Örn. Başvurduğum işe kabul edilecek miyim?" />
        </div>
        <div className="grid gap-1.5">
          <Label>Konu</Label>
          <div className="flex flex-wrap gap-2">
            {QUESTION_TYPES.map((t) => (
              <button key={t.id} type="button" onClick={() => setType(t.id)}
                className={`rounded-full border px-3 py-1 text-sm ${type === t.id ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:text-foreground"}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-1.5">
          <Label>Şu an bulunduğunuz şehir</Label>
          <PlaceSearch value={place} onChange={setPlace} />
        </div>
        {err && <p className="text-sm text-destructive">{err}</p>}
        <Button onClick={ask} className="bg-gold text-primary-foreground shadow-glow">Soruyu şimdi sor</Button>
      </div>

      {res && (
        <section className="mt-10 grid gap-8 lg:grid-cols-2">
          <div className="flex justify-center rounded-xl border border-border bg-card/40 p-4"><ChartWheel chart={res.chart} /></div>
          <div className="grid content-start gap-4">
            <div className="rounded-xl border border-primary/40 bg-card p-6 shadow-glow">
              <p className="text-sm text-muted-foreground">“{res.q}”</p>
              <h2 className={`mt-2 font-display text-3xl font-bold ${VERDICT[res.judge.verdict].cls}`}>{VERDICT[res.judge.verdict].title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Siz: {pn(res.judge.querent).glyph} {pn(res.judge.querent).name} · Sorulan ({res.judge.quesitedHouse}. ev): {pn(res.judge.quesited).glyph} {pn(res.judge.quesited).name}
              </p>
              <p className="text-xs text-muted-foreground">Yükselen {formatDeg(res.chart.angles.asc)} · {res.chart.date.toLocaleString("tr-TR")}</p>
            </div>
            <div className="rounded-xl border border-border bg-card/70 p-5">
              <h3 className="font-semibold">Gerekçeler</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{res.judge.reasons.map((r, i) => <li key={i}>{r}</li>)}</ul>
            </div>
            {res.judge.cautions.length > 0 && (
              <div className="rounded-xl border border-destructive/40 bg-card/70 p-5">
                <h3 className="font-semibold">Uyarılar</h3>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{res.judge.cautions.map((r, i) => <li key={i}>{r}</li>)}</ul>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
