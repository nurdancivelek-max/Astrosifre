import { createFileRoute, Link } from "@tanstack/react-router";
import { SkyToday } from "@/components/SkyToday";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Astrosifre — Yükseleni Bul, Horary ve Doğum Haritası" },
      { name: "description", content: "Kayıt olmadan yükseleninizi bulun, horary ile sorunuza yanıt arayın, doğum haritanızı çıkarın." },
      { property: "og:title", content: "Astrosifre — Gökyüzünün şifresini çözün" },
      { property: "og:description", content: "Ücretsiz astroloji hesaplamaları, horary ve e-postayla gelen kişisel raporlar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const TOOLS = [
  { to: "/yukselen", title: "Yükseleni Bul", text: "Doğum saatinizi bilmiyor musunuz? Gün boyunca hangi yükselenin hangi saatlerde doğduğunu görün.", glyph: "↑" },
  { to: "/horary", title: "Horary · Soru Astrolojisi", text: "Sorunuzu sorduğunuz anın haritası, klasik kurallarla yorumlanır: uygulayan açılar, boşta Ay, uyarılar.", glyph: "?" },
  { to: "/dogum-haritasi", title: "Doğum Haritası", text: "Placidus evleri, gezegen konumları, retrolar ve açılar — tek ekranda, ücretsiz.", glyph: "☉" },
  { to: "/raporlar", title: "Kişisel Raporlar", text: "Ücretsiz raporlar sıraya alınıp e-postayla gelir; ücretli raporlar anında teslim edilir.", glyph: "✉" },
] as const;

function Index() {
  return (
    <div className="mx-auto max-w-6xl px-4">
      <SkyToday />
      <section className="py-12 text-center">
        <h2 className="mx-auto max-w-3xl font-display text-3xl font-bold leading-tight sm:text-4xl">
          Bu gökyüzü <span className="text-gold">sizi</span> nasıl etkiliyor?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Kayıt gerekmez: saat bilinmeden yükselen penceresi, klasik horary analizi ve hassas doğum haritası.
        </p>
      </section>
      <section className="grid gap-5 sm:grid-cols-2">
        {TOOLS.map((t) => (
          <Link key={t.to} to={t.to} className="group rounded-xl border border-border bg-card/70 p-6 transition hover:border-primary/60 hover:shadow-glow">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-primary/50 text-xl text-primary">{t.glyph}</div>
            <h2 className="mt-4 font-display text-xl font-semibold group-hover:text-primary">{t.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{t.text}</p>
          </Link>
        ))}
      </section>
      <section className="mt-16 rounded-xl border border-border bg-card/50 p-8 text-center">
        <h2 className="font-display text-2xl font-semibold">Ailenizin haritalarını bir arada tutun</h2>
        <p className="mx-auto mt-2 max-w-xl text-muted-foreground">Üyelik zorunlu değil. İsterseniz ücretsiz hesap açıp birden çok kişinin haritasını kaydedebilirsiniz.</p>
        <Link to="/auth" className="mt-5 inline-flex rounded-md border border-primary/50 px-5 py-2 text-primary">Hesap oluştur</Link>
      </section>
    </div>
  );
}
