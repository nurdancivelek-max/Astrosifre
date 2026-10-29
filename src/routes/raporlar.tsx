import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { BirthForm } from "@/components/BirthForm";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { REPORTS, type ReportId } from "@/lib/report-rules";
import { requestFreeReport } from "@/lib/reports.functions";

export const Route = createFileRoute("/raporlar")({
  head: () => ({
    meta: [
      { title: "Kişisel Astroloji Raporları — Astrosifre" },
      { name: "description", content: "Ücretsiz raporlar e-postayla sıraya alınarak teslim edilir; ücretli raporlar anında hazır." },
      { property: "og:title", content: "Kişisel Astroloji Raporları — Astrosifre" },
      { property: "og:description", content: "Ücretsiz ya da anında teslim edilen detaylı raporlar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReportsPage,
});

function ReportsPage() {
  const [selected, setSelected] = useState<ReportId>("natal-ozet");
  const [email, setEmail] = useState("");
  const [done, setDone] = useState<{ title: string; deliverAfter: string; queue: number } | null>(null);
  const send = useServerFn(requestFreeReport);
  const sel = REPORTS.find((r) => r.id === selected)!;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="font-display text-4xl font-bold">Kişisel <span className="text-gold">Raporlar</span></h1>
      <p className="mt-2 text-muted-foreground">Ücretsiz raporlar sıraya alınır ve e-postanıza gelir. Ücretli raporlar beklemeden, anında teslim edilir.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {REPORTS.map((r) => (
          <button key={r.id} type="button" onClick={() => setSelected(r.id)}
            className={`rounded-xl border p-5 text-left transition ${selected === r.id ? "border-primary bg-card shadow-glow" : "border-border bg-card/60 hover:border-primary/50"}`}>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">{r.title}</h2>
              <span className={`rounded-full px-2 py-0.5 text-xs ${r.tier === "free" ? "bg-secondary" : "bg-gold text-primary-foreground"}`}>
                {r.tier === "free" ? "Ücretsiz" : "Tek seferlik ödeme"}
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{r.text}</p>
            <p className="mt-3 text-xs text-primary">{r.tier === "free" ? `Teslim: ${r.delayHours === 48 ? "48 saat içinde" : "1 hafta içinde"}` : "Teslim: anında"}</p>
          </button>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-border bg-card/70 p-6">
        {sel.tier === "paid" ? (
          <div className="text-center">
            <h3 className="font-display text-xl font-semibold">{sel.title}</h3>
            <p className="mt-2 text-muted-foreground">Ödeme sistemi çok yakında açılıyor. Bu süreçte ücretsiz raporları talep edebilirsiniz.</p>
          </div>
        ) : done ? (
          <div className="text-center">
            <h3 className="font-display text-xl font-semibold text-gold">Talebiniz sıraya alındı ✦</h3>
            <p className="mt-2">{done.title} en geç <b>{new Date(done.deliverAfter).toLocaleString("tr-TR", { dateStyle: "long", timeStyle: "short" })}</b> tarihinde e-postanızda olacak.</p>
            <p className="mt-1 text-sm text-muted-foreground">Şu an sırada {done.queue} talep var.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            <h3 className="font-display text-xl font-semibold">{sel.title} talep et</h3>
            <div className="grid gap-1.5">
              <Label htmlFor="email">E-posta</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ornek@eposta.com" />
            </div>
            <BirthForm
              submitLabel="Raporu talep et"
              onSubmit={async (d) => {
                if (!/^\S+@\S+\.\S+$/.test(email)) return toast.error("Geçerli bir e-posta girin");
                try {
                  const r = await send({ data: { email, reportId: selected, date: d.date, time: d.time, placeName: d.place.name, latitude: d.place.latitude, longitude: d.place.longitude, timezone: d.place.timezone } });
                  if (r.ok) setDone(r); else toast.error(r.error);
                } catch { toast.error("Bir hata oluştu"); }
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
