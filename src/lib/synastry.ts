import { ASPECTS, type Chart, type PlanetKey } from "@/lib/astro";

export interface CrossAspect { a: PlanetKey; b: PlanetKey; aName: string; bName: string; type: (typeof ASPECTS)[number]; orb: number; weight: number }

// Harmony weights per aspect type: positive = supportive, negative = friction
const TYPE_SCORE: Record<string, number> = { Kavuşum: 1, Altmışlık: 0.8, Üçgen: 1, Kare: -0.7, Karşıt: -0.4 };
// Importance of planet pairs for relationships
const KEY_WEIGHT: Partial<Record<PlanetKey, number>> = { Sun: 3, Moon: 3, Venus: 3, Mars: 2.5, Mercury: 1.5, Jupiter: 1.2, Saturn: 1.5 };

export function crossAspects(A: Chart, B: Chart): CrossAspect[] {
  const out: CrossAspect[] = [];
  const pa = A.planets.filter((p) => p.key !== "Node");
  const pb = B.planets.filter((p) => p.key !== "Node");
  for (const x of pa) for (const y of pb) {
    const sep = Math.abs(((y.lon - x.lon + 540) % 360) - 180);
    for (const t of ASPECTS) {
      const orb = Math.abs(sep - t.angle);
      if (orb <= t.orb - 1) {
        const w = (KEY_WEIGHT[x.key] ?? 0.6) * (KEY_WEIGHT[y.key] ?? 0.6) * (1 - orb / t.orb);
        out.push({ a: x.key, b: y.key, aName: x.name, bName: y.name, type: t, orb, weight: w });
      }
    }
  }
  return out.sort((p, q) => q.weight - p.weight);
}

/** 0-100 compatibility score: 50 is neutral; supportive aspects raise, frictional lower. */
export function compatibilityScore(aspects: CrossAspect[]): number {
  let s = 0;
  for (const a of aspects) {
    let t = TYPE_SCORE[a.type.name] ?? 0;
    // Saturn conjunctions feel heavy rather than sweet
    if (a.type.name === "Kavuşum" && (a.a === "Saturn" || a.b === "Saturn")) t = -0.3;
    s += t * a.weight;
  }
  return Math.max(0, Math.min(100, Math.round(50 + s * 2)));
}

const THEMES: Partial<Record<PlanetKey, string>> = {
  Sun: "kimlik", Moon: "duygular", Mercury: "iletişim", Venus: "sevgi", Mars: "tutku",
  Jupiter: "büyüme", Saturn: "bağlılık", Uranus: "özgürlük", Neptune: "hayaller", Pluto: "dönüşüm",
};

export function crossText(a: CrossAspect): string {
  const t1 = THEMES[a.a] ?? a.aName, t2 = THEMES[a.b] ?? a.bName;
  const n = a.type.name;
  if (n === "Üçgen" || n === "Altmışlık") return `Sizin ${t1} alanınız ile onun ${t2} alanı kolayca uyum sağlıyor.`;
  if (n === "Kare") return `Sizin ${t1} ile onun ${t2} alanı sürtüşme yaratabilir; sabır büyütür.`;
  if (n === "Karşıt") return `${t1} ve ${t2} karşılıklı çekim ve denge arayışı içinde.`;
  return `${t1} ve ${t2} güçlü biçimde birleşiyor; yoğun ve belirgin bir bağ.`;
}
