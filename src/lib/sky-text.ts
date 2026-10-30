import type { Aspect, PlanetKey } from "./astro";

export const PLANET_THEME: Record<PlanetKey, string> = {
  Sun: "kimlik ve irade",
  Moon: "duygular ve ihtiyaçlar",
  Mercury: "iletişim ve düşünce",
  Venus: "ilişkiler ve keyif",
  Mars: "enerji ve cesaret",
  Jupiter: "büyüme ve şans",
  Saturn: "sorumluluk ve sınırlar",
  Uranus: "değişim ve sürprizler",
  Neptune: "sezgi ve hayaller",
  Pluto: "dönüşüm ve güç",
  Node: "kader yönü",
};

export const ASPECT_TONE: Record<string, { kind: "uyumlu" | "zorlayıcı" | "nötr"; verb: string }> = {
  Kavuşum: { kind: "nötr", verb: "birleşerek yoğunlaştırıyor" },
  Altmışlık: { kind: "uyumlu", verb: "fırsat kapısı açıyor" },
  Kare: { kind: "zorlayıcı", verb: "gerilim yaratıp harekete zorluyor" },
  Üçgen: { kind: "uyumlu", verb: "akıcı biçimde destekliyor" },
  Karşıt: { kind: "zorlayıcı", verb: "denge kurmayı gerektiriyor" },
};

export function aspectSentence(a: Aspect) {
  const tone = ASPECT_TONE[a.type.name];
  const when = a.applying ? "Etkisi güçleniyor." : "Etkisi azalıyor.";
  return `${PLANET_THEME[a.a]} ile ${PLANET_THEME[a.b]} arasında ${tone.verb}. ${when}`;
}

export function aspectStrength(orb: number) {
  if (orb <= 1) return "Tam";
  if (orb <= 3) return "Güçlü";
  return "Geniş";
}

const ADVICE_EASY: Record<PlanetKey, string> = {
  Sun: "kendinizi göstermek için uygun bir an, inisiyatif alın",
  Moon: "sevdiklerinizle vakit geçirin, içinizden geleni dinleyin",
  Mercury: "konuşmalar, yazışmalar ve anlaşmalar için verimli",
  Venus: "ilişkilere, güzelliğe ve keyfe zaman ayırın",
  Mars: "ertelediğiniz işlere enerjiyle girişin",
  Jupiter: "fırsatlara açık olun, büyük düşünün",
  Saturn: "kalıcı planlar yapın, düzen kurun",
  Uranus: "yeni fikirleri deneyin, rutini kırın",
  Neptune: "sezgilerinize güvenin, yaratıcı işlere yönelin",
  Pluto: "derin konularla yüzleşmek için güçlü bir zaman",
  Node: "hedefinize uygun adımlar atın",
};
const ADVICE_HARD: Record<PlanetKey, string> = {
  Sun: "ego çatışmalarından kaçının, inat etmeyin",
  Moon: "duygusal tepkiler yükselebilir, hemen karar vermeyin",
  Mercury: "fikir ayrılıkları olabilir, tartışmaya girmeyin; yazdıklarınızı iki kez kontrol edin",
  Venus: "ilişkilerde kırgınlık ve aşırı harcamaya dikkat",
  Mars: "sabırsızlık ve öfke artabilir, aceleci davranmayın",
  Jupiter: "abartıya ve fazla söz vermeye dikkat",
  Saturn: "engeller ve gecikmeler olabilir, sabırlı olun",
  Uranus: "ani değişikliklere hazırlıklı olun, riskli adımları erteleyin",
  Neptune: "kafa karışıklığı olabilir, önemli imzaları erteleyin",
  Pluto: "güç mücadelelerine girmeyin, kontrolü bırakın",
  Node: "eski alışkanlıklara dönmemeye çalışın",
};

const FAST: PlanetKey[] = ["Moon", "Mercury", "Venus", "Sun", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto", "Node"];

/** Günün enerjisi tavsiyesi — daha hızlı (kişisel) gezegene göre. */
export function aspectAdvice(a: Aspect) {
  const kind = ASPECT_TONE[a.type.name].kind;
  const p = FAST.indexOf(a.a) <= FAST.indexOf(a.b) ? a.a : a.b;
  const other = p === a.a ? a.b : a.a;
  if (kind === "uyumlu") return capital(ADVICE_EASY[p]) + ".";
  if (kind === "zorlayıcı") return capital(ADVICE_HARD[p]) + ".";
  return capital(ADVICE_EASY[p]) + `; ancak ${PLANET_THEME[other]} konusunda ölçülü olun.`;
}
const capital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Açının etkisinin kaç gün daha süreceği (orb dışına çıkana kadar). speeds: derece/gün */
export function aspectRemainingDays(a: Aspect, speedA: number, speedB: number) {
  const rel = Math.max(Math.abs(speedA - speedB), 0.005);
  const left = a.applying ? a.orb + a.type.orb : a.type.orb - a.orb;
  return Math.max(left, 0) / rel;
}

export function formatDuration(days: number, from: Date, timeZone: string) {
  const end = new Date(from.getTime() + days * 86400000);
  const label = days < 1 ? `yaklaşık ${Math.max(1, Math.round(days * 24))} saat` : days < 60 ? `yaklaşık ${Math.round(days)} gün` : `yaklaşık ${Math.round(days / 30)} ay`;
  const date = new Intl.DateTimeFormat("tr-TR", { timeZone, day: "numeric", month: "long", ...(days > 300 ? { year: "numeric" } : {}) }).format(end);
  return `${label} etkili (${date}'e kadar)`;
}
