import { headers } from "next/headers";

import { ApiError, apiSuccess } from "@/lib/api/error-handler";
import { withApiHandler } from "@/lib/api/with-api-handler";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/database/prisma";

type TranslationRow = {
  localeCode: string;
  name: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getLocaleCandidates(
  request: Request,
  defaultLocaleCode: string | null,
) {
  const rawLocale = new URL(request.url).searchParams.get("locale") ?? "en";
  const normalizedLocale = rawLocale.trim().toLowerCase().replaceAll("_", "-");
  const requestedLocale = /^[a-z]{2}(?:-[a-z0-9]{2,8})*$/.test(
    normalizedLocale,
  )
    ? normalizedLocale
    : "en";

  return Array.from(
    new Set(
      [
        requestedLocale,
        requestedLocale.split("-")[0],
        defaultLocaleCode?.toLowerCase(),
        "en",
      ].filter((localeCode): localeCode is string => Boolean(localeCode)),
    ),
  );
}

function getTranslatedName(
  translations: TranslationRow[],
  localeCandidates: string[],
  fallback: string,
) {
  for (const localeCode of localeCandidates) {
    const translation = translations.find(
      (item) => item.localeCode.toLowerCase() === localeCode,
    );

    if (translation?.name.trim()) {
      return translation.name.trim();
    }
  }

  return translations.find((item) => item.name.trim())?.name.trim() ?? fallback;
}

function getPublicAssetPath(value: string | null, fallbackDirectory: string) {
  const normalizedValue = value?.trim();

  if (!normalizedValue) {
    return null;
  }

  if (
    normalizedValue.startsWith("/") ||
    /^[a-z][a-z0-9+.-]*:/i.test(normalizedValue)
  ) {
    return normalizedValue;
  }

  return `${fallbackDirectory}/${normalizedValue}`;
}

function getStringIds(value: unknown, fieldName: string) {
  if (
    !Array.isArray(value) ||
    value.some((item) => typeof item !== "string" || !item.trim())
  ) {
    throw new ApiError(
      `${fieldName} must be an array of IDs.`,
      400,
      "INVALID_ONBOARDING_DATA",
    );
  }

  return Array.from(new Set(value.map((item) => item.trim())));
}

function getOptionalString(value: unknown, fieldName: string) {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== "string") {
    throw new ApiError(
      `${fieldName} must be a string.`,
      400,
      "INVALID_ONBOARDING_DATA",
    );
  }

  return value.trim() || null;
}

async function getRequestBody(request: Request) {
  const body: unknown = await request.json().catch(() => null);

  if (!isRecord(body)) {
    throw new ApiError(
      "The request body must be a valid JSON object.",
      400,
      "INVALID_ONBOARDING_DATA",
    );
  }

  return body;
}

