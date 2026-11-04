import { describe, expect, it } from "vitest";
import {
  __compositeArcForTest as compositeArc,
  calculateCompositeAspects,
  calculateCompositeChart,
  calculateCompositePlanets,
  isInArc,
  makeArc,
  shortestArcMidpoint,
  type CompositePlanet,
} from "@/lib/composite";

const close = (a: number, b: number, eps = 1e-6) => expect(Math.abs(a - b)).toBeLessThan(eps);

describe("shortestArcMidpoint", () => {
  it("T1 standart yay: 20° / 80° → 50°", () => {
    const m = shortestArcMidpoint(20, 80);
    close(m.lon, 50);
    expect(m.isOppositionAmbiguous).toBe(false);
  });

  it("T2 sıfır geçişi: 350° / 10° → 0°", () => {
    const m = shortestArcMidpoint(350, 10);
    close(m.lon, 0);
    expect(m.isOppositionAmbiguous).toBe(false);
    close(shortestArcMidpoint(359, 1).lon, 0);
  });

  it("T3 0°/180° karşıtlık → 90°, alternatif 270°", () => {
    const m = shortestArcMidpoint(0, 180);
    close(m.lon, 90);
    expect(m.isOppositionAmbiguous).toBe(true);
    close(m.alternateMidpoint!, 270);
  });

  it("T4 180°/0° ters sıra aynı sonucu verir", () => {
    expect(shortestArcMidpoint(180, 0)).toEqual(shortestArcMidpoint(0, 180));
  });

  it("T5 10°/190° → 100°, alternatif 280°", () => {
    const m = shortestArcMidpoint(10, 190);
    close(m.lon, 100);
    expect(m.isOppositionAmbiguous).toBe(true);
    close(m.alternateMidpoint!, 280);
  });

  it("T6 190°/10° ters sıra aynı sonucu verir", () => {
    expect(shortestArcMidpoint(190, 10)).toEqual(shortestArcMidpoint(10, 190));
  });

  it("T7 karşıtlık çevresinde iki yandan yaklaşım", () => {
    const left = shortestArcMidpoint(0, 179.99);
    const right = shortestArcMidpoint(0, 180.01);
    close(left.lon, 89.995);
    close(right.lon, 270.005);
    expect(left.isOppositionAmbiguous).toBe(false);
    expect(right.isOppositionAmbiguous).toBe(false);
  });

  it("negatif ve 360+ girdiler normalize edilir", () => {
    close(shortestArcMidpoint(-10, 370).lon, 0);
  });
});

describe("dairesel yay", () => {
  it("T8 358° → 10° yayı 12° uzunlukta ve 0°'ı geçer", () => {
    const arc = makeArc(358, 12);
    close(arc.endLon, 10);
    close(arc.arcLength, 12);
    expect(arc.crossesZero).toBe(true);
  });

  it("yay içi denetim dairesel çalışır", () => {
    const arc = makeArc(358, 12);
    expect(isInArc(2, arc)).toBe(true);
    expect(isInArc(359, arc)).toBe(true);
    expect(isInArc(180, arc)).toBe(false);
    expect(isInArc(20, arc)).toBe(false);
  });

  it("composite yay yalnızca uçlara bakmaz; 180° dal atlamasını yakalar", () => {
    // A 170°→190° ilerlerken B 0°'da sabit: ayrılık 180°'den geçer.
    const a = Array.from({ length: 21 }, (_, i) => 170 + i);
    const r = compositeArc(a, [0], shortestArcMidpoint(180.5, 0).lon);
    expect(r.crossesOpp).toBe(true);
    expect(r.alternateArc).toBeDefined();
    // sürekli yol 10° genişliğinde olmalı, 180°+ sahte yay değil
    close(r.arc.arcLength, 10, 1e-6);
  });
});

const UTC = "UTC";
// 2024-01-16'da Ay gün içinde ≈357° → ≈11° ilerler (0° Koç geçişi).
const unknownJan16 = { date: "2024-01-16", time: null, timeZone: UTC, lat: 41, lon: 29 };

