import { describe, expect, it } from "vitest";
import { ANALYSIS_DESKS, analystCodeSchema } from "@/lib/analysis-desks";

describe("analysis codes", () => {
  it("allows exactly the three selected code names", () => {
    expect(ANALYSIS_DESKS).toEqual(["ALTAIR", "VEGA", "SIRIUS"]);
    for (const code of ANALYSIS_DESKS) expect(analystCodeSchema.parse(code)).toBe(code);
    expect(analystCodeSchema.safeParse("MAYA").success).toBe(false);
  });
});