import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();
  let dbStatus = "connected";
  let dbLatencyMs = 0;

  try {
    const dbStart = Date.now();
    await prisma.$queryRawUnsafe("SELECT 1");
    dbLatencyMs = Date.now() - dbStart;
  } catch (error) {
    dbStatus = "error";
    console.error("Health check database probe failed:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      {
        status: "degraded",
        database: "disconnected",
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.floor(process.uptime()),
        error: "Database connectivity check failed",
      },
      { status: 503 }
    );
  }

  return NextResponse.json(
    {
      status: "ok",
      service: "texlink-factory-os",
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      database: {
        status: dbStatus,
        latencyMs: dbLatencyMs,
      },
      totalDurationMs: Date.now() - startTime,
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    }
  );
}
