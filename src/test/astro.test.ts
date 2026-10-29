import { describe, expect, it } from "vitest";
import { computeChart, signOf } from "@/lib/astro";
import { localToUtc } from "@/lib/geo";
import { deliverAfter } from "@/lib/report-rules";

describe("astro calculations", () => {
  it("places the Sun near 10° Capricorn on 2000-01-01 12:00 UTC", () => {
    const sun = computeChart(new Date(Date.UTC(2000, 0, 1, 12)), 41, 29).planets[0];
    expect(sun.lon).toBeGreaterThan(280);
    expect(sun.lon).toBeLessThan(281);
  });
  it("converts Istanbul summer 1990 local time to UTC (+3)", () => {
    expect(localToUtc("1990-06-15", "14:30", "Europe/Istanbul").toISOString()).toBe("1990-06-15T11:30:00.000Z");
  });
  it("first house cusp equals the ascendant", () => {
    const c = computeChart(new Date(Date.UTC(1985, 4, 10, 6)), 39.9, 32.85);
    expect(c.cusps[0]).toBeCloseTo(c.angles.asc, 6);
    expect(signOf(c.angles.mc).index).toBeGreaterThanOrEqual(0);
  });
});

describe("report delivery rules", () => {
  const t = new Date("2026-01-01T00:00:00Z");
  it("free birth chart summary is due after 48 hours", () => {
    expect(deliverAfter("natal-ozet", t).toISOString()).toBe("2026-01-03T00:00:00.000Z");
  });
  it("free yearly transit report is due after one week", () => {
    expect(deliverAfter("yillik-transit", t).toISOString()).toBe("2026-01-08T00:00:00.000Z");
  });
  it("paid reports are immediate", () => {
    expect(deliverAfter("detayli-natal", t).getTime()).toBe(t.getTime());
  });
});
