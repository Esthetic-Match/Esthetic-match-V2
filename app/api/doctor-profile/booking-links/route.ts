// app/api/doctor-profile/booking-links/route.ts

import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/database/prisma";
import { ApiError, apiSuccess } from "@/lib/api/error-handler";
import { withApiHandler } from "@/lib/api/with-api-handler";

export const PATCH = withApiHandler(async (req: Request) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new ApiError("Unauthorized", 401, "UNAUTHORIZED");
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
    throw new ApiError(
      "Doctor profile not found",
      404,
      "DOCTOR_PROFILE_NOT_FOUND"
    );
  }

  if (doctorProfile.paidPlan !== "standard") {
    throw new ApiError(
      "Booking links are only available on the standard plan",
      403,
      "STANDARD_PLAN_REQUIRED"
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

  return apiSuccess({
    success: true,
    bookingLinks: updatedDoctorProfile.bookingLinks,
  });
});