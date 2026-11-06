import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ user: null });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      isFactory: true,
      isBuyer: true,
      avatarUrl: true,
      factoryProfile: {
        select: {
          id: true,
          slug: true,
          nameAr: true,
          verificationStatus: true,
          rating: true,
        },
      },
      buyerProfile: {
        select: {
          id: true,
          companyName: true,
          businessType: true,
        },
      },
    },
  });

  return NextResponse.json({ user });
}
