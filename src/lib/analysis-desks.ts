import { z } from "zod";

export const ANALYSIS_DESKS = ["ALTAIR", "VEGA", "SIRIUS"] as const;
export const analystCodeSchema = z.enum(ANALYSIS_DESKS);
export type AnalystCode = z.infer<typeof analystCodeSchema>;