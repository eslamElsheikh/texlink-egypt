import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { resolveFactoryContext } from "@/lib/auth/factory-context";
import { z } from "zod";

const submitQuoteSchema = z.object({
  unitPrice: z.number().positive("سعر القطعة يجب أن يكون أكبر من صفر"),
  leadTimeDays: z.number().int().min(1, "مدة التنفيذ مطلوبة"),
  samplePrice: z.number().optional().default(0),
  sampleLeadTimeDays: z.number().int().optional().default(3),
  minQuantity: z.number().int().min(1, "الحد الأدنى مطلوب"),
  paymentTermsAr: z.string().min(5, "شروط الدفع مطلوبة"),
  notesAr: z.string().optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ctx = await resolveFactoryContext(req);
    if ("error" in ctx) {
      return NextResponse.json({ error: ctx.error }, { status: ctx.status });
    }

    const { factory, factoryId, settings } = ctx;

    if (!settings?.marketplaceEnabled) {
      return NextResponse.json(
        { error: "حساب المصنع مضبوط على وضع الإدارة فقط؛ قم بتفعيل السوق التجاري لتقديم عروض أسعار" },
        { status: 403 }
      );
    }

    if (factory.verificationStatus !== "VERIFIED") {
      return NextResponse.json(
        { error: "يجب إتمام التحقق الميداني للمصنع قبل تقديم عروض الأسعار في السوق" },
        { status: 403 }
      );
    }

    const rfq = await prisma.rfq.findUnique({
      where: { id },
      include: { buyer: true },
    });

    if (!rfq) {
      return NextResponse.json({ error: "طلب التصنيع غير موجود" }, { status: 404 });
    }

    if (rfq.status !== "OPEN" || (rfq.expiresAt && new Date(rfq.expiresAt) < new Date())) {
      return NextResponse.json(
        { error: "عذراً، هذا الطلب منتهي الصلاحية أو مغلق ولا يقبل عروضاً جديدة" },
        { status: 400 }
      );
    }

    // Check if factory already submitted a pending quote
    const existingQuote = await prisma.quote.findFirst({
      where: { rfqId: id, factoryId },
    });

    const body = await req.json();
    const parsed = submitQuoteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "بيانات العرض غير صالحة" },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const totalAmount = data.unitPrice * rfq.totalQuantity;

    let quote;
    if (existingQuote) {
      // Update quote
      quote = await prisma.quote.update({
        where: { id: existingQuote.id },
        data: {
          unitPrice: data.unitPrice,
          totalAmount,
          leadTimeDays: data.leadTimeDays,
          samplePrice: data.samplePrice,
          sampleLeadTimeDays: data.sampleLeadTimeDays,
          minQuantity: data.minQuantity,
          paymentTermsAr: data.paymentTermsAr,
          notesAr: data.notesAr,
          status: "PENDING",
        },
      });
    } else {
      // Create new quote
      quote = await prisma.quote.create({
        data: {
          rfqId: id,
          factoryId,
          unitPrice: data.unitPrice,
          totalAmount,
          leadTimeDays: data.leadTimeDays,
          samplePrice: data.samplePrice,
          sampleLeadTimeDays: data.sampleLeadTimeDays,
          minQuantity: data.minQuantity,
          paymentTermsAr: data.paymentTermsAr,
          notesAr: data.notesAr,
          status: "PENDING",
        },
      });
    }

    // Notify buyer
    await prisma.notification.create({
      data: {
        userId: rfq.buyerId,
        titleAr: "📬 عرض سعر جديد على طلبك!",
        bodyAr: `قدم "${factory?.nameAr}" عرض سعر بقيمة ${data.unitPrice} ج.م للقطعة (إجمالي ${totalAmount.toLocaleString()} ج.م) على طلبك "${rfq.titleAr}".`,
        type: "QUOTE_RECEIVED",
        link: `/rfqs/${rfq.id}/compare`,
      },
    });

    return NextResponse.json({
      success: true,
      quote,
    });
  } catch (error) {
    console.error("Submit quote error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء تقديم عرض السعر" },
      { status: 500 }
    );
  }
}
