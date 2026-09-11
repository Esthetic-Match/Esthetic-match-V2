import { prisma } from "@/lib/database/prisma";
import { apiSuccess } from "@/lib/api/error-handler";
import { withApiHandler } from "@/lib/api/with-api-handler";

import type {
  DoctorProfileWhereInput,
} from "@/generated/prisma/models/DoctorProfile";

/* ═════════════════════════════════════
   TYPES
═════════════════════════════════════ */

type TranslationRow = {
  localeCode: string;
  name: string;
};

/* ═════════════════════════════════════
   HELPERS
═════════════════════════════════════ */

function normalize(
  value: string,
) {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_");
}

function parseList(
  value: string | null,
): string[] | undefined {
  const items = value
    ?.split(",")
    .map((item) =>
      item.trim(),
    )
    .filter(Boolean);

  return items &&
    items.length > 0
    ? items
    : undefined;
}

function parseNumber(
  value: string | null,
): number | null {
  if (!value) {
    return null;
  }

  const number =
    Number(value);

  return Number.isNaN(
    number,
  )
    ? null
    : number;
}

function normalizeLocale(
  value: string | null,
): string {
  const normalized = (
    value ?? "en"
  )
    .trim()
    .toLowerCase()
    .replaceAll("_", "-");

  if (
    /^[a-z]{2}(?:-[a-z0-9]{2,8})*$/.test(
      normalized,
    )
  ) {
    return normalized;
  }

  return "en";
}

function getLocaleCandidates(
  requestedLocale: string,
  defaultLocaleCode:
    | string
    | null,
): string[] {
  return Array.from(
    new Set(
      [
        requestedLocale,
        requestedLocale.split(
          "-",
        )[0],

        defaultLocaleCode
          ?.trim()
          .toLowerCase(),

        "en",
      ].filter(
        (
          locale,
        ): locale is string =>
          Boolean(locale),
      ),
    ),
  );
}

function getTranslatedName(
  translations: TranslationRow[],
  localeCandidates: string[],
  fallback: string,
): string {
  for (
    const localeCode of localeCandidates
  ) {
    const translation =
      translations.find(
        (item) =>
          item.localeCode.toLowerCase() ===
          localeCode.toLowerCase(),
      );

    if (
      translation?.name?.trim()
    ) {
      return translation.name.trim();
    }
  }

  const fallbackTranslation =
    translations.find(
      (item) =>
        item.name?.trim(),
    );

  return (
    fallbackTranslation?.name?.trim() ??
    fallback
  );
}

function uniqueNormalizedList(
  values:
    | string[]
    | undefined,
): string[] {
  if (!values) {
    return [];
  }

  return Array.from(
    new Set(
      values.flatMap(
        (value) => [
          value,
          normalize(value),
        ],
      ),
    ),
  );
}

/* ═════════════════════════════════════
   GET
═════════════════════════════════════ */

