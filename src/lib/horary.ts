import { PLANETS, TRAD_RULER, findAspects, moonVoidOfCourse, signOf, type Chart, type PlanetKey } from "./astro";

export const QUESTION_TYPES = [
  { id: "relationship", label: "İlişki / evlilik", house: 7 },
  { id: "money", label: "Para / kayıp eşya", house: 2 },
  { id: "career", label: "İş / kariyer", house: 10 },
  { id: "job", label: "Günlük iş / sağlık", house: 6 },
  { id: "home", label: "Ev / taşınma", house: 4 },
  { id: "travel", label: "Seyahat / eğitim", house: 9 },
  { id: "friends", label: "Dilek / arkadaş", house: 11 },
] as const;

const name = (k: PlanetKey) => PLANETS.find((p) => p.key === k)!.name;

export interface HoraryResult {
  querent: PlanetKey; quesited: PlanetKey; quesitedHouse: number;
  verdict: "olumlu" | "olumsuz" | "belirsiz"; reasons: string[]; cautions: string[];
}

export function judgeHorary(chart: Chart, house: number): HoraryResult {
  const reasons: string[] = [], cautions: string[] = [];
  const ascSign = signOf(chart.angles.asc);
  const querent = TRAD_RULER[ascSign.index];
  const quesited = TRAD_RULER[signOf(chart.cusps[house - 1]).index];

  if (ascSign.degree < 3) cautions.push("Yükselen çok erken derecede: soru için henüz erken olabilir.");
  if (ascSign.degree > 27) cautions.push("Yükselen çok geç derecede: mesele zaten büyük ölçüde belirlenmiş olabilir.");
  const saturn = chart.planets.find((p) => p.key === "Saturn")!;
  if (saturn.house === 7) cautions.push("Satürn 7. evde: yorumcunun yargısı zorlanabilir (klasik uyarı).");
  const voc = moonVoidOfCourse(chart.date);
  if (voc.voc) cautions.push(`Ay boşta (void of course): burcunu değiştirmeden önce hiçbir açı yapmıyor — klasik yorumda "hiçbir şey olmaz".`);
  else if (voc.nextAspect) reasons.push(`Ay'ın burcunu terk etmeden önceki ilk açısı: ${voc.nextAspect}.`);

  let score = 0;
  if (querent === quesited) {
    reasons.push(`Soran ve sorulan aynı gezegen (${name(querent)}) tarafından yönetiliyor — güçlü bir bağ.`);
    score += 1;
  } else {
    const asp = findAspects(chart.planets, [querent, quesited])[0];
    if (asp && asp.applying) {
      const good = asp.type.angle === 60 || asp.type.angle === 120 || asp.type.angle === 0;
      reasons.push(`${name(asp.a)} ile ${name(asp.b)} arasında uygulayan ${asp.type.name} (${asp.orb.toFixed(1)}°): ${good ? "mesele kolaylıkla gerçekleşmeye yöneliyor" : "gerçekleşebilir ama zorluk ve çaba ile"}.`);
      score += good ? 2 : asp.type.angle === 90 ? 0.5 : -0.5;
    } else if (asp) {
      reasons.push(`${name(asp.a)} ile ${name(asp.b)} arasındaki ${asp.type.name} ayrılıyor: fırsat geçmiş olabilir.`);
      score -= 1;
    } else {
      reasons.push(`${name(querent)} (siz) ile ${name(quesited)} (sorulan) arasında açı yok.`);
      score -= 0.5;
    }
  }
  const moonAsp = findAspects(chart.planets, ["Moon", quesited]).find((a) => a.applying);
  if (moonAsp && quesited !== "Moon") {
    reasons.push(`Ay, sorulanın yöneticisine uygulayan ${moonAsp.type.name} yapıyor — olayları taşıyabilir.`);
    score += moonAsp.type.angle === 90 || moonAsp.type.angle === 180 ? 0.25 : 1;
  }
  const qr = chart.planets.find((p) => p.key === querent)!;
  const qd = chart.planets.find((p) => p.key === quesited)!;
  if (qr.retro) cautions.push(`${name(querent)} retro: soran fikir değiştirebilir.`);
  if (qd.retro) cautions.push(`${name(quesited)} retro: sorulan konu geri dönüş veya gecikme gösterebilir.`);
  if (voc.voc) score -= 1.5;

  const verdict = score >= 1.5 ? "olumlu" : score <= -0.5 ? "olumsuz" : "belirsiz";
  return { querent, quesited, quesitedHouse: house, verdict, reasons, cautions };
}
