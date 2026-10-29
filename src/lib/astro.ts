import * as Astronomy from "astronomy-engine";

export const SIGNS = [
  "Koç", "Boğa", "İkizler", "Yengeç", "Aslan", "Başak",
  "Terazi", "Akrep", "Yay", "Oğlak", "Kova", "Balık",
] as const;
export const SIGN_GLYPHS = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];

export type PlanetKey =
  | "Sun" | "Moon" | "Mercury" | "Venus" | "Mars" | "Jupiter" | "Saturn" | "Uranus" | "Neptune" | "Pluto" | "Node";

export const PLANETS: { key: PlanetKey; name: string; glyph: string }[] = [
  { key: "Sun", name: "Güneş", glyph: "☉" },
  { key: "Moon", name: "Ay", glyph: "☽" },
  { key: "Mercury", name: "Merkür", glyph: "☿" },
  { key: "Venus", name: "Venüs", glyph: "♀" },
  { key: "Mars", name: "Mars", glyph: "♂" },
  { key: "Jupiter", name: "Jüpiter", glyph: "♃" },
  { key: "Saturn", name: "Satürn", glyph: "♄" },
  { key: "Uranus", name: "Uranüs", glyph: "♅" },
  { key: "Neptune", name: "Neptün", glyph: "♆" },
  { key: "Pluto", name: "Plüton", glyph: "♇" },
  { key: "Node", name: "Kuzey Ay Düğümü", glyph: "☊" },
];

/** Traditional (classical) sign rulers, used for horary. */
export const TRAD_RULER: PlanetKey[] = [
  "Mars", "Venus", "Mercury", "Moon", "Sun", "Mercury",
  "Venus", "Mars", "Jupiter", "Saturn", "Saturn", "Jupiter",
];

const rad = Math.PI / 180;
const deg = 180 / Math.PI;
export const norm = (x: number) => ((x % 360) + 360) % 360;

export function signOf(lon: number) {
  const l = norm(lon);
  const i = Math.floor(l / 30);
  return { index: i, name: SIGNS[i], glyph: SIGN_GLYPHS[i], degree: l - i * 30 };
}

export function formatDeg(lon: number) {
  const s = signOf(lon);
  const d = Math.floor(s.degree);
  const m = Math.floor((s.degree - d) * 60);
  return `${d}°${String(m).padStart(2, "0")}′ ${s.name}`;
}

function obliquity(date: Date) {
  const T = (date.getTime() / 86400000 + 2440587.5 - 2451545.0) / 36525;
  return 23.4392911 - 0.0130042 * T;
}

function planetLon(key: PlanetKey, date: Date): number {
  if (key === "Node") {
    const T = (date.getTime() / 86400000 + 2440587.5 - 2451545.0) / 36525;
    return norm(125.04452 - 1934.136261 * T);
  }
  const body = Astronomy.Body[key as keyof typeof Astronomy.Body];
  const vec = Astronomy.GeoVector(body, date, true);
  return norm(Astronomy.Ecliptic(vec).elon);
}

export interface Angles { asc: number; mc: number; ramc: number; eps: number }

export function angles(date: Date, lat: number, lon: number): Angles {
  const eps = obliquity(date);
  const ramc = norm(Astronomy.SiderealTime(date) * 15 + lon);
  const r = ramc * rad, e = eps * rad, p = lat * rad;
  const mc = norm(Math.atan2(Math.sin(r), Math.cos(r) * Math.cos(e)) * deg);
  const asc = norm(
    Math.atan2(Math.cos(r), -(Math.sin(r) * Math.cos(e) + Math.tan(p) * Math.sin(e))) * deg,
  );
  return { asc, mc, ramc, eps };
}

/** Placidus cusps (1..12, index 0 = cusp 1). Falls back to equal houses near the poles. */
export function placidus(a: Angles, lat: number): { cusps: number[]; system: "Placidus" | "Eşit" } {
  const e = a.eps * rad, p = lat * rad;
  const cuspFor = (f: number, above: boolean) => {
    let lam = norm(a.mc + (above ? f * 90 : 180 - f * 90));
    for (let i = 0; i < 30; i++) {
      const dec = Math.asin(Math.sin(e) * Math.sin(lam * rad));
      const x = -Math.tan(p) * Math.tan(dec);
      if (Math.abs(x) > 1) return NaN;
      const dsa = Math.acos(x) * deg;
      const ra = above ? a.ramc + f * dsa : a.ramc + 180 - f * (180 - dsa);
      const next = norm(Math.atan2(Math.sin(ra * rad), Math.cos(ra * rad) * Math.cos(e)) * deg);
      if (Math.abs(next - lam) < 1e-7) { lam = next; break; }
      lam = next;
    }
    return lam;
  };
  const c11 = cuspFor(1 / 3, true), c12 = cuspFor(2 / 3, true);
  const c2 = cuspFor(2 / 3, false), c3 = cuspFor(1 / 3, false);
  if ([c11, c12, c2, c3].some(Number.isNaN)) {
    return { cusps: Array.from({ length: 12 }, (_, i) => norm(a.asc + i * 30)), system: "Eşit" };
  }
  const c = [a.asc, c2, c3, norm(a.mc + 180), norm(c11 + 180), norm(c12 + 180),
    norm(a.asc + 180), norm(c2 + 180), norm(c3 + 180), a.mc, c11, c12];
  return { cusps: c, system: "Placidus" };
}

