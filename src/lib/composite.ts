/**
 * "Bizden Ne Olur?" — Composite matematik motoru (1. aşama).
 *
 * Kapsam: en kısa yay orta noktası, 180° belirsizlik yönetimi, composite gezegen
 * orta noktaları, saatsiz doğumlar için dairesel olası aralıklar ve majör açılar.
 * Evler / ASC / MC bu aşamada bilinçli olarak hesaplanmaz.
 *
 * Mevcut astro.ts ve geo.ts yalnızca okunur; hiçbir fonksiyonu değiştirilmez.
 */
import { ASPECTS, PLANETS, computeChart, norm, signOf, type PlanetKey } from "@/lib/astro";
import { localToUtc } from "@/lib/geo";

const EPS = 1e-6;

/* ───────────────────────── Orta nokta ───────────────────────── */

export interface MidpointResult {
  lon: number;
  isOppositionAmbiguous: boolean;
  alternateMidpoint?: number;
}

/**
 * İki boylamın en kısa yay orta noktası. Parametre sırasından bağımsızdır.
 * Tam 180° karşıtlıkta iki eşdeğer orta nokta vardır; deterministik kural olarak
 * birincil = küçük boylam + 90°, alternatif = küçük boylam + 270° döner ve
 * belirsizlik bayrağı işaretlenir. Bu bir astrolojik standart değil, tekrarlanabilirlik
 * için seçilmiş bir kuraldır; iki uç da eşit ağırlıktadır.
 */
export function shortestArcMidpoint(lon1: number, lon2: number): MidpointResult {
  const l1 = norm(lon1);
  const l2 = norm(lon2);
  const lMin = Math.min(l1, l2);
  const lMax = Math.max(l1, l2);
  const diff = lMax - lMin;
  if (Math.abs(diff - 180) < EPS) {
    return { lon: norm(lMin + 90), isOppositionAmbiguous: true, alternateMidpoint: norm(lMin + 270) };
  }
  if (diff < 180) return { lon: norm(lMin + diff / 2), isOppositionAmbiguous: false };
  return { lon: norm(lMax + (360 - diff) / 2), isOppositionAmbiguous: false };
}

/* ───────────────────────── Dairesel yay ───────────────────────── */

export interface CircularArc {
  /** Yayın saat yönünün tersine (zodyak yönünde) başlangıcı [0,360). */
  startLon: number;
  /** Yayın bitişi [0,360). */
  endLon: number;
  /** Zodyak yönünde yay uzunluğu (derece). */
  arcLength: number;
  /** Yay 0° Koç noktasından geçiyor mu (ör. 358° → 10°). */
  crossesZero: boolean;
}

export function makeArc(startLon: number, arcLength: number): CircularArc {
  const s = norm(startLon);
  const len = Math.max(0, arcLength);
  return { startLon: s, endLon: norm(s + len), arcLength: len, crossesZero: s + len >= 360 - EPS && len > 0 };
}

/** Yönlü yay içi denetim: norm(L - start) <= arcLength. */
export function isInArc(lon: number, arc: CircularArc): boolean {
  return norm(lon - arc.startLon) <= arc.arcLength + EPS;
}

/** Bir referansa göre işaretli en kısa fark (-180, 180]. */
function signedDelta(lon: number, ref: number) {
  let d = norm(lon - ref);
  if (d > 180) d -= 360;
  return d;
}

/* ───────────────────────── Doğum verisi ───────────────────────── */

export interface BirthInput {
  /** Yerel tarih "YYYY-MM-DD" */
  date: string;
  /** Yerel saat "HH:MM"; bilinmiyorsa boş bırakılır. */
  time?: string | null;
  /** IANA saat dilimi (ör. "Europe/Istanbul"). Tarihsel yaz/kış saati Intl tzdb ile çözülür. */
  timeZone?: string | null;
  lat: number;
  lon: number;
}

export const REFERENCE_TIME = "12:00" as const;
const SAMPLES = 25; // gün içi örnek sayısı (her ~1 saat)

function toUtc(b: BirthInput, time: string): { date: Date; fallback: boolean } {
  if (b.timeZone) {
    try {
      return { date: localToUtc(b.date, time, b.timeZone), fallback: false };
    } catch {
      /* geçersiz saat dilimi → UTC'ye düş */
    }
  }
  const [y, mo, d] = b.date.split("-").map(Number);
  const [h, mi] = time.split(":").map(Number);
  return { date: new Date(Date.UTC(y, mo - 1, d, h, mi)), fallback: true };
}

