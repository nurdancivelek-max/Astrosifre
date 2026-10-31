import { describe, expect, it } from "vitest";
import { toPublicMatch } from "@/lib/soulmate.functions";

describe("soulmate pool privacy", () => {
  const row = {
    nickname: "GeceKuşu",
    sun_sign: 7,
    moon_sign: 3,
    rising_sign: 11,
    // fields that must never leak into a public match view:
    birth_date: "1990-05-17",
    birth_time: "04:32",
    place_name: "İstanbul",
    latitude: 41.01,
    longitude: 28.97,
  };

  it("public match exposes only nickname, signs and score", () => {
    const m = toPublicMatch(row, 82);
    expect(Object.keys(m).sort()).toEqual(["moon", "nickname", "rising", "score", "sun"]);
    expect(m).toEqual({ nickname: "GeceKuşu", sun: "Akrep", moon: "Yengeç", rising: "Balık", score: 82 });
  });

  it("public match contains no birth data", () => {
    const json = JSON.stringify(toPublicMatch(row, 50));
    expect(json).not.toContain("1990-05-17");
    expect(json).not.toContain("04:32");
    expect(json).not.toContain("İstanbul");
    expect(json).not.toContain("41.01");
  });

  it("unknown birth time hides the rising sign", () => {
    const m = toPublicMatch({ ...row, rising_sign: null }, 60);
    expect(m.rising).toBeNull();
  });
});
