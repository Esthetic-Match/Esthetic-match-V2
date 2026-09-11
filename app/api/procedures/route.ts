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
        requestedLocale.split("-")[0],
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

function getTranslation(
  translations: TranslationRow[],
  localeCandidates: string[],
  fallbackName: string,
) {
  for (const localeCode of localeCandidates) {
    const translation =
      translations.find(
        (item) =>
          item.localeCode.toLowerCase() ===
          localeCode.toLowerCase(),
      );

    if (translation?.name?.trim()) {
      return {
        name:
          translation.name.trim(),

        description:
          translation.description ??
          null,
      };
    }
  }

  const fallback =
    translations.find(
      (item) =>
        item.name?.trim(),
    );

  return {
    name:
      fallback?.name?.trim() ??
      fallbackName,

    description:
      fallback?.description ??
      null,
  };
}

/* ═════════════════════════════════════
   GET
═════════════════════════════════════ */

export async function GET(
  request: NextRequest,
) {
  try {
    const categoryId =
      request.nextUrl.searchParams
        .get("categoryId")
        ?.trim() || null;

    const subcategoryId =
      request.nextUrl.searchParams
        .get("subcategoryId")
        ?.trim() || null;

    const search =
      request.nextUrl.searchParams
        .get("search")
        ?.trim() || null;

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
        defaultLocale?.code ??
          null,
      );

    /* ═══════════════════════════════════
       PROCEDURES
    ═══════════════════════════════════ */

    const procedures =
      await prisma.procedure.findMany({
        where: {
          isActive: true,

          /*
           * Optional category / subcategory
           * filtering.
           */
          ...(categoryId ||
          subcategoryId
            ? {
                subcategoryLinks: {
                  some: {
                    isActive: true,

                    ...(subcategoryId
                      ? {
                          subcategoryId,
                        }
                      : {}),

                    subcategory: {
                      isActive: true,

                      ...(categoryId
                        ? {
                            categoryId,
                          }
                        : {}),
                    },
                  },
                },
              }
            : {}),

          /*
           * Optional text search.
           */
          ...(search
            ? {
                OR: [
                  {
                    id: {
                      contains:
                        search,
                      mode:
                        "insensitive",
                    },
                  },

                  {
                    translations: {
                      some: {
                        name: {
                          contains:
                            search,

                          mode:
                            "insensitive",
                        },
                      },
                    },
                  },
                ],
              }
            : {}),
        },

        orderBy: {
          id: "asc",
        },

        select: {
          id: true,

          /* ─────────────────────────
             PROCEDURE TRANSLATION
          ───────────────────────── */

          translations: {
            where: {
              localeCode: {
                in:
                  localeCandidates,
              },
            },

            select: {
              localeCode: true,
              name: true,
              description: true,
            },
          },

          /* ─────────────────────────
             SUBCATEGORY RELATIONS
          ───────────────────────── */

          subcategoryLinks: {
            where: {
              isActive: true,

              subcategory: {
                isActive: true,

                ...(categoryId
                  ? {
                      categoryId,
                    }
                  : {}),

                ...(subcategoryId
                  ? {
                      id:
                        subcategoryId,
                    }
                  : {}),
              },
            },

            orderBy: [
              {
                subcategory: {
                  category: {
                    sortOrder:
                      "asc",
                  },
                },
              },
              {
                subcategory: {
                  sortOrder:
                    "asc",
                },
              },
              {
                sortOrder:
                  "asc",
              },
            ],

            select: {
              sortOrder: true,

              subcategory: {
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

                      name:
                        true,

                      description:
                        true,
                    },
                  },

                  category: {
                    select: {
                      id: true,
                      slug: true,
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

                          name:
                            true,

                          description:
                            true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

    /* ═══════════════════════════════════
       FORMAT RESPONSE
    ═══════════════════════════════════ */

    const responseProcedures =
      procedures.map(
        (procedure) => {
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

            subcategories:
              procedure.subcategoryLinks.map(
                (link) => {
                  const subcategory =
                    link.subcategory;

                  const category =
                    subcategory.category;

                  const subcategoryTranslation =
                    getTranslation(
                      subcategory.translations,
                      localeCandidates,
                      subcategory.id,
                    );

                  const categoryTranslation =
                    getTranslation(
                      category.translations,
                      localeCandidates,
                      category.id,
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

                    procedureSortOrder:
                      link.sortOrder,

                    category: {
                      id:
                        category.id,

                      slug:
                        category.slug,

                      name:
                        categoryTranslation.name,

                      description:
                        categoryTranslation.description,

                      sortOrder:
                        category.sortOrder,
                    },
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

        count:
          responseProcedures.length,

        procedures:
          responseProcedures,
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
      "Could not load procedures:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Could not load procedures.",
      },
      {
        status: 500,
      },
    );
  }
}