import {
  NextRequest,
  NextResponse,
} from "next/server";

import { prisma } from "@/lib/database/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ═════════════════════════════════════
   TYPES
═════════════════════════════════════ */

type TranslationRow = {
  localeCode: string;
  name: string;
  description: string | null;
};

type NameTranslationRow = {
  localeCode: string;
  name: string;
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
  request: NextRequest,
  defaultLocaleCode: string | null,
): string[] {
  const requestedLocale =
    normalizeLocale(
      request.nextUrl.searchParams.get(
        "locale",
      ),
    );

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
   TRANSLATION HELPERS
═════════════════════════════════════ */

function getTranslation(
  translations: TranslationRow[],
  localeCandidates: string[],
  fallbackName: string,
) {
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
      return {
        name:
          translation.name.trim(),

        description:
          translation.description ??
          null,
      };
    }
  }

  const fallbackTranslation =
    translations.find(
      (item) =>
        item.name?.trim(),
    );

  return {
    name:
      fallbackTranslation?.name?.trim() ??
      fallbackName,

    description:
      fallbackTranslation?.description ??
      null,
  };
}

function getNameTranslation(
  translations: NameTranslationRow[],
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

  const fallbackTranslation =
    translations.find(
      (item) =>
        item.name?.trim(),
    );

  return (
    fallbackTranslation?.name?.trim() ??
    fallbackName
  );
}

/* ═════════════════════════════════════
   GET
═════════════════════════════════════ */

