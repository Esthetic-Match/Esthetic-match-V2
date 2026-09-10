import { headers } from "next/headers";
import slugify from "slugify";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/database/prisma";

import {
  ApiError,
  apiSuccess,
} from "@/lib/api/error-handler";

import { withApiHandler } from "@/lib/api/with-api-handler";

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
   NORMAL SCALAR FIELDS

   Catalogue fields are intentionally NOT
   included here. They are handled separately
   so relational tables stay synchronized.
═════════════════════════════════════ */

const allowedScalarFields = [
  "clinicName",
  "clinicBanner",
  "avatar",
  "yearsOfExperience",
  "subzoneIds",
  "workAddress",
  "city",
  "country",
  "zipCode",
  "workLatitude",
  "workLongitude",
  "googlePlaceId",
  "googleRating",
  "googleReviewCount",
  "googleMapsUri",
  "otherSpecialtyText",
  "inClinicPrice",
  "onlineConsulPrice",
  "onlineActive",
  "bookingLinks",
  "inClinicLink",
  "currency",
  "RPPS",
] as const;

/* ═════════════════════════════════════
   HELPERS
═════════════════════════════════════ */

function requiredString(
  value: unknown,
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  return trimmed.length > 0
    ? trimmed
    : null;
}

function nullableNumber(
  value: unknown,
): number | null {
  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return value;
  }

  if (
    typeof value === "string" &&
    value.trim() !== ""
  ) {
    const parsed = Number(value);

    return Number.isFinite(parsed)
      ? parsed
      : null;
  }

  return null;
}

function hasOwn(
  object: Record<string, unknown>,
  key: string,
): boolean {
  return Object.prototype.hasOwnProperty.call(
    object,
    key,
  );
}

function parseStringArray(
  value: unknown,
  fieldName: string,
): string[] {
  if (!Array.isArray(value)) {
    throw new ApiError(
      `${fieldName} must be an array.`,
      400,
      "INVALID_ARRAY",
    );
  }

  const result: string[] = [];
  const seen = new Set<string>();

  for (const item of value) {
    if (
      typeof item !== "string" ||
      item.trim() === ""
    ) {
      throw new ApiError(
        `${fieldName} must contain only non-empty strings.`,
        400,
        "INVALID_ARRAY_VALUE",
      );
    }

    const id = item.trim();

    if (seen.has(id)) {
      continue;
    }

    seen.add(id);
    result.push(id);
  }

  return result;
}

function normalizeCategoryId(
  categoryId: string,
): string {
  return (
    CATEGORY_ID_ALIASES[categoryId] ??
    categoryId
  );
}

function normalizeCategoryIds(
  categoryIds: string[],
): string[] {
  return Array.from(
    new Set(
      categoryIds.map(
        normalizeCategoryId,
      ),
    ),
  );
}

function sameStringArray(
  left: string[],
  right: string[],
): boolean {
  return (
    left.length === right.length &&
    left.every(
      (value, index) =>
        value === right[index],
    )
  );
}

async function generateUniqueDoctorSlug(
  name: string,
) {
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
      select: {
        id: true,
      },
    })
  ) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

/* ═════════════════════════════════════
   POST
═════════════════════════════════════ */

