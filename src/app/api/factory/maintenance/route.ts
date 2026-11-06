import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { resolveFactoryContext } from "@/lib/auth/factory-context";

export async function GET(request: Request) {
  try {
    const ctx = await resolveFactoryContext(request);
    if ("error" in ctx) {
      return NextResponse.json({ error: ctx.error }, { status: ctx.status });
    }
    const { factoryId } = ctx;

    const [tickets, machines] = await Promise.all([
      prisma.maintenanceTicket.findMany({
        where: { factoryId },
        include: {
          machine: {
            select: { id: true, code: true, name: true, type: true, status: true },
          },
        },
        orderBy: { startTime: "desc" },
      }),
      prisma.machine.findMany({
        where: { factoryId },
        select: { id: true, code: true, name: true, status: true },
        orderBy: { code: "asc" },
      }),
    ]);

    const totalDowntimeMinutes = tickets.reduce((s, t) => s + (t.downtimeMinutes || 0), 0);
    const totalRepairCost = tickets.reduce((s, t) => s + Number(t.totalCost || 0), 0);
    const openTicketsCount = tickets.filter((t) => t.status === "OPEN" || t.status === "IN_PROGRESS").length;

    return NextResponse.json({
      tickets,
      machines,
      stats: {
        totalTickets: tickets.length,
        openTickets: openTicketsCount,
        totalDowntimeHours: Math.round((totalDowntimeMinutes / 60) * 10) / 10,
        totalRepairCost,
      },
    });
  } catch (error) {
    console.error("GET /api/factory/maintenance error:", error);
    return NextResponse.json({ error: "فشل تحميل بلاغات الصيانة" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const ctx = await resolveFactoryContext(request);
    if ("error" in ctx) {
      return NextResponse.json({ error: ctx.error }, { status: ctx.status });
    }
    const { factoryId } = ctx;

    const body = await request.json();
    const { machineId, issueType, priority, description, startTime } = body;

    if (!machineId || !issueType || !description) {
      return NextResponse.json({ error: "الماكينة ونوع العطل ووصف المشكلة حقول مطلوبة" }, { status: 400 });
    }

    const machine = await prisma.machine.findFirst({
      where: { id: machineId, factoryId },
    });
    if (!machine) {
      return NextResponse.json({ error: "الماكينة غير موجودة أو غير تابعة لمصنعك" }, { status: 404 });
    }

    const ticket = await prisma.$transaction(async (tx) => {
      const created = await tx.maintenanceTicket.create({
        data: {
          factoryId,
          machineId,
          issueType,
          priority: priority || "MEDIUM",
          description,
          startTime: startTime ? new Date(startTime) : new Date(),
          status: "OPEN",
        },
      });

      // Update machine status to UNDER_MAINTENANCE
      await tx.machine.update({
        where: { id: machineId },
        data: { status: "UNDER_MAINTENANCE" },
      });

      return created;
    });

    return NextResponse.json({ success: true, ticket });
  } catch (error) {
    console.error("POST /api/factory/maintenance error:", error);
    return NextResponse.json({ error: "فشل إنشاء بلاغ الصيانة" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const ctx = await resolveFactoryContext(request);
    if ("error" in ctx) {
      return NextResponse.json({ error: ctx.error }, { status: ctx.status });
    }
    const { factoryId } = ctx;

    const body = await request.json();
    const {
      id,
      status,
      endTime,
      sparePartsUsed,
      laborCost,
      sparePartsCost,
      resolvedBy,
      notes,
    } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "معرف التذكرة والحالة مطلوبان" }, { status: 400 });
    }

    const ticket = await prisma.maintenanceTicket.findFirst({
      where: { id, factoryId },
      include: { machine: true },
    });
    if (!ticket) {
      return NextResponse.json({ error: "تذكرة الصيانة غير موجودة" }, { status: 404 });
    }

    const resolvedEnd = endTime ? new Date(endTime) : new Date();
    const startMs = new Date(ticket.startTime).getTime();
    const endMs = resolvedEnd.getTime();
    const calculatedDowntime = Math.max(0, Math.round((endMs - startMs) / (1000 * 60)));

    const lCost = laborCost !== undefined ? parseFloat(String(laborCost)) : ticket.laborCost;
    const spCost = sparePartsCost !== undefined ? parseFloat(String(sparePartsCost)) : ticket.sparePartsCost;
    const tCost = lCost + spCost;

    const updated = await prisma.$transaction(async (tx) => {
      const isFinishing = status === "RESOLVED" || status === "CLOSED";

      const t = await tx.maintenanceTicket.update({
        where: { id },
        data: {
          status,
          endTime: isFinishing ? resolvedEnd : ticket.endTime,
          downtimeMinutes: isFinishing ? calculatedDowntime : ticket.downtimeMinutes,
          sparePartsUsed: sparePartsUsed !== undefined ? sparePartsUsed : ticket.sparePartsUsed,
          laborCost: lCost,
          sparePartsCost: spCost,
          totalCost: tCost,
          resolvedBy: resolvedBy !== undefined ? resolvedBy : ticket.resolvedBy,
        },
      });

      // Strict Multi-Ticket Evaluation:
      // Only restore machine status to RUNNING if NO OTHER active breakdown tickets exist for this machine!
      if (isFinishing) {
        const otherActiveTickets = await tx.maintenanceTicket.findFirst({
          where: {
            machineId: ticket.machineId,
            id: { not: id },
            status: { in: ["OPEN", "IN_PROGRESS", "WAITING_FOR_PARTS"] },
          },
        });

        if (!otherActiveTickets) {
          await tx.machine.update({
            where: { id: ticket.machineId },
            data: {
              status: "RUNNING",
              lastMaintenanceDate: new Date(),
            },
          });
        }
      }

      return t;
    });

    return NextResponse.json({ success: true, ticket: updated });
  } catch (error) {
    console.error("PATCH /api/factory/maintenance error:", error);
    return NextResponse.json({ error: "فشل تحديث تذكرة الصيانة" }, { status: 500 });
  }
}
