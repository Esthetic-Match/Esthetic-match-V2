import { ApiError, apiSuccess } from "@/lib/api/error-handler";
import { withApiHandler } from "@/lib/api/with-api-handler";
import { prisma } from "@/lib/database/prisma";

export const dynamic = "force-dynamic";

export const GET = withApiHandler(async (req: Request) => {
  const requestUrl = new URL(req.url);

  const doctorProfileId = requestUrl.searchParams.get(
    "doctorProfileId"
  );

  if (!doctorProfileId?.trim()) {
    throw new ApiError(
      "Doctor profile ID is required.",
      400,
      "DOCTOR_PROFILE_ID_REQUIRED"
    );
  }

  const reels = await prisma.instagramReel.findMany({
    where: {
      doctorProfileId: doctorProfileId.trim(),
    },

    orderBy: [
      {
        sortOrder: "asc",
      },
      {
        createdAt: "asc",
      },
    ],

    take: 2,

    select: {
      id: true,
      url: true,
      sortOrder: true,
    },
  });

  return apiSuccess({
    reels,
  });
});