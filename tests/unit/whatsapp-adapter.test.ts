import { describe, it, expect } from "vitest";
import { WhatsAppAdapter } from "@/lib/notifications";

describe("WhatsApp Adapter & Message Templates", () => {
  it("formats Egyptian mobile numbers with country prefix 20", () => {
    const link = WhatsAppAdapter.createWaMeLink("01012345678", "مرحباً");
    expect(link).toContain("https://wa.me/201012345678");
    expect(link).toContain(encodeURIComponent("مرحباً"));
  });

  it("handles numbers already prefixed with 20", () => {
    const link = WhatsAppAdapter.createWaMeLink("+201123456789", "اختبار");
    expect(link).toContain("https://wa.me/201123456789");
  });

  it("generates correct RFQ_MATCH template in Arabic", () => {
    const text = WhatsAppAdapter.formatMessage("RFQ_MATCH", {
      productType: "تيشيرت بولو",
      quantity: 500,
      url: "https://texlink-egypt.com/rfqs/123",
    });

    expect(text).toContain("TexLink Egypt");
    expect(text).toContain("تيشيرت بولو");
    expect(text).toContain("500 قطعة");
    expect(text).toContain("https://texlink-egypt.com/rfqs/123");
  });

  it("generates correct QUOTE_ACCEPTED template with order number", () => {
    const text = WhatsAppAdapter.formatMessage("QUOTE_ACCEPTED", {
      orderNumber: "ORD-2026-99999",
      totalAmount: 45000,
    });

    expect(text).toContain("مبروك");
    expect(text).toContain("ORD-2026-99999");
    expect(text).toContain("45000");
  });
});
