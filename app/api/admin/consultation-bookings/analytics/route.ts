// app/api/admin/consultation-bookings/analytics/route.ts
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

  const bookings = await prisma.consultationBooking.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      createdAt: true,
      amount: true,
      platformFee: true,
      doctorAmount: true,
      currency: true,
    },
  });

  const totals = bookings.reduce(
    (acc, booking) => {
      acc.totalAmount += booking.amount;
      acc.totalPlatformFee += booking.platformFee;
      acc.totalDoctorAmount += booking.doctorAmount;
      return acc;
    },
    {
      totalAmount: 0,
      totalPlatformFee: 0,
      totalDoctorAmount: 0,
    }
  );

  const dailyMap = new Map<string, number>();

  for (const booking of bookings) {
    const day = booking.createdAt.toISOString().slice(0, 10);
    dailyMap.set(day, (dailyMap.get(day) ?? 0) + 1);
  }

  const dailyBookings = Array.from(dailyMap.entries()).map(([date, count]) => ({
    date,
    count,
  }));

  return NextResponse.json({
    dailyBookings,
    totalBookings: bookings.length,
    totalAmount: totals.totalAmount,
    totalPlatformFee: totals.totalPlatformFee,
    totalDoctorAmount: totals.totalDoctorAmount,
    currency: bookings[0]?.currency ?? "eur",
  });
}