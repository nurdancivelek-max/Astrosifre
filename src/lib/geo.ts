export interface Place { name: string; latitude: number; longitude: number; timezone: string }

export async function searchPlaces(q: string): Promise<Place[]> {
  if (q.trim().length < 2) return [];
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=6&language=tr&format=json`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const json = (await res.json()) as {
    results?: { name: string; admin1?: string; country?: string; latitude: number; longitude: number; timezone: string }[];
  };
  return (json.results ?? []).map((r) => ({
    name: [r.name, r.admin1, r.country].filter(Boolean).join(", "),
    latitude: r.latitude,
    longitude: r.longitude,
    timezone: r.timezone,
  }));
}

/** Offset in minutes of an IANA zone at a UTC instant. */
export function tzOffsetMinutes(utcMs: number, timeZone: string) {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
  const parts = Object.fromEntries(dtf.formatToParts(new Date(utcMs)).map((p) => [p.type, p.value]));
  const asUtc = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute, +parts.second);
  return Math.round((asUtc - utcMs) / 60000);
}

/** Convert wall-clock "YYYY-MM-DD" + "HH:MM" in an IANA zone to a UTC Date. */
export function localToUtc(date: string, time: string, timeZone: string): Date {
  const [y, mo, d] = date.split("-").map(Number);
  const [h, mi] = time.split(":").map(Number);
  const guess = Date.UTC(y, mo - 1, d, h, mi);
  let utc = guess - tzOffsetMinutes(guess, timeZone) * 60000;
  utc = guess - tzOffsetMinutes(utc, timeZone) * 60000;
  return new Date(utc);
}

export function formatInZone(d: Date, timeZone: string) {
  return new Intl.DateTimeFormat("tr-TR", { timeZone, hour: "2-digit", minute: "2-digit" }).format(d);
}
