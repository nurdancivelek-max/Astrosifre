import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { BirthForm } from "@/components/BirthForm";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { REPORTS, type ReportId } from "@/lib/report-rules";
import { requestFreeReport } from "@/lib/reports.functions";
import { DeskSelector } from "@/components/DeskSelector";
import { Button } from "@/components/ui/button";
import type { AnalystCode } from "@/lib/analysis-desks";

export const Route = createFileRoute("/raporlar")({
  head: () => ({
    meta: [
      { title: "Kişisel Astroloji Raporları — Astrosifre" },
      { name: "description", content: "Ücretsiz raporlar e-postayla sıraya alınarak teslim edilir; premium raporlar çok yakında." },
      { property: "og:title", content: "Kişisel Astroloji Raporları — Astrosifre" },
      { property: "og:description", content: "Ücretsiz astroloji raporları; premium analizler çok yakında." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReportsPage,
});

function ReportsPage() {
  const [selected, setSelected] = useState<ReportId>("natal-ozet");
  const [email, setEmail] = useState("");
  const [analystCode, setAnalystCode] = useState<AnalystCode>("ALTAIR");
  const [done, setDone] = useState<{ title: string; deliverAfter: string; queue: number; analystCode: AnalystCode; reference: string } | null>(null);
  const send = useServerFn(requestFreeReport);
  const sel = REPORTS.find((r) => r.id === selected) ?? REPORTS[0];

  const [step, setStep] = useState<1 | 2>(1);
  const choose = (id: ReportId) => { setSelected(id); setDone(null); setStep(2); window.scrollTo({ top: 0, behavior: "smooth" }); };

  if (step === 1) return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="font-display text-4xl font-bold">Kişisel <span className="text-gold">Raporlar</span></h1>
      <p className="mt-2 text-muted-foreground">Bir rapor seçin, ardından analiz masanızı belirleyin.</p>
      {([["Kişisel Keşif", ["natal-ozet", "detayli-natal", "yillik-transit"]], ["İlişki ve Karar", ["iliski-uyumu"]]] as const).map(([cat, ids]) => {
        const items = REPORTS.filter((r) => (ids as readonly string[]).includes(r.id));
        if (!items.length) return null;
        return (
          <section key={cat} className="mt-8">
            <h2 className="font-display text-sm uppercase tracking-widest text-primary">✦ {cat}</h2>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              {items.map((r) => (
                <button key={r.id} type="button" onClick={() => choose(r.id)}
                  className="rounded-xl border border-border bg-card p-5 text-left shadow-sm transition hover:border-primary hover:shadow-glow">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-display text-lg font-semibold">{r.title}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-xs ${r.tier === "free" ? "bg-secondary" : "bg-gold text-primary-foreground"}`}>
                      {r.tier === "free" ? "Ücretsiz" : "Premium · Erken erişim"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{r.text}</p>
                  <p className="mt-3 text-xs text-primary">{r.tier === "free" ? `Teslim: ${r.delayHours === 48 ? "48 saat içinde" : "1 hafta içinde"}` : "3 arkadaş davetiyle ilk siz deneyin"} →</p>
                </button>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <button type="button" onClick={() => setStep(1)} className="text-sm text-primary">← Raporlara dön</button>
      <h1 className="mt-3 font-display text-3xl font-bold">{sel.title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{sel.text}</p>

      {sel.tier === "paid" ? (
        <div className="mt-6"><InviteCard /></div>
      ) : done ? (
        <div className="mt-8 rounded-xl border border-border bg-card p-6 text-center">
          <h3 className="font-display text-xl font-semibold text-gold">{done.analystCode} · Talebiniz sıraya alındı</h3>
          <p className="mt-2 text-xs text-muted-foreground">Talep no: {done.reference}</p>
          <p className="mt-2">{done.title} en geç <b>{new Date(done.deliverAfter).toLocaleString("tr-TR", { dateStyle: "long", timeStyle: "short" })}</b> tarihinde e-postanızda olacak.</p>
          <p className="mt-1 text-sm text-muted-foreground">Şu an sırada {done.queue} talep var.</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-5">
          <div>
            <h2 className="mb-2 font-display text-sm uppercase tracking-widest text-primary">Analiz masanızı seçin</h2>
            <DeskSelector value={analystCode} onChange={setAnalystCode} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="email">E-posta</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ornek@eposta.com" />
          </div>
          <BirthForm
            submitLabel="Raporu sıraya al"
            onSubmit={async (d) => {
              if (!/^\S+@\S+\.\S+$/.test(email)) return toast.error("Geçerli bir e-posta girin");
              try {
                const r = await send({ data: { email, analystCode, reportId: sel.id as "natal-ozet" | "yillik-transit", date: d.date, time: d.time, placeName: d.place.name, latitude: d.place.latitude, longitude: d.place.longitude, timezone: d.place.timezone } });
                if (r.ok) setDone(r); else toast.error(r.error);
              } catch { toast.error("Bir hata oluştu"); }
            }}
          />
        </div>
      )}
    </div>
  );
}
