import { prisma } from "@/lib/database/prisma";
import { apiSuccess } from "@/lib/api/error-handler";
import { withApiHandler } from "@/lib/api/with-api-handler";

type TranslationRow = {
  localeCode: string;
  name: string;
};

type LatestDoctorRow = {
  id: string;
  slug: string | null;
  avatar: string | null;
  city: string | null;
  country: string | null;
  yearsOfExperience: number | null;
  inClinicPrice: number | null;
  onlineConsulPrice: number | null;
  currency: string;
  stripeConnectOnboardingComplete: boolean;
  onlineActive: boolean;
  clinicBanner: string | null;
  googleRating: number | null;
  googleReviewCount: number | null;
  specialties: Array<{
    specialty: {
      id: string;
      translations: TranslationRow[];
    };
  }>;
  procedures: Array<{
    topRank: number | null;
    procedure: {
      id: string;
      translations: TranslationRow[];
    };
  }>;
  user: {
    name: string | null;
    image: string | null;
  };
};

function getLocaleCandidates(request: Request) {
  const requestedLocale =
    new URL(request.url).searchParams.get("locale")?.trim().toLowerCase() ??
    "en";

  const locale = /^[a-z]{2}(?:-[a-z0-9]{2,8})*$/.test(requestedLocale)
    ? requestedLocale
    : "en";

  return [...new Set([locale, locale.split("-")[0], "en"])];
}

function getTranslatedName(
  translations: TranslationRow[],
  localeCandidates: string[],
  fallback: string
) {
  for (const localeCode of localeCandidates) {
    const translation = translations.find(
      (item) => item.localeCode.toLowerCase() === localeCode
    );

    if (translation?.name.trim()) {
      return translation.name;
    }
  }

  return translations.find((item) => item.name.trim())?.name ?? fallback;
}

export const GET = withApiHandler(async (request: Request) => {
  const localeCandidates = getLocaleCandidates(request);

  const doctors: LatestDoctorRow[] = await prisma.doctorProfile.findMany({
    take: 4,
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      slug: true,
      avatar: true,
      city: true,
      country: true,
      yearsOfExperience: true,
      inClinicPrice: true,
      onlineConsulPrice: true,
      currency: true,
      stripeConnectOnboardingComplete: true,
      onlineActive: true,
      clinicBanner: true,
      googleRating: true,
      googleReviewCount: true,
      specialties: {
        orderBy: [{ position: "asc" }, { specialtyId: "asc" }],
        select: {
          specialty: {
            select: {
              id: true,
              translations: {
                where: {
                  localeCode: {
                    in: localeCandidates,
                  },
                },
                select: {
                  localeCode: true,
                  name: true,
                },
              },
            },
          },
        },
      },
      procedures: {
        where: {
          topRank: {
            not: null,
          },
        },
        orderBy: [{ topRank: "asc" }, { procedureId: "asc" }],
        select: {
          topRank: true,
          procedure: {
            select: {
              id: true,
              translations: {
                where: {
                  localeCode: {
                    in: localeCandidates,
                  },
                },
                select: {
                  localeCode: true,
                  name: true,
                },
              },
            },
          },
        },
      },
      user: {
        select: {
          name: true,
          image: true,
        },
      },
    },
  });

  const formattedDoctors = doctors.map((doctor) => {
    const specialties = doctor.specialties.map(({ specialty }) => ({
      id: specialty.id,
      name: getTranslatedName(
        specialty.translations,
        localeCandidates,
        specialty.id
      ),
    }));

    const topThreeProcedures = doctor.procedures.map(({ procedure }) => ({
      id: procedure.id,
      name: getTranslatedName(
        procedure.translations,
        localeCandidates,
        procedure.id
      ),
    }));

    return {
      id: doctor.id,
      slug: doctor.slug,
      name: doctor.user.name ?? "Doctor",

      // New database-backed values
      specialties,
      topThreeProcedures,

      // Retained for components still using the previous contract
      specialtyIds: specialties.map((specialty) => specialty.id),
      topThree: topThreeProcedures.map((procedure) => procedure.id),

      city: doctor.city,
      country: doctor.country,
      googleRating: doctor.googleRating,
      googleReviewCount: doctor.googleReviewCount,
      yearsOfExperience: doctor.yearsOfExperience,
      inClinicPrice: doctor.inClinicPrice,
      onlineConsulPrice: doctor.onlineConsulPrice,
      currency: doctor.currency,
      stripeConnectOnboardingComplete:
        doctor.stripeConnectOnboardingComplete,
      onlineActive: doctor.onlineActive,
      avatar:
        doctor.avatar ??
        doctor.user.image ??
        "/images/default-doctor.png",
      clinicBanner: doctor.clinicBanner,
    };
  });

  return apiSuccess(formattedDoctors);
});