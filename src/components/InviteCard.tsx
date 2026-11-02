import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { getMyReferral } from "@/lib/referral.functions";
import { REFERRALS_FOR_EARLY_ACCESS, remainingInvites } from "@/lib/referral-rules";

export function InviteCard() {
  const { user, loading } = useAuth();
  const fetchRef = useServerFn(getMyReferral);
  const [info, setInfo] = useState<{ code: string | null; count: number; earlyAccess: boolean } | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchRef().then(setInfo).catch(() => setInfo(null));
  }, [user, fetchRef]);

  const link = info?.code ? `${window.location.origin}/?ref=${info.code}` : "";
  const msg = `Astrosifre'de haritama baktım, sen de bak ✦ ${link}`;

  return (
    <div className="rounded-xl border border-primary/40 bg-card p-5 shadow-glow">
      <p className="text-xs uppercase tracking-widest text-primary">Erken erişim</p>
      <h3 className="mt-1 font-display text-lg font-semibold">Premium raporları herkesten önce deneyimleyin</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        {REFERRALS_FOR_EARLY_ACCESS} arkadaşınızı davet edin; ödeme sistemi açılmadan premium raporu ilk siz alın.
      </p>
      {loading ? null : !user ? (
        <Button asChild className="mt-4 bg-gold text-primary-foreground"><Link to="/auth">Davet linkimi al (ücretsiz hesap)</Link></Button>
      ) : !info ? (
        <p className="mt-4 text-sm text-muted-foreground">Davet linkiniz hazırlanıyor…</p>
      ) : (
        <div className="mt-4 grid gap-3">
          <div className="flex items-center gap-2" aria-label={`${info.count}/${REFERRALS_FOR_EARLY_ACCESS} arkadaş katıldı`}>
            {Array.from({ length: REFERRALS_FOR_EARLY_ACCESS }, (_, i) => (
              <span key={i} className={`h-3 w-3 rounded-full border border-primary ${i < info.count ? "bg-primary" : "bg-transparent"}`} />
            ))}
            <span className="ml-2 text-sm">
              {info.earlyAccess ? "Tebrikler! Erken erişiminiz açıldı ✦" : `${Math.min(info.count, 3)}/${REFERRALS_FOR_EARLY_ACCESS} arkadaş katıldı · ${remainingInvites(info.count)} kişi kaldı`}
            </span>
          </div>
          <div className="truncate rounded-md border border-border bg-background px-3 py-2 text-xs">{link}</div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => { navigator.clipboard.writeText(link); toast.success("Link kopyalandı"); }}>Linki kopyala</Button>
            <Button asChild className="bg-gold text-primary-foreground">
              <a href={`https://wa.me/?text=${encodeURIComponent(msg)}`} target="_blank" rel="noreferrer">WhatsApp ile paylaş</a>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Arkadaşınız linkten gelip hesabını e-postayla onayladığında sayılır.</p>
        </div>
      )}
    </div>
  );
}
