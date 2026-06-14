import { prisma } from "@/lib/database/prisma";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { ApiError, apiSuccess } from "@/lib/api/error-handler";
import { withApiHandler } from "@/lib/api/with-api-handler";

function requiredString(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export const POST = withApiHandler(async (req: Request) => {
  const body = await req.json();

  const userId = requiredString(body.userId);

  if (!userId) {
    throw new ApiError("User ID is required.", 400, "USER_ID_REQUIRED");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      role: true,
    },
  });

  if (!user) {
    throw new ApiError("User not found.", 404, "USER_NOT_FOUND");
  }

  if (user.role !== "PATIENT") {
    throw new ApiError(
      "User is not registered as a patient.",
      400,
      "USER_IS_NOT_PATIENT"
    );
  }

  const patientProfile = await prisma.patientProfile.upsert({
    where: {
      userId,
    },
    update: {},
    create: {
      userId,
    },
  });

  return apiSuccess({
    success: true,
    patientProfile,
  });
});

export const GET = withApiHandler(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return apiSuccess({ doctors: [] }, 401);
  }

  const patientProfile = await prisma.patientProfile.findUnique({
    where: {
      userId: session.user.id,
    },
    select: {
      favorite: true,
    },
  });

  const favoriteIds = patientProfile?.favorite ?? [];

  if (!favoriteIds.length) {
    return apiSuccess({
      doctors: [],
    });
  }

  const doctors = await prisma.doctorProfile.findMany({
    where: {
      id: {
        in: favoriteIds,
      },
    },
    include: {
      user: true,
    },
  });

  return apiSuccess({
    doctors,
  });
});