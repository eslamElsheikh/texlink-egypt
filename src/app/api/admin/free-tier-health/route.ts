import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getFreeTierUsageMetrics } from "@/lib/monitoring/free-tier-monitor";

export async function GET() {
  try {
    const session = await getCurrentUser();
    // Admin access check
    if (!session || (session.role !== "ADMIN" && (session.role as string) !== "PLATFORM_ADMIN")) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
    }

    const metrics = await getFreeTierUsageMetrics();

    return NextResponse.json({
      success: true,
      budget: "$0.00 USD (Strict Zero-Cost Policy)",
      metrics,
    });
  } catch (error) {
    console.error("Free tier health check error:", error);
    return NextResponse.json({ error: "فشل استعراض مؤشرات الحصة المجانية" }, { status: 500 });
  }
}
