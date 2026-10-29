import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Giriş / Hesap Oluştur — Astrosifre" },
      { name: "description", content: "Birden çok kişinin haritasını kaydetmek için ücretsiz Astrosifre hesabı açın." },
      { property: "og:title", content: "Giriş — Astrosifre" },
      { property: "og:description", content: "Haritalarınızı kaydedin." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) toast.error("E-posta veya şifre hatalı"); else navigate({ to: "/haritalarim" });
    } else {
      const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
      if (error) toast.error(error.message); else toast.success("Hesabınızı onaylamak için e-postanızı kontrol edin.");
    }
    setBusy(false);
  };

  const google = async () => {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (r.error) return toast.error("Google ile giriş başarısız");
    if (r.redirected) return;
    navigate({ to: "/haritalarim" });
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-xl border border-border bg-card/80 p-8 shadow-glow">
        <h1 className="font-display text-2xl font-bold">{mode === "in" ? "Giriş yap" : "Hesap oluştur"}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Hesap opsiyoneldir; yalnızca haritaları kaydetmek için gerekir.</p>
        <Button variant="outline" className="mt-6 w-full" onClick={google}>Google ile devam et</Button>
        <div className="my-5 text-center text-xs text-muted-foreground">veya</div>
        <form onSubmit={submit} className="grid gap-4">
          <div className="grid gap-1.5"><Label htmlFor="em">E-posta</Label><Input id="em" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div className="grid gap-1.5"><Label htmlFor="pw">Şifre</Label><Input id="pw" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} /></div>
          <Button type="submit" disabled={busy} className="bg-gold text-primary-foreground">{mode === "in" ? "Giriş yap" : "Kayıt ol"}</Button>
        </form>
        <button className="mt-4 w-full text-center text-sm text-primary" onClick={() => setMode(mode === "in" ? "up" : "in")}>
          {mode === "in" ? "Hesabınız yok mu? Kayıt olun" : "Zaten hesabınız var mı? Giriş yapın"}
        </button>
      </div>
    </div>
  );
}