type Lons = Record<PlanetKey, number>;

function lonsAt(date: Date, b: BirthInput): Lons {
  const out = {} as Lons;
  for (const p of computeChart(date, b.lat, b.lon).planets) out[p.key] = p.lon;
  return out;
}

interface PersonSamples {
  hasTime: boolean;
  timezoneFallback: boolean;
  nominal: Lons;
  /** Saat biliniyorsa tek örnek; bilinmiyorsa yerel 00:00 → 23:59 arası örnekler. */
  samples: Lons[];
}

function samplePerson(b: BirthInput): PersonSamples {
  const hasTime = !!b.time && /^\d{1,2}:\d{2}$/.test(b.time);
  if (hasTime) {
    const t = toUtc(b, b.time!);
    const l = lonsAt(t.date, b);
    return { hasTime, timezoneFallback: t.fallback, nominal: l, samples: [l] };
  }
  const ref = toUtc(b, REFERENCE_TIME);
  const start = toUtc(b, "00:00").date.getTime();
  const end = toUtc(b, "23:59").date.getTime();
  const samples: Lons[] = [];
  for (let i = 0; i < SAMPLES; i++) {
    samples.push(lonsAt(new Date(start + ((end - start) * i) / (SAMPLES - 1)), b));
  }
  return { hasTime, timezoneFallback: ref.fallback, nominal: lonsAt(ref.date, b), samples };
}

/* ───────────────────────── Composite gezegenler ───────────────────────── */

export interface CompositePlanet {
  key: PlanetKey;
  name: string;
  glyph: string;
  lon: number;
  sign: string;
  degreeInSign: number;

  isOppositionAmbiguous: boolean;
  alternateMidpoint?: number;
  alternateSign?: string;
  alternateDegreeInSign?: number;

  isExact: boolean;
  timeUnknown: boolean;
  referenceTimeUsed?: typeof REFERENCE_TIME;
  /** Olası sapma: nominal değerden yay uçlarına en büyük uzaklık. */
  toleranceDeg: number;
  /** Saat bilinmiyorsa composite yerleşimin gün içinde alabileceği dairesel aralık. */
  possibleArc?: CircularArc;
  /** Olası aralık içinde iki doğum boylamı tam 180° karşıtlıktan geçiyor mu. */
  arcCrossesOpposition?: boolean;
  /** Karşıtlık geçişinde en kısa yay kuralının seçeceği simetrik (antipodal) aralık. */
  alternateArc?: CircularArc;
}

export interface CompositeChart {
  planets: CompositePlanet[];
  aspects: CompositeAspect[];
  isExact: boolean;
  timeUnknownA: boolean;
  timeUnknownB: boolean;
  timezoneFallback: boolean;
  houses: null; // bilinçli olarak bu aşamada hesaplanmaz
}

/**
 * Bir gezegen için composite olası yayı: A ve B örneklerinin tüm çiftleri taranır
 * (iki kişi de saatsizse 2 boyutlu ızgara). Her çiftin orta noktası, nominal
 * değere en yakın daldan (m ya da m+180) sürekli biçimde açılır; böylece yalnızca
 * başlangıç/bitiş noktalarına bakılmaz ve 180° dal atlamaları yanlış yay üretmez.
 */
function compositeArc(aSamples: number[], bSamples: number[], nominal: number) {
  let lo = 0, hi = 0, crossesOpp = false;
  const nominalBranch = shortestArcMidpoint(aSamples[0], bSamples[0]);
  void nominalBranch;
  for (const a of aSamples) for (const b of bSamples) {
    const m = shortestArcMidpoint(a, b);
    const d1 = signedDelta(m.lon, nominal);
    const d2 = signedDelta(m.lon + 180, nominal);
    const cont = Math.abs(d1) <= Math.abs(d2) ? d1 : d2;
    // En kısa yay kuralı sürekli daldan farklı tarafa düştüyse karşıtlık geçişi var
    if (m.isOppositionAmbiguous || Math.abs(d1) > Math.abs(d2) + EPS) crossesOpp = true;
    if (cont < lo) lo = cont;
    if (cont > hi) hi = cont;
  }
  const arc = makeArc(nominal + lo, hi - lo);
  return {
    arc,
    tolerance: Math.max(-lo, hi),
    crossesOpp,
    alternateArc: crossesOpp ? makeArc(nominal + lo + 180, hi - lo) : undefined,
  };
}

