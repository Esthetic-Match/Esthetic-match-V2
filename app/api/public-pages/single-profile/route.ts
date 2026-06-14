import { NextRequest } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { ApiError, apiSuccess } from "@/lib/api/error-handler";
import { withApiHandler } from "@/lib/api/with-api-handler";

export const GET = withApiHandler<unknown, NextRequest>(async (req) => {
  const slug = req.nextUrl.searchParams.get("slug");

  if (!slug) {
    throw new ApiError(
      "Missing doctor profile slug",
      400,
      "DOCTOR_PROFILE_SLUG_REQUIRED"
    );
  }

  const doctorProfile = await prisma.doctorProfile.findUnique({
    where: {
      slug,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });

  if (!doctorProfile) {
    throw new ApiError(
      "Doctor profile not found",
      404,
      "DOCTOR_PROFILE_NOT_FOUND"
    );
  }

  return apiSuccess(doctorProfile);
});