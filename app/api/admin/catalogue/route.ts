import { headers } from "next/headers";
import { NextRequest } from "next/server";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/database/prisma";

import {
  ApiError,
  apiSuccess,
} from "@/lib/api/error-handler";

import { withApiHandler } from "@/lib/api/with-api-handler";

/* ═════════════════════════════════════
   CONSTANTS
═════════════════════════════════════ */

const REQUIRED_LOCALES = [
  {
    code: "en",
    displayName: "English",
    isDefault: true,
    sortOrder: 0,
  },
  {
    code: "fr",
    displayName: "Français",
    isDefault: false,
    sortOrder: 1,
  },
] as const;

/* ═════════════════════════════════════
   HELPERS
═════════════════════════════════════ */

function requiredString(
  value: unknown,
  fieldName: string,
): string {
  if (
    typeof value !== "string" ||
    value.trim() === ""
  ) {
    throw new ApiError(
      `${fieldName} is required.`,
      400,
      "INVALID_CATALOGUE_REQUEST",
    );
  }

  return value.trim();
}

function optionalString(
  value: unknown,
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  return trimmed || null;
}

function validateId(
  value: unknown,
  fieldName: string,
): string {
  const id = requiredString(
    value,
    fieldName,
  );

  if (
    !/^[a-z0-9_]+$/.test(id)
  ) {
    throw new ApiError(
      `${fieldName} must contain only lowercase letters, numbers and underscores.`,
      400,
      "INVALID_CATALOGUE_ID",
    );
  }

  return id;
}

function toSlug(
  value: string,
): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function translatedName(
  translations: {
    localeCode: string;
    name: string;
  }[],
  localeCode: string,
  fallback: string,
): string {
  return (
    translations.find(
      (translation) =>
        translation.localeCode ===
        localeCode,
    )?.name ?? fallback
  );
}

async function requireAdmin() {
  const session =
    await auth.api.getSession({
      headers:
        await headers(),
    });

  if (!session?.user) {
    throw new ApiError(
      "Unauthorized",
      401,
      "UNAUTHORIZED",
    );
  }

  if (
    session.user.role !==
    "ADMIN"
  ) {
    throw new ApiError(
      "Forbidden",
      403,
      "FORBIDDEN",
    );
  }

  return session;
}

async function ensureLocales() {
  await Promise.all(
    REQUIRED_LOCALES.map(
      (locale) =>
        prisma.catalogLocale.upsert({
          where: {
            code:
              locale.code,
          },

          update: {
            displayName:
              locale.displayName,

            isDefault:
              locale.isDefault,

            isActive: true,

            sortOrder:
              locale.sortOrder,
          },

          create: {
            code:
              locale.code,

            displayName:
              locale.displayName,

            isDefault:
              locale.isDefault,

            isActive: true,

            sortOrder:
              locale.sortOrder,
          },
        }),
    ),
  );
}

/* ═════════════════════════════════════
   ADMIN SNAPSHOT
═════════════════════════════════════ */

