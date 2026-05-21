// app/api/admin/doctor-profiles/plans/route.ts
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const doctorProfiles = await prisma.doctorProfile.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      clinicName: true,
      paidPlan: true,
      subscriptionPlan: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  return NextResponse.json({ doctorProfiles });
}