import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BirthForm, type BirthData } from "@/components/BirthForm";

export const Route = createFileRoute("/bizden-ne-olur")({
  head: () => ({
    meta: [
      { title: "Bizden Ne Olur? — Composite İlişki Haritası | Astrosifre" },
      { name: "description", content: "İki doğum haritasının orta noktalarından doğan ilişki haritası: Composite Güneş, Ay, Venüs ve Mars ile ilişkinin karakteri." },
      { property: "og:title", content: "Bizden Ne Olur? — Composite İlişki Haritası" },
      { property: "og:description", content: "İki haritanın tek bir ilişki haritasında birleşimi." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CompositePage,
});

function DemoBadge({ label = "DEMO · Örnek veri" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-primary/50 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-primary">
      ✦ {label}
    </span>
  );
}

const DEMO_PLANETS = [
  { glyph: "☉", title: "Composite Güneş", role: "İlişkinin amacı ve kimliği", sign: "Aslan" },
  { glyph: "☽", title: "Composite Ay", role: "Duygusal güven ve ortak kalp dili", sign: "Yengeç" },
  { glyph: "♀", title: "Composite Venüs", role: "Sevginin ifadesi, romantik çekim", sign: "Terazi" },
  { glyph: "♂", title: "Composite Mars", role: "Tutku, ortak eylem, kriz yönetimi", sign: "Akrep" },
];

const DEMO_THEMES = [
  { name: "Duygusal Bağ & Romantizm", v: 86 },
  { name: "Zihinsel Uyum & İletişim", v: 72 },
  { name: "Tutku & Çekim", v: 91 },
  { name: "Gelecek & Ortak Kararlar", v: 65 },
  { name: "Sürtüşme Riski", v: 28 },
];

const DEMO_WEEK = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

function CompositePage() {
  const [a, setA] = useState<BirthData | null>(null);
  const [b, setB] = useState<BirthData | null>(null);
  const [shown, setShown] = useState(false);
  const ready = !!a && !!b;
  const timeUnknown = (a && !a.time) || (b && !b.time);

  return (
    <div className="mx-auto max-w-5xl px-4 pb-28 pt-8 md:py-12">
      {/* Başlık */}
      <header className="text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">✦ KOD: VEGA</span>
        <h1 className="mt-3 font-display text-4xl font-bold md:text-5xl">
          Bizden <span className="text-gold">Ne Olur?</span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          İki haritanın orta noktalarından doğan tek bir ilişki haritası: ilişkinizin kendine ait karakteri.
        </p>
      </header>

      {/* Form */}
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {[
          { label: "1. Kişi · Sen", set: setA, v: a },
          { label: "2. Kişi · O", set: setB, v: b },
        ].map((p) => (
          <div key={p.label} className="rounded-2xl border border-primary/30 bg-card/80 p-5 shadow-sm">
            <h2 className="mb-4 font-display text-lg font-semibold">
              {p.label} {p.v && <span className="text-sm text-primary">✓ {p.v.place.name}</span>}
            </h2>
            <BirthForm askName timeOptional submitLabel="Kaydet" onSubmit={p.set} />
          </div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <button
          type="button"
          disabled={!ready}
          onClick={() => setShown(true)}
          className="rounded-full bg-primary px-8 py-3 font-display font-semibold text-primary-foreground shadow-glow transition disabled:opacity-40"
        >
          İlişkinin Şifresini Çöz
        </button>
        {!ready && <p className="mt-2 text-xs text-muted-foreground">Önce iki kişinin bilgilerini kaydedin.</p>}
      </div>

      {shown && (
        <div className="mt-10 grid gap-8">
          <div className="rounded-xl border border-primary/40 bg-primary/5 p-4 text-center text-sm">
            <strong>Bu ekran tasarım önizlemesidir.</strong> Aşağıdaki burçlar, yüzdeler ve haftalık akış girdiğiniz bilgilerden hesaplanmamıştır; tamamı örnek (demo) veridir.
          </div>

          {timeUnknown && (
            <div className="rounded-xl border border-border bg-card/70 p-4 text-sm text-muted-foreground">
              <strong className="text-foreground">Doğum saati bilinmiyor:</strong> Hesaplamada öğlen 12:00 referans alınır ve sonuçlar <em>yaklaşık</em> kabul edilir.
              Ay bir günde yaklaşık 12–15° ilerlediği için Composite Ay konumu gün içinde belirgin şekilde değişebilir; Ay burcu bile farklı çıkabilir.
              Gerçek sapma aralığı yalnızca hesaplama yapıldığında gösterilecektir.
            </div>
          )}

          {/* Composite kimlik kartı */}
          <section className="rounded-2xl border border-primary/40 bg-card p-6 shadow-glow">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-2xl font-semibold">İlişkinin Kozmik Kimliği</h2>
              <DemoBadge />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
              {DEMO_PLANETS.map((p) => (
                <div key={p.title} className="rounded-xl border border-border bg-background/60 p-4 text-center">
                  <div className="text-3xl text-gold">{p.glyph}</div>
                  <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{p.title}</div>
                  <div className="mt-1 font-display text-lg font-semibold">{p.sign}</div>
                  <p className="mt-1 text-xs text-muted-foreground">{p.role}</p>
                  {timeUnknown && p.title === "Composite Ay" && (
                    <p className="mt-2 text-[11px] font-semibold text-primary">Yaklaşık yerleşim</p>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Temalar */}
          <section className="rounded-2xl border border-border bg-card/80 p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-2xl font-semibold">İlişki Temaları</h2>
              <DemoBadge />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Yüzdeler yalnızca görsel örnektir; gerçek bir uyum puanı değildir.</p>
            <ul className="mt-5 grid gap-4">
              {DEMO_THEMES.map((t) => (
                <li key={t.name}>
                  <div className="flex justify-between text-sm">
                    <span>{t.name}</span>
                    <span className="text-muted-foreground">%{t.v} (demo)</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary/70" style={{ width: `${t.v}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Haftalık */}
          <section className="rounded-2xl border border-border bg-card/80 p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-2xl font-semibold">Bu Hafta Biz</h2>
              <DemoBadge label="DEMO · Çok yakında" />
            </div>
            <div className="mt-4 rounded-xl border border-primary/30 bg-primary/5 p-4">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Örnek öne çıkan açı</div>
              <div className="mt-1 font-semibold">Transit Venüs △ Composite Ay</div>
              <p className="mt-1 text-sm text-muted-foreground">Bu metin örnektir; haftalık transitler henüz hesaplanmıyor.</p>
            </div>
            <div className="mt-4 grid grid-cols-7 gap-1.5">
              {DEMO_WEEK.map((d, i) => (
                <div key={d} className="rounded-lg border border-border bg-background/60 py-3 text-center">
                  <div className="text-xs text-muted-foreground">{d}</div>
                  <div className={`mx-auto mt-2 h-2 w-2 rounded-full ${i === 2 || i === 4 ? "bg-primary" : "bg-muted"}`} />
                </div>
              ))}
            </div>
            <p className="mt-4 text-center text-sm font-semibold text-primary">Haftalık Dinamik Rapor · Premium · Çok Yakında</p>
          </section>
        </div>
      )}
    </div>
  );
}
