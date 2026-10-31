import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { computeChart, signOf, SIGNS } from "@/lib/astro";
import { localToUtc } from "@/lib/geo";
import { compatibilityScore, crossAspects } from "@/lib/synastry";

const joinSchema = z.object({
  nickname: z.string().trim().min(2).max(30),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/).or(z.literal("")),
  placeName: z.string().min(1).max(200),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  timezone: z.string().min(1).max(64),
});

interface ProfileRow {
  user_id: string;
  nickname: string;
  birth_date: string;
  birth_time: string | null;
  place_name: string;
  latitude: number;
  longitude: number;
  timezone: string;
  sun_sign: number;
  moon_sign: number;
  rising_sign: number | null;
}

/** What other members may ever see about a match: nickname, three signs, score. No birth data. */
export interface PublicMatch {
  nickname: string;
  sun: string;
  moon: string;
  rising: string | null;
  score: number;
}

export function toPublicMatch(
  p: Pick<ProfileRow, "nickname" | "sun_sign" | "moon_sign" | "rising_sign">,
  score: number,
): PublicMatch {
  return {
    nickname: p.nickname,
    sun: SIGNS[p.sun_sign],
    moon: SIGNS[p.moon_sign],
    rising: p.rising_sign == null ? null : SIGNS[p.rising_sign],
    score,
  };
}

function chartOfProfile(p: ProfileRow) {
  const utc = localToUtc(p.birth_date, p.birth_time || "12:00", p.timezone);
  return computeChart(utc, p.latitude, p.longitude);
}

export const joinSoulmatePool = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => joinSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const utc = localToUtc(data.date, data.time || "12:00", data.timezone);
    const chart = computeChart(utc, data.latitude, data.longitude);
    const sun = chart.planets.find((p) => p.key === "Sun")!;
    const moon = chart.planets.find((p) => p.key === "Moon")!;
    const { error } = await supabase.from("soulmate_profiles").upsert(
      {
        user_id: userId,
        nickname: data.nickname,
        birth_date: data.date,
        birth_time: data.time || null,
        place_name: data.placeName,
        latitude: data.latitude,
        longitude: data.longitude,
        timezone: data.timezone,
        sun_sign: signOf(sun.lon).index,
        moon_sign: signOf(moon.lon).index,
        rising_sign: data.time ? signOf(chart.angles.asc).index : null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );
    if (error) return { ok: false as const, error: "Kaydedilemedi, lütfen tekrar deneyin." };
    return { ok: true as const };
  });

export const getMySoulmateProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase
      .from("soulmate_profiles")
      .select("nickname, sun_sign, moon_sign, rising_sign, place_name")
      .eq("user_id", userId)
      .maybeSingle();
    if (!data) return { ok: true as const, profile: null };
    return {
      ok: true as const,
      profile: {
        nickname: data.nickname,
        placeName: data.place_name,
        sun: SIGNS[data.sun_sign],
        moon: SIGNS[data.moon_sign],
        rising: data.rising_sign == null ? null : SIGNS[data.rising_sign],
      },
    };
  });

export const leaveSoulmatePool = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await supabase.from("soulmate_profiles").delete().eq("user_id", userId);
    return { ok: true as const };
  });

export const getSoulmateMatches = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: mine } = await supabase
      .from("soulmate_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (!mine) return { ok: false as const, error: "not-joined" };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: others, error } = await supabaseAdmin
      .from("soulmate_profiles")
      .select("*")
      .neq("user_id", userId)
      .limit(500);
    if (error) return { ok: false as const, error: "Eşleşmeler yüklenemedi." };

    const myChart = chartOfProfile(mine as ProfileRow);
    const matches = ((others ?? []) as ProfileRow[])
      .map((p) => {
        const score = compatibilityScore(crossAspects(myChart, chartOfProfile(p)));
        return toPublicMatch(p, score);
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    return { ok: true as const, matches, poolSize: (others ?? []).length };
  });
