import { NextRequest } from "next/server";

import { prisma } from "@/lib/database/prisma";

import {
  ApiError,
  apiSuccess,
} from "@/lib/api/error-handler";

import { withApiHandler } from "@/lib/api/with-api-handler";

/* ═════════════════════════════════════
   TYPES
═════════════════════════════════════ */

type TranslationRow = {
  localeCode: string;
  name: string;
};

/* ═════════════════════════════════════
   LEGACY CATEGORY ALIASES
═════════════════════════════════════ */

const CATEGORY_ID_ALIASES: Readonly<
  Record<string, string>
> = {
  wellness_and_drainage:
    "wellness_and_postoperative",

  longevity:
    "longevity_medicine",
};

/* ═════════════════════════════════════
   LOCALE
═════════════════════════════════════ */

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
  defaultLocaleCode: string | null,
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

/* ═════════════════════════════════════
   TRANSLATION
═════════════════════════════════════ */

function getTranslatedName(
  translations: TranslationRow[],
  localeCandidates: string[],
  fallbackName: string,
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

  const fallback =
    translations.find(
      (item) =>
        item.name?.trim(),
    );

  return (
    fallback?.name?.trim() ??
    fallbackName
  );
}

/* ═════════════════════════════════════
   CATEGORY NORMALIZATION
═════════════════════════════════════ */

function normalizeCategoryIds(
  categoryIds: string[],
): string[] {
  return Array.from(
    new Set(
      categoryIds.map(
        (categoryId) =>
          CATEGORY_ID_ALIASES[
            categoryId
          ] ?? categoryId,
      ),
    ),
  );
}

/* ═════════════════════════════════════
   GET
═════════════════════════════════════ */

