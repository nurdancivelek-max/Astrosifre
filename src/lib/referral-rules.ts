/** Browser-safe referral rules shared by UI, server and tests. */
export const REFERRALS_FOR_EARLY_ACCESS = 3;
export const REF_STORAGE_KEY = "astrosifre_ref";

export function isValidRefCode(code: string): boolean {
  return /^[a-z0-9]{6,12}$/.test(code);
}

export function hasEarlyAccess(count: number): boolean {
  return count >= REFERRALS_FOR_EARLY_ACCESS;
}

export function remainingInvites(count: number): number {
  return Math.max(0, REFERRALS_FOR_EARLY_ACCESS - count);
}