export const POST = withApiHandler(
  async (req: Request) => {
    const body =
      (await req.json()) as Record<
        string,
        unknown
      >;

    const userId =
      requiredString(body.userId);

    const clinicName =
      requiredString(body.clinicName);

    const workAddress =
      requiredString(body.workAddress);

    const city =
      requiredString(body.city);

    const country =
      requiredString(body.country);

    const zipCode =
      requiredString(body.zipCode);

    const yearsOfExperience =
      nullableNumber(
        body.yearsOfExperience,
      );

    if (!userId) {
      throw new ApiError(
        "User ID is required.",
        400,
        "USER_ID_REQUIRED",
      );
    }

    if (!clinicName) {
      throw new ApiError(
        "Clinic name is required.",
        400,
        "CLINIC_NAME_REQUIRED",
      );
    }

    if (!workAddress) {
      throw new ApiError(
        "Clinic address is required.",
        400,
        "CLINIC_ADDRESS_REQUIRED",
      );
    }

    if (!city) {
      throw new ApiError(
        "City is required.",
        400,
        "CITY_REQUIRED",
      );
    }

    if (!country) {
      throw new ApiError(
        "Country is required.",
        400,
        "COUNTRY_REQUIRED",
      );
    }

    if (!zipCode) {
      throw new ApiError(
        "Clinic zip code is required.",
        400,
        "CLINIC_ZIP_CODE_REQUIRED",
      );
    }

    const user =
      await prisma.user.findUnique({
        where: {
          id: userId,
        },

        select: {
          id: true,
          role: true,
          name: true,
        },
      });

    if (!user) {
      throw new ApiError(
        "User not found.",
        404,
        "USER_NOT_FOUND",
      );
    }

    if (user.role !== "DOCTOR") {
      throw new ApiError(
        "User is not registered as a doctor.",
        400,
        "USER_IS_NOT_DOCTOR",
      );
    }

    const existingProfile =
      await prisma.doctorProfile.findUnique({
        where: {
          userId,
        },

        select: {
          slug: true,
        },
      });

    const slug =
      existingProfile?.slug ||
      (await generateUniqueDoctorSlug(
        user.name ||
          clinicName,
      ));

    const profile =
      await prisma.doctorProfile.upsert({
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
          yearsOfExperience,

          workLatitude:
            nullableNumber(
              body.workLatitude,
            ),

          workLongitude:
            nullableNumber(
              body.workLongitude,
            ),
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

          workLatitude:
            nullableNumber(
              body.workLatitude,
            ),

          workLongitude:
            nullableNumber(
              body.workLongitude,
            ),

          /* Legacy arrays */

          specialtyIds: [],
          subcategoryIds: [],
          procedureIds: [],
          subzoneIds: [],
          topThree: [],
          bookingLinks: [],
        },
      });

    return apiSuccess({
      success: true,
      profile,
    });
  },
);

/* ═════════════════════════════════════
   PATCH
═════════════════════════════════════ */

