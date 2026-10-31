import { describe, expect, it } from "vitest";
import { ASPECTS } from "@/lib/astro";
import { compatibilityScore, type CrossAspect } from "@/lib/synastry";

const asp = (name: string, weight: number): CrossAspect => ({
  a: "Venus", b: "Mars", aName: "Venüs", bName: "Mars", type: ASPECTS.find((t) => t.name === name)!, orb: 1, weight,
});

describe("compatibilityScore", () => {
  it("is 50 with no aspects", () => expect(compatibilityScore([])).toBe(50));
  it("trines raise the score", () => expect(compatibilityScore([asp("Üçgen", 5)])).toBe(60));
  it("squares lower the score", () => expect(compatibilityScore([asp("Kare", 5)])).toBe(43));
  it("is clamped to 0-100", () => expect(compatibilityScore([asp("Üçgen", 100)])).toBe(100));
});
