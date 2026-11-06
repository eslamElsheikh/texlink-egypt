import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح لك" }, { status: 403 });
    }

    const factories = await prisma.factoryProfile.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        documents: true,
      },
    });

    const parsed = factories.map((f) => ({
      ...f,
      specialties: JSON.parse(f.specialties || "[]") as string[],
      machines: JSON.parse(f.machines || "[]") as string[],
      fabrics: JSON.parse(f.fabrics || "[]") as string[],
    }));

    return NextResponse.json({ success: true, factories: parsed });
  } catch (error) {
    console.error("Admin fetch factories error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب المصانع" },
      { status: 500 }
    );
  }
}