export async function GET(
  request: NextRequest,
) {
  try {
    /* ─────────────────────────────────
       DEFAULT LOCALE
    ───────────────────────────────── */

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
        request,
        defaultLocale?.code ?? null,
      );

    /* ═══════════════════════════════════
       LOAD SPECIALTIES + CATEGORIES
    ═══════════════════════════════════ */

    const [
      specialties,
      categories,
    ] = await Promise.all([
      /* ───────────────────────────────
         SPECIALTIES
      ─────────────────────────────── */

      prisma.specialty.findMany({
        where: {
          isActive: true,

          specialtyGroup: {
            isActive: true,
          },
        },

        orderBy: [
          {
            specialtyGroup: {
              sortOrder: "asc",
            },
          },
          {
            sortOrder: "asc",
          },
          {
            id: "asc",
          },
        ],

        select: {
          id: true,
          icon: true,
          sortOrder: true,
          specialtyGroupId: true,

          translations: {
            where: {
              localeCode: {
                in: localeCandidates,
              },
            },

            select: {
              localeCode: true,
              name: true,
              description: true,
            },
          },

          specialtyGroup: {
            select: {
              id: true,
              sortOrder: true,

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
      }),

      /* ───────────────────────────────
         CATEGORIES
      ─────────────────────────────── */

      prisma.category.findMany({
        where: {
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
          slug: true,
          href: true,
          homeImage: true,
          dashboardImage: true,
          icon: true,
          sortOrder: true,

          /* ─────────────────────────
             CATEGORY TRANSLATIONS
          ───────────────────────── */

          translations: {
            where: {
              localeCode: {
                in: localeCandidates,
              },
            },

            select: {
              localeCode: true,
              name: true,
              description: true,
            },
          },

          /* ─────────────────────────
             SPECIALTY → CATEGORY
          ───────────────────────── */

          specialtyLinks: {
            where: {
              isActive: true,

              specialty: {
                isActive: true,

                specialtyGroup: {
                  isActive: true,
                },
              },
            },

            orderBy: [
              {
                sortOrder: "asc",
              },
              {
                specialtyId: "asc",
              },
            ],

            select: {
              specialtyId: true,
              sortOrder: true,
            },
          },

          /* ─────────────────────────
             SUBCATEGORIES
          ───────────────────────── */

          subcategories: {
            where: {
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
                    in: localeCandidates,
                  },
                },

                select: {
                  localeCode: true,
                  name: true,
                  description: true,
                },
              },

              /* ─────────────────────
                 PROCEDURES
              ───────────────────── */

              procedureLinks: {
                where: {
                  isActive: true,

                  procedure: {
                    isActive: true,
                  },
                },

                orderBy: [
                  {
                    sortOrder: "asc",
                  },
                  {
                    procedureId: "asc",
                  },
                ],

                select: {
                  sortOrder: true,
                  procedureId: true,

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
                          description: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      }),
    ]);

    /* ═══════════════════════════════════
       FORMAT SPECIALTIES
    ═══════════════════════════════════ */

    const responseSpecialties =
      specialties.map(
        (specialty) => {
          const specialtyTranslation =
            getTranslation(
              specialty.translations,
              localeCandidates,
              specialty.id,
            );

          const groupName =
            getNameTranslation(
              specialty.specialtyGroup
                .translations,
              localeCandidates,
              specialty.specialtyGroup.id,
            );

          return {
            id: specialty.id,

            name:
              specialtyTranslation.name,

            description:
              specialtyTranslation.description,

            icon:
              specialty.icon,

            sortOrder:
              specialty.sortOrder,

            specialtyGroupId:
              specialty.specialtyGroupId,

            group: {
              id:
                specialty.specialtyGroup.id,

              name:
                groupName,

              sortOrder:
                specialty.specialtyGroup
                  .sortOrder,
            },
          };
        },
      );

    /* ═══════════════════════════════════
       FORMAT CATEGORIES
    ═══════════════════════════════════ */

    const responseCategories =
      categories.map(
        (category) => {
          const categoryTranslation =
            getTranslation(
              category.translations,
              localeCandidates,
              category.id,
            );

          return {
            id:
              category.id,

            slug:
              category.slug,

            name:
              categoryTranslation.name,

            description:
              categoryTranslation.description,

            href:
              category.href,

            homeImage:
              category.homeImage,

            dashboardImage:
              category.dashboardImage,

            icon:
              category.icon,

            sortOrder:
              category.sortOrder,

            /* ───────────────────────
               SPECIALTIES
            ─────────────────────── */

            specialtyIds:
              category.specialtyLinks.map(
                (link) =>
                  link.specialtyId,
              ),

            /* ───────────────────────
               SUBCATEGORIES
            ─────────────────────── */

            subcategories:
              category.subcategories.map(
                (
                  subcategory,
                ) => {
                  const subcategoryTranslation =
                    getTranslation(
                      subcategory.translations,
                      localeCandidates,
                      subcategory.id,
                    );

                  return {
                    id:
                      subcategory.id,

                    name:
                      subcategoryTranslation.name,

                    description:
                      subcategoryTranslation.description,

                    sortOrder:
                      subcategory.sortOrder,

                    /* ─────────────────
                       PROCEDURES
                    ───────────────── */

                    procedures:
                      subcategory.procedureLinks.map(
                        ({
                          procedure,
                          sortOrder,
                        }) => {
                          const procedureTranslation =
                            getTranslation(
                              procedure.translations,
                              localeCandidates,
                              procedure.id,
                            );

                          return {
                            id:
                              procedure.id,

                            name:
                              procedureTranslation.name,

                            description:
                              procedureTranslation.description,

                            sortOrder,
                          };
                        },
                      ),
                  };
                },
              ),
          };
        },
      );

    /* ═══════════════════════════════════
       RESPONSE
    ═══════════════════════════════════ */

    return NextResponse.json(
      {
        success: true,

        locale:
          localeCandidates[0] ??
          "en",

        specialties:
          responseSpecialties,

        categories:
          responseCategories,
      },
      {
        status: 200,

        headers: {
          "Cache-Control":
            "no-store, max-age=0",
        },
      },
    );
  } catch (error) {
    console.error(
      "Could not load doctor catalogue:",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        error:
          "Could not load doctor catalogue.",
      },
      {
        status: 500,
      },
    );
  }
}