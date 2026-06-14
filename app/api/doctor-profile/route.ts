import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/database/prisma";
import slugify from "slugify";
import { ApiError, apiSuccess } from "@/lib/api/error-handler";
import { withApiHandler } from "@/lib/api/with-api-handler";

const allowedFields = [
  "clinicName",
  "clinicBanner",
  "avatar",
  "yearsOfExperience",
  "specialtyIds",
  "subcategoryIds",
  "procedureIds",
  "subzoneIds",
  "workAddress",
  "city",
  "country",
  "zipCode",
  "topThree",
  "workLatitude",
  "workLongitude",
  "googlePlaceId",
  "googleRating",
  "googleReviewCount",
  "googleMapsUri",
  "otherSpecialtyText",
  "inClinicPrice",
  "onlineConsulPrice",
  "socialMediaLink",
  "bookingLinks",
  "inClinicLink",
  "currency",
  "RPPS",
] as const;

function requiredString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function nullableNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

async function generateUniqueDoctorSlug(name: string) {
  const baseSlug = slugify(name, {
    lower: true,
    strict: true,
    trim: true,
  });

  let slug = baseSlug;
  let counter = 1;

  while (
    await prisma.doctorProfile.findFirst({
      where: {
        slug,
      },
    })
  ) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

export const POST = withApiHandler(async (req: Request) => {
  const body = await req.json();

  const userId = requiredString(body.userId);
  const clinicName = requiredString(body.clinicName);
  const workAddress = requiredString(body.workAddress);
  const city = requiredString(body.city);
  const country = requiredString(body.country);
  const zipCode = requiredString(body.zipCode);
  const yearsOfExperience = nullableNumber(body.yearsOfExperience);

  if (!userId) {
    throw new ApiError("User ID is required.", 400, "USER_ID_REQUIRED");
  }

  if (!clinicName) {
    throw new ApiError("Clinic name is required.", 400, "CLINIC_NAME_REQUIRED");
  }

  if (!workAddress) {
    throw new ApiError(
      "Clinic address is required.",
      400,
      "CLINIC_ADDRESS_REQUIRED"
    );
  }

  if (!city) {
    throw new ApiError("City is required.", 400, "CITY_REQUIRED");
  }

  if (!country) {
    throw new ApiError("Country is required.", 400, "COUNTRY_REQUIRED");
  }

  if (!zipCode) {
    throw new ApiError(
      "Clinic zip code is required.",
      400,
      "CLINIC_ZIP_CODE_REQUIRED"
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      role: true,
      name: true,
    },
  });

  if (!user) {
    throw new ApiError("User not found.", 404, "USER_NOT_FOUND");
  }

  if (user.role !== "DOCTOR") {
    throw new ApiError(
      "User is not registered as a doctor.",
      400,
      "USER_IS_NOT_DOCTOR"
    );
  }

  const existingProfile = await prisma.doctorProfile.findUnique({
    where: {
      userId,
    },
    select: {
      slug: true,
    },
  });

  const slug =
    existingProfile?.slug ||
    (await generateUniqueDoctorSlug(user.name || clinicName));

  const profile = await prisma.doctorProfile.upsert({
    where: {
      userId,
    },
    update: {
      clinicName,
      workAddress,
      slug,
      city,
      country,
      zipCode,
      workLatitude: nullableNumber(body.workLatitude),
      workLongitude: nullableNumber(body.workLongitude),
    },
    create: {
      userId,
      clinicName,
      slug,
      workAddress,
      city,
      country,
      zipCode,
      yearsOfExperience,
      workLatitude: nullableNumber(body.workLatitude),
      workLongitude: nullableNumber(body.workLongitude),

      specialtyIds: [],
      subcategoryIds: [],
      procedureIds: [],
      subzoneIds: [],
    },
  });

  return apiSuccess({
    success: true,
    profile,
  });
});

export const PATCH = withApiHandler(async (req: Request) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new ApiError("Unauthorized", 401, "UNAUTHORIZED");
  }

  if (session.user.role !== "DOCTOR") {
    throw new ApiError("Forbidden", 403, "FORBIDDEN");
  }

  const body = await req.json();

  const updateData: Record<string, unknown> = {};

  for (const field of allowedFields) {
    if (field in body) {
      updateData[field] = body[field];
    }
  }

  if (Object.keys(updateData).length === 0) {
    throw new ApiError(
      "No valid fields provided",
      400,
      "NO_VALID_FIELDS_PROVIDED"
    );
  }

  const profile = await prisma.doctorProfile.update({
    where: {
      userId: session.user.id,
    },
    data: updateData,
  });

  return apiSuccess({
    success: true,
    profile,
  });
});

export const GET = withApiHandler(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new ApiError("Unauthorized", 401, "UNAUTHORIZED");
  }

  const profile = await prisma.doctorProfile.findUnique({
    where: {
      userId: session.user.id,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
        },
      },
    },
  });

  return apiSuccess({
    profile,
  });
});