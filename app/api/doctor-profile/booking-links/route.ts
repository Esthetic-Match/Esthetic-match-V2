// app/api/doctor-profile/booking-links/route.ts
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const bookingLinks = Array.isArray(body.bookingLinks)
    ? body.bookingLinks
        .map((link: unknown) => String(link).trim())
        .filter(Boolean)
        .slice(0, 3)
    : [];

  const doctorProfile = await prisma.doctorProfile.findUnique({
    where: {
      userId: session.user.id,
    },
  });

  if (!doctorProfile) {
    return NextResponse.json(
      { error: "Doctor profile not found" },
      { status: 404 }
    );
  }

  if (doctorProfile.paidPlan !== "standard") {
    return NextResponse.json(
      { error: "Booking links are only available on the standard plan" },
      { status: 403 }
    );
  }

  const updatedDoctorProfile = await prisma.doctorProfile.update({
    where: {
      id: doctorProfile.id,
    },
    data: {
      bookingLinks,
    },
  });

  return NextResponse.json({
    success: true,
    bookingLinks: updatedDoctorProfile.bookingLinks,
  });
}