export const GET =
  withApiHandler<
    unknown,
    NextRequest
  >(async (req) => {
    /* ─────────────────────────────────
       PARAMS
    ───────────────────────────────── */

    const slug =
      req.nextUrl.searchParams.get(
        "slug",
      );

    const requestedLocale =
      normalizeLocale(
        req.nextUrl.searchParams.get(
          "locale",
        ),
      );

    if (!slug) {
      throw new ApiError(
        "Missing doctor profile slug",
        400,
        "DOCTOR_PROFILE_SLUG_REQUIRED",
      );
    }

    /* ═══════════════════════════════════
       DEFAULT CATALOGUE LOCALE
    ═══════════════════════════════════ */

    const defaultLocale =
      await prisma.catalogLocale.findFirst({
        where: {
          isActive: true,
          isDefault: true,
        },

        orderBy: [
          {
            sortOrder: "asc",
          },
          {
            code: "asc",
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

    /* ═══════════════════════════════════
       DOCTOR PROFILE
    ═══════════════════════════════════ */

    const doctorProfile =
      await prisma.doctorProfile.findUnique({
        where: {
          slug,
        },

        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },

          /*
           * Normalized selected categories.
           */
          categories: {
            orderBy: {
              position: "asc",
            },

            select: {
              categoryId: true,
              position: true,
            },
          },

          /*
           * Real normalized subcategories.
           */
          subcategories: {
            orderBy: {
              position: "asc",
            },

            select: {
              subcategoryId: true,
              position: true,
            },
          },

          /*
           * Normalized selected procedures.
           */
          procedures: {
            orderBy: {
              position: "asc",
            },

            select: {
              procedureId: true,
              position: true,
              topRank: true,
            },
          },

          /*
           * Normalized specialties.
           */
          specialties: {
            orderBy: {
              position: "asc",
            },

            select: {
              specialtyId: true,
              position: true,
            },
          },
        },
      });

    if (!doctorProfile) {
      throw new ApiError(
        "Doctor profile not found",
        404,
        "DOCTOR_PROFILE_NOT_FOUND",
      );
    }

    /* ═══════════════════════════════════
       RESOLVE SELECTED IDS

       Prefer normalized relations.

       Fall back to legacy arrays for doctors
       that have not been backfilled yet.
    ═══════════════════════════════════ */

    const selectedCategoryIds =
      doctorProfile.categories.length >
      0
        ? doctorProfile.categories.map(
            (item) =>
              item.categoryId,
          )
        : normalizeCategoryIds(
            doctorProfile.subcategoryIds ??
              [],
          );

    const selectedProcedureIds =
      doctorProfile.procedures.length >
      0
        ? doctorProfile.procedures.map(
            (item) =>
              item.procedureId,
          )
        : doctorProfile.procedureIds ??
          [];

    const selectedSpecialtyIds =
      doctorProfile.specialties.length >
      0
        ? doctorProfile.specialties.map(
            (item) =>
              item.specialtyId,
          )
        : doctorProfile.specialtyIds ??
          [];

    const selectedSubcategoryIds =
      doctorProfile.subcategories.map(
        (item) =>
          item.subcategoryId,
      );

    /* ═══════════════════════════════════
       LOAD SELECTED CATALOGUE STRUCTURE
    ═══════════════════════════════════ */

    const categories =
      selectedCategoryIds.length > 0
        ? await prisma.category.findMany({
            where: {
              id: {
                in:
                  selectedCategoryIds,
              },

              isActive: true,
            },

            orderBy: [
              {
                sortOrder: "asc",
              },
              {
                id: "asc",
              },
            ],

            select: {
              id: true,
              sortOrder: true,

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
                  name: true,
                },
              },

              subcategories: {
                where: {
                  isActive: true,

                  /*
                   * If this doctor has normalized
                   * DoctorSubcategory rows, only
                   * retrieve those.
                   *
                   * Otherwise procedures below
                   * determine which ones appear.
                   */
                  ...(selectedSubcategoryIds.length >
                  0
                    ? {
                        id: {
                          in:
                            selectedSubcategoryIds,
                        },
                      }
                    : {}),
                },

                orderBy: [
                  {
                    sortOrder:
                      "asc",
                  },
                  {
                    id: "asc",
                  },
                ],

                select: {
                  id: true,
                  sortOrder: true,

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
                      name: true,
                    },
                  },

                  procedureLinks: {
                    where: {
                      isActive: true,

                      procedure: {
                        isActive: true,

                        id: {
                          in:
                            selectedProcedureIds,
                        },
                      },
                    },

                    orderBy: [
                      {
                        sortOrder:
                          "asc",
                      },
                      {
                        procedureId:
                          "asc",
                      },
                    ],

                    select: {
                      sortOrder: true,

                      procedure: {
                        select: {
                          id: true,

                          translations: {
                            where: {
                              localeCode:
                                {
                                  in:
                                    localeCandidates,
                                },
                            },

                            select: {
                              localeCode:
                                true,
                              name: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          })
        : [];

    /* ═══════════════════════════════════
       PRESERVE DOCTOR CATEGORY ORDER
    ═══════════════════════════════════ */

    const categoryPosition =
      new Map(
        selectedCategoryIds.map(
          (
            categoryId,
            index,
          ) => [
            categoryId,
            index,
          ],
        ),
      );

    const sortedCategories = [
      ...categories,
    ].sort(
      (left, right) => {
        const leftPosition =
          categoryPosition.get(
            left.id,
          ) ??
          Number.MAX_SAFE_INTEGER;

        const rightPosition =
          categoryPosition.get(
            right.id,
          ) ??
          Number.MAX_SAFE_INTEGER;

        return (
          leftPosition -
            rightPosition ||
          left.sortOrder -
            right.sortOrder
        );
      },
    );

    /* ═══════════════════════════════════
       CREATE PUBLIC EXPERTISE STRUCTURE
    ═══════════════════════════════════ */

    const expertise =
      sortedCategories
        .map((category) => {
          const categoryName =
            getTranslatedName(
              category.translations,
              localeCandidates,
              category.id,
            );

          const subcategories =
            category.subcategories
              .map(
                (subcategory) => {
                  const subcategoryName =
                    getTranslatedName(
                      subcategory.translations,
                      localeCandidates,
                      subcategory.id,
                    );

                  const procedures =
                    subcategory.procedureLinks.map(
                      ({
                        procedure,
                      }) => ({
                        id:
                          procedure.id,

                        label:
                          getTranslatedName(
                            procedure.translations,
                            localeCandidates,
                            procedure.id,
                          ),
                      }),
                    );

                  return {
                    subcategoryId:
                      subcategory.id,

                    label:
                      subcategoryName,

                    procedures,
                  };
                },
              )

              /*
               * Public page should not display
               * empty subcategory cards.
               */
              .filter(
                (subcategory) =>
                  subcategory
                    .procedures
                    .length > 0,
              );

          return {
            categoryId:
              category.id,

            label:
              categoryName,

            subcategories,
          };
        })

        /*
         * Public page should not show an
         * empty category tab.
         */
        .filter(
          (category) =>
            category.subcategories
              .length > 0,
        );

    /* ═══════════════════════════════════
       NORMALIZED TOP THREE
    ═══════════════════════════════════ */

    const relationalTopThree =
      doctorProfile.procedures
        .filter(
          (
            item,
          ): item is typeof item & {
            topRank: number;
          } =>
            item.topRank !== null,
        )
        .sort(
          (left, right) =>
            left.topRank -
            right.topRank,
        )
        .map(
          (item) =>
            item.procedureId,
        );

    const topThree =
      relationalTopThree.length >
      0
        ? relationalTopThree
        : doctorProfile.topThree ??
          [];

    /* ═══════════════════════════════════
       REMOVE INTERNAL RELATION ARRAYS
       FROM PUBLIC RESPONSE
    ═══════════════════════════════════ */

    const {
      categories:
        _doctorCategories,

      subcategories:
        _doctorSubcategories,

      procedures:
        _doctorProcedures,

      specialties:
        _doctorSpecialties,

      ...publicDoctorProfile
    } = doctorProfile;

    /* ═══════════════════════════════════
       RESPONSE
    ═══════════════════════════════════ */

    return apiSuccess({
      ...publicDoctorProfile,

      /*
       * Keep these properties because other
       * existing public components may still
       * consume them.
       */

      specialtyIds:
        selectedSpecialtyIds,

      procedureIds:
        selectedProcedureIds,

      /*
       * LEGACY:
       * subcategoryIds historically contains
       * category IDs.
       */
      subcategoryIds:
        selectedCategoryIds,

      categoryIds:
        selectedCategoryIds,

      normalizedSubcategoryIds:
        selectedSubcategoryIds,

      topThree,

      /*
       * This is what your new
       * PublicExpertiseSection consumes.
       */
      expertise,
    });
  });