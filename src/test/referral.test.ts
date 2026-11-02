import { describe, expect, it } from "vitest";
import { hasEarlyAccess, isValidRefCode, remainingInvites } from "@/lib/referral-rules";
describe("referral rules", () => {
  it("3 invites unlock early access", () => { expect(hasEarlyAccess(2)).toBe(false); expect(hasEarlyAccess(3)).toBe(true); });
  it("remaining never negative", () => { expect(remainingInvites(1)).toBe(2); expect(remainingInvites(5)).toBe(0); });
  it("rejects bad codes", () => { expect(isValidRefCode("abc")).toBe(false); expect(isValidRefCode("ab3k9mnp")).toBe(true); });
});