export const GET =
  withApiHandler(
    async (req: Request) => {
      const { searchParams } =
        new URL(req.url);

      /* ───────────────────────────────
         QUERY PARAMS
      ─────────────────────────────── */

      const q =
        searchParams
          .get("q")
          ?.trim();

      const specialtyFilters =
        parseList(
          searchParams.get(
            "specialty",
          ),
        );

      const categoryFilters =
        parseList(
          searchParams.get(
            "category",
          ),
        );

      const procedureFilters =
        parseList(
          searchParams.get(
            "procedures",
          ),
        );

      const location =
        searchParams
          .get("location")
          ?.trim();

      const minRating =
        parseNumber(
          searchParams.get(
            "minRating",
          ),
        );

      const topThreeOnly =
        searchParams.get(
          "topThreeOnly",
        ) === "true";

      const maxInClinicPrice =
        parseNumber(
          searchParams.get(
            "maxInClinicPrice",
          ),
        );

      const maxOnlineConsultationPrice =
        parseNumber(
          searchParams.get(
            "maxOnlineConsultationPrice",
          ),
        );

      const requestedLocale =
        normalizeLocale(
          searchParams.get(
            "locale",
          ),
        );

      /* ───────────────────────────────
         PAGINATION
      ─────────────────────────────── */

      const page = Math.max(
        Number(
          searchParams.get(
            "page",
          ) || "1",
        ),
        1,
      );

      const limit = Math.min(
        Math.max(
          Number(
            searchParams.get(
              "limit",
            ) || "10",
          ),
          1,
        ),
        50,
      );

      const skip =
        (page - 1) *
        limit;

      /* ═══════════════════════════════
         LOCALE
      ═══════════════════════════════ */

      const defaultLocale =
        await prisma.catalogLocale.findFirst({
          where: {
            isActive: true,
            isDefault: true,
          },

          orderBy: [
            {
              sortOrder:
                "asc",
            },
            {
              code:
                "asc",
            },
          ],

          select: {
            code: true,
          },
        });

      const localeCandidates =
        getLocaleCandidates(
          requestedLocale,
          defaultLocale?.code ??
            null,
        );

      /* ═══════════════════════════════
         NORMALIZED FILTER IDS
      ═══════════════════════════════ */

      const normalizedSpecialties =
        uniqueNormalizedList(
          specialtyFilters,
        );

      const normalizedCategories =
        uniqueNormalizedList(
          categoryFilters,
        );

      const normalizedProcedures =
        uniqueNormalizedList(
          procedureFilters,
        );

      const normalizedQ =
        q
          ? normalize(q)
          : undefined;

      const qValues = [
        q,
        normalizedQ,
      ].filter(
        (
          value,
        ): value is string =>
          Boolean(value),
      );

      /* ═══════════════════════════════
         BASE FILTER
      ═══════════════════════════════ */

      const andFilters: DoctorProfileWhereInput[] =
        [
          {
            slug: {
              not: null,
            },

            user: {
              is: {
                role:
                  "DOCTOR",

                onboardingCompleted:
                  true,
              },
            },
          },
        ];

      /* ═══════════════════════════════
         SEARCH

         Search doctor info AND normalized
         catalogue translation names.
      ═══════════════════════════════ */

      if (q) {
        andFilters.push({
          OR: [
            {
              user: {
                is: {
                  name: {
                    contains:
                      q,

                    mode:
                      "insensitive",
                  },
                },
              },
            },

            {
              clinicName: {
                contains:
                  q,

                mode:
                  "insensitive",
              },
            },

            {
              city: {
                contains:
                  q,

                mode:
                  "insensitive",
              },
            },

            {
              country: {
                contains:
                  q,

                mode:
                  "insensitive",
              },
            },

            /* NORMALIZED SPECIALTY SEARCH */

            {
              specialties: {
                some: {
                  specialty: {
                    is: {
                      isActive:
                        true,

                      translations:
                        {
                          some: {
                            name: {
                              contains:
                                q,

                              mode:
                                "insensitive",
                            },
                          },
                        },
                    },
                  },
                },
              },
            },

            /* NORMALIZED CATEGORY SEARCH */

            {
              categories: {
                some: {
                  category: {
                    is: {
                      isActive:
                        true,

                      translations:
                        {
                          some: {
                            name: {
                              contains:
                                q,

                              mode:
                                "insensitive",
                            },
                          },
                        },
                    },
                  },
                },
              },
            },

            /* NORMALIZED PROCEDURE SEARCH */

            {
              procedures: {
                some: {
                  procedure: {
                    is: {
                      isActive:
                        true,

                      translations:
                        {
                          some: {
                            name: {
                              contains:
                                q,

                              mode:
                                "insensitive",
                            },
                          },
                        },
                    },
                  },
                },
              },
            },

            /*
             * Transitional legacy fallbacks.
             */

            {
              specialtyIds: {
                hasSome:
                  qValues,
              },
            },

            {
              subcategoryIds: {
                hasSome:
                  qValues,
              },
            },

            {
              procedureIds: {
                hasSome:
                  qValues,
              },
            },
          ],
        });
      }

      /* ═══════════════════════════════
         SPECIALTY FILTER
      ═══════════════════════════════ */

      if (
        normalizedSpecialties.length >
        0
      ) {
        andFilters.push({
          OR: [
            {
              specialties: {
                some: {
                  specialtyId: {
                    in:
                      normalizedSpecialties,
                  },

                  specialty: {
                    is: {
                      isActive:
                        true,
                    },
                  },
                },
              },
            },

            /*
             * Legacy fallback until migration
             * parity is fully verified.
             */
            {
              specialtyIds: {
                hasSome:
                  normalizedSpecialties,
              },
            },
          ],
        });
      }

      /* ═══════════════════════════════
         CATEGORY FILTER
      ═══════════════════════════════ */

      if (
        normalizedCategories.length >
        0
      ) {
        andFilters.push({
          OR: [
            {
              categories: {
                some: {
                  categoryId: {
                    in:
                      normalizedCategories,
                  },

                  category: {
                    is: {
                      isActive:
                        true,
                    },
                  },
                },
              },
            },

            /*
             * LEGACY:
             * DoctorProfile.subcategoryIds
             * historically stores category IDs.
             */
            {
              subcategoryIds: {
                hasSome:
                  normalizedCategories,
              },
            },
          ],
        });
      }

      /* ═══════════════════════════════
         PROCEDURE FILTER

         This is intentionally a separate
         AND condition from category/specialty.

         Your old implementation placed all
         catalogue filters inside one OR,
         meaning:
           category A OR procedure B

         rather than:
           category A AND procedure B
      ═══════════════════════════════ */

      if (
        normalizedProcedures.length >
        0
      ) {
        if (topThreeOnly) {
          andFilters.push({
            OR: [
              {
                procedures: {
                  some: {
                    procedureId: {
                      in:
                        normalizedProcedures,
                    },

                    topRank: {
                      not: null,
                    },

                    procedure: {
                      is: {
                        isActive:
                          true,
                      },
                    },
                  },
                },
              },

              {
                topThree: {
                  hasSome:
                    normalizedProcedures,
                },
              },
            ],
          });
        } else {
          andFilters.push({
            OR: [
              {
                procedures: {
                  some: {
                    procedureId: {
                      in:
                        normalizedProcedures,
                    },

                    procedure: {
                      is: {
                        isActive:
                          true,
                      },
                    },
                  },
                },
              },

              {
                procedureIds: {
                  hasSome:
                    normalizedProcedures,
                },
              },
            ],
          });
        }
      }

      /* ═══════════════════════════════
         LOCATION
      ═══════════════════════════════ */

      if (location) {
        andFilters.push({
          OR: [
            {
              city: {
                contains:
                  location,

                mode:
                  "insensitive",
              },
            },

            {
              country: {
                contains:
                  location,

                mode:
                  "insensitive",
              },
            },
          ],
        });
      }

      /* ═══════════════════════════════
         RATING
      ═══════════════════════════════ */

      if (
        minRating !== null
      ) {
        andFilters.push({
          googleRating: {
            gte:
              minRating,

            not:
              null,
          },
        });
      }

      /* ═══════════════════════════════
         CLINIC PRICE
      ═══════════════════════════════ */

      if (
        maxInClinicPrice !==
        null
      ) {
        andFilters.push({
          inClinicPrice: {
            gte: 0,
            lte:
              maxInClinicPrice,
          },
        });
      }

      /* ═══════════════════════════════
         ONLINE PRICE
      ═══════════════════════════════ */

      if (
        maxOnlineConsultationPrice !==
        null
      ) {
        andFilters.push({
          onlineConsulPrice: {
            gte: 0,

            lte:
              maxOnlineConsultationPrice,
          },
        });
      }

      const where: DoctorProfileWhereInput =
        {
          AND:
            andFilters,
        };

      /* ═══════════════════════════════
         FETCH DOCTORS
      ═══════════════════════════════ */

      const doctors =
        await prisma.doctorProfile.findMany({
          skip,
          take:
            limit + 1,

          where,

          orderBy: {
            createdAt:
              "desc",
          },

          select: {
            id: true,
            userId: true,
            slug: true,

            avatar: true,
            clinicBanner: true,
            clinicName: true,

            city: true,
            country: true,

            yearsOfExperience:
              true,

            inClinicPrice:
              true,

            onlineConsulPrice:
              true,

            currency: true,

            googleRating:
              true,

            googleReviewCount:
              true,

            stripeConnectOnboardingComplete:
              true,

            onlineActive:
              true,

            /*
             * Transitional arrays for old
             * profiles not backfilled yet.
             */

            specialtyIds:
              true,

            procedureIds:
              true,

            topThree:
              true,

            /* USER */

            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },

            /* NORMALIZED SPECIALTIES */

            specialties: {
              where: {
                specialty: {
                  isActive:
                    true,
                },
              },

              orderBy: {
                position:
                  "asc",
              },

              select: {
                specialtyId:
                  true,

                specialty: {
                  select: {
                    id: true,

                    translations: {
                      where: {
                        localeCode: {
                          in:
                            localeCandidates,
                        },
                      },

                      select: {
                        localeCode:
                          true,

                        name:
                          true,
                      },
                    },
                  },
                },
              },
            },

            /* NORMALIZED PROCEDURES */

            procedures: {
              where: {
                procedure: {
                  isActive:
                    true,
                },
              },

              orderBy: {
                position:
                  "asc",
              },

              select: {
                procedureId:
                  true,

                position:
                  true,

                topRank:
                  true,

                procedure: {
                  select: {
                    id: true,

                    translations: {
                      where: {
                        localeCode: {
                          in:
                            localeCandidates,
                        },
                      },

                      select: {
                        localeCode:
                          true,

                        name:
                          true,
                      },
                    },
                  },
                },
              },
            },
          },
        });

      /* ═══════════════════════════════
         PAGINATION
      ═══════════════════════════════ */

      const visibleDoctors =
        doctors.slice(
          0,
          limit,
        );

      const hasMore =
        doctors.length >
        limit;

      /* ═══════════════════════════════
         LEGACY TRANSLATION FALLBACK

         Only needed during transition for
         profiles that don't yet have
         normalized relation rows.
      ═══════════════════════════════ */

      const legacySpecialtyIds =
        Array.from(
          new Set(
            visibleDoctors.flatMap(
              (doctor) =>
                doctor.specialties
                  .length === 0
                  ? doctor.specialtyIds
                  : [],
            ),
          ),
        );

      const legacyTopProcedureIds =
        Array.from(
          new Set(
            visibleDoctors.flatMap(
              (doctor) => {
                const relationalTopThree =
                  doctor.procedures.filter(
                    (procedure) =>
                      procedure.topRank !==
                      null,
                  );

                return relationalTopThree.length ===
                  0
                  ? doctor.topThree
                  : [];
              },
            ),
          ),
        );

      const [
        legacySpecialties,
        legacyTopProcedures,
      ] = await Promise.all([
        legacySpecialtyIds.length >
        0
          ? prisma.specialty.findMany({
              where: {
                id: {
                  in:
                    legacySpecialtyIds,
                },

                isActive:
                  true,
              },

              select: {
                id: true,

                translations: {
                  where: {
                    localeCode: {
                      in:
                        localeCandidates,
                    },
                  },

                  select: {
                    localeCode:
                      true,

                    name:
                      true,
                  },
                },
              },
            })
          : Promise.resolve(
              [],
            ),

        legacyTopProcedureIds.length >
        0
          ? prisma.procedure.findMany({
              where: {
                id: {
                  in:
                    legacyTopProcedureIds,
                },

                isActive:
                  true,
              },

              select: {
                id: true,

                translations: {
                  where: {
                    localeCode: {
                      in:
                        localeCandidates,
                    },
                  },

                  select: {
                    localeCode:
                      true,

                    name:
                      true,
                  },
                },
              },
            })
          : Promise.resolve(
              [],
            ),
      ]);

      const legacySpecialtyMap =
        new Map(
          legacySpecialties.map(
            (specialty) => [
              specialty.id,

              {
                id:
                  specialty.id,

                name:
                  getTranslatedName(
                    specialty.translations,
                    localeCandidates,
                    specialty.id,
                  ),
              },
            ],
          ),
        );

      const legacyProcedureMap =
        new Map(
          legacyTopProcedures.map(
            (procedure) => [
              procedure.id,

              {
                id:
                  procedure.id,

                name:
                  getTranslatedName(
                    procedure.translations,
                    localeCandidates,
                    procedure.id,
                  ),
              },
            ],
          ),
        );

      /* ═══════════════════════════════
         FORMAT DOCTOR CARDS
      ═══════════════════════════════ */

      const formattedDoctors =
        visibleDoctors.map(
          (doctor) => {
            /* ───────────────────────
               SPECIALTIES
            ─────────────────────── */

            const relationalSpecialties =
              doctor.specialties.map(
                ({
                  specialty,
                }) => ({
                  id:
                    specialty.id,

                  name:
                    getTranslatedName(
                      specialty.translations,
                      localeCandidates,
                      specialty.id,
                    ),
                }),
              );

            const specialties =
              relationalSpecialties.length >
              0
                ? relationalSpecialties
                : doctor.specialtyIds
                    .map(
                      (id) =>
                        legacySpecialtyMap.get(
                          id,
                        ),
                    )
                    .filter(
                      (
                        item,
                      ): item is {
                        id: string;
                        name: string;
                      } =>
                        Boolean(
                          item,
                        ),
                    );

            /* ───────────────────────
               TOP THREE
            ─────────────────────── */

            const relationalTopThree =
              doctor.procedures
                .filter(
                  (
                    procedure,
                  ): procedure is typeof procedure & {
                    topRank: number;
                  } =>
                    procedure.topRank !==
                    null,
                )
                .sort(
                  (
                    left,
                    right,
                  ) =>
                    left.topRank -
                    right.topRank,
                )
                .slice(
                  0,
                  3,
                )
                .map(
                  ({
                    procedure,
                  }) => ({
                    id:
                      procedure.id,

                    name:
                      getTranslatedName(
                        procedure.translations,
                        localeCandidates,
                        procedure.id,
                      ),
                  }),
                );

            const topThreeProcedures =
              relationalTopThree.length >
              0
                ? relationalTopThree
                : doctor.topThree
                    .slice(
                      0,
                      3,
                    )
                    .map(
                      (id) =>
                        legacyProcedureMap.get(
                          id,
                        ),
                    )
                    .filter(
                      (
                        item,
                      ): item is {
                        id: string;
                        name: string;
                      } =>
                        Boolean(
                          item,
                        ),
                    );

            return {
              id:
                doctor.id,

              slug:
                doctor.slug,

              name:
                doctor.user
                  .name ??
                "Doctor",

              clinicName:
                doctor.clinicName,

              /* DB-backed display data */

              specialties,

              topThreeProcedures,

              /*
               * Keep IDs temporarily for
               * backwards compatibility.
               */
              specialtyIds:
                specialties.map(
                  (item) =>
                    item.id,
                ),

              topThree:
                topThreeProcedures.map(
                  (item) =>
                    item.id,
                ),

              city:
                doctor.city,

              country:
                doctor.country,

              googleRating:
                doctor.googleRating,

              googleReviewCount:
                doctor.googleReviewCount,

              yearsOfExperience:
                doctor.yearsOfExperience,

              inClinicPrice:
                doctor.inClinicPrice,

              onlineConsulPrice:
                doctor.onlineConsulPrice,

              currency:
                doctor.currency,

              stripeConnectOnboardingComplete:
                doctor.stripeConnectOnboardingComplete,

              onlineActive:
                doctor.onlineActive,

              avatar:
                doctor.avatar ??
                doctor.user.image ??
                "/images/default-doctor.png",

              clinicBanner:
                doctor.clinicBanner,
            };
          },
        );

      return apiSuccess({
        doctors:
          formattedDoctors,

        page,
        limit,
        hasMore,

        locale:
          localeCandidates[0] ??
          "en",
      });
    },
  );