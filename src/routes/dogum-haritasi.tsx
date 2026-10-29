import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { toast } from "sonner";
import { BirthForm } from "@/components/BirthForm";
import { ChartWheel } from "@/components/ChartWheel";
import { ChartDetails } from "@/components/ChartDetails";
import { Button } from "@/components/ui/button";
import { computeChart } from "@/lib/astro";
import { localToUtc } from "@/lib/geo";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

type Search = { n?: string; d?: string; t?: string; p?: string; lat?: number; lon?: number; tz?: string };

export const Route = createFileRoute("/dogum-haritasi")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    n: typeof s.n === "string" ? s.n : undefined,
    d: typeof s.d === "string" ? s.d : undefined,
    t: typeof s.t === "string" ? s.t : undefined,
    p: typeof s.p === "string" ? s.p : undefined,
    lat: s.lat != null ? Number(s.lat) : undefined,
    lon: s.lon != null ? Number(s.lon) : undefined,
    tz: typeof s.tz === "string" ? s.tz : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Ücretsiz Doğum Haritası — Astrosifre" },
      { name: "description", content: "Placidus evleri, gezegen konumları, retrolar ve açılarla ücretsiz doğum haritası." },
      { property: "og:title", content: "Ücretsiz Doğum Haritası — Astrosifre" },
      { property: "og:description", content: "Doğum haritanızı saniyeler içinde çıkarın." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NatalPage,
});

function NatalPage() {
  const s = Route.useSearch();
  const navigate = useNavigate({ from: "/dogum-haritasi" });
  const { user } = useAuth();
  const ready = s.d && s.t && s.lat != null && s.lon != null && s.tz;
  const chart = useMemo(
    () => (ready ? computeChart(localToUtc(s.d!, s.t!, s.tz!), s.lat!, s.lon!) : null),
    [ready, s.d, s.t, s.tz, s.lat, s.lon],
  );

  const save = async () => {
    if (!user || !ready) return;
    const { error } = await supabase.from("saved_charts").insert({
      user_id: user.id, name: s.n || "İsimsiz", birth_date: s.d!, birth_time: s.t!, place_name: s.p || "",
      latitude: s.lat!, longitude: s.lon!, timezone: s.tz!,
    });
    if (error) toast.error("Kaydedilemedi"); else toast.success("Harita kaydedildi");
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-4xl font-bold">Doğum <span className="text-gold">Haritası</span></h1>
      <div className="mt-8 rounded-xl border border-border bg-card/70 p-6">
        <BirthForm
          askName
          key={`${s.d}${s.t}${s.lat}`}
          initial={ready ? { name: s.n, date: s.d, time: s.t, place: { name: s.p ?? "", latitude: s.lat!, longitude: s.lon!, timezone: s.tz! } } : undefined}
          onSubmit={(d) => navigate({ search: { n: d.name, d: d.date, t: d.time, p: d.place.name, lat: d.place.latitude, lon: d.place.longitude, tz: d.place.timezone } })}
        />
      </div>
      {chart && (
        <>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-2xl font-semibold">{s.n ? `${s.n} için harita` : "Harita"}</h2>
            {user ? (
              <Button variant="outline" onClick={save}>Haritalarıma kaydet</Button>
            ) : (
              <Link to="/auth" className="text-sm text-primary underline">Kaydetmek için ücretsiz hesap açın</Link>
            )}
          </div>
          <div className="mt-4 grid gap-8 lg:grid-cols-2">
            <div className="flex justify-center rounded-xl border border-border bg-card/40 p-4"><ChartWheel chart={chart} /></div>
            <ChartDetails chart={chart} />
          </div>
        </>
      )}
    </div>
  );
}
