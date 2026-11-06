import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { z } from "zod";

const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  commentAr: z.string().min(5, "التعليق يجب أن لا يقل عن 5 أحرف"),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;
    const session = await getCurrentUser();

    if (!session) {
      return NextResponse.json({ error: "يرجى تسجيل الدخول أولاً" }, { status: 401 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { factory: true },
    });

    if (!order) {
      return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
    }

    if (session.id !== order.buyerId && session.role !== "ADMIN") {
      return NextResponse.json({ error: "التقييم متاح لمشتري الطلب فقط" }, { status: 403 });
    }

    // Check if already reviewed
    const existing = await prisma.review.findFirst({
      where: { orderId, authorId: session.id },
    });

    if (existing) {
      return NextResponse.json({ error: "تم تقييم هذا الطلب مسبقاً" }, { status: 400 });
    }

    const body = await req.json();
    const parsed = createReviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "بيانات غير صالحة" },
        { status: 400 }
      );
    }

    const { rating, commentAr } = parsed.data;

    const review = await prisma.review.create({
      data: {
        orderId,
        authorId: session.id,
        factoryId: order.factoryId,
        rating,
        commentAr,
      },
    });

    // Recalculate factory average rating and reviewCount
    const allFactoryReviews = await prisma.review.findMany({
      where: { factoryId: order.factoryId },
      select: { rating: true },
    });

    const totalRatings = allFactoryReviews.reduce((acc, r) => acc + r.rating, 0);
    const avgRating = totalRatings / (allFactoryReviews.length || 1);

    await prisma.factoryProfile.update({
      where: { id: order.factoryId },
      data: {
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: allFactoryReviews.length,
      },
    });

    return NextResponse.json({
      success: true,
      review,
      newRating: Math.round(avgRating * 10) / 10,
    });
  } catch (error) {
    console.error("Create review error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء حفظ التقييم" },
      { status: 500 }
    );
  }
}
