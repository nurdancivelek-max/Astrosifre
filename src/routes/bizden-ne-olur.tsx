import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PlaceSearch } from "@/components/PlaceSearch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Place } from "@/lib/geo";

interface Person { name: string; date: string; time: string; unknown: boolean; place: Place | null }
const EMPTY: Person = { name: "", date: "", time: "", unknown: false, place: null };

function missing(p: Person): string[] {
  const m: string[] = [];
  if (!p.date) m.push("doğum tarihi");
  if (!p.unknown && !p.time) m.push("doğum saati (ya da “bilmiyorum”)");
  if (!p.place) m.push("doğum yeri");
  return m;
}

function PersonCard({ id, label, v, set, err }: { id: string; label: string; v: Person; set: (p: Person) => void; err?: string[] }) {
  const [editPlace, setEditPlace] = useState(false);
  return (
    <div className={`rounded-2xl border bg-card/80 p-4 shadow-sm md:p-5 ${err?.length ? "border-destructive/60" : "border-primary/30"}`}>
      <h2 className="mb-3 font-display text-lg font-semibold">{label}</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-1.5 sm:col-span-2">
          <Label htmlFor={`${id}-name`}>İsim veya takma ad <span className="text-muted-foreground">(isteğe bağlı)</span></Label>
          <Input id={`${id}-name`} value={v.name} onChange={(e) => set({ ...v, name: e.target.value })} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor={`${id}-date`}>Doğum tarihi</Label>
          <Input id={`${id}-date`} type="date" value={v.date} onChange={(e) => set({ ...v, date: e.target.value })} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor={`${id}-time`}>Doğum saati</Label>
          <Input id={`${id}-time`} type="time" value={v.unknown ? "" : v.time} disabled={v.unknown} onChange={(e) => set({ ...v, time: e.target.value })} />
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" checked={v.unknown} onChange={(e) => set({ ...v, unknown: e.target.checked })} className="h-4 w-4 accent-primary" />
            Doğum saatimi bilmiyorum
          </label>
        </div>
        <div className="grid gap-1.5 sm:col-span-2">
          <Label>Doğum yeri (şehir / ilçe)</Label>
          {v.place && !editPlace ? (
            <div className="flex items-center justify-between rounded-md border border-primary/40 bg-primary/5 px-3 py-2 text-sm">
              <span className="truncate">📍 {v.place.name}</span>
              <button type="button" className="ml-2 shrink-0 text-xs font-semibold text-primary" onClick={() => setEditPlace(true)}>Değiştir</button>
            </div>
          ) : (
            <PlaceSearch value={null} onChange={(p) => { set({ ...v, place: p }); setEditPlace(false); }} />
          )}
        </div>
      </div>
      {err && err.length > 0 && <p className="mt-3 text-sm text-destructive">Eksik: {err.join(", ")}</p>}
    </div>
  );
}

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
  { glyph: "☉", title: "Composite Güneş", role: "İlişkinin amacı ve kimliği", sign: "Aslan", deg: "18° 42′" },
  { glyph: "☽", title: "Composite Ay", role: "Duygusal güven ve ortak kalp dili", sign: "Yengeç", deg: "04° 15′" },
  { glyph: "♀", title: "Composite Venüs", role: "Sevginin ifadesi, romantik çekim", sign: "Terazi", deg: "22° 10′" },
  { glyph: "♂", title: "Composite Mars", role: "Tutku, ortak eylem, kriz yönetimi", sign: "Akrep", deg: "11° 50′" },
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
  const [a, setA] = useState<Person>(EMPTY);
  const [b, setB] = useState<Person>(EMPTY);
  const [shown, setShown] = useState(false);
  const [errs, setErrs] = useState<{ a?: string[]; b?: string[] }>({});
  const timeUnknown = a.unknown || b.unknown;

  const solve = () => {
    const ea = missing(a), eb = missing(b);
    setErrs({ a: ea, b: eb });
    if (ea.length || eb.length) { setShown(false); return; }
    setShown(true);
    setTimeout(() => document.getElementById("sonuc")?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 pb-28 pt-3 md:py-12">
      {/* Başlık */}
      <header className="text-center">
        <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary">✦ KOD: VEGA</span>
        <h1 className="mt-1.5 font-display text-3xl font-bold md:mt-3 md:text-5xl">
          Bizden <span className="text-gold">Ne Olur?</span>
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground md:mt-3 md:text-base">
          İki haritanın orta noktalarından doğan tek bir ilişki haritası: ilişkinizin kendine ait karakteri.
        </p>
      </header>

      {/* Form */}
      <div className="mt-5 grid gap-4 md:mt-8 md:grid-cols-2 md:gap-5">
        <PersonCard id="a" label="1. Kişi · Sen" v={a} set={setA} err={errs.a} />
        <PersonCard id="b" label="2. Kişi · O" v={b} set={setB} err={errs.b} />
      </div>

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={solve}
          className="w-full rounded-full bg-primary px-8 py-3.5 font-display font-semibold text-primary-foreground shadow-glow transition sm:w-auto"
        >
          ✦ İlişkinin Şifresini Çöz
        </button>
        <p className="mt-2 text-xs text-muted-foreground">
          Bilgiler yalnızca bu ekranda kullanılır; hiçbir yere kaydedilmez veya gönderilmez.
        </p>
      </div>

      {shown && (
        <div id="sonuc" className="mt-10 grid scroll-mt-20 gap-8">
          <div className="rounded-xl border border-primary/40 bg-primary/5 p-4 text-center text-sm">
            <strong>Bu ekran tasarım önizlemesidir.</strong> Aşağıdaki burçlar, yüzdeler ve haftalık akış girdiğiniz bilgilerden hesaplanmamıştır; tamamı örnek (demo) veridir.
          </div>

          {timeUnknown && (
            <div className="rounded-xl border border-border bg-card/70 p-4 text-sm text-muted-foreground">
              <strong className="text-foreground">Doğum saati bilinmiyor:</strong> Hesaplamada öğlen 12:00 kullanılır. Bu, gerçek doğum saatiniz değildir;
              yalnızca hesaplama için seçilmiş yaklaşık bir saattir ve sonuçlar <em>yaklaşık</em> kabul edilmelidir.
              Genel bir bilgi olarak Ay bir günde ortalama 12–15° ilerler; bu nedenle Composite Ay konumu gün içinde belirgin şekilde değişebilir, Ay burcu bile farklı çıkabilir.
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
                  <div className="mt-1 flex flex-wrap items-baseline justify-center gap-x-1.5">
                    <span className="font-display text-lg font-semibold">{p.sign}</span>
                    <span className="font-display text-sm tabular-nums text-gold">{p.deg}</span>
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-primary">demo derece</div>
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
