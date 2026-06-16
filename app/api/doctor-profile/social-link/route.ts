// app/api/doctor-profile/social-link/route.ts

import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/database/prisma";
import { ApiError, apiSuccess } from "@/lib/api/error-handler";
import { withApiHandler } from "@/lib/api/with-api-handler";

export const GET = withApiHandler(async (req: Request) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new ApiError("Unauthorized", 401, "UNAUTHORIZED");
  }

  const { searchParams } = new URL(req.url);
  const locale = searchParams.get("locale") || "en";

  const doctorProfile = await prisma.doctorProfile.findUnique({
    where: {
      userId: session.user.id,
    },
    select: {
      id: true,
      slug: true,
      paidPlan: true,
      socialMediaLink: true,
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
      "Social profile link is only available on the standard plan",
      403,
      "STANDARD_PLAN_REQUIRED"
    );
  }

  if (!doctorProfile.slug) {
    throw new ApiError(
      "Doctor profile slug not found",
      400,
      "DOCTOR_PROFILE_SLUG_NOT_FOUND"
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!appUrl) {
    throw new ApiError(
      "Missing NEXT_PUBLIC_APP_URL",
      500,
      "NEXT_PUBLIC_APP_URL_MISSING"
    );
  }

  const correctLink = `${appUrl}/${locale}/doctor-profile/${doctorProfile.slug}`;

  const isOldBrokenLink =
    doctorProfile.socialMediaLink?.includes("/doctors/") ||
    doctorProfile.socialMediaLink?.includes(doctorProfile.id);

  if (doctorProfile.socialMediaLink && !isOldBrokenLink) {
    return apiSuccess({
      socialMediaLink: doctorProfile.socialMediaLink,
    });
  }

  const updatedDoctorProfile = await prisma.doctorProfile.update({
    where: {
      id: doctorProfile.id,
    },
    data: {
      socialMediaLink: correctLink,
    },
  });

  return apiSuccess({
    socialMediaLink: updatedDoctorProfile.socialMediaLink,
  });
});