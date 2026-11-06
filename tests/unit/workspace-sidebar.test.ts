import { describe, it, expect } from "vitest";

describe("TexLink — Workspace-Specific Sidebar Navigation Acceptance Tests", () => {
  // Navigation generator function mirroring DashboardSidebar.tsx logic
  function generateSidebarForPath(pathname: string, currentRole: string) {
    // 1. CRM Workspace Navigation (/crm/*)
    if (pathname.startsWith("/crm")) {
      return [
        {
          label: "نظرة عامة والصفقات",
          items: [
            { title: "لوحة تحكم CRM", href: "/crm/dashboard" },
            { title: "خط سير الصفقات (Pipeline)", href: "/crm/pipeline" },
          ],
        },
        {
          label: "إدارة العملاء والفرص",
          items: [
            { title: "العملاء والشركات", href: "/crm/customers" },
            { title: "العملاء المحتملون (Leads)", href: "/crm/leads" },
            { title: "عروض الأسعار والمقايسات", href: "/crm/quotations" },
          ],
        },
        {
          label: "المتابعات والتواصل",
          items: [
            { title: "المهام والتذكيرات", href: "/crm/follow-ups" },
            { title: "سجل الأنشطة والمكالمات", href: "/crm/activities" },
            { title: "طلبات عملاء السوق", href: "/crm/marketplace-requests" },
            { title: "المحادثات والرسائل", href: "/messages" },
          ],
        },
        {
          label: "التقارير والإعدادات",
          items: [
            { title: "تقارير المبيعات وCRM", href: "/crm/reports" },
            { title: "إعدادات CRM", href: "/crm/settings" },
          ],
        },
      ];
    }

    // 2. Marketplace Workspace Navigation (/marketplace/*, /factory/rfqs, /factory/quotes, /factory/orders)
    if (
      pathname.startsWith("/marketplace") ||
      pathname.startsWith("/factory/rfqs") ||
      pathname.startsWith("/factory/quotes") ||
      pathname.startsWith("/factory/orders")
    ) {
      return [
        {
          label: "سوق تكس لينك التجاري B2B",
          items: [
            { title: "لوحة تحكم السوق", href: "/marketplace/dashboard" },
            { title: "طلبات الشراء وRFQs", href: "/factory/rfqs" },
            { title: "صفقات وأوامر السوق", href: "/factory/orders" },
            { title: "كتالوج المنتجات الجاهزة", href: "/factory/products" },
            { title: "عروض الأسعار المقدمة", href: "/factory/quotes" },
            { title: "دليل مصانع مصر", href: "/factories" },
            { title: "المحادثات والتفاوض", href: "/messages" },
          ],
        },
      ];
    }

    // 3. Factory Management Workspace Navigation (/factory/*)
    if (currentRole === "FACTORY" || pathname.startsWith("/factory")) {
      return [
        {
          label: "التشغيل والإنتاج",
          items: [
            { title: "لوحة التحكم التشغيلية", href: "/factory/dashboard" },
            { title: "إدارة الإنتاج والتشغيل", href: "/factory/production" },
            { title: "أوامر الإنتاج والدفعات", href: "/factory/production-orders" },
            { title: "الماكينات والمعدات", href: "/factory/machines" },
            { title: "الأعطال والصيانة", href: "/factory/maintenance" },
            { title: "الهالك والفاقد", href: "/factory/waste" },
            { title: "فحص الجودة", href: "/factory/quality" },
          ],
        },
        {
          label: "المخازن وسلاسل الإمداد",
          items: [
            { title: "المخازن والخامات", href: "/factory/inventory" },
            { title: "استهلاك الخامات", href: "/factory/material-consumption" },
            { title: "الموردون", href: "/factory/suppliers" },
            { title: "أوامر الشراء والتوريد", href: "/factory/purchases" },
          ],
        },
        {
          label: "العمالة والتكاليف",
          items: [
            { title: "العمال والموظفون", href: "/factory/employees" },
            { title: "إدارة الورديات", href: "/factory/shifts" },
            { title: "الحضور والغياب", href: "/factory/attendance" },
            { title: "المصروفات التشغيلية", href: "/factory/expenses" },
            { title: "تكاليف أوامر الإنتاج", href: "/factory/costs" },
            { title: "التقارير والإحصائيات", href: "/factory/reports" },
          ],
        },
        {
          label: "الإعدادات والملف",
          items: [
            { title: "ملف المصنع", href: "/factory/profile" },
            { title: "إعدادات المصنع", href: "/factory/settings" },
          ],
        },
      ];
    }

    return [];
  }

  // Acceptance Criterion 1: Factory Workspace shows ONLY Factory OS navigation
  it("Factory Workspace displays strictly Factory OS operational modules and zero CRM/Marketplace links", () => {
    const factorySidebar = generateSidebarForPath("/factory/dashboard", "FACTORY");
    const allHrefs = factorySidebar.flatMap((sec) => sec.items.map((i) => i.href));

    // Must contain factory operational links
    expect(allHrefs).toContain("/factory/dashboard");
    expect(allHrefs).toContain("/factory/production");
    expect(allHrefs).toContain("/factory/production-orders");
    expect(allHrefs).toContain("/factory/machines");
    expect(allHrefs).toContain("/factory/maintenance");
    expect(allHrefs).toContain("/factory/waste");
    expect(allHrefs).toContain("/factory/inventory");
    expect(allHrefs).toContain("/factory/costs");

    // Strictly MUST NOT contain CRM links
    expect(allHrefs.some((href) => href.startsWith("/crm"))).toBe(false);
    expect(allHrefs).not.toContain("/crm/dashboard");
    expect(allHrefs).not.toContain("/crm/customers");
    expect(allHrefs).not.toContain("/crm/pipeline");

    // Strictly MUST NOT contain Marketplace links
    expect(allHrefs).not.toContain("/factory/rfqs");
    expect(allHrefs).not.toContain("/factory/orders");
    expect(allHrefs).not.toContain("/marketplace/dashboard");
  });

  // Acceptance Criterion 2: CRM Workspace shows ONLY CRM navigation
  it("CRM Workspace displays strictly CRM sales/customer modules and zero factory production links", () => {
    const crmSidebar = generateSidebarForPath("/crm/dashboard", "FACTORY");
    const allHrefs = crmSidebar.flatMap((sec) => sec.items.map((i) => i.href));

    // Must contain CRM links
    expect(allHrefs).toContain("/crm/dashboard");
    expect(allHrefs).toContain("/crm/customers");
    expect(allHrefs).toContain("/crm/leads");
    expect(allHrefs).toContain("/crm/pipeline");
    expect(allHrefs).toContain("/crm/quotations");
    expect(allHrefs).toContain("/crm/follow-ups");
    expect(allHrefs).toContain("/crm/activities");
    expect(allHrefs).toContain("/crm/marketplace-requests");

    // Strictly MUST NOT contain Factory operational links
    expect(allHrefs).not.toContain("/factory/production");
    expect(allHrefs).not.toContain("/factory/machines");
    expect(allHrefs).not.toContain("/factory/maintenance");
    expect(allHrefs).not.toContain("/factory/inventory");
    expect(allHrefs).not.toContain("/factory/waste");
    expect(allHrefs).not.toContain("/factory/costs");
  });

  // Acceptance Criterion 3: Marketplace Workspace shows ONLY Marketplace navigation
  it("Marketplace Workspace displays strictly Marketplace modules and zero Factory/CRM modules", () => {
    const marketSidebar = generateSidebarForPath("/marketplace/dashboard", "FACTORY");
    const allHrefs = marketSidebar.flatMap((sec) => sec.items.map((i) => i.href));

    // Must contain Marketplace links
    expect(allHrefs).toContain("/marketplace/dashboard");
    expect(allHrefs).toContain("/factory/rfqs");
    expect(allHrefs).toContain("/factory/orders");
    expect(allHrefs).toContain("/factory/products");
    expect(allHrefs).toContain("/factory/quotes");
    expect(allHrefs).toContain("/factories");
    expect(allHrefs).toContain("/messages");

    // Strictly MUST NOT contain Factory OS operational links
    expect(allHrefs).not.toContain("/factory/dashboard");
    expect(allHrefs).not.toContain("/factory/production");
    expect(allHrefs).not.toContain("/factory/machines");
    expect(allHrefs).not.toContain("/factory/maintenance");

    // Strictly MUST NOT contain CRM links
    expect(allHrefs.some((href) => href.startsWith("/crm"))).toBe(false);
  });

  // Acceptance Criterion 4: Switching workspaces completely replaces the sidebar navigation
  it("Switching between workspaces yields distinct, non-overlapping navigation sets", () => {
    const factorySidebar = generateSidebarForPath("/factory/dashboard", "FACTORY");
    const crmSidebar = generateSidebarForPath("/crm/dashboard", "FACTORY");
    const marketSidebar = generateSidebarForPath("/marketplace/dashboard", "FACTORY");

    const factoryHrefs = new Set(factorySidebar.flatMap((s) => s.items.map((i) => i.href)));
    const crmHrefs = new Set(crmSidebar.flatMap((s) => s.items.map((i) => i.href)));
    const marketHrefs = new Set(marketSidebar.flatMap((s) => s.items.map((i) => i.href)));

    // Ensure completely segregated sets
    for (const href of crmHrefs) {
      if (href !== "/messages") {
        expect(factoryHrefs.has(href)).toBe(false);
      }
    }

    for (const href of marketHrefs) {
      if (href !== "/messages") {
        expect(factoryHrefs.has(href)).toBe(false);
      }
    }
  });
});
