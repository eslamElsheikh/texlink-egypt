import { test, expect } from "@playwright/test";

test.describe("TexLink Egypt - Core RFQ & Order Journey", () => {
  test("Homepage loads properly in RTL with TexLink branding", async ({ page }) => {
    await page.goto("/");

    // Verify RTL direction
    const htmlDir = await page.getAttribute("html", "dir");
    expect(htmlDir).toBe("rtl");

    // Verify Brand Logo
    await expect(page.locator("text=TexLink")).toBeVisible();
    await expect(page.locator("text=Egypt")).toBeVisible();

    // Verify Hero section
    await expect(
      page.locator("text=منصة ربط مصانع التريكو في مصر")
    ).toBeVisible();

    // Verify Dual Action Cards
    await expect(page.locator("text=للمشترين")).toBeVisible();
    await expect(page.locator("text=للمصانع")).toBeVisible();

    // Verify Featured Factories and Latest RFQs
    await expect(page.locator("text=مصانع مميزة")).toBeVisible();
    await expect(page.locator("text=أحدث طلبات الشراء (RFQ)")).toBeVisible();

    // Verify Trust bar
    await expect(page.locator("text=معاملات آمنة وموثوقة")).toBeVisible();
  });

  test("Factory directory filtering works", async ({ page }) => {
    await page.goto("/factories");

    // Verify factory cards render
    await expect(page.locator("text=مصانع التريكو والملابس المعتمدة في مصر")).toBeVisible();
    await expect(page.locator("text=مصنع النصر للتريكو")).toBeVisible();
  });

  test("Product catalog with tiered pricing renders", async ({ page }) => {
    await page.goto("/products");

    await expect(page.locator("text=كتالوج المنتجات الجاهزة")).toBeVisible();
    await expect(page.locator("text=تيشيرت قطن 100%")).toBeVisible();
  });
});
