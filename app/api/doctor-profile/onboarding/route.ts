import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/database/prisma";
import { ApiError, apiSuccess } from "@/lib/api/error-handler";
import { withApiHandler } from "@/lib/api/with-api-handler";

export const POST = withApiHandler(async (req: Request) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new ApiError(
      "Unauthorized: Please log out and sign in again to verify your identity",
      401,
      "UNAUTHORIZED"
    );
  }

  const body = await req.json();

  const {
    specialtyIds,
    subcategoryIds,
    procedureIds,
    otherSpecialtyText,
    topThree,
  } = body;

  await prisma.doctorProfile.update({
    where: {
      userId: session.user.id,
    },
    data: {
      specialtyIds,
      subcategoryIds,
      procedureIds,
      topThree,
      otherSpecialtyText,
    },
  });

  await prisma.user.update({
    where: {
      id: session.user.id,
    },
    data: {
      onboardingCompleted: true,
    },
  });

  return apiSuccess({
    ok: true,
  });
});