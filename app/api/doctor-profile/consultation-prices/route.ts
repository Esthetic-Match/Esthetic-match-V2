// app/api/doctor-profile/consultation-prices/route.ts

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

  const inClinicPrice = Number(body.inClinicPrice);
  const onlineConsulPrice = Number(body.onlineConsulPrice);

  if (!inClinicPrice || inClinicPrice <= 0) {
    throw new ApiError(
      "Invalid in-clinic consultation price",
      400,
      "INVALID_IN_CLINIC_CONSULTATION_PRICE"
    );
  }

  if (!onlineConsulPrice || onlineConsulPrice <= 0) {
    throw new ApiError(
      "Invalid online consultation price",
      400,
      "INVALID_ONLINE_CONSULTATION_PRICE"
    );
  }

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

  const updatedDoctorProfile = await prisma.doctorProfile.update({
    where: {
      id: doctorProfile.id,
    },
    data: {
      inClinicPrice,
      onlineConsulPrice,
    },
  });

  return apiSuccess({
    success: true,
    doctorProfile: updatedDoctorProfile,
  });
});