import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/haritalarim")({
  head: () => ({
    meta: [
      { title: "Haritalarım — Astrosifre" },
      { name: "description", content: "Kaydettiğiniz doğum haritaları." },
      { property: "og:title", content: "Haritalarım — Astrosifre" },
      { property: "og:description", content: "Kaydettiğiniz doğum haritaları." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MyCharts,
});

function MyCharts() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { data = [], isLoading } = useQuery({
    queryKey: ["saved_charts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("saved_charts").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const remove = async (id: string) => {
    const { error } = await supabase.from("saved_charts").delete().eq("id", id);
    if (error) return toast.error("Silinemedi");
    qc.invalidateQueries({ queryKey: ["saved_charts"] });
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-4xl font-bold">Haritalarım</h1>
        <div className="flex gap-2">
          <Link to="/dogum-haritasi" className="rounded-md bg-gold px-4 py-2 text-sm font-semibold text-primary-foreground">Yeni harita</Link>
          <Button variant="outline" onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/" }); }}>Çıkış</Button>
        </div>
      </div>
      {isLoading ? <p className="mt-8 text-muted-foreground">Yükleniyor…</p> : data.length === 0 ? (
        <p className="mt-8 text-muted-foreground">Henüz kayıtlı harita yok. Bir doğum haritası çıkarıp “Haritalarıma kaydet” deyin.</p>
      ) : (
        <ul className="mt-8 grid gap-3">
          {data.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card/70 p-4">
              <div>
                <p className="font-semibold">{c.name}</p>
                <p className="text-sm text-muted-foreground">{c.birth_date} · {c.birth_time.slice(0, 5)} · {c.place_name}</p>
              </div>
              <div className="flex gap-2">
                <Link to="/dogum-haritasi" search={{ n: c.name, d: c.birth_date, t: c.birth_time.slice(0, 5), p: c.place_name, lat: c.latitude, lon: c.longitude, tz: c.timezone }}
                  className="rounded-md border border-primary/50 px-3 py-1.5 text-sm text-primary">Aç</Link>
                <Button variant="ghost" size="sm" onClick={() => remove(c.id)}>Sil</Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
