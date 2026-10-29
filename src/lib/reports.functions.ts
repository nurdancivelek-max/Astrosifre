import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { REPORTS, deliverAfter } from "./report-rules";

const schema = z.object({
  email: z.string().trim().email().max(255),
  reportId: z.enum(["natal-ozet", "yillik-transit"]),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  placeName: z.string().min(1).max(200),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  timezone: z.string().min(1).max(64),
});

export const requestFreeReport = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => schema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // Simple abuse guard: one pending request per email + report type.
    const { count } = await supabaseAdmin
      .from("report_requests")
      .select("id", { count: "exact", head: true })
      .eq("email", data.email.toLowerCase())
      .eq("report_type", data.reportId)
      .eq("status", "queued");
    if ((count ?? 0) > 0) return { ok: false as const, error: "Bu rapor için zaten sırada bir talebiniz var." };

    const due = deliverAfter(data.reportId, new Date());
    const { error } = await supabaseAdmin.from("report_requests").insert({
      email: data.email.toLowerCase(), report_type: data.reportId, tier: "free",
      birth_date: data.date, birth_time: data.time, place_name: data.placeName,
      latitude: data.latitude, longitude: data.longitude, timezone: data.timezone,
      deliver_after: due.toISOString(),
    });
    if (error) return { ok: false as const, error: "Talep kaydedilemedi, lütfen tekrar deneyin." };
    const { count: queue } = await supabaseAdmin
      .from("report_requests").select("id", { count: "exact", head: true }).eq("status", "queued");
    return { ok: true as const, deliverAfter: due.toISOString(), title: REPORTS.find((r) => r.id === data.reportId)!.title, queue: queue ?? 1 };
  });
