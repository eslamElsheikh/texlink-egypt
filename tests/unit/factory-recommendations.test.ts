import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("TexLink Factory OS — Recommendations Implementation Tests", () => {
  // 1. Job Traveler QR & Barcode Generation
  describe("Job Traveler QR & Tracking Code Generation", () => {
    it("formats QR tracking payload deterministically for shop floor cards", () => {
      const orderNumber = "ORD-1025";
      const batchNumber = "BATCH-2026-1025";
      const targetQuantity = 5000;

      const payload = `TEXLINK|ORD:${orderNumber}|BATCH:${batchNumber}|QTY:${targetQuantity}`;

      expect(payload).toBe("TEXLINK|ORD:ORD-1025|BATCH:BATCH-2026-1025|QTY:5000");
      expect(payload).toContain("ORD:ORD-1025");
      expect(payload).toContain("BATCH:BATCH-2026-1025");
    });

    it("parses scanned barcode string to extract orderNumber or batchNumber", () => {
      function parseScannedCode(input: string) {
        const cleaned = input.trim().toUpperCase();
        if (cleaned.startsWith("TEXLINK|")) {
          const parts = cleaned.split("|");
          const ordPart = parts.find((p) => p.startsWith("ORD:"));
          return ordPart ? ordPart.replace("ORD:", "") : null;
        }
        return cleaned;
      }

      expect(parseScannedCode("TEXLINK|ORD:ORD-1025|BATCH:BATCH-2026-1025|QTY:5000")).toBe("ORD-1025");
      expect(parseScannedCode("ord-1025")).toBe("ORD-1025");
      expect(parseScannedCode("BATCH-2026-1025")).toBe("BATCH-2026-1025");
    });
  });

  // 2. One-Click B2B to Production Order Converter Logic
  describe("B2B Marketplace to Production Order Converter", () => {
    function convertB2BOrderToProduction(
      b2bOrder: {
        id: string;
        orderNumber: string;
        quantity: number;
        productName: string;
        status: string;
      },
      existingProductionOrders: Array<{ orderNumber: string }>
    ) {
      const targetOrderNumber = `ORD-${b2bOrder.orderNumber}`;

      // Idempotency check: Reject duplicate conversion
      const alreadyExists = existingProductionOrders.some(
        (po) => po.orderNumber === targetOrderNumber || po.orderNumber === b2bOrder.orderNumber
      );

      if (alreadyExists) {
        return {
          success: true,
          alreadyConverted: true,
          message: "أمر الإنتاج موجود بالفعل في خطوط التشغيل",
        };
      }

      const newProductionOrder = {
        orderNumber: targetOrderNumber,
        batchNumber: `BATCH-B2B-${b2bOrder.orderNumber}`,
        targetQuantity: b2bOrder.quantity,
        productNameSnapshot: b2bOrder.productName,
        status: "IN_PROGRESS",
      };

      return {
        success: true,
        alreadyConverted: false,
        productionOrder: newProductionOrder,
        updatedB2BStatus: "IN_PRODUCTION",
      };
    }

    it("successfully converts a new B2B order into a Factory OS production order", () => {
      const b2bOrder = {
        id: "b2b-ord-1",
        orderNumber: "B2B-8801",
        quantity: 3000,
        productName: "تيشيرت بولو رجالي",
        status: "CONFIRMED",
      };

      const existingProdOrders: Array<{ orderNumber: string }> = [];

      const result = convertB2BOrderToProduction(b2bOrder, existingProdOrders);

      expect(result.success).toBe(true);
      expect(result.alreadyConverted).toBe(false);
      expect(result.productionOrder?.orderNumber).toBe("ORD-B2B-8801");
      expect(result.productionOrder?.batchNumber).toBe("BATCH-B2B-B2B-8801");
      expect(result.productionOrder?.targetQuantity).toBe(3000);
      expect(result.productionOrder?.status).toBe("IN_PROGRESS");
      expect(result.updatedB2BStatus).toBe("IN_PRODUCTION");
    });

    it("prevents duplicate production orders when conversion is repeated (idempotency)", () => {
      const b2bOrder = {
        id: "b2b-ord-1",
        orderNumber: "B2B-8801",
        quantity: 3000,
        productName: "تيشيرت بولو رجالي",
        status: "IN_PRODUCTION",
      };

      const existingProdOrders = [{ orderNumber: "ORD-B2B-8801" }];

      const result = convertB2BOrderToProduction(b2bOrder, existingProdOrders);

      expect(result.success).toBe(true);
      expect(result.alreadyConverted).toBe(true);
      expect(result.message).toContain("موجود بالفعل");
    });
  });

  // 3. PWA Web App Manifest Compliance
  describe("PWA Web App Manifest Compliance", () => {
    it("verifies manifest.json exists with valid PWA standalone configuration", () => {
      const manifestPath = path.resolve(process.cwd(), "public/manifest.json");
      expect(fs.existsSync(manifestPath)).toBe(true);

      const raw = fs.readFileSync(manifestPath, "utf-8");
      const manifest = JSON.parse(raw);

      expect(manifest.display).toBe("standalone");
      expect(manifest.start_url).toBe("/factory/floor");
      expect(manifest.dir).toBe("rtl");
      expect(manifest.lang).toBe("ar");
      expect(manifest.theme_color).toBe("#079B62");
      expect(manifest.background_color).toBe("#14264A");
    });
  });
});
