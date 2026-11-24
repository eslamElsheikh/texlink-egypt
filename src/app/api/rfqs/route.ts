import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { matchFactoriesForRfq } from "@/lib/matching/engine";
import { Prisma } from "@prisma/client";
import { z } from "zod";

const createRfqSchema = z.object({
  titleAr: z.string().min(5, "عنوان الطلب مطلوب"),
  productType: z.string().min(2, "نوع المنتج مطلوب"),
  totalQuantity: z.number().int().min(10, "الكمية لا تقل عن 10 قطع"),
  fabricDetails: z.string().min(3, "تفاصيل القماش مطلوبة"),
  gsm: z.number().int().optional(),
  colors: z.string().optional(),
  printingEmbroidery: z.string().optional(),
  targetBudgetPerPiece: z.number().optional(),
  deadlineDays: z.number().int().min(3).max(180).default(15),
  sampleRequired: z.boolean().default(true),
  targetGovernorate: z.string().optional(),
  notesAr: z.string().optional(),
  sizeBreakdown: z
    .array(
      z.object({
        size: z.string(),
        color: z.string().optional(),
        quantity: z.number().int().min(1),
      })
    )
    .optional(),
  attachments: z
    .array(
      z.object({
        fileUrl: z.string(),
        fileType: z.string(),
        fileName: z.string(),
      })
    )
    .optional(),
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const status = searchParams.get("status") || "";
    const governorate = searchParams.get("governorate") || "";

    const where: Prisma.RfqWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (governorate && governorate !== "الكل") {
      where.targetGovernorate = { contains: governorate };
    }

    if (q) {
      where.OR = [
        { titleAr: { contains: q } },
        { productType: { contains: q } },
        { fabricDetails: { contains: q } },
      ];
    }

    const rfqs = await prisma.rfq.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { quotes: true } },
        category: true,
      },
    });

    return NextResponse.json({
      success: true,
      count: rfqs.length,
      rfqs: rfqs.map((r) => ({
        ...r,
        quoteCount: r._count.quotes,
      })),
    });
  } catch (error) {
    console.error("Fetch RFQs error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب طلبات الشراء" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getCurrentUser();
    let buyerId: string;

    if (session) {
      buyerId = session.id;
    } else {
      // Find or create default demo buyer if guest posts
      const defaultBuyer = await prisma.user.findFirst({
        where: { role: "BUYER" },
      });
      if (defaultBuyer) {
        buyerId = defaultBuyer.id;
      } else {
        return NextResponse.json(
          { error: "يرجى تسجيل الدخول لنشر طلب تصنيع" },
          { status: 401 }
        );
      }
    }

    const body = await req.json();
    const parsed = createRfqSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "بيانات الطلب غير صالحة" },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days default

    const newRfq = await prisma.rfq.create({
      data: {
        buyerId,
        titleAr: data.titleAr,
        productType: data.productType,
        totalQuantity: data.totalQuantity,
        fabricDetails: data.fabricDetails,
        gsm: data.gsm,
        colors: data.colors,
        printingEmbroidery: data.printingEmbroidery,
        targetBudgetPerPiece: data.targetBudgetPerPiece,
        deadlineDays: data.deadlineDays,
        deadlineDate: new Date(Date.now() + data.deadlineDays * 24 * 60 * 60 * 1000),
        sampleRequired: data.sampleRequired,
        targetGovernorate: data.targetGovernorate,
        notesAr: data.notesAr,
        status: "OPEN",
        expiresAt,
        sizeBreakdowns: data.sizeBreakdown
          ? {
              create: data.sizeBreakdown.map((sb) => ({
                size: sb.size,
                color: sb.color,
                quantity: sb.quantity,
              })),
            }
          : undefined,
        attachments: data.attachments
          ? {
              create: data.attachments.map((att) => ({
                fileUrl: att.fileUrl,
                fileType: att.fileType,
                fileName: att.fileName,
              })),
            }
          : undefined,
      },
    });

    // Run matching engine to notify matching factories
    const matches = await matchFactoriesForRfq({
      id: newRfq.id,
      productType: newRfq.productType,
      fabricDetails: newRfq.fabricDetails || "",
      totalQuantity: newRfq.totalQuantity,
      targetGovernorate: newRfq.targetGovernorate,
    });

    return NextResponse.json({
      success: true,
      rfq: newRfq,
      matchedFactoriesCount: matches.length,
    });
  } catch (error) {
    console.error("Create RFQ error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء نشر طلب التصنيع" },
      { status: 500 }
    );
  }
}