export const PATCH = withApiHandler(
  async (req: Request) => {
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
      "DOCTOR"
    ) {
      throw new ApiError(
        "Forbidden",
        403,
        "FORBIDDEN",
      );
    }

    const body =
      (await req.json()) as Record<
        string,
        unknown
      >;

    const currentProfile =
      await prisma.doctorProfile.findUnique({
        where: {
          userId:
            session.user.id,
        },

        select: {
          id: true,

          specialtyIds: true,
          subcategoryIds: true,
          procedureIds: true,
          topThree: true,

          specialties: {
            orderBy: {
              position: "asc",
            },

            select: {
              specialtyId: true,
            },
          },

          categories: {
            orderBy: {
              position: "asc",
            },

            select: {
              categoryId: true,
            },
          },

          procedures: {
            orderBy: {
              position: "asc",
            },

            select: {
              procedureId: true,
              topRank: true,
            },
          },
        },
      });

    if (!currentProfile) {
      throw new ApiError(
        "Doctor profile not found.",
        404,
        "DOCTOR_PROFILE_NOT_FOUND",
      );
    }

    /* ═════════════════════════════════
       DETECT CATALOGUE UPDATES
    ═════════════════════════════════ */

    const hasSpecialtyUpdate =
      hasOwn(
        body,
        "specialtyIds",
      );

    const hasCategoryUpdate =
      hasOwn(
        body,
        "categoryIds",
      ) ||
      hasOwn(
        body,
        "subcategoryIds",
      );

    const hasProcedureUpdate =
      hasOwn(
        body,
        "procedureIds",
      );

    const hasTopThreeUpdate =
      hasOwn(
        body,
        "topThree",
      );

    const hasCatalogueUpdate =
      hasSpecialtyUpdate ||
      hasCategoryUpdate ||
      hasProcedureUpdate ||
      hasTopThreeUpdate;

    /* ═════════════════════════════════
       CURRENT NORMALIZED SELECTIONS

       Fall back to legacy arrays if this
       profile has not yet been backfilled.
    ═════════════════════════════════ */

    const currentSpecialtyIds =
      currentProfile.specialties
        .length > 0
        ? currentProfile.specialties.map(
            (item) =>
              item.specialtyId,
          )
        : currentProfile.specialtyIds;

    const currentCategoryIds =
      currentProfile.categories
        .length > 0
        ? currentProfile.categories.map(
            (item) =>
              item.categoryId,
          )
        : normalizeCategoryIds(
            currentProfile.subcategoryIds,
          );

    const currentProcedureIds =
      currentProfile.procedures
        .length > 0
        ? currentProfile.procedures.map(
            (item) =>
              item.procedureId,
          )
        : currentProfile.procedureIds;

    const relationalTopThree =
      currentProfile.procedures
        .filter(
          (
            item,
          ): item is typeof item & {
            topRank: number;
          } =>
            item.topRank !== null,
        )
        .sort(
          (a, b) =>
            a.topRank -
            b.topRank,
        )
        .map(
          (item) =>
            item.procedureId,
        );

    const currentTopThree =
      relationalTopThree.length >
      0
        ? relationalTopThree
        : currentProfile.topThree;

    /* ═════════════════════════════════
       REQUESTED SPECIALTIES
    ═════════════════════════════════ */

    let finalSpecialtyIds =
      hasSpecialtyUpdate
        ? parseStringArray(
            body.specialtyIds,
            "specialtyIds",
          )
        : currentSpecialtyIds;

    /* ═════════════════════════════════
       REQUESTED CATEGORIES

       New API:
         categoryIds

       Legacy compatibility:
         subcategoryIds
       historically contains CATEGORY IDs.
    ═════════════════════════════════ */

    let finalCategoryIds =
      currentCategoryIds;

    if (hasCategoryUpdate) {
      const rawCategoryIds =
        hasOwn(
          body,
          "categoryIds",
        )
          ? parseStringArray(
              body.categoryIds,
              "categoryIds",
            )
          : parseStringArray(
              body.subcategoryIds,
              "subcategoryIds",
            );

      finalCategoryIds =
        normalizeCategoryIds(
          rawCategoryIds,
        );
    }

    /* ═════════════════════════════════
       REQUESTED PROCEDURES
    ═════════════════════════════════ */

    let finalProcedureIds =
      hasProcedureUpdate
        ? parseStringArray(
            body.procedureIds,
            "procedureIds",
          )
        : currentProcedureIds;

    /* ═════════════════════════════════
       REQUESTED TOP THREE
    ═════════════════════════════════ */

    let finalTopThree =
      hasTopThreeUpdate
        ? parseStringArray(
            body.topThree,
            "topThree",
          )
        : currentTopThree;

    if (
      finalTopThree.length >
      3
    ) {
      throw new ApiError(
        "A maximum of three top procedures may be selected.",
        400,
        "TOO_MANY_TOP_PROCEDURES",
      );
    }

    /* ═════════════════════════════════
       TRANSACTION
    ═════════════════════════════════ */

    const updatedProfile =
      await prisma.$transaction(
        async (tx) => {
          /* ───────────────────────────
             VALIDATE SPECIALTIES
          ─────────────────────────── */

          if (
            finalSpecialtyIds.length >
            0
          ) {
            const specialties =
              await tx.specialty.findMany({
                where: {
                  id: {
                    in: finalSpecialtyIds,
                  },

                  isActive: true,
                },

                select: {
                  id: true,
                },
              });

            const validIds =
              new Set(
                specialties.map(
                  (item) =>
                    item.id,
                ),
              );

            const invalidIds =
              finalSpecialtyIds.filter(
                (id) =>
                  !validIds.has(
                    id,
                  ),
              );

            if (
              invalidIds.length >
              0
            ) {
              throw new ApiError(
                `Unknown or inactive specialties: ${invalidIds.join(
                  ", ",
                )}`,
                400,
                "INVALID_SPECIALTIES",
              );
            }
          }

          /* ───────────────────────────
             CATEGORY VALIDATION
          ─────────────────────────── */

          if (
            finalCategoryIds.length >
            0
          ) {
            const categoryRows =
              await tx.category.findMany({
                where: {
                  id: {
                    in: finalCategoryIds,
                  },

                  isActive: true,
                },

                select: {
                  id: true,

                  specialtyLinks: {
                    where: {
                      isActive: true,

                      specialtyId: {
                        in:
                          finalSpecialtyIds,
                      },

                      specialty: {
                        isActive: true,
                      },
                    },

                    select: {
                      specialtyId:
                        true,
                    },
                  },
                },
              });

            const categoryMap =
              new Map(
                categoryRows.map(
                  (category) => [
                    category.id,
                    category,
                  ],
                ),
              );

            /*
             * If the caller explicitly selected
             * categories, invalid ones are an error.
             *
             * If specialties changed without an
             * explicit category update, simply
             * remove categories that are no longer
             * available for those specialties.
             */

            if (
              hasCategoryUpdate
            ) {
              const invalidCategories =
                finalCategoryIds.filter(
                  (categoryId) => {
                    const category =
                      categoryMap.get(
                        categoryId,
                      );

                    return (
                      !category ||
                      category
                        .specialtyLinks
                        .length === 0
                    );
                  },
                );

              if (
                invalidCategories.length >
                0
              ) {
                throw new ApiError(
                  `These categories are not available for the selected specialties: ${invalidCategories.join(
                    ", ",
                  )}`,
                  400,
                  "INVALID_CATEGORIES",
                );
              }
            } else if (
              hasSpecialtyUpdate
            ) {
              finalCategoryIds =
                finalCategoryIds.filter(
                  (categoryId) => {
                    const category =
                      categoryMap.get(
                        categoryId,
                      );

                    return (
                      category !==
                        undefined &&
                      category
                        .specialtyLinks
                        .length > 0
                    );
                  },
                );
            }
          }

          /*
           * No specialties means no category can
           * remain selected.
           */

          if (
            finalSpecialtyIds.length ===
            0
          ) {
            finalCategoryIds = [];
          }

          /* ───────────────────────────
             PROCEDURE VALIDATION
          ─────────────────────────── */

          type ProcedureRow = {
            id: string;

            subcategoryLinks: Array<{
              subcategoryId:
                string;

              sortOrder:
                number;

              subcategory: {
                id: string;
                categoryId:
                  string;
                sortOrder:
                  number;
              };
            }>;
          };

          let procedureRows: ProcedureRow[] =
            [];

          if (
            finalProcedureIds.length >
            0 &&
            finalCategoryIds.length >
            0
          ) {
            procedureRows =
              await tx.procedure.findMany({
                where: {
                  id: {
                    in: finalProcedureIds,
                  },

                  isActive: true,
                },

                select: {
                  id: true,

                  subcategoryLinks: {
                    where: {
                      isActive: true,

                      subcategory: {
                        isActive: true,

                        categoryId: {
                          in:
                            finalCategoryIds,
                        },
                      },
                    },

                    select: {
                      subcategoryId:
                        true,

                      sortOrder:
                        true,

                      subcategory: {
                        select: {
                          id: true,
                          categoryId:
                            true,
                          sortOrder:
                            true,
                        },
                      },
                    },
                  },
                },
              });
          }

          const procedureMap =
            new Map(
              procedureRows.map(
                (procedure) => [
                  procedure.id,
                  procedure,
                ],
              ),
            );

          /*
           * An explicit procedure selection should
           * fail if the procedure does not exist or
           * is not connected to any selected category.
           */

          if (
            hasProcedureUpdate
          ) {
            const invalidProcedures =
              finalProcedureIds.filter(
                (procedureId) => {
                  const procedure =
                    procedureMap.get(
                      procedureId,
                    );

                  return (
                    !procedure ||
                    procedure
                      .subcategoryLinks
                      .length === 0
                  );
                },
              );

            if (
              invalidProcedures.length >
              0
            ) {
              throw new ApiError(
                `These procedures are not available under the selected categories: ${invalidProcedures.join(
                  ", ",
                )}`,
                400,
                "INVALID_PROCEDURES",
              );
            }
          } else if (
            hasCategoryUpdate ||
            hasSpecialtyUpdate
          ) {
            /*
             * Category/specialty changed, but
             * procedures were not explicitly sent.
             *
             * Preserve only procedures that are
             * still valid.
             */

            finalProcedureIds =
              finalProcedureIds.filter(
                (procedureId) => {
                  const procedure =
                    procedureMap.get(
                      procedureId,
                    );

                  return (
                    procedure !==
                      undefined &&
                    procedure
                      .subcategoryLinks
                      .length > 0
                  );
                },
              );
          }

          if (
            finalCategoryIds.length ===
            0
          ) {
            finalProcedureIds = [];
          }

          /* ───────────────────────────
             RELOAD FINAL PROCEDURE LINKS

             Needed if procedures were pruned.
          ─────────────────────────── */

          if (
            finalProcedureIds.length >
              0 &&
            finalCategoryIds.length >
              0
          ) {
            procedureRows =
              await tx.procedure.findMany({
                where: {
                  id: {
                    in:
                      finalProcedureIds,
                  },

                  isActive: true,
                },

                select: {
                  id: true,

                  subcategoryLinks: {
                    where: {
                      isActive: true,

                      subcategory: {
                        isActive: true,

                        categoryId: {
                          in:
                            finalCategoryIds,
                        },
                      },
                    },

                    select: {
                      subcategoryId:
                        true,

                      sortOrder:
                        true,

                      subcategory: {
                        select: {
                          id: true,

                          categoryId:
                            true,

                          sortOrder:
                            true,
                        },
                      },
                    },
                  },
                },
              });
          } else {
            procedureRows = [];
          }

          const finalProcedureMap =
            new Map(
              procedureRows.map(
                (procedure) => [
                  procedure.id,
                  procedure,
                ],
              ),
            );

          /* ───────────────────────────
             DERIVE REAL SUBCATEGORIES

             A procedure may appear under several
             subcategories, so every valid parent
             under the selected categories is kept.
          ─────────────────────────── */

          const categoryOrder =
            new Map(
              finalCategoryIds.map(
                (
                  categoryId,
                  index,
                ) => [
                  categoryId,
                  index,
                ],
              ),
            );

          const finalSubcategoryIds: string[] =
            [];

          const seenSubcategories =
            new Set<string>();

          for (
            const procedureId of finalProcedureIds
          ) {
            const procedure =
              finalProcedureMap.get(
                procedureId,
              );

            if (!procedure) {
              continue;
            }

            const links = [
              ...procedure.subcategoryLinks,
            ].sort(
              (
                left,
                right,
              ) => {
                const leftCategory =
                  categoryOrder.get(
                    left
                      .subcategory
                      .categoryId,
                  ) ??
                  Number.MAX_SAFE_INTEGER;

                const rightCategory =
                  categoryOrder.get(
                    right
                      .subcategory
                      .categoryId,
                  ) ??
                  Number.MAX_SAFE_INTEGER;

                return (
                  leftCategory -
                    rightCategory ||
                  left
                    .subcategory
                    .sortOrder -
                    right
                      .subcategory
                      .sortOrder ||
                  left.sortOrder -
                    right.sortOrder ||
                  left.subcategoryId.localeCompare(
                    right.subcategoryId,
                  )
                );
              },
            );

            for (const link of links) {
              if (
                seenSubcategories.has(
                  link.subcategoryId,
                )
              ) {
                continue;
              }

              seenSubcategories.add(
                link.subcategoryId,
              );

              finalSubcategoryIds.push(
                link.subcategoryId,
              );
            }
          }

          /* ───────────────────────────
             TOP THREE
          ─────────────────────────── */

          const selectedProcedureSet =
            new Set(
              finalProcedureIds,
            );

          if (
            hasTopThreeUpdate
          ) {
            const invalidTopThree =
              finalTopThree.filter(
                (procedureId) =>
                  !selectedProcedureSet.has(
                    procedureId,
                  ),
              );

            if (
              invalidTopThree.length >
              0
            ) {
              throw new ApiError(
                `Top procedures must also be selected procedures: ${invalidTopThree.join(
                  ", ",
                )}`,
                400,
                "INVALID_TOP_PROCEDURES",
              );
            }
          } else {
            /*
             * Automatically remove top-three entries
             * if their procedure has been deselected.
             */

            finalTopThree =
              finalTopThree.filter(
                (procedureId) =>
                  selectedProcedureSet.has(
                    procedureId,
                  ),
              );
          }

          /* ═══════════════════════════
             SYNC RELATIONAL TABLES
          ═══════════════════════════ */

          if (
            hasCatalogueUpdate
          ) {
            /* ─────────────────────────
               DoctorSpecialty
            ───────────────────────── */

            if (
              finalSpecialtyIds.length ===
              0
            ) {
              await tx.doctorSpecialty.deleteMany({
                where: {
                  doctorProfileId:
                    currentProfile.id,
                },
              });
            } else {
              await tx.doctorSpecialty.deleteMany({
                where: {
                  doctorProfileId:
                    currentProfile.id,

                  specialtyId: {
                    notIn:
                      finalSpecialtyIds,
                  },
                },
              });
            }

            for (
              let position = 0;
              position <
              finalSpecialtyIds.length;
              position++
            ) {
              const specialtyId =
                finalSpecialtyIds[
                  position
                ];

              await tx.doctorSpecialty.upsert({
                where: {
                  doctorProfileId_specialtyId:
                    {
                      doctorProfileId:
                        currentProfile.id,

                      specialtyId,
                    },
                },

                update: {
                  position,
                },

                create: {
                  doctorProfileId:
                    currentProfile.id,

                  specialtyId,
                  position,
                },
              });
            }

            /* ─────────────────────────
               DoctorCategory
            ───────────────────────── */

            if (
              finalCategoryIds.length ===
              0
            ) {
              await tx.doctorCategory.deleteMany({
                where: {
                  doctorProfileId:
                    currentProfile.id,
                },
              });
            } else {
              await tx.doctorCategory.deleteMany({
                where: {
                  doctorProfileId:
                    currentProfile.id,

                  categoryId: {
                    notIn:
                      finalCategoryIds,
                  },
                },
              });
            }

            for (
              let position = 0;
              position <
              finalCategoryIds.length;
              position++
            ) {
              const categoryId =
                finalCategoryIds[
                  position
                ];

              await tx.doctorCategory.upsert({
                where: {
                  doctorProfileId_categoryId:
                    {
                      doctorProfileId:
                        currentProfile.id,

                      categoryId,
                    },
                },

                update: {
                  position,
                },

                create: {
                  doctorProfileId:
                    currentProfile.id,

                  categoryId,
                  position,
                },
              });
            }

            /* ─────────────────────────
               DoctorSubcategory
            ───────────────────────── */

            if (
              finalSubcategoryIds.length ===
              0
            ) {
              await tx.doctorSubcategory.deleteMany({
                where: {
                  doctorProfileId:
                    currentProfile.id,
                },
              });
            } else {
              await tx.doctorSubcategory.deleteMany({
                where: {
                  doctorProfileId:
                    currentProfile.id,

                  subcategoryId: {
                    notIn:
                      finalSubcategoryIds,
                  },
                },
              });
            }

            for (
              let position = 0;
              position <
              finalSubcategoryIds.length;
              position++
            ) {
              const subcategoryId =
                finalSubcategoryIds[
                  position
                ];

              await tx.doctorSubcategory.upsert({
                where: {
                  doctorProfileId_subcategoryId:
                    {
                      doctorProfileId:
                        currentProfile.id,

                      subcategoryId,
                    },
                },

                update: {
                  position,
                },

                create: {
                  doctorProfileId:
                    currentProfile.id,

                  subcategoryId,
                  position,
                },
              });
            }

            /* ─────────────────────────
               DoctorProcedure

               Clear top ranks FIRST because
               swapping #1/#2 could violate the
               unique constraint otherwise.
            ───────────────────────── */

            await tx.doctorProcedure.updateMany({
              where: {
                doctorProfileId:
                  currentProfile.id,
              },

              data: {
                topRank: null,
              },
            });

            if (
              finalProcedureIds.length ===
              0
            ) {
              await tx.doctorProcedure.deleteMany({
                where: {
                  doctorProfileId:
                    currentProfile.id,
                },
              });
            } else {
              await tx.doctorProcedure.deleteMany({
                where: {
                  doctorProfileId:
                    currentProfile.id,

                  procedureId: {
                    notIn:
                      finalProcedureIds,
                  },
                },
              });
            }

            for (
              let position = 0;
              position <
              finalProcedureIds.length;
              position++
            ) {
              const procedureId =
                finalProcedureIds[
                  position
                ];

              await tx.doctorProcedure.upsert({
                where: {
                  doctorProfileId_procedureId:
                    {
                      doctorProfileId:
                        currentProfile.id,

                      procedureId,
                    },
                },

                /*
                 * Do NOT update price.
                 *
                 * Existing doctor-specific pricing
                 * must survive procedure/profile edits.
                 */
                update: {
                  position,
                },

                create: {
                  doctorProfileId:
                    currentProfile.id,

                  procedureId,
                  position,
                  topRank: null,
                  price: null,
                },
              });
            }

            for (
              let index = 0;
              index <
              finalTopThree.length;
              index++
            ) {
              const procedureId =
                finalTopThree[
                  index
                ];

              await tx.doctorProcedure.update({
                where: {
                  doctorProfileId_procedureId:
                    {
                      doctorProfileId:
                        currentProfile.id,

                      procedureId,
                    },
                },

                data: {
                  topRank:
                    index + 1,
                },
              });
            }
          }

          /* ═══════════════════════════
             SCALAR UPDATE
          ═══════════════════════════ */

          const updateData: Record<
            string,
            unknown
          > = {};

          for (
            const field of allowedScalarFields
          ) {
            if (
              hasOwn(
                body,
                field,
              )
            ) {
              updateData[field] =
                body[field];
            }
          }

          /*
           * Continue dual-writing the legacy arrays
           * until you are ready to remove them from
           * DoctorProfile completely.
           */

          if (
            hasCatalogueUpdate
          ) {
            updateData.specialtyIds =
              finalSpecialtyIds;

            /*
             * LEGACY:
             * subcategoryIds stores CATEGORY IDs.
             */
            updateData.subcategoryIds =
              finalCategoryIds;

            updateData.procedureIds =
              finalProcedureIds;

            updateData.topThree =
              finalTopThree;
          }

          if (
            Object.keys(
              updateData,
            ).length === 0
          ) {
            throw new ApiError(
              "No valid fields provided",
              400,
              "NO_VALID_FIELDS_PROVIDED",
            );
          }

          return tx.doctorProfile.update({
            where: {
              id:
                currentProfile.id,
            },

            data:
              updateData,
          });
        },
        {
          maxWait: 30_000,
          timeout: 60_000,
        },
      );

    return apiSuccess({
      success: true,

      profile:
        updatedProfile,

      catalogue: {
        specialtyIds:
          finalSpecialtyIds,

        categoryIds:
          finalCategoryIds,

        subcategoryIds:
          finalCategoryIds,

        procedureIds:
          finalProcedureIds,

        topThree:
          finalTopThree,
      },
    });
  },
);

