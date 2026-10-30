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
