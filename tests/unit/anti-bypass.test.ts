import { describe, it, expect } from "vitest";
import { sanitizeMessageContent } from "@/lib/anti-bypass/sanitizer";

describe("Anti-Bypass Egyptian Contact Filter", () => {
  it("allows normal discussion text with zero masking", () => {
    const input = "السلام عليكم، نريد معرفة هل متوفر خامة قطن مشط 100% بلون كحلي؟";
    const result = sanitizeMessageContent(input, false);
    expect(result.containsContactInfo).toBe(false);
    expect(result.cleanText).toBe(input);
  });

  it("detects and masks standard Egyptian 010 mobile numbers", () => {
    const input = "كلمني على الرقم ده 01012345678 للتفاصيل";
    const result = sanitizeMessageContent(input, false);
    expect(result.containsContactInfo).toBe(true);
    expect(result.detectedTypes).toContain("PHONE_NUMBER");
    expect(result.cleanText).not.toContain("01012345678");
    expect(result.cleanText).toContain("[تم حجب بيانات التواصل لحماية المعاملة");
  });

  it("detects and masks Egyptian numbers with +20 international prefix", () => {
    const input = "تواصل معي عبر الواتساب +201123456789";
    const result = sanitizeMessageContent(input, false);
    expect(result.containsContactInfo).toBe(true);
    expect(result.cleanText).not.toContain("+201123456789");
  });

  it("detects spaced-out phone numbers used to evade filters", () => {
    const input = "رقمي هو 0 1 2 3 4 5 6 7 8 9 0";
    const result = sanitizeMessageContent(input, false);
    expect(result.containsContactInfo).toBe(true);
    expect(result.cleanText).not.toContain("0 1 2");
  });

  it("detects and masks email addresses and external URLs", () => {
    const input = "راسلنا على info@factory.com أو زر موقعنا https://external-deal.com";
    const result = sanitizeMessageContent(input, false);
    expect(result.containsContactInfo).toBe(true);
    expect(result.detectedTypes).toContain("EMAIL");
    expect(result.detectedTypes).toContain("URL");
    expect(result.cleanText).not.toContain("info@factory.com");
    expect(result.cleanText).not.toContain("https://external-deal.com");
  });

  it("leaves all contact details intact when isContactAllowed is true (post-acceptance)", () => {
    const input = "رقم الهاتف 01012345678 والموقع www.factory.com";
    const result = sanitizeMessageContent(input, true);
    expect(result.containsContactInfo).toBe(false);
    expect(result.cleanText).toBe(input);
  });
});
