export const REPORTS = [
  { id: "natal-ozet", title: "Doğum Haritası Özeti", tier: "free", delayHours: 48, text: "Güneş, Ay, yükselen ve öne çıkan açılarınızın özeti." },
  { id: "yillik-transit", title: "Yıllık Transit Özeti", tier: "free", delayHours: 168, text: "Önümüzdeki 12 ayın önemli gezegen geçişleri." },
  { id: "detayli-natal", title: "Detaylı Doğum Haritası Raporu", tier: "paid", delayHours: 0, text: "Tüm gezegenler, evler ve açılar için kapsamlı yorum." },
  { id: "iliski-uyumu", title: "İlişki Uyumu (Sinastri)", tier: "paid", delayHours: 0, text: "İki haritanın karşılaştırmalı analizi." },
] as const;

export type ReportId = (typeof REPORTS)[number]["id"];

/** When a request becomes due: free reports wait in a queue, paid ones are immediate. */
export function deliverAfter(reportId: ReportId, requestedAt: Date): Date {
  const r = REPORTS.find((x) => x.id === reportId)!;
  return new Date(requestedAt.getTime() + r.delayHours * 3600000);
}
