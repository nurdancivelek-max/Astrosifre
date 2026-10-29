import { createFileRoute, Link } from "@tanstack/react-router";

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
      <section className="py-20 text-center sm:py-28">
        <p className="text-sm uppercase tracking-[0.3em] text-primary">Kayıt gerekmez</p>
        <h1 className="mx-auto mt-4 max-w-3xl font-display text-4xl font-bold leading-tight sm:text-6xl">
          Gökyüzünün <span className="text-gold">şifresini</span> kendiniz çözün
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
          Başka sitelerde bulamayacağınız hesaplamalar: saat bilinmeden yükselen penceresi, klasik horary analizi ve hassas doğum haritası.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/yukselen" className="rounded-md bg-gold px-6 py-3 font-semibold text-primary-foreground shadow-glow">Yükselenimi bul</Link>
          <Link to="/horary" className="rounded-md border border-primary/50 px-6 py-3 font-semibold text-primary">Bir soru sor</Link>
        </div>
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
