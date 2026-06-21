import { prisma } from "@/lib/database/prisma";
import { apiSuccess } from "@/lib/api/error-handler";
import { withApiHandler } from "@/lib/api/with-api-handler";
import type { DoctorProfileWhereInput } from "@/generated/prisma/models/DoctorProfile";

type PublicDoctorProfileRow = {
  id: string;
  userId: string;
  slug: string | null;
  avatar: string | null;
  specialtyIds: string[];
  city: string | null;
  country: string | null;
  yearsOfExperience: number | null;
  inClinicPrice: number | null;
  onlineConsulPrice: number | null;
  currency: string;
  googleRating: number | null;
  googleReviewCount: number | null;
  stripeConnectOnboardingComplete: boolean;
  onlineActive: boolean;
  clinicBanner: string | null;
};

type PublicDoctorUserRow = {
  id: string;
  name: string | null;
  image: string | null;
};

function normalize(value: string) {
  return value.toLowerCase().trim().replace(/\s+/g, "_");
}

function parseList(value: string | null): string[] | undefined {
  const items = value
    ?.split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return items && items.length > 0 ? items : undefined;
}

function parseNumber(value: string | null): number | null {
  if (!value) return null;

  const n = Number(value);

  return Number.isNaN(n) ? null : n;
}

function isDoctorProfileWhereInput(
  value: DoctorProfileWhereInput | null
): value is DoctorProfileWhereInput {
  return value !== null;
}

