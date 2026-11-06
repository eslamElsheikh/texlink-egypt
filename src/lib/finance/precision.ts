/**
 * TexLink — Financial Precision & Currency Arithmetic Engine
 * Eliminates binary floating-point rounding errors (0.1 + 0.2 !== 0.3)
 * by performing exact scaled-integer calculations for Egyptian Pounds (EGP/piastres)
 * and 3-decimal precision for textile stock measurements (kg/meters/grams).
 */

const MONEY_SCALE = 100; // 2 decimal places (Piastres / قرش)
const STOCK_SCALE = 1000; // 3 decimal places (Grams / جرام)

/**
 * Rounds any financial amount to exactly 2 decimal places (half-up)
 */
export function roundMoney(value: number | string): number {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return 0;
  return Math.round((num + Number.EPSILON) * MONEY_SCALE) / MONEY_SCALE;
}

/**
 * Rounds inventory quantity to 3 decimal places (half-up, e.g. 1.255 kg)
 */
export function roundStock(value: number | string): number {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return 0;
  return Math.round((num + Number.EPSILON) * STOCK_SCALE) / STOCK_SCALE;
}

/**
 * Exact scaled-integer addition for monetary values
 */
export function addMoney(...amounts: (number | string)[]): number {
  const totalCents = amounts.reduce<number>((acc, cur) => {
    const val = typeof cur === "string" ? parseFloat(cur) : cur;
    if (isNaN(val)) return acc;
    return acc + Math.round((val + Number.EPSILON) * MONEY_SCALE);
  }, 0);
  return totalCents / MONEY_SCALE;
}

/**
 * Exact scaled-integer subtraction for monetary values
 */
export function subtractMoney(minuend: number | string, ...subtrahends: (number | string)[]): number {
  const minVal = typeof minuend === "string" ? parseFloat(minuend) : minuend;
  let cents = Math.round((minVal + Number.EPSILON) * MONEY_SCALE);

  for (const s of subtrahends) {
    const sVal = typeof s === "string" ? parseFloat(s) : s;
    if (!isNaN(sVal)) {
      cents -= Math.round((sVal + Number.EPSILON) * MONEY_SCALE);
    }
  }
  return cents / MONEY_SCALE;
}

/**
 * Exact monetary multiplication (e.g. quantity * unit price) rounded to 2 decimals
 */
export function multiplyMoney(amount: number | string, factor: number | string): number {
  const a = typeof amount === "string" ? parseFloat(amount) : amount;
  const f = typeof factor === "string" ? parseFloat(factor) : factor;
  if (isNaN(a) || isNaN(f)) return 0;
  return roundMoney(a * f);
}

/**
 * Computes exact cost per good production unit
 * Total Production Cost / Good Units Count
 */
export function calculateUnitCost(totalCost: number | string, goodUnits: number): number {
  const cost = typeof totalCost === "string" ? parseFloat(totalCost) : totalCost;
  if (isNaN(cost) || goodUnits <= 0) return 0;
  return roundMoney(cost / goodUnits);
}

/**
 * Computes platform commission or markup rounded to exact 2 decimal places
 */
export function calculateCommission(amount: number | string, ratePct: number): number {
  const amt = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(amt) || ratePct <= 0) return 0;
  return roundMoney((amt * ratePct) / 100);
}

/**
 * Computes total inventory valuation with 3-decimal stock and 2-decimal unit cost
 */
export function calculateInventoryValuation(currentStock: number | string, unitCost: number | string): number {
  const stock = roundStock(currentStock);
  const cost = roundMoney(unitCost);
  return roundMoney(stock * cost);
}
