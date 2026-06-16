import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/database/prisma";
import { ApiError, apiSuccess } from "@/lib/api/error-handler";
import { withApiHandler } from "@/lib/api/with-api-handler";

export const DELETE = withApiHandler(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new ApiError("Unauthorized", 401, "UNAUTHORIZED");
  }

  const userId = session.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      doctorProfile: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!user) {
    throw new ApiError("User not found", 404, "USER_NOT_FOUND");
  }

  await prisma.$transaction(async (tx) => {
    if (user.doctorProfile?.id) {
      await tx.beforeAfterCase.deleteMany({
        where: {
          doctorId: user.doctorProfile.id,
        },
      });
    }

    await tx.beforeAfterCase.deleteMany({
      where: {
        patientId: userId,
      },
    });

    await tx.user.delete({
      where: {
        id: userId,
      },
    });
  });

  return apiSuccess({
    success: true,
  });
});