export function calculateCompositePlanets(personA: BirthInput, personB: BirthInput) {
  const A = samplePerson(personA);
  const B = samplePerson(personB);
  const timeUnknown = !A.hasTime || !B.hasTime;

  const planets: CompositePlanet[] = PLANETS.map((p) => {
    const mid = shortestArcMidpoint(A.nominal[p.key], B.nominal[p.key]);
    const s = signOf(mid.lon);
    const cp: CompositePlanet = {
      key: p.key, name: p.name, glyph: p.glyph,
      lon: mid.lon, sign: s.name, degreeInSign: s.degree,
      isOppositionAmbiguous: mid.isOppositionAmbiguous,
      isExact: !timeUnknown,
      timeUnknown,
      toleranceDeg: 0,
    };
    if (mid.alternateMidpoint !== undefined) {
      const as = signOf(mid.alternateMidpoint);
      cp.alternateMidpoint = mid.alternateMidpoint;
      cp.alternateSign = as.name;
      cp.alternateDegreeInSign = as.degree;
    }
    if (timeUnknown) {
      cp.referenceTimeUsed = REFERENCE_TIME;
      const r = compositeArc(A.samples.map((x) => x[p.key]), B.samples.map((x) => x[p.key]), mid.lon);
      cp.possibleArc = r.arc;
      cp.toleranceDeg = r.tolerance;
      cp.arcCrossesOpposition = r.crossesOpp;
      if (r.alternateArc) cp.alternateArc = r.alternateArc;
    }
    return cp;
  });

  return {
    planets,
    timeUnknownA: !A.hasTime,
    timeUnknownB: !B.hasTime,
    timezoneFallback: A.timezoneFallback || B.timezoneFallback,
  };
}

/* ───────────────────────── Majör açılar ───────────────────────── */

export interface CompositeAspect {
  a: PlanetKey;
  b: PlanetKey;
  type: (typeof ASPECTS)[number];
  orb: number;
  isApproximate: boolean;
  /** Saat belirsizliğinden doğan en büyük orb sapması. */
  maxOrbDeviation: number;
  hasAmbiguousPlanet: boolean;
  /** Belirsiz gezegen alternatif orta noktasına göre oluşan açı (varsa). */
  alternate?: { type: (typeof ASPECTS)[number]; orb: number } | null;
}

function aspectBetween(l1: number, l2: number) {
  const sep = Math.abs(((l2 - l1 + 540) % 360) - 180);
  let best: { type: (typeof ASPECTS)[number]; orb: number } | null = null;
  for (const t of ASPECTS) {
    const orb = Math.abs(sep - t.angle);
    if (orb <= t.orb && (!best || orb < best.orb)) best = { type: t, orb };
  }
  return best;
}

/** Composite gezegenler arası majör açılar (Ay Düğümü hariç, astro.ts orbları). */
export function calculateCompositeAspects(planets: CompositePlanet[]): CompositeAspect[] {
  const list = planets.filter((p) => p.key !== "Node");
  const out: CompositeAspect[] = [];
  for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
    const A = list[i], B = list[j];
    const hit = aspectBetween(A.lon, B.lon);
    const ambiguous = A.isOppositionAmbiguous || B.isOppositionAmbiguous;
    let alternate: CompositeAspect["alternate"];
    if (ambiguous) {
      alternate = aspectBetween(A.alternateMidpoint ?? A.lon, B.alternateMidpoint ?? B.lon);
    }
    if (!hit && !(ambiguous && alternate)) continue;
    const base = hit ?? alternate!;
    out.push({
      a: A.key, b: B.key, type: base.type, orb: base.orb,
      isApproximate: A.timeUnknown || B.timeUnknown,
      maxOrbDeviation: A.toleranceDeg + B.toleranceDeg,
      hasAmbiguousPlanet: ambiguous,
      ...(ambiguous ? { alternate: alternate ?? null } : {}),
    });
  }
  return out.sort((x, y) => x.orb - y.orb);
}

export function calculateCompositeChart(personA: BirthInput, personB: BirthInput): CompositeChart {
  const r = calculateCompositePlanets(personA, personB);
  return {
    planets: r.planets,
    aspects: calculateCompositeAspects(r.planets),
    isExact: !r.timeUnknownA && !r.timeUnknownB,
    timeUnknownA: r.timeUnknownA,
    timeUnknownB: r.timeUnknownB,
    timezoneFallback: r.timezoneFallback,
    houses: null,
  };
}

/** Test edilebilirlik için: verilen örnek boylamlardan composite yay. */
export const __compositeArcForTest = compositeArc;