describe("calculateCompositePlanets", () => {
  it("iki saat de biliniyorsa kesin ve yaysız", () => {
    const r = calculateCompositePlanets(
      { date: "1990-05-10", time: "14:30", timeZone: "Europe/Istanbul", lat: 41, lon: 29 },
      { date: "1988-11-02", time: "08:15", timeZone: "Europe/Istanbul", lat: 39.9, lon: 32.8 },
    );
    for (const p of r.planets) {
      expect(p.isExact).toBe(true);
      expect(p.timeUnknown).toBe(false);
      expect(p.possibleArc).toBeUndefined();
      expect(p.referenceTimeUsed).toBeUndefined();
    }
    expect(r.planets).toHaveLength(11);
  });

  it("T9 bir kişi saatsiz: Ay yayı yarım günlük hareket kadar ve 0°'ı geçiyor", () => {
    // B tam 00:00 UTC — Ay ≈357°, A gün boyu ≈357°→11°
    const r = calculateCompositePlanets(unknownJan16, { ...unknownJan16, time: "00:00" });
    const moon = r.planets.find((p) => p.key === "Moon")!;
    expect(r.timeUnknownA).toBe(true);
    expect(r.timeUnknownB).toBe(false);
    expect(moon.isExact).toBe(false);
    expect(moon.referenceTimeUsed).toBe("12:00");
    expect(moon.possibleArc!.crossesZero).toBe(true);
    expect(moon.possibleArc!.arcLength).toBeGreaterThan(5.5);
    expect(moon.possibleArc!.arcLength).toBeLessThan(8);
    expect(isInArc(moon.lon, moon.possibleArc!)).toBe(true);
    expect(isInArc(0, moon.possibleArc!)).toBe(true);
    expect(moon.arcCrossesOpposition).toBe(false);
  });

  it("T10/T11 iki kişi saatsiz: tam günlük Ay yayı, 0° geçişi, 300°+ sahte yay yok", () => {
    const r = calculateCompositePlanets(unknownJan16, unknownJan16);
    const moon = r.planets.find((p) => p.key === "Moon")!;
    const arc = moon.possibleArc!;
    expect(arc.crossesZero).toBe(true);
    expect(arc.startLon).toBeGreaterThan(355);
    expect(arc.endLon).toBeLessThan(13);
    expect(arc.arcLength).toBeGreaterThan(11.8);
    expect(arc.arcLength).toBeLessThan(15.3);
    expect(moon.toleranceDeg).toBeLessThan(8);
  });

  it("gerçek günlük Ay hareketi sabit ±6° değildir (iki farklı gün farklı)", () => {
    const a = calculateCompositePlanets(unknownJan16, unknownJan16).planets[1].possibleArc!.arcLength;
    const d2 = { ...unknownJan16, date: "2024-01-30" };
    const b = calculateCompositePlanets(d2, d2).planets[1].possibleArc!.arcLength;
    expect(Math.abs(a - b)).toBeGreaterThan(0.3);
  });

  it("T13 saatsiz doğumda Ay dışı gezegenler de yaklaşık işaretlenir", () => {
    const r = calculateCompositePlanets(unknownJan16, { ...unknownJan16, date: "1990-05-10", time: "10:00" });
    const sun = r.planets.find((p) => p.key === "Sun")!;
    expect(sun.timeUnknown).toBe(true);
    expect(sun.isExact).toBe(false);
    expect(sun.referenceTimeUsed).toBe("12:00");
    expect(sun.toleranceDeg).toBeGreaterThan(0);
    expect(sun.toleranceDeg).toBeLessThan(0.6);
  });

  it("saat dilimi yoksa UTC'ye düşüldüğü işaretlenir", () => {
    const r = calculateCompositePlanets({ ...unknownJan16, timeZone: null }, unknownJan16);
    expect(r.timezoneFallback).toBe(true);
  });
});

function fake(key: CompositePlanet["key"], lon: number, extra: Partial<CompositePlanet> = {}): CompositePlanet {
  return {
    key, name: key, glyph: "", lon, sign: "", degreeInSign: 0,
    isOppositionAmbiguous: false, isExact: true, timeUnknown: false, toleranceDeg: 0, ...extra,
  };
}

describe("calculateCompositeAspects", () => {
  it("T14 45° / 135° → kare, orb 0", () => {
    const asp = calculateCompositeAspects([fake("Sun", 45), fake("Mars", 135)]);
    expect(asp).toHaveLength(1);
    expect(asp[0].type.name).toBe("Kare");
    close(asp[0].orb, 0);
    expect(asp[0].isApproximate).toBe(false);
  });

  it("0° / 120° → üçgen; Ay Düğümü dahil edilmez", () => {
    const asp = calculateCompositeAspects([fake("Sun", 0), fake("Moon", 120), fake("Node", 0)]);
    expect(asp).toHaveLength(1);
    expect(asp[0].type.name).toBe("Üçgen");
  });

  it("T12 180° belirsizliği açıya taşınır ve alternatif açı korunur", () => {
    const ven = fake("Venus", 90, { isOppositionAmbiguous: true, alternateMidpoint: 270 });
    const asp = calculateCompositeAspects([fake("Sun", 0), ven]);
    expect(asp[0].hasAmbiguousPlanet).toBe(true);
    expect(asp[0].type.name).toBe("Kare");
    expect(asp[0].alternate?.type.name).toBe("Kare");
  });

  it("saatsiz gezegenli açı yaklaşık işaretlenir ve sapma toplanır", () => {
    const asp = calculateCompositeAspects([
      fake("Sun", 0, { timeUnknown: true, isExact: false, toleranceDeg: 0.5 }),
      fake("Moon", 60, { timeUnknown: true, isExact: false, toleranceDeg: 6.5 }),
    ]);
    expect(asp[0].isApproximate).toBe(true);
    close(asp[0].maxOrbDeviation, 7);
  });
});

describe("calculateCompositeChart", () => {
  it("180° belirsizliği gerçek çıktıda kaybolmaz ve evler hesaplanmaz", () => {
    const c = calculateCompositeChart(unknownJan16, unknownJan16);
    expect(c.houses).toBeNull();
    expect(c.isExact).toBe(false);
    for (const p of c.planets) {
      if (p.isOppositionAmbiguous) expect(p.alternateMidpoint).toBeDefined();
    }
  });
});