export const GET = withApiHandler(async (req: Request) => {
  const { searchParams } = new URL(req.url);

  const q = searchParams.get("q")?.trim();
  const specialties = parseList(searchParams.get("specialty"));
  const categories = parseList(searchParams.get("category"));
  const procedures = parseList(searchParams.get("procedures"));
  const location = searchParams.get("location")?.trim();
  const minRating = parseNumber(searchParams.get("minRating"));
  const topThreeOnly = searchParams.get("topThreeOnly") === "true";
  const maxInClinicPrice = parseNumber(searchParams.get("maxInClinicPrice"));
  const maxOnlineConsultationPrice = parseNumber(
    searchParams.get("maxOnlineConsultationPrice")
  );

  const page = Math.max(Number(searchParams.get("page") || "1"), 1);
  const limit = Math.min(
    Math.max(Number(searchParams.get("limit") || "10"), 1),
    50
  );
  const skip = (page - 1) * limit;

  const normalizedQ = q ? normalize(q) : undefined;

  const normalizedSpecialties =
    specialties && specialties.length > 0
      ? specialties.flatMap((item) => [item, normalize(item)])
      : [];

  const qValues = [q, normalizedQ].filter((value): value is string =>
    Boolean(value)
  );

  const searchOrFiltersRaw: Array<DoctorProfileWhereInput | null> = [
    q
      ? {
          OR: [
            {
              user: {
                is: {
                  name: {
                    contains: q,
                    mode: "insensitive",
                  },
                },
              },
            },
            {
              clinicName: {
                contains: q,
                mode: "insensitive",
              },
            },
            {
              city: {
                contains: q,
                mode: "insensitive",
              },
            },
            {
              country: {
                contains: q,
                mode: "insensitive",
              },
            },
            {
              specialtyIds: {
                hasSome: qValues,
              },
            },
            {
              subcategoryIds: {
                hasSome: qValues,
              },
            },
            {
              procedureIds: {
                hasSome: qValues,
              },
            },
          ],
        }
      : null,

    specialties && specialties.length > 0
      ? {
          specialtyIds: {
            hasSome: normalizedSpecialties,
          },
        }
      : null,

    categories && categories.length > 0
      ? {
          subcategoryIds: {
            hasSome: categories,
          },
        }
      : null,

    procedures && procedures.length > 0
      ? topThreeOnly
        ? {
            topThree: {
              hasSome: procedures,
            },
          }
        : {
            procedureIds: {
              hasSome: procedures,
            },
          }
      : null,
  ];

  const searchOrFilters = searchOrFiltersRaw.filter(isDoctorProfileWhereInput);

  const publicProfileFilter: DoctorProfileWhereInput = {
    slug: {
      not: null,
    },
    user: {
      is: {
        role: "DOCTOR",
        onboardingCompleted: true,
      },
    },
  };

  const andFilters: DoctorProfileWhereInput[] = [publicProfileFilter];

  if (searchOrFilters.length > 0) {
    andFilters.push({
      OR: searchOrFilters,
    });
  }

  if (location) {
    andFilters.push({
      OR: [
        {
          city: {
            contains: location,
            mode: "insensitive",
          },
        },
        {
          country: {
            contains: location,
            mode: "insensitive",
          },
        },
      ],
    });
  }

  if (minRating !== null) {
    andFilters.push({
      googleRating: {
        gte: minRating,
        not: null,
      },
    });
  }

  if (maxInClinicPrice !== null) {
    andFilters.push({
      AND: [
        {
          inClinicPrice: {
            gt: -1,
          },
        },
        {
          inClinicPrice: {
            lte: maxInClinicPrice,
          },
        },
      ],
    });
  }

  if (maxOnlineConsultationPrice !== null) {
    andFilters.push({
      AND: [
        {
          onlineConsulPrice: {
            gt: -1,
          },
        },
        {
          onlineConsulPrice: {
            lte: maxOnlineConsultationPrice,
          },
        },
      ],
    });
  }

  const where: DoctorProfileWhereInput = {
    AND: andFilters,
  };

const doctors: PublicDoctorProfileRow[] = await prisma.doctorProfile.findMany({
  skip,
  take: limit + 1,
  where,
  orderBy: {
    createdAt: "desc",
  },
  select: {
    id: true,
    userId: true,
    slug: true,
    avatar: true,
    specialtyIds: true,
    city: true,
    country: true,
    yearsOfExperience: true,
    inClinicPrice: true,
    onlineConsulPrice: true,
    currency: true,
    googleRating: true,
    googleReviewCount: true,
    stripeConnectOnboardingComplete: true,
    onlineActive: true,
    clinicBanner: true,
  },
});

const visibleDoctors = doctors.slice(0, limit);
const hasMore = doctors.length > limit;

const userIds = Array.from(
  new Set(visibleDoctors.map((doctor: PublicDoctorProfileRow) => doctor.userId))
);

const users: PublicDoctorUserRow[] =
  userIds.length > 0
    ? await prisma.user.findMany({
        where: {
          id: {
            in: userIds,
          },
        },
        select: {
          id: true,
          name: true,
          image: true,
        },
      })
    : [];

const userById = new Map<string, PublicDoctorUserRow>(
  users.map((user: PublicDoctorUserRow) => [user.id, user])
);

const formattedDoctors = visibleDoctors.map(
  (doctor: PublicDoctorProfileRow) => {
    const user = userById.get(doctor.userId);

    return {
      id: doctor.id,
      slug: doctor.slug,
      name: user?.name ?? "Doctor",
      specialtyIds: doctor.specialtyIds,
      city: doctor.city,
      country: doctor.country,
      googleRating: doctor.googleRating,
      googleReviewCount: doctor.googleReviewCount,
      yearsOfExperience: doctor.yearsOfExperience,
      inClinicPrice: doctor.inClinicPrice,
      onlineConsulPrice: doctor.onlineConsulPrice,
      currency: doctor.currency,
      stripeConnectOnboardingComplete: doctor.stripeConnectOnboardingComplete,
      onlineActive: doctor.onlineActive,
      avatar: doctor.avatar ?? user?.image ?? "/images/default-doctor.png",
      clinicBanner: doctor.clinicBanner,
    };
  }
);

return apiSuccess({
  doctors: formattedDoctors,
  page,
  limit,
  hasMore,
});
});