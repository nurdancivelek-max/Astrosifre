import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BirthForm, type BirthData } from "@/components/BirthForm";
import { computeChart, signOf } from "@/lib/astro";
import { localToUtc } from "@/lib/geo";
import { compatibilityScore, crossAspects, crossText } from "@/lib/synastry";
import { SoulmatePool } from "@/components/SoulmatePool";

export const Route = createFileRoute("/ruh-esim")({
  head: () => ({
    meta: [
      { title: "Ruh Eşim — Sinastri Uyum Analizi | Astrosifre" },
      { name: "description", content: "İki doğum haritasını karşılaştırın: uyum puanı, aşk, iletişim ve tutku açıları. Ücretsiz, kayıt gerekmez." },
      { property: "og:title", content: "Ruh Eşim — Sinastri Uyum Analizi" },
      { property: "og:description", content: "İki harita arasındaki uyumu ve açıları ücretsiz görün." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SoulmatePage,
});

function chartOf(d: BirthData) {
  return computeChart(localToUtc(d.date, d.time || "12:00", d.place.timezone), d.place.latitude, d.place.longitude);
}

function SoulmatePage() {
  const [a, setA] = useState<BirthData | null>(null);
  const [b, setB] = useState<BirthData | null>(null);
  const ready = a && b;
  const ca = a ? chartOf(a) : null, cb = b ? chartOf(b) : null;
  const aspects = ca && cb ? crossAspects(ca, cb) : [];
  const score = compatibilityScore(aspects);
  const sign = (c: typeof ca, k: string) => { const p = c?.planets.find((x) => x.key === k); return p ? signOf(p.lon).name : "—"; };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="font-display text-4xl font-bold">Ruh <span className="text-gold">Eşim</span></h1>
      <p className="mt-2 text-muted-foreground">İki kişinin doğum bilgilerini girin; haritalarınız arasındaki uyumu ve önemli açıları gösterelim.</p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {[{ label: "Siz", set: setA, v: a }, { label: "O", set: setB, v: b }].map((p) => (
          <div key={p.label} className="rounded-xl border border-border bg-card/70 p-6">
            <h2 className="mb-4 font-display text-xl font-semibold">{p.label} {p.v && <span className="text-sm text-primary">✓ {p.v.place.name}</span>}</h2>
            <BirthForm timeOptional submitLabel="Kaydet" onSubmit={p.set} />
          </div>
        ))}
      </div>

      {ready && ca && cb && (
        <>
          <section className="mt-10 rounded-xl border border-primary/40 bg-card p-8 text-center shadow-glow">
            <p className="text-sm uppercase tracking-widest text-muted-foreground">Uyum puanı</p>
            <div className="mt-2 font-display text-6xl font-bold text-gold">{score}<span className="text-2xl">/100</span></div>
            <p className="mt-3 text-sm text-muted-foreground">
              Güneş {sign(ca, "Sun")} · Ay {sign(ca, "Moon")} · Venüs {sign(ca, "Venus")} &nbsp;♡&nbsp; Güneş {sign(cb, "Sun")} · Ay {sign(cb, "Moon")} · Venüs {sign(cb, "Venus")}
            </p>
            {(!a!.time || !b!.time) && <p className="mt-2 text-xs text-muted-foreground">Doğum saati bilinmeyen kişide öğlen 12:00 kullanıldı; Ay konumu birkaç derece sapabilir.</p>}
          </section>
          <section className="mt-8">
            <h2 className="font-display text-2xl font-semibold">Haritalar arası açılar</h2>
            <ul className="mt-4 grid gap-2">
              {aspects.slice(0, 15).map((x, i) => (
                <li key={i} className="rounded-lg border border-border bg-card/60 px-4 py-3">
                  <div className="font-semibold">Sizin {x.aName} {x.type.glyph} {x.type.name} onun {x.bName} <span className="text-xs text-muted-foreground">· {x.orb.toFixed(1)}°</span></div>
                  <p className="text-sm text-muted-foreground">{crossText(x)}</p>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
