import { describe, it, expect } from "vitest";
import {
  roundMoney,
  roundStock,
  addMoney,
  subtractMoney,
  multiplyMoney,
  calculateUnitCost,
  calculateCommission,
  calculateInventoryValuation,
} from "@/lib/finance/precision";

describe("TexLink — Financial Precision & Exact Currency Arithmetic Tests", () => {
  it("eliminates binary floating-point rounding errors on multiple decimal additions (0.1 + 0.2 === 0.3)", () => {
    // Standard JS: 0.1 + 0.2 === 0.30000000000000004
    expect(0.1 + 0.2).not.toBe(0.3);

    // Exact financial precision:
    expect(addMoney(0.1, 0.2)).toBe(0.3);
    expect(addMoney(19.99, 0.01, 100.5, 0.49)).toBe(120.99);
  });

  it("handles repeated financial deductions without floating-point drift", () => {
    // Deducting 10 small amounts of 0.1 from 1.0
    const deductions = [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1];
    const result = subtractMoney(1.0, ...deductions);
    expect(result).toBe(0.0);
  });

  it("calculates exact production cost per good unit with half-up rounding", () => {
    // Total production cost 10,000 EGP for 3,333 good t-shirts:
    // 10000 / 3333 = 3.00030003... -> exactly 3.00 EGP
    expect(calculateUnitCost(10000, 3333)).toBe(3.0);

    // 50,000 EGP for 1,500 units = 33.333333... -> exactly 33.33 EGP
    expect(calculateUnitCost(50000, 1500)).toBe(33.33);

    // Zero good units returns 0 without division by zero crash
    expect(calculateUnitCost(50000, 0)).toBe(0);
  });

  it("calculates exact marketplace commissions and fee markups to 2 decimal places", () => {
    // 2.5% platform commission on 145,550.75 EGP order = 3,638.76875 -> 3,638.77 EGP
    expect(calculateCommission(145550.75, 2.5)).toBe(3638.77);

    // 5.0% commission on 1,000 EGP = 50.00 EGP
    expect(calculateCommission(1000, 5.0)).toBe(50.0);
  });

  it("calculates inventory valuation preserving 3-decimal stock quantities and 2-decimal unit costs", () => {
    // 125.455 kg of cotton yarn @ 150.25 EGP/kg
    // 125.455 * 150.25 = 18,849.61375 -> 18,849.61 EGP
    expect(calculateInventoryValuation(125.455, 150.25)).toBe(18849.61);

    // Stock with trailing decimals: 10.3333 -> rounds to 10.333
    expect(roundStock(10.3333)).toBe(10.333);
    expect(roundMoney(19.999)).toBe(20.0);
  });

  it("verifies multiplication of volume price tiers", () => {
    // 5,000 pieces @ 48.75 EGP = 243,750.00 EGP
    expect(multiplyMoney(5000, 48.75)).toBe(243750.0);
  });
});