async function getCatalogueSnapshot() {
  const [
    groups,
    categories,
  ] = await Promise.all([
    prisma.specialtyGroup.findMany({
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

      include: {
        translations: {
          where: {
            localeCode: {
              in: [
                "en",
                "fr",
              ],
            },
          },
        },

        specialties: {
          where: {
            isActive: true,
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

          include: {
            translations: {
              where: {
                localeCode: {
                  in: [
                    "en",
                    "fr",
                  ],
                },
              },
            },

            categoryLinks: {
              where: {
                isActive: true,

                category: {
                  isActive: true,
                },
              },

              orderBy: [
                {
                  sortOrder:
                    "asc",
                },
                {
                  categoryId:
                    "asc",
                },
              ],

              select: {
                categoryId:
                  true,
              },
            },
          },
        },
      },
    }),

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

      include: {
        translations: {
          where: {
            localeCode: {
              in: [
                "en",
                "fr",
              ],
            },
          },
        },

        subcategories: {
          where: {
            isActive: true,
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

          include: {
            translations: {
              where: {
                localeCode: {
                  in: [
                    "en",
                    "fr",
                  ],
                },
              },
            },

            procedureLinks: {
              where: {
                isActive: true,

                procedure: {
                  isActive: true,
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

              include: {
                procedure: {
                  include: {
                    translations: {
                      where: {
                        localeCode: {
                          in: [
                            "en",
                            "fr",
                          ],
                        },
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

  const specialitiesName: Record<
    string,
    string
  > = {};

  const specialitiesName_fr: Record<
    string,
    string
  > = {};

  const categoriesName: Record<
    string,
    string
  > = {};

  const categoriesName_fr: Record<
    string,
    string
  > = {};

  const subcategoriesName: Record<
    string,
    string
  > = {};

  const subcategoriesName_fr: Record<
    string,
    string
  > = {};

  const proceduresName: Record<
    string,
    string
  > = {};

  const proceduresName_fr: Record<
    string,
    string
  > = {};

  const specialtyMap: Record<
    string,
    string[]
  > = {};

  const specialtyItems: string[] =
    [];

  const specialtyGroups =
    groups.map((group) => {
      const items =
        group.specialties.map(
          (specialty) => {
            specialtyItems.push(
              specialty.id,
            );

            specialitiesName[
              specialty.id
            ] = translatedName(
              specialty.translations,
              "en",
              specialty.id,
            );

            specialitiesName_fr[
              specialty.id
            ] = translatedName(
              specialty.translations,
              "fr",
              "",
            );

            specialtyMap[
              specialty.id
            ] =
              specialty.categoryLinks.map(
                (link) =>
                  link.categoryId,
              );

            return {
              id:
                specialty.id,

              labelKey:
                `items.${specialty.id}.label`,

              descriptionKey:
                `items.${specialty.id}.description`,

              icon:
                specialty.icon ??
                "",
            };
          },
        );

      return {
        titleKey:
          `groups.${group.id}`,

        items,
      };
    });

  const responseCategories =
    categories.map((category) => {
      const en =
        translatedName(
          category.translations,
          "en",
          category.id,
        );

      const fr =
        translatedName(
          category.translations,
          "fr",
          "",
        );

      categoriesName[
        category.id
      ] = en;

      categoriesName_fr[
        category.id
      ] = fr;

      return {
        key:
          en.toUpperCase(),

        id:
          category.id,

        slug:
          category.slug,

        href:
          category.href ??
          "",

        homeImage:
          category.homeImage ??
          "",

        dashboardImage:
          category.dashboardImage ??
          "",

        icon:
          category.icon ??
          "",

        category:
          category.id,

        subcategories:
          category.subcategories.map(
            (subcategory) => {
              subcategoriesName[
                subcategory.id
              ] = translatedName(
                subcategory.translations,
                "en",
                subcategory.id,
              );

              subcategoriesName_fr[
                subcategory.id
              ] = translatedName(
                subcategory.translations,
                "fr",
                "",
              );

              return {
                subcategory:
                  subcategory.id,

                procedures:
                  subcategory.procedureLinks.map(
                    (link) => {
                      const procedure =
                        link.procedure;

                      proceduresName[
                        procedure.id
                      ] =
                        translatedName(
                          procedure.translations,
                          "en",
                          procedure.id,
                        );

                      proceduresName_fr[
                        procedure.id
                      ] =
                        translatedName(
                          procedure.translations,
                          "fr",
                          "",
                        );

                      return {
                        id:
                          procedure.id,

                        name:
                          proceduresName[
                            procedure.id
                          ],
                      };
                    },
                  ),
              };
            },
          ),
      };
    });

  return {
    catalog: {
      specialties: {
        id: "specialties",

        label:
          "SPECIALTIES (DOCTOR PROFILE ONBOARDING)",

        items:
          specialtyItems,

        groups:
          specialtyGroups,
      },

      categories:
        responseCategories,
    },

    specialtyMap,

    translations: {
      specialitiesName,
      categoriesName,
      subcategoriesName,
      proceduresName,

      specialitiesName_fr,
      categoriesName_fr,
      subcategoriesName_fr,
      proceduresName_fr,
    },
  };
}

/* ═════════════════════════════════════
   GET
═════════════════════════════════════ */

export const GET =
  withApiHandler<
    unknown,
    NextRequest
  >(async () => {
    await requireAdmin();
    await ensureLocales();

    const snapshot =
      await getCatalogueSnapshot();

    return apiSuccess({
      success: true,
      ...snapshot,
    });
  });

/* ═════════════════════════════════════
   POST / MUTATIONS
═════════════════════════════════════ */

export const POST =
  withApiHandler<
    unknown,
    NextRequest
  >(async (req) => {
    await requireAdmin();
    await ensureLocales();

    const body =
      (await req.json()) as Record<
        string,
        unknown
      >;

    const action =
      requiredString(
        body.action,
        "action",
      );

    switch (action) {
      /* ═══════════════════════════════
         SPECIALTY
      ═══════════════════════════════ */

      case "createSpecialty": {
        const id =
          validateId(
            body.id,
            "id",
          );

        const en =
          requiredString(
            body.en,
            "English name",
          );

        const fr =
          requiredString(
            body.fr,
            "French name",
          );

        const rawGroup =
          requiredString(
            body.groupId,
            "groupId",
          );

        const groupId =
          rawGroup.replace(
            /^groups\./,
            "",
          );

        const [
          existing,
          group,
        ] = await Promise.all([
          prisma.specialty.findUnique({
            where: {
              id,
            },
          }),

          prisma.specialtyGroup.findUnique({
            where: {
              id:
                groupId,
            },
          }),
        ]);

        if (existing) {
          throw new ApiError(
            `Specialty "${id}" already exists.`,
            409,
            "SPECIALTY_EXISTS",
          );
        }

        if (
          !group ||
          !group.isActive
        ) {
          throw new ApiError(
            "Specialty group not found.",
            404,
            "SPECIALTY_GROUP_NOT_FOUND",
          );
        }

        await prisma.$transaction(
          async (tx) => {
            const max =
              await tx.specialty.aggregate({
                where: {
                  specialtyGroupId:
                    groupId,
                },

                _max: {
                  sortOrder: true,
                },
              });

            const sortOrder =
              (max._max
                .sortOrder ??
                -1) + 1;

            await tx.specialty.create({
              data: {
                id,
                specialtyGroupId:
                  groupId,

                icon: null,
                sortOrder,
                isActive: true,
              },
            });

            await Promise.all([
              tx.specialtyTranslation.create({
                data: {
                  specialtyId:
                    id,

                  localeCode:
                    "en",

                  name:
                    en,
                },
              }),

              tx.specialtyTranslation.create({
                data: {
                  specialtyId:
                    id,

                  localeCode:
                    "fr",

                  name:
                    fr,
                },
              }),
            ]);
          },
        );

        break;
      }

      case "updateSpecialty": {
        const specialtyId =
          requiredString(
            body.specialtyId,
            "specialtyId",
          );

        const en =
          requiredString(
            body.en,
            "English name",
          );

        const fr =
          requiredString(
            body.fr,
            "French name",
          );

        const specialty =
          await prisma.specialty.findUnique({
            where: {
              id:
                specialtyId,
            },
          });

        if (!specialty) {
          throw new ApiError(
            "Specialty not found.",
            404,
            "SPECIALTY_NOT_FOUND",
          );
        }

        await prisma.$transaction([
          prisma.specialtyTranslation.upsert({
            where: {
              specialtyId_localeCode:
                {
                  specialtyId,
                  localeCode:
                    "en",
                },
            },

            update: {
              name:
                en,
            },

            create: {
              specialtyId,
              localeCode:
                "en",
              name:
                en,
            },
          }),

          prisma.specialtyTranslation.upsert({
            where: {
              specialtyId_localeCode:
                {
                  specialtyId,
                  localeCode:
                    "fr",
                },
            },

            update: {
              name:
                fr,
            },

            create: {
              specialtyId,
              localeCode:
                "fr",
              name:
                fr,
            },
          }),
        ]);

        break;
      }

      /* ═══════════════════════════════
         CATEGORY
      ═══════════════════════════════ */

      case "assignCategory": {
        const specialtyId =
          requiredString(
            body.specialtyId,
            "specialtyId",
          );

        const categoryId =
          requiredString(
            body.categoryId,
            "categoryId",
          );

        const [
          specialty,
          category,
        ] = await Promise.all([
          prisma.specialty.findUnique({
            where: {
              id:
                specialtyId,
            },
          }),

          prisma.category.findUnique({
            where: {
              id:
                categoryId,
            },
          }),
        ]);

        if (
          !specialty ||
          !category
        ) {
          throw new ApiError(
            "Specialty or category not found.",
            404,
            "CATALOGUE_ITEM_NOT_FOUND",
          );
        }

        const max =
          await prisma.specialtyCategory.aggregate({
            where: {
              specialtyId,
            },

            _max: {
              sortOrder: true,
            },
          });

        await prisma.specialtyCategory.upsert({
          where: {
            specialtyId_categoryId:
              {
                specialtyId,
                categoryId,
              },
          },

          update: {
            isActive: true,
          },

          create: {
            specialtyId,
            categoryId,

            sortOrder:
              (max._max
                .sortOrder ??
                -1) + 1,

            isActive: true,
          },
        });

        break;
      }

      case "unassignCategory": {
        const specialtyId =
          requiredString(
            body.specialtyId,
            "specialtyId",
          );

        const categoryId =
          requiredString(
            body.categoryId,
            "categoryId",
          );

        await prisma.specialtyCategory.updateMany({
          where: {
            specialtyId,
            categoryId,
          },

          data: {
            isActive: false,
          },
        });

        break;
      }

      case "createCategory": {
        const id =
          validateId(
            body.id,
            "id",
          );

        const en =
          requiredString(
            body.en,
            "English name",
          );

        const fr =
          requiredString(
            body.fr,
            "French name",
          );

        const specialtyId =
          optionalString(
            body.specialtyId,
          );

        const slug =
          toSlug(en);

        const [
          existingById,
          existingBySlug,
        ] = await Promise.all([
          prisma.category.findUnique({
            where: {
              id,
            },
          }),

          prisma.category.findUnique({
            where: {
              slug,
            },
          }),
        ]);

        if (
          existingById ||
          existingBySlug
        ) {
          throw new ApiError(
            "A category with this ID or slug already exists.",
            409,
            "CATEGORY_EXISTS",
          );
        }

        await prisma.$transaction(
          async (tx) => {
            const max =
              await tx.category.aggregate({
                _max: {
                  sortOrder: true,
                },
              });

            await tx.category.create({
              data: {
                id,
                slug,

                href:
                  `/categories/${slug}`,

                homeImage:
                  null,

                dashboardImage:
                  null,

                icon:
                  null,

                sortOrder:
                  (max._max
                    .sortOrder ??
                    -1) + 1,

                isActive:
                  true,
              },
            });

            await Promise.all([
              tx.categoryTranslation.create({
                data: {
                  categoryId:
                    id,

                  localeCode:
                    "en",

                  name:
                    en,
                },
              }),

              tx.categoryTranslation.create({
                data: {
                  categoryId:
                    id,

                  localeCode:
                    "fr",

                  name:
                    fr,
                },
              }),
            ]);

            if (specialtyId) {
              const maxLink =
                await tx.specialtyCategory.aggregate({
                  where: {
                    specialtyId,
                  },

                  _max: {
                    sortOrder:
                      true,
                  },
                });

              await tx.specialtyCategory.create({
                data: {
                  specialtyId,
                  categoryId:
                    id,

                  sortOrder:
                    (maxLink._max
                      .sortOrder ??
                      -1) +
                    1,

                  isActive:
                    true,
                },
              });
            }
          },
        );

        break;
      }

      case "updateCategory": {
        const categoryId =
          requiredString(
            body.categoryId,
            "categoryId",
          );

        const en =
          requiredString(
            body.en,
            "English name",
          );

        const fr =
          requiredString(
            body.fr,
            "French name",
          );

        await prisma.$transaction([
          prisma.categoryTranslation.upsert({
            where: {
              categoryId_localeCode:
                {
                  categoryId,
                  localeCode:
                    "en",
                },
            },

            update: {
              name:
                en,
            },

            create: {
              categoryId,
              localeCode:
                "en",

              name:
                en,
            },
          }),

          prisma.categoryTranslation.upsert({
            where: {
              categoryId_localeCode:
                {
                  categoryId,
                  localeCode:
                    "fr",
                },
            },

            update: {
              name:
                fr,
            },

            create: {
              categoryId,
              localeCode:
                "fr",

              name:
                fr,
            },
          }),
        ]);

        break;
      }

      /* ═══════════════════════════════
         SUBCATEGORY
      ═══════════════════════════════ */

      case "createSubcategory": {
        const categoryId =
          requiredString(
            body.categoryId,
            "categoryId",
          );

        const id =
          validateId(
            body.id,
            "id",
          );

        const en =
          requiredString(
            body.en,
            "English name",
          );

        const fr =
          requiredString(
            body.fr,
            "French name",
          );

        const rawProcedures =
          body.procedures;

        if (
          !Array.isArray(
            rawProcedures,
          )
        ) {
          throw new ApiError(
            "procedures must be an array.",
            400,
            "INVALID_PROCEDURES",
          );
        }

        const procedures =
          rawProcedures.map(
            (
              raw,
              index,
            ) => {
              if (
                typeof raw !==
                  "object" ||
                raw === null
              ) {
                throw new ApiError(
                  `Invalid procedure at index ${index}.`,
                  400,
                  "INVALID_PROCEDURES",
                );
              }

              const record =
                raw as Record<
                  string,
                  unknown
                >;

              return {
                id:
                  validateId(
                    record.id,
                    `procedures[${index}].id`,
                  ),

                en:
                  requiredString(
                    record.en,
                    `procedures[${index}].en`,
                  ),

                fr:
                  requiredString(
                    record.fr,
                    `procedures[${index}].fr`,
                  ),
              };
            },
          );

        const existing =
          await prisma.subcategory.findUnique({
            where: {
              id,
            },
          });

        if (existing) {
          throw new ApiError(
            `Subcategory "${id}" already exists.`,
            409,
            "SUBCATEGORY_EXISTS",
          );
        }

        await prisma.$transaction(
          async (tx) => {
            const max =
              await tx.subcategory.aggregate({
                where: {
                  categoryId,
                },

                _max: {
                  sortOrder: true,
                },
              });

            await tx.subcategory.create({
              data: {
                id,
                categoryId,

                sortOrder:
                  (max._max
                    .sortOrder ??
                    -1) + 1,

                isActive:
                  true,
              },
            });

            await Promise.all([
              tx.subcategoryTranslation.create({
                data: {
                  subcategoryId:
                    id,

                  localeCode:
                    "en",

                  name:
                    en,
                },
              }),

              tx.subcategoryTranslation.create({
                data: {
                  subcategoryId:
                    id,

                  localeCode:
                    "fr",

                  name:
                    fr,
                },
              }),
            ]);

            for (
              let index = 0;
              index <
              procedures.length;
              index++
            ) {
              const procedure =
                procedures[index];

              await tx.procedure.upsert({
                where: {
                  id:
                    procedure.id,
                },

                update: {
                  isActive:
                    true,
                },

                create: {
                  id:
                    procedure.id,

                  isActive:
                    true,
                },
              });

              await Promise.all([
                tx.procedureTranslation.upsert({
                  where: {
                    procedureId_localeCode:
                      {
                        procedureId:
                          procedure.id,

                        localeCode:
                          "en",
                      },
                  },

                  update: {
                    name:
                      procedure.en,
                  },

                  create: {
                    procedureId:
                      procedure.id,

                    localeCode:
                      "en",

                    name:
                      procedure.en,
                  },
                }),

                tx.procedureTranslation.upsert({
                  where: {
                    procedureId_localeCode:
                      {
                        procedureId:
                          procedure.id,

                        localeCode:
                          "fr",
                      },
                  },

                  update: {
                    name:
                      procedure.fr,
                  },

                  create: {
                    procedureId:
                      procedure.id,

                    localeCode:
                      "fr",

                    name:
                      procedure.fr,
                  },
                }),
              ]);

              await tx.procedureSubcategory.upsert({
                where: {
                  subcategoryId_procedureId:
                    {
                      subcategoryId:
                        id,

                      procedureId:
                        procedure.id,
                    },
                },

                update: {
                  isActive:
                    true,

                  sortOrder:
                    index,
                },

                create: {
                  subcategoryId:
                    id,

                  procedureId:
                    procedure.id,

                  sortOrder:
                    index,

                  isActive:
                    true,
                },
              });
            }
          },
        );

        break;
      }

      case "updateSubcategory": {
        const subcategoryId =
          requiredString(
            body.subcategoryId,
            "subcategoryId",
          );

        const en =
          requiredString(
            body.en,
            "English name",
          );

        const fr =
          requiredString(
            body.fr,
            "French name",
          );

        await prisma.$transaction([
          prisma.subcategoryTranslation.upsert({
            where: {
              subcategoryId_localeCode:
                {
                  subcategoryId,
                  localeCode:
                    "en",
                },
            },

            update: {
              name:
                en,
            },

            create: {
              subcategoryId,
              localeCode:
                "en",

              name:
                en,
            },
          }),

          prisma.subcategoryTranslation.upsert({
            where: {
              subcategoryId_localeCode:
                {
                  subcategoryId,
                  localeCode:
                    "fr",
                },
            },

            update: {
              name:
                fr,
            },

            create: {
              subcategoryId,
              localeCode:
                "fr",

              name:
                fr,
            },
          }),
        ]);

        break;
      }

      case "deactivateSubcategory": {
        const subcategoryId =
          requiredString(
            body.subcategoryId,
            "subcategoryId",
          );

        await prisma.$transaction([
          prisma.procedureSubcategory.updateMany({
            where: {
              subcategoryId,
            },

            data: {
              isActive:
                false,
            },
          }),

          prisma.subcategory.update({
            where: {
              id:
                subcategoryId,
            },

            data: {
              isActive:
                false,
            },
          }),
        ]);

        break;
      }

      /* ═══════════════════════════════
         PROCEDURE
      ═══════════════════════════════ */

      case "createProcedure": {
        const subcategoryId =
          requiredString(
            body.subcategoryId,
            "subcategoryId",
          );

        const id =
          validateId(
            body.id,
            "id",
          );

        const en =
          requiredString(
            body.en,
            "English name",
          );

        const fr =
          requiredString(
            body.fr,
            "French name",
          );

        await prisma.$transaction(
          async (tx) => {
            await tx.procedure.upsert({
              where: {
                id,
              },

              update: {
                isActive:
                  true,
              },

              create: {
                id,
                isActive:
                  true,
              },
            });

            await Promise.all([
              tx.procedureTranslation.upsert({
                where: {
                  procedureId_localeCode:
                    {
                      procedureId:
                        id,

                      localeCode:
                        "en",
                    },
                },

                update: {
                  name:
                    en,
                },

                create: {
                  procedureId:
                    id,

                  localeCode:
                    "en",

                  name:
                    en,
                },
              }),

              tx.procedureTranslation.upsert({
                where: {
                  procedureId_localeCode:
                    {
                      procedureId:
                        id,

                      localeCode:
                        "fr",
                    },
                },

                update: {
                  name:
                    fr,
                },

                create: {
                  procedureId:
                    id,

                  localeCode:
                    "fr",

                  name:
                    fr,
                },
              }),
            ]);

            const max =
              await tx.procedureSubcategory.aggregate({
                where: {
                  subcategoryId,
                },

                _max: {
                  sortOrder:
                    true,
                },
              });

            await tx.procedureSubcategory.upsert({
              where: {
                subcategoryId_procedureId:
                  {
                    subcategoryId,
                    procedureId:
                      id,
                  },
              },

              update: {
                isActive:
                  true,
              },

              create: {
                subcategoryId,
                procedureId:
                  id,

                sortOrder:
                  (max._max
                    .sortOrder ??
                    -1) + 1,

                isActive:
                  true,
              },
            });
          },
        );

        break;
      }

      case "updateProcedure": {
        const procedureId =
          requiredString(
            body.procedureId,
            "procedureId",
          );

        const en =
          requiredString(
            body.en,
            "English name",
          );

        const fr =
          requiredString(
            body.fr,
            "French name",
          );

        await prisma.$transaction([
          prisma.procedureTranslation.upsert({
            where: {
              procedureId_localeCode:
                {
                  procedureId,
                  localeCode:
                    "en",
                },
            },

            update: {
              name:
                en,
            },

            create: {
              procedureId,
              localeCode:
                "en",

              name:
                en,
            },
          }),

          prisma.procedureTranslation.upsert({
            where: {
              procedureId_localeCode:
                {
                  procedureId,
                  localeCode:
                    "fr",
                },
            },

            update: {
              name:
                fr,
            },

            create: {
              procedureId,
              localeCode:
                "fr",

              name:
                fr,
            },
          }),
        ]);

        break;
      }

      case "unlinkProcedure": {
        const subcategoryId =
          requiredString(
            body.subcategoryId,
            "subcategoryId",
          );

        const procedureId =
          requiredString(
            body.procedureId,
            "procedureId",
          );

        await prisma.procedureSubcategory.updateMany({
          where: {
            subcategoryId,
            procedureId,
          },

          data: {
            isActive:
              false,
          },
        });

        const activeLinks =
          await prisma.procedureSubcategory.count({
            where: {
              procedureId,
              isActive: true,

              subcategory: {
                isActive: true,
              },
            },
          });

        if (
          activeLinks === 0
        ) {
          await prisma.procedure.update({
            where: {
              id:
                procedureId,
            },

            data: {
              isActive:
                false,
            },
          });
        }

        break;
      }

      default:
        throw new ApiError(
          `Unknown catalogue action "${action}".`,
          400,
          "UNKNOWN_CATALOGUE_ACTION",
        );
    }

    return apiSuccess({
      success: true,
    });
  });