import { useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { claimReferral } from "@/lib/referral.functions";
import { isValidRefCode, REF_STORAGE_KEY } from "@/lib/referral-rules";

/** Remembers ?ref=code from invite links and credits the inviter once the visitor is signed in. */
export function useReferralCapture() {
  const claim = useServerFn(claimReferral);
  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref")?.toLowerCase();
    if (ref && isValidRefCode(ref)) localStorage.setItem(REF_STORAGE_KEY, ref);
    const tryClaim = async () => {
      const code = localStorage.getItem(REF_STORAGE_KEY);
      if (!code) return;
      const { data } = await supabase.auth.getSession();
      if (!data.session?.user.email_confirmed_at) return;
      try { await claim({ data: { code } }); } catch { return; }
      localStorage.removeItem(REF_STORAGE_KEY);
    };
    tryClaim();
    const { data } = supabase.auth.onAuthStateChange((e) => { if (e === "SIGNED_IN") tryClaim(); });
    return () => data.subscription.unsubscribe();
  }, [claim]);
}