export const GET = withApiHandler(async (request: Request) => {
  const defaultLocale = await prisma.catalogLocale.findFirst({
    where: {
      isActive: true,
      isDefault: true,
    },
    orderBy: [{ sortOrder: "asc" }, { code: "asc" }],
    select: {
      code: true,
    },
  });

  const localeCandidates = getLocaleCandidates(
    request,
    defaultLocale?.code ?? null,
  );

  const [specialtyGroups, categories] = await Promise.all([
    prisma.specialtyGroup.findMany({
      where: {
        isActive: true,
        specialties: {
          some: {
            isActive: true,
          },
        },
      },
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
      select: {
        id: true,
        translations: {
          where: {
            localeCode: {
              in: localeCandidates,
            },
          },
          orderBy: {
            localeCode: "asc",
          },
          select: {
            localeCode: true,
            name: true,
          },
        },
        specialties: {
          where: {
            isActive: true,
          },
          orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
          select: {
            id: true,
            icon: true,
            translations: {
              where: {
                localeCode: {
                  in: localeCandidates,
                },
              },
              orderBy: {
                localeCode: "asc",
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
    prisma.category.findMany({
      where: {
        isActive: true,
        specialtyLinks: {
          some: {
            isActive: true,
            specialty: {
              isActive: true,
              specialtyGroup: {
                isActive: true,
              },
            },
          },
        },
        subcategories: {
          some: {
            isActive: true,
            procedureLinks: {
              some: {
                isActive: true,
                procedure: {
                  isActive: true,
                },
              },
            },
          },
        },
      },
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
      select: {
        id: true,
        dashboardImage: true,
        translations: {
          where: {
            localeCode: {
              in: localeCandidates,
            },
          },
          orderBy: {
            localeCode: "asc",
          },
          select: {
            localeCode: true,
            name: true,
          },
        },
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
          orderBy: [{ sortOrder: "asc" }, { specialtyId: "asc" }],
          select: {
            specialtyId: true,
          },
        },
        subcategories: {
          where: {
            isActive: true,
            procedureLinks: {
              some: {
                isActive: true,
                procedure: {
                  isActive: true,
                },
              },
            },
          },
          orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
          select: {
            id: true,
            translations: {
              where: {
                localeCode: {
                  in: localeCandidates,
                },
              },
              orderBy: {
                localeCode: "asc",
              },
              select: {
                localeCode: true,
                name: true,
              },
            },
            procedureLinks: {
              where: {
                isActive: true,
                procedure: {
                  isActive: true,
                },
              },
              orderBy: [{ sortOrder: "asc" }, { procedureId: "asc" }],
              select: {
                procedure: {
                  select: {
                    id: true,
                    translations: {
                      where: {
                        localeCode: {
                          in: localeCandidates,
                        },
                      },
                      orderBy: {
                        localeCode: "asc",
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
          },
        },
      },
    }),
  ]);

  return apiSuccess({
    specialtyGroups: specialtyGroups.map((group) => ({
      id: group.id,
      name: getTranslatedName(
        group.translations,
        localeCandidates,
        group.id,
      ),
      specialties: group.specialties.map((specialty) => ({
        id: specialty.id,
        name: getTranslatedName(
          specialty.translations,
          localeCandidates,
          specialty.id,
        ),
        icon: getPublicAssetPath(
          specialty.icon,
          "/images/dashboard/specialties",
        ),
      })),
    })),
    categories: categories.map((category) => ({
      id: category.id,
      name: getTranslatedName(
        category.translations,
        localeCandidates,
        category.id,
      ),
      dashboardImage: getPublicAssetPath(
        category.dashboardImage,
        "/images/dashboard/categories",
      ),
      specialtyIds: category.specialtyLinks.map((link) => link.specialtyId),
      subcategories: category.subcategories.map((subcategory) => ({
        id: subcategory.id,
        name: getTranslatedName(
          subcategory.translations,
          localeCandidates,
          subcategory.id,
        ),
        procedures: subcategory.procedureLinks.map(({ procedure }) => ({
          id: procedure.id,
          name: getTranslatedName(
            procedure.translations,
            localeCandidates,
            procedure.id,
          ),
        })),
      })),
    })),
  });
});

export const POST = withApiHandler(async (request: Request) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new ApiError(
      "Unauthorized: Please log out and sign in again to verify your identity",
      401,
      "UNAUTHORIZED",
    );
  }

  const body = await getRequestBody(request);
  const specialtyIds = getStringIds(body.specialtyIds, "specialtyIds");
  const categoryIds = getStringIds(body.categoryIds, "categoryIds");
  const procedureIds = getStringIds(body.procedureIds, "procedureIds");
  const topThree = getStringIds(body.topThree, "topThree");
  const otherSpecialtyText = getOptionalString(
    body.otherSpecialtyText,
    "otherSpecialtyText",
  );

  if (specialtyIds.length === 0) {
    throw new ApiError(
      "Select at least one specialty.",
      400,
      "SPECIALTY_REQUIRED",
    );
  }

  if (categoryIds.length === 0) {
    throw new ApiError(
      "Select at least one category.",
      400,
      "CATEGORY_REQUIRED",
    );
  }

  if (
    topThree.length !== 3 ||
    topThree.some((procedureId) => !procedureIds.includes(procedureId))
  ) {
    throw new ApiError(
      "Top procedures must contain exactly three selected procedure IDs.",
      400,
      "INVALID_TOP_PROCEDURES",
    );
  }

  const [doctorProfile, specialties, categories, procedures] =
    await Promise.all([
      prisma.doctorProfile.findUnique({
        where: {
          userId: session.user.id,
        },
        select: {
          id: true,
        },
      }),
      prisma.specialty.findMany({
        where: {
          id: {
            in: specialtyIds,
          },
          isActive: true,
          specialtyGroup: {
            isActive: true,
          },
        },
        select: {
          id: true,
        },
      }),
      prisma.category.findMany({
        where: {
          id: {
            in: categoryIds,
          },
          isActive: true,
          specialtyLinks: {
            some: {
              specialtyId: {
                in: specialtyIds,
              },
              isActive: true,
              specialty: {
                isActive: true,
                specialtyGroup: {
                  isActive: true,
                },
              },
            },
          },
        },
        select: {
          id: true,
        },
      }),
      prisma.procedure.findMany({
        where: {
          id: {
            in: procedureIds,
          },
          isActive: true,
          subcategoryLinks: {
            some: {
              isActive: true,
              subcategory: {
                isActive: true,
                categoryId: {
                  in: categoryIds,
                },
                category: {
                  isActive: true,
                },
              },
            },
          },
        },
        select: {
          id: true,
          subcategoryLinks: {
            where: {
              isActive: true,
              subcategory: {
                isActive: true,
                categoryId: {
                  in: categoryIds,
                },
                category: {
                  isActive: true,
                },
              },
            },
            select: {
              subcategoryId: true,
              subcategory: {
                select: {
                  id: true,
                  sortOrder: true,
                  categoryId: true,
                  category: {
                    select: {
                      sortOrder: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
    ]);

  if (!doctorProfile) {
    throw new ApiError(
      "Doctor profile not found.",
      404,
      "DOCTOR_PROFILE_NOT_FOUND",
    );
  }

  if (specialties.length !== specialtyIds.length) {
    throw new ApiError(
      "One or more specialties are invalid or inactive.",
      400,
      "INVALID_SPECIALTY_SELECTION",
    );
  }

  if (categories.length !== categoryIds.length) {
    throw new ApiError(
      "One or more categories are invalid, inactive, or unavailable for the selected specialties.",
      400,
      "INVALID_CATEGORY_SELECTION",
    );
  }

  if (procedures.length !== procedureIds.length) {
    throw new ApiError(
      "One or more procedures are invalid, inactive, or unavailable for the selected categories.",
      400,
      "INVALID_PROCEDURE_SELECTION",
    );
  }

  const categoryPosition = new Map(
    categoryIds.map((categoryId, index) => [categoryId, index]),
  );
  const subcategoryLinks = procedures
    .flatMap((procedure) => procedure.subcategoryLinks)
    .sort((left, right) => {
      const leftCategoryPosition =
        categoryPosition.get(left.subcategory.categoryId) ??
        Number.MAX_SAFE_INTEGER;
      const rightCategoryPosition =
        categoryPosition.get(right.subcategory.categoryId) ??
        Number.MAX_SAFE_INTEGER;

      if (leftCategoryPosition !== rightCategoryPosition) {
        return leftCategoryPosition - rightCategoryPosition;
      }

      if (
        left.subcategory.category.sortOrder !==
        right.subcategory.category.sortOrder
      ) {
        return (
          left.subcategory.category.sortOrder -
          right.subcategory.category.sortOrder
        );
      }

      if (left.subcategory.sortOrder !== right.subcategory.sortOrder) {
        return left.subcategory.sortOrder - right.subcategory.sortOrder;
      }

      return left.subcategoryId.localeCompare(right.subcategoryId);
    });
  const subcategoryIds = Array.from(
    new Set(subcategoryLinks.map((link) => link.subcategoryId)),
  );
  const topRankByProcedureId = new Map(
    topThree.map((procedureId, index) => [procedureId, index + 1]),
  );

  await prisma.$transaction(async (transaction) => {
    await transaction.doctorSpecialty.deleteMany({
      where: {
        doctorProfileId: doctorProfile.id,
        specialtyId: {
          notIn: specialtyIds,
        },
      },
    });

    for (const [position, specialtyId] of specialtyIds.entries()) {
      await transaction.doctorSpecialty.upsert({
        where: {
          doctorProfileId_specialtyId: {
            doctorProfileId: doctorProfile.id,
            specialtyId,
          },
        },
        create: {
          doctorProfileId: doctorProfile.id,
          specialtyId,
          position,
        },
        update: {
          position,
        },
      });
    }

    await transaction.doctorCategory.deleteMany({
      where: {
        doctorProfileId: doctorProfile.id,
        categoryId: {
          notIn: categoryIds,
        },
      },
    });

    for (const [position, categoryId] of categoryIds.entries()) {
      await transaction.doctorCategory.upsert({
        where: {
          doctorProfileId_categoryId: {
            doctorProfileId: doctorProfile.id,
            categoryId,
          },
        },
        create: {
          doctorProfileId: doctorProfile.id,
          categoryId,
          position,
        },
        update: {
          position,
        },
      });
    }

    await transaction.doctorSubcategory.deleteMany({
      where: {
        doctorProfileId: doctorProfile.id,
        subcategoryId: {
          notIn: subcategoryIds,
        },
      },
    });

    for (const [position, subcategoryId] of subcategoryIds.entries()) {
      await transaction.doctorSubcategory.upsert({
        where: {
          doctorProfileId_subcategoryId: {
            doctorProfileId: doctorProfile.id,
            subcategoryId,
          },
        },
        create: {
          doctorProfileId: doctorProfile.id,
          subcategoryId,
          position,
        },
        update: {
          position,
        },
      });
    }

    // Clear ranks before assigning the new order so swaps cannot violate the
    // @@unique([doctorProfileId, topRank]) constraint.
    await transaction.doctorProcedure.updateMany({
      where: {
        doctorProfileId: doctorProfile.id,
      },
      data: {
        topRank: null,
      },
    });

    await transaction.doctorProcedure.deleteMany({
      where: {
        doctorProfileId: doctorProfile.id,
        procedureId: {
          notIn: procedureIds,
        },
      },
    });

    for (const [position, procedureId] of procedureIds.entries()) {
      const topRank = topRankByProcedureId.get(procedureId) ?? null;

      await transaction.doctorProcedure.upsert({
        where: {
          doctorProfileId_procedureId: {
            doctorProfileId: doctorProfile.id,
            procedureId,
          },
        },
        create: {
          doctorProfileId: doctorProfile.id,
          procedureId,
          position,
          topRank,
        },
        update: {
          position,
          topRank,
        },
      });
    }

    await transaction.doctorProfile.update({
      where: {
        id: doctorProfile.id,
      },
      data: {
        // Transitional dual-write. This legacy field historically stores
        // category IDs despite its name. DoctorSubcategory contains the actual
        // inferred subcategory relations.
        specialtyIds,
        subcategoryIds: categoryIds,
        procedureIds,
        topThree,
        otherSpecialtyText,
      },
    });

    await transaction.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        onboardingCompleted: true,
      },
    });
  });

  return apiSuccess({
    ok: true,
  });
});