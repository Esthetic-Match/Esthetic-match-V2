// app/api/admin/doctor-plans/route.ts
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/database/prisma";

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

  const [freeDoctors, standardDoctors] = await Promise.all([
    prisma.doctorProfile.count({
      where: {
        OR: [{ paidPlan: "free" }, { paidPlan: null }],
      },
    }),
    prisma.doctorProfile.count({
      where: {
        paidPlan: "standard",
      },
    }),
  ]);

  return NextResponse.json({
    freeDoctors,
    standardDoctors,
    totalDoctors: freeDoctors + standardDoctors,
  });
}