import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { hasEarlyAccess, isValidRefCode } from "./referral-rules";

function newCode() {
  const chars = "abcdefghjkmnpqrstuvwxyz23456789";
  let s = "";
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  for (const b of bytes) s += chars[b % chars.length];
  return s;
}

/** Returns (and creates on first call) the signed-in user's invite code and progress. */
export const getMyReferral = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const userId = context.userId;
    let { data: row } = await supabaseAdmin.from("referral_codes").select("code").eq("user_id", userId).maybeSingle();
    if (!row) {
      for (let i = 0; i < 4 && !row; i++) {
        const { data } = await supabaseAdmin.from("referral_codes").insert({ user_id: userId, code: newCode() }).select("code").maybeSingle();
        if (data) row = data;
        else {
          const again = await supabaseAdmin.from("referral_codes").select("code").eq("user_id", userId).maybeSingle();
          if (again.data) row = again.data;
        }
      }
    }
    const { count } = await supabaseAdmin.from("referrals").select("referred_id", { count: "exact", head: true }).eq("referrer_id", userId);
    const n = count ?? 0;
    return { code: row?.code ?? null, count: n, earlyAccess: hasEarlyAccess(n) };
  });

/** Credits the inviter once for a newly signed-in, email-confirmed member. */
export const claimReferral = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ code: z.string().trim().toLowerCase() }).parse(input))
  .handler(async ({ data, context }) => {
    if (!isValidRefCode(data.code)) return { ok: false as const };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: owner } = await supabaseAdmin.from("referral_codes").select("user_id").eq("code", data.code).maybeSingle();
    if (!owner || owner.user_id === context.userId) return { ok: false as const };
    // Only brand-new accounts (created within the last 7 days) count as invites.
    const { data: u } = await supabaseAdmin.auth.admin.getUserById(context.userId);
    const created = u.user?.created_at ? new Date(u.user.created_at).getTime() : 0;
    if (!u.user?.email_confirmed_at || Date.now() - created > 7 * 864e5) return { ok: false as const };
    const { error } = await supabaseAdmin.from("referrals").insert({ referred_id: context.userId, referrer_id: owner.user_id });
    return { ok: !error };
  });
