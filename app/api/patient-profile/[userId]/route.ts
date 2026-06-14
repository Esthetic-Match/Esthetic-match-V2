import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/database/prisma";
import { ApiError, apiSuccess } from "@/lib/api/error-handler";
import { withApiHandler } from "@/lib/api/with-api-handler";

type RouteContext = {
  params: Promise<{
    userId: string;
  }>;
};

const allowedFields = [
  "avatar",
  "gender",
  "phoneNumber",
  "city",
  "country",
  "zipCode",
  "address",
  "latitude",
  "longitude",
  "googlePlaceId",
  "preferredConsultationType",
  "preferredLanguage",
  "notes",
  "stripeCustomerId",
  "favorite",
] as const;

export const GET = withApiHandler<RouteContext>(
  async (_req: Request, context) => {
    const { userId } = await context.params;

    if (!userId) {
      throw new ApiError("User ID is required.", 400, "USER_ID_REQUIRED");
    }

    const patientProfile = await prisma.patientProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            dateOfBirth: true,
          },
        },
      },
    });

    if (!patientProfile) {
      throw new ApiError(
        "Patient profile not found.",
        404,
        "PATIENT_PROFILE_NOT_FOUND"
      );
    }

    return apiSuccess({
      patientProfile,
    });
  }
);

export const PATCH = withApiHandler<RouteContext>(
  async (req: Request, context) => {
    const { userId } = await context.params;

    if (!userId) {
      throw new ApiError("User ID is required.", 400, "USER_ID_REQUIRED");
    }

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new ApiError("Unauthorized", 401, "UNAUTHORIZED");
    }

    if (session.user.role !== "PATIENT") {
      throw new ApiError("Forbidden", 403, "FORBIDDEN");
    }

    if (session.user.id !== userId) {
      throw new ApiError(
        "You can only update your own profile.",
        403,
        "CANNOT_UPDATE_OTHER_USER_PROFILE"
      );
    }

    const body = await req.json();

    const updateData: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (field in body) {
        updateData[field] = body[field];
      }
    }

    if ("favorite" in body) {
      const currentProfile = await prisma.patientProfile.findUnique({
        where: { userId: session.user.id },
        select: { favorite: true },
      });

      const currentFavorites = currentProfile?.favorite ?? [];
      const doctorProfileId = Array.isArray(body.favorite)
        ? body.favorite[0]
        : body.favorite;

      if (typeof doctorProfileId === "string") {
        updateData.favorite = currentFavorites.includes(doctorProfileId)
          ? currentFavorites.filter((id) => id !== doctorProfileId)
          : [...currentFavorites, doctorProfileId];
      }
    }

    if (Object.keys(updateData).length === 0) {
      throw new ApiError(
        "No valid fields provided",
        400,
        "NO_VALID_FIELDS_PROVIDED"
      );
    }

    const patientProfile = await prisma.patientProfile.update({
      where: {
        userId: session.user.id,
      },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            dateOfBirth: true,
          },
        },
      },
    });

    return apiSuccess({
      success: true,
      patientProfile,
    });
  }
);