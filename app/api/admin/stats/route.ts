// app/api/admin/stats/route.ts
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

  const [totalUsers, totalPatients, totalDoctors] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "PATIENT" } }),
    prisma.user.count({ where: { role: "DOCTOR" } }),
  ]);

  return NextResponse.json({
    totalUsers,
    totalPatients,
    totalDoctors,
  });
}