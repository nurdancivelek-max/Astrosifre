import { useCallback, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { BirthForm, type BirthData } from "@/components/BirthForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getMySoulmateProfile,
  getSoulmateMatches,
  joinSoulmatePool,
  leaveSoulmatePool,
  type PublicMatch,
} from "@/lib/soulmate.functions";
import { SIGN_GLYPHS, SIGNS } from "@/lib/astro";

interface MyProfile {
  nickname: string;
  placeName: string;
  sun: string;
  moon: string;
  rising: string | null;
}

const glyphOf = (sign: string) => SIGN_GLYPHS[SIGNS.indexOf(sign as (typeof SIGNS)[number])] ?? "";

function SignChips({ sun, moon, rising }: { sun: string; moon: string; rising: string | null }) {
  return (
    <span className="text-sm text-muted-foreground">
      ☉ {glyphOf(sun)} {sun} · ☽ {glyphOf(moon)} {moon}
      {rising && <> · ↑ {glyphOf(rising)} {rising}</>}
    </span>
  );
}

export function SoulmatePool() {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<MyProfile | null>(null);
  const [checked, setChecked] = useState(false);
  const [nickname, setNickname] = useState("");
  const [matches, setMatches] = useState<PublicMatch[] | null>(null);
  const [poolSize, setPoolSize] = useState(0);
  const [busy, setBusy] = useState(false);

  const loadMatches = useCallback(async () => {
    const res = await getSoulmateMatches();
    if (res.ok) {
      setMatches(res.matches);
      setPoolSize(res.poolSize);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    getMySoulmateProfile().then((res) => {
      if (res.ok && res.profile) {
        setProfile(res.profile);
        loadMatches();
      }
      setChecked(true);
    });
  }, [user, loadMatches]);

  if (loading) return null;

  if (!user) {
    return (
      <section className="mt-14 rounded-xl border border-primary/40 bg-card p-8 text-center shadow-glow">
        <h2 className="font-display text-2xl font-semibold">Ruh Eşi <span className="text-gold">Havuzu</span></h2>
        <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">
          Ücretsiz hesap oluşturun, haritanızı havuza ekleyin; sistem diğer üyeler arasında sizinle en yüksek
          uyumu taşıyan haritaları bulsun. Doğum bilgileriniz kimseyle paylaşılmaz — diğer üyeler yalnızca
          rumuzunuzu ve Güneş, Ay, Yükselen burçlarınızı görür.
        </p>
        <Link to="/auth" className="mt-6 inline-flex rounded-md bg-gold px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow">
          Üye ol ve havuza katıl
        </Link>
      </section>
    );
  }

  if (!checked) return null;

  if (!profile) {
    return (
      <section className="mt-14 rounded-xl border border-primary/40 bg-card p-6 shadow-glow">
        <h2 className="font-display text-2xl font-semibold">Ruh Eşi <span className="text-gold">Havuzu</span>'na katılın</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Haritanızı ekleyin; sizinle en uyumlu üyeleri bulalım. Doğum bilgileriniz gizli kalır, yalnızca
          rumuzunuz ve burçlarınız görünür.
        </p>
        <div className="mt-5 grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="sp-nick">Rumuz</Label>
            <Input id="sp-nick" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="Havuzda görünecek adınız" maxLength={30} />
          </div>
          <BirthForm
            timeOptional
            submitLabel={busy ? "Kaydediliyor…" : "Havuza katıl"}
            onSubmit={async (d: BirthData) => {
              if (nickname.trim().length < 2) return toast.error("Lütfen en az 2 harfli bir rumuz girin.");
              setBusy(true);
              const res = await joinSoulmatePool({
                data: {
                  nickname: nickname.trim(),
                  date: d.date,
                  time: d.time,
                  placeName: d.place.name,
                  latitude: d.place.latitude,
                  longitude: d.place.longitude,
                  timezone: d.place.timezone,
                },
              });
              setBusy(false);
              if (!res.ok) return toast.error(res.error);
              toast.success("Havuzdasınız! Eşleşmeler hesaplanıyor…");
              const me = await getMySoulmateProfile();
              if (me.ok && me.profile) setProfile(me.profile);
              loadMatches();
            }}
          />
        </div>
      </section>
    );
  }

  return (
    <section className="mt-14 rounded-xl border border-primary/40 bg-card p-6 shadow-glow">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-semibold">Ruh Eşi <span className="text-gold">Havuzu</span></h2>
          <p className="mt-1 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{profile.nickname}</span> olarak havuzdasınız ·{" "}
            <SignChips sun={profile.sun} moon={profile.moon} rising={profile.rising} />
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadMatches}>Yenile</Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive"
            onClick={async () => {
              await leaveSoulmatePool();
              setProfile(null);
              setMatches(null);
              toast.success("Havuzdan ayrıldınız.");
            }}
          >
            Havuzdan ayrıl
          </Button>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="font-display text-lg font-semibold">En uyumlu üyeler</h3>
        {matches === null ? (
          <p className="mt-3 text-sm text-muted-foreground">Eşleşmeler hesaplanıyor…</p>
        ) : matches.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Henüz havuzda başka üye yok. Arkadaşlarınızı davet edin — havuz büyüdükçe eşleşmeler burada listelenecek.
          </p>
        ) : (
          <>
            <p className="mt-1 text-xs text-muted-foreground">{poolSize} üye arasından en yüksek {matches.length} uyum:</p>
            <ul className="mt-4 grid gap-2">
              {matches.map((m, i) => (
                <li key={i} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card/60 px-4 py-3">
                  <div>
                    <div className="font-semibold">{m.nickname}</div>
                    <SignChips sun={m.sun} moon={m.moon} rising={m.rising} />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-gold" style={{ width: `${m.score}%` }} />
                    </div>
                    <span className="font-display text-xl font-bold text-gold">{m.score}</span>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">
              Gizlilik: üyeler yalnızca rumuz ve burçları görür; doğum tarihi, saati ve yeri asla paylaşılmaz.
            </p>
          </>
        )}
      </div>
    </section>
  );
}