export function houseOf(lon: number, cusps: number[]) {
  for (let i = 0; i < 12; i++) {
    const start = cusps[i], end = cusps[(i + 1) % 12];
    const span = norm(end - start);
    if (norm(lon - start) < span) return i + 1;
  }
  return 1;
}

export interface PlanetPos {
  key: PlanetKey; name: string; glyph: string; lon: number; speed: number; retro: boolean; house: number;
}

export const ASPECTS = [
  { name: "Kavuşum", angle: 0, orb: 8, glyph: "☌" },
  { name: "Altmışlık", angle: 60, orb: 5, glyph: "⚹" },
  { name: "Kare", angle: 90, orb: 7, glyph: "□" },
  { name: "Üçgen", angle: 120, orb: 7, glyph: "△" },
  { name: "Karşıt", angle: 180, orb: 8, glyph: "☍" },
];

export interface Aspect { a: PlanetKey; b: PlanetKey; type: (typeof ASPECTS)[number]; orb: number; applying: boolean }

export function findAspects(planets: PlanetPos[], keys?: PlanetKey[]): Aspect[] {
  const list = planets.filter((p) => !keys || keys.includes(p.key)).filter((p) => p.key !== "Node");
  const out: Aspect[] = [];
  for (let i = 0; i < list.length; i++) {
    for (let j = i + 1; j < list.length; j++) {
      const A = list[i], B = list[j];
      const sep = Math.abs(((B.lon - A.lon + 540) % 360) - 180);
      for (const t of ASPECTS) {
        const extra = A.key === "Sun" || A.key === "Moon" || B.key === "Sun" || B.key === "Moon" ? 2 : 0;
        const orb = Math.abs(sep - t.angle);
        if (orb <= t.orb + extra) {
          const sepLater = Math.abs(((B.lon + B.speed * 0.01 - A.lon - A.speed * 0.01 + 540) % 360) - 180);
          const applying = Math.abs(sepLater - t.angle) < orb;
          out.push({ a: A.key, b: B.key, type: t, orb, applying });
        }
      }
    }
  }
  return out.sort((x, y) => x.orb - y.orb);
}

export interface Chart {
  date: Date; lat: number; lon: number; angles: Angles; cusps: number[]; houseSystem: string;
  planets: PlanetPos[]; aspects: Aspect[];
}

export function computeChart(date: Date, lat: number, lon: number): Chart {
  const a = angles(date, lat, lon);
  const { cusps, system } = placidus(a, lat);
  const later = new Date(date.getTime() + 86400000);
  const planets: PlanetPos[] = PLANETS.map((p) => {
    const l = planetLon(p.key, date);
    const l2 = planetLon(p.key, later);
    const speed = ((l2 - l + 540) % 360) - 180; // degrees/day
    return { ...p, lon: l, speed, retro: p.key !== "Node" && speed < 0, house: houseOf(l, cusps) };
  });
  return { date, lat, lon, angles: a, cusps, houseSystem: system, planets, aspects: findAspects(planets) };
}

/** Rising-sign windows for one calendar day (useful when birth time is unknown). */
export function risingTimeline(dayStartUtc: Date, lat: number, lon: number) {
  const windows: { signIndex: number; start: Date; end: Date }[] = [];
  let cur = signOf(angles(dayStartUtc, lat, lon).asc).index;
  let start = dayStartUtc;
  for (let m = 2; m <= 24 * 60; m += 2) {
    const t = new Date(dayStartUtc.getTime() + m * 60000);
    const idx = signOf(angles(t, lat, lon).asc).index;
    if (idx !== cur || m === 24 * 60) {
      windows.push({ signIndex: cur, start, end: t });
      cur = idx;
      start = t;
    }
  }
  return windows;
}

/** Does the Moon perfect a Ptolemaic aspect to a classical planet before leaving its sign? */
export function moonVoidOfCourse(date: Date): { voc: boolean; nextAspect?: string; signChangeHours: number } {
  const classical: PlanetKey[] = ["Sun", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"];
  const startSign = signOf(planetLon("Moon", date)).index;
  for (let h = 0.5; h <= 72; h += 0.5) {
    const t = new Date(date.getTime() + h * 3600000);
    const moon = planetLon("Moon", t);
    if (signOf(moon).index !== startSign) return { voc: true, signChangeHours: h };
    const prevT = new Date(t.getTime() - 1800000);
    const prevMoon = planetLon("Moon", prevT);
    for (const k of classical) {
      const pl = planetLon(k, t), plPrev = planetLon(k, prevT);
      for (const asp of ASPECTS) {
        const d1 = (((moon - pl + 540) % 360) - 180);
        const d0 = (((prevMoon - plPrev + 540) % 360) - 180);
        for (const target of asp.angle === 0 || asp.angle === 180 ? [asp.angle] : [asp.angle, -asp.angle]) {
          const f1 = target === 180 ? Math.abs(d1) - 180 : d1 - target;
          const f0 = target === 180 ? Math.abs(d0) - 180 : d0 - target;
          if (f0 * f1 <= 0 && Math.abs(f1 - f0) < 10) {
            const name = PLANETS.find((p) => p.key === k)!.name;
            return { voc: false, nextAspect: `${name} ile ${asp.name}`, signChangeHours: h };
          }
        }
      }
    }
  }
  return { voc: false, signChangeHours: 72 };
}