/* ═════════════════════════════════════
   GET
═════════════════════════════════════ */

export const GET = withApiHandler(
  async () => {
    const session =
      await auth.api.getSession({
        headers:
          await headers(),
      });

    if (
      !session?.user?.id
    ) {
      throw new ApiError(
        "Unauthorized",
        401,
        "UNAUTHORIZED",
      );
    }

    const currentUser =
      await prisma.user.findUnique({
        where: {
          id:
            session.user.id,
        },

        select: {
          id: true,
          onboardingCompleted:
            true,
        },
      });

    if (!currentUser) {
      throw new ApiError(
        "Unauthorized",
        401,
        "UNAUTHORIZED",
      );
    }

    if (
      !currentUser.onboardingCompleted
    ) {
      return apiSuccess({
        onboardingCompleted:
          false,

        profile: null,
      });
    }

    const profile =
      await prisma.doctorProfile.findUnique({
        where: {
          userId:
            session.user.id,
        },

        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              role: true,
              onboardingCompleted:
                true,
            },
          },

          specialties: {
            orderBy: {
              position: "asc",
            },

            select: {
              specialtyId: true,
              position: true,
            },
          },

          categories: {
            orderBy: {
              position: "asc",
            },

            select: {
              categoryId: true,
              position: true,
            },
          },

          subcategories: {
            orderBy: {
              position: "asc",
            },

            select: {
              subcategoryId:
                true,

              position: true,
            },
          },

          procedures: {
            orderBy: {
              position: "asc",
            },

            select: {
              procedureId: true,
              position: true,
              topRank: true,
              price: true,
            },
          },
        },
      });

    if (!profile) {
      return apiSuccess({
        onboardingCompleted:
          true,

        profile: null,
      });
    }

    const normalizedSpecialtyIds =
      profile.specialties.map(
        (item) =>
          item.specialtyId,
      );

    const normalizedCategoryIds =
      profile.categories.map(
        (item) =>
          item.categoryId,
      );

    const normalizedSubcategoryIds =
      profile.subcategories.map(
        (item) =>
          item.subcategoryId,
      );

    const normalizedProcedureIds =
      profile.procedures.map(
        (item) =>
          item.procedureId,
      );

    const normalizedTopThree =
      profile.procedures
        .filter(
          (
            item,
          ): item is typeof item & {
            topRank: number;
          } =>
            item.topRank !== null,
        )
        .sort(
          (a, b) =>
            a.topRank -
            b.topRank,
        )
        .map(
          (item) =>
            item.procedureId,
        );

    return apiSuccess({
      onboardingCompleted:
        true,

      profile: {
        ...profile,

        /*
         * Keep legacy properties intact while
         * exposing correctly named normalized
         * properties as well.
         */

        normalizedSpecialtyIds,
        categoryIds:
          normalizedCategoryIds,

        normalizedSubcategoryIds,
        normalizedProcedureIds,
        normalizedTopThree,
      },
    });
  },
);