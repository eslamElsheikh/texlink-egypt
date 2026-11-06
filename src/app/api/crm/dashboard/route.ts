import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { resolveFactoryContext } from "@/lib/auth/factory-context";

export async function GET(request: Request) {
  try {
    const ctx = await resolveFactoryContext(request);
    if ("error" in ctx) {
      return NextResponse.json({ error: ctx.error }, { status: ctx.status });
    }
    const { factoryId, factory, isAdminPreview } = ctx;

    const [
      customers,
      leads,
      deals,
      followUps,
      activities,
      marketplaceQuotes,
    ] = await Promise.all([
      prisma.crmCustomer.findMany({
        where: { factoryId },
        include: {
          buyer: { select: { name: true, phone: true } },
          _count: { select: { deals: true, followUps: true } },
        },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.crmLead.findMany({
        where: { factoryId },
        include: {
          customer: { select: { id: true, name: true, companyName: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.crmDeal.findMany({
        where: { factoryId },
        include: {
          customer: { select: { id: true, name: true, companyName: true, phone: true } },
          rfq: { select: { id: true, titleAr: true } },
          order: { select: { id: true, orderNumber: true } },
        },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.crmFollowUp.findMany({
        where: { factoryId },
        include: {
          customer: { select: { id: true, name: true, companyName: true, phone: true } },
          deal: { select: { id: true, title: true } },
        },
        orderBy: { dueDate: "asc" },
      }),
      prisma.crmActivity.findMany({
        where: { factoryId },
        include: {
          customer: { select: { id: true, name: true, companyName: true } },
          deal: { select: { id: true, title: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.quote.findMany({
        where: { factoryId, status: "PENDING" },
        select: { id: true, totalAmount: true },
      }),
    ]);

    // Metrics calculation
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter((c) => c.status === "ACTIVE").length;
    const newLeads = leads.filter((l) => l.status === "NEW").length;
    const totalLeads = leads.length;

    const openDeals = deals.filter((d) => d.stage !== "WON" && d.stage !== "LOST");
    const openDealsValue = openDeals.reduce((sum, d) => sum + d.amount, 0);
    const wonDealsValue = deals.filter((d) => d.stage === "WON").reduce((sum, d) => sum + d.amount, 0);

    const now = new Date();
    const pendingFollowUps = followUps.filter((f) => f.status === "PENDING");
    const overdueFollowUps = pendingFollowUps.filter((f) => new Date(f.dueDate) < now);

    // Pipeline by stage
    const pipelineStages = [
      { id: "DISCOVERY", title: "استكشاف وتواصل", color: "bg-blue-500", count: 0, totalAmount: 0 },
      { id: "PROPOSAL", title: "تقديم عرض أسعار", color: "bg-purple-500", count: 0, totalAmount: 0 },
      { id: "NEGOTIATION", title: "تفاوض واعتماد", color: "bg-amber-500", count: 0, totalAmount: 0 },
      { id: "WON", title: "صفقات محسومة", color: "bg-emerald-500", count: 0, totalAmount: 0 },
      { id: "LOST", title: "صفقات ملغاة", color: "bg-red-500", count: 0, totalAmount: 0 },
    ];

    for (const d of deals) {
      const stageObj = pipelineStages.find((s) => s.id === d.stage);
      if (stageObj) {
        stageObj.count += 1;
        stageObj.totalAmount += d.amount;
      }
    }

    return NextResponse.json({
      factory: {
        id: factory.id,
        nameAr: factory.nameAr,
        slug: factory.slug,
      },
      isAdminPreview,
      kpis: {
        totalCustomers,
        activeCustomers,
        newLeads,
        totalLeads,
        openDealsCount: openDeals.length,
        openDealsValue,
        wonDealsValue,
        pendingQuotesCount: marketplaceQuotes.length,
        pendingFollowUpsCount: pendingFollowUps.length,
        overdueFollowUpsCount: overdueFollowUps.length,
      },
      pipelineStages,
      recentActivities: activities,
      upcomingFollowUps: pendingFollowUps.slice(0, 5),
      topCustomers: customers.slice(0, 5).map((c) => ({
        id: c.id,
        name: c.name,
        companyName: c.companyName,
        phone: c.phone,
        source: c.source,
        status: c.status,
        totalSpend: c.totalSpend,
        ordersCount: c.ordersCount,
      })),
      recentDeals: deals.slice(0, 5),
    });
  } catch (error) {
    console.error("GET /api/crm/dashboard error:", error);
    return NextResponse.json({ error: "فشل تحميل بيانات لوحة تحكم CRM" }, { status: 500 });
  }
}
