import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/database/prisma";
import {
  NextRequest,
  NextResponse,
} from "next/server";

type RouteContext = {
  params: Promise<{
    doctorId: string;
  }>;
};

type ProcedureMutationBody = {
  categoryIds?: unknown;

  /*
   * Temporary backward compatibility.
   * Older admin UI sent CATEGORY IDs
   * using this property name.
   */
  subcategoryIds?: unknown;

  procedureIds?: unknown;
};

type NormalizedArrayResult =
  | {
      success: true;
      value: string[];
    }
  | {
      success: false;
      error: string;
    };

const CATEGORY_ID_ALIASES: Readonly<
  Record<string, string>
> = {
  wellness_and_drainage:
    "wellness_and_postoperative",

  longevity:
    "longevity_medicine",
};

function normalizeStringArray(
  value: unknown,
  fieldName: string
): NormalizedArrayResult {
  if (!Array.isArray(value)) {
    return {
      success: false,
      error: `${fieldName} must be an array of strings.`,
    };
  }

  const normalized: string[] =
    [];

  for (const item of value) {
    if (typeof item !== "string") {
      return {
        success: false,
        error: `${fieldName} must contain only strings.`,
      };
    }

    const id = item.trim();

    if (!id) {
      return {
        success: false,
        error: `${fieldName} cannot contain empty values.`,
      };
    }

    normalized.push(id);
  }

  return {
    success: true,
    value: [
      ...new Set(normalized),
    ],
  };
}

function normalizeCategoryIds(
  ids: string[]
) {
  return [
    ...new Set(
      ids.map(
        (id) =>
          CATEGORY_ID_ALIASES[
            id
          ] ?? id
      )
    ),
  ];
}

async function requireAdmin(
  request: NextRequest
) {
  const session =
    await auth.api.getSession({
      headers: request.headers,
    });

  if (!session) {
    return NextResponse.json(
      {
        error:
          "Authentication required.",
      },
      {
        status: 401,
      }
    );
  }

  if (
    session.user.role !== "ADMIN"
  ) {
    return NextResponse.json(
      {
        error:
          "Administrator access required.",
      },
      {
        status: 403,
      }
    );
  }

  return null;
}

async function getDoctorProfile(
  doctorUserId: string
) {
  return prisma.doctorProfile.findUnique({
    where: {
      userId: doctorUserId,
    },

    select: {
      id: true,
      userId: true,

      /*
       * Legacy fallback fields.
       */
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

      subcategories: {
        orderBy: {
          position: "asc",
        },

        select: {
          subcategoryId: true,
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

          procedure: {
            select: {
              isActive: true,

              translations: {
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

      user: {
        select: {
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });
}

type DoctorProfileRecord =
  NonNullable<
    Awaited<
      ReturnType<
        typeof getDoctorProfile
      >
    >
  >;

function getSpecialtyIds(
  doctor: DoctorProfileRecord
) {
  return doctor.specialties.length >
    0
    ? doctor.specialties.map(
        (item) =>
          item.specialtyId
      )
    : doctor.specialtyIds;
}

function getCategoryIds(
  doctor: DoctorProfileRecord
) {
  return doctor.categories.length >
    0
    ? doctor.categories.map(
        (item) =>
          item.categoryId
      )
    : normalizeCategoryIds(
        doctor.subcategoryIds
      );
}

function getProcedureIds(
  doctor: DoctorProfileRecord
) {
  return doctor.procedures.length >
    0
    ? doctor.procedures.map(
        (item) =>
          item.procedureId
      )
    : doctor.procedureIds;
}

function getTopThree(
  doctor: DoctorProfileRecord
) {
  const relational =
    doctor.procedures
      .filter(
        (
          item
        ): item is typeof item & {
          topRank: number;
        } =>
          item.topRank !== null
      )
      .sort(
        (a, b) =>
          a.topRank -
          b.topRank
      )
      .map(
        (item) =>
          item.procedureId
      );

  return relational.length > 0
    ? relational
    : doctor.topThree;
}

function formatResponse(
  doctor: DoctorProfileRecord
) {
  return {
    doctor: {
      userId:
        doctor.userId,

      doctorProfileId:
        doctor.id,

      name:
        doctor.user.name,

      email:
        doctor.user.email,
    },

    specialtyIds:
      getSpecialtyIds(
        doctor
      ),

    categoryIds:
      getCategoryIds(
        doctor
      ),

    /*
     * These are REAL normalized
     * DoctorSubcategory IDs.
     */
    subcategoryIds:
      doctor.subcategories.map(
        (item) =>
          item.subcategoryId
      ),

    procedureIds:
      getProcedureIds(
        doctor
      ),

    topThree:
      getTopThree(
        doctor
      ),

    procedures:
      doctor.procedures.map(
        (item) => ({
          id:
            item.procedureId,

          procedureId:
            item.procedureId,

          position:
            item.position,

          topRank:
            item.topRank,

          price:
            item.price?.toString() ??
            null,

          isActive:
            item.procedure.isActive,

          translations:
            item.procedure
              .translations,
        })
      ),
  };
}

async function validateSelection(
  doctor: DoctorProfileRecord,
  categoryIds: string[],
  procedureIds: string[]
) {
  const specialtyIds =
    getSpecialtyIds(doctor);

  const [
    categories,
    procedures,
    specialtyCategoryLinks,
    procedureLinks,
  ] = await Promise.all([
    prisma.category.findMany({
      where: {
        id: {
          in: categoryIds,
        },

        isActive: true,
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
      },

      select: {
        id: true,
      },
    }),

    prisma.specialtyCategory.findMany({
      where: {
        specialtyId: {
          in: specialtyIds,
        },

        categoryId: {
          in: categoryIds,
        },

        isActive: true,
      },

      select: {
        categoryId: true,
      },
    }),

    prisma.procedureSubcategory.findMany({
      where: {
        procedureId: {
          in: procedureIds,
        },

        isActive: true,

        subcategory: {
          isActive: true,

          categoryId: {
            in: categoryIds,
          },
        },
      },

      select: {
        procedureId: true,
        subcategoryId: true,
        sortOrder: true,

        subcategory: {
          select: {
            categoryId: true,
            sortOrder: true,
          },
        },
      },
    }),
  ]);

  if (
    categories.length !==
    categoryIds.length
  ) {
    return {
      error:
        "One or more categories do not exist.",
      subcategoryIds: [],
    };
  }

  if (
    procedures.length !==
    procedureIds.length
  ) {
    return {
      error:
        "One or more procedures do not exist.",
      subcategoryIds: [],
    };
  }

  const allowedCategoryIds =
    new Set(
      specialtyCategoryLinks.map(
        (item) =>
          item.categoryId
      )
    );

  const invalidCategory =
    categoryIds.find(
      (id) =>
        !allowedCategoryIds.has(
          id
        )
    );

  if (invalidCategory) {
    return {
      error: `Category ${invalidCategory} is not available for this doctor's specialties.`,
      subcategoryIds: [],
    };
  }

  const proceduresWithLinks =
    new Set(
      procedureLinks.map(
        (item) =>
          item.procedureId
      )
    );

  const invalidProcedure =
    procedureIds.find(
      (id) =>
        !proceduresWithLinks.has(
          id
        )
    );

  if (invalidProcedure) {
    return {
      error: `Procedure ${invalidProcedure} is not available inside the selected categories.`,
      subcategoryIds: [],
    };
  }

  const categoryPosition =
    new Map(
      categoryIds.map(
        (id, index) => [
          id,
          index,
        ]
      )
    );

  const procedurePosition =
    new Map(
      procedureIds.map(
        (id, index) => [
          id,
          index,
        ]
      )
    );

  const sortedLinks = [
    ...procedureLinks,
  ].sort((a, b) => {
    return (
      (categoryPosition.get(
        a.subcategory.categoryId
      ) ??
        Number.MAX_SAFE_INTEGER) -
        (categoryPosition.get(
          b.subcategory.categoryId
        ) ??
          Number.MAX_SAFE_INTEGER) ||
      (procedurePosition.get(
        a.procedureId
      ) ??
        Number.MAX_SAFE_INTEGER) -
        (procedurePosition.get(
          b.procedureId
        ) ??
          Number.MAX_SAFE_INTEGER) ||
      a.sortOrder -
        b.sortOrder ||
      a.subcategory.sortOrder -
        b.subcategory.sortOrder
    );
  });

  const subcategoryIds = [
    ...new Set(
      sortedLinks.map(
        (item) =>
          item.subcategoryId
      )
    ),
  ];

  return {
    error: null,
    subcategoryIds,
  };
}

async function replaceSelections(
  doctor: DoctorProfileRecord,
  categoryIds: string[],
  procedureIds: string[]
) {
  const validation =
    await validateSelection(
      doctor,
      categoryIds,
      procedureIds
    );

  if (validation.error) {
    return {
      error:
        validation.error,
    };
  }

  const subcategoryIds =
    validation.subcategoryIds;

  await prisma.$transaction(
    async (tx) => {
      /*
       * CATEGORIES
       */

      await tx.doctorCategory.deleteMany({
        where: {
          doctorProfileId:
            doctor.id,

          categoryId: {
            notIn:
              categoryIds,
          },
        },
      });

      for (const [
        position,
        categoryId,
      ] of categoryIds.entries()) {
        await tx.doctorCategory.upsert({
          where: {
            doctorProfileId_categoryId:
              {
                doctorProfileId:
                  doctor.id,

                categoryId,
              },
          },

          update: {
            position,
          },

          create: {
            doctorProfileId:
              doctor.id,

            categoryId,
            position,
          },
        });
      }

      /*
       * REAL SUBCATEGORIES
       * Derived from selected procedures.
       */

      await tx.doctorSubcategory.deleteMany({
        where: {
          doctorProfileId:
            doctor.id,

          subcategoryId: {
            notIn:
              subcategoryIds,
          },
        },
      });

      for (const [
        position,
        subcategoryId,
      ] of subcategoryIds.entries()) {
        await tx.doctorSubcategory.upsert({
          where: {
            doctorProfileId_subcategoryId:
              {
                doctorProfileId:
                  doctor.id,

                subcategoryId,
              },
          },

          update: {
            position,
          },

          create: {
            doctorProfileId:
              doctor.id,

            subcategoryId,
            position,
          },
        });
      }

      /*
       * PROCEDURES
       */

      await tx.doctorProcedure.deleteMany({
        where: {
          doctorProfileId:
            doctor.id,

          procedureId: {
            notIn:
              procedureIds,
          },
        },
      });

      for (const [
        position,
        procedureId,
      ] of procedureIds.entries()) {
        await tx.doctorProcedure.upsert({
          where: {
            doctorProfileId_procedureId:
              {
                doctorProfileId:
                  doctor.id,

                procedureId,
              },
          },

          /*
           * Preserve existing price
           * and topRank.
           */
          update: {
            position,
          },

          create: {
            doctorProfileId:
              doctor.id,

            procedureId,
            position,
            price: null,
            topRank: null,
          },
        });
      }
    }
  );

  return {
    error: null,
  };
}

async function resolveDoctor(
  request: NextRequest,
  context: RouteContext
) {
  const authError =
    await requireAdmin(request);

  if (authError) {
    return {
      response:
        authError,

      doctor: null,
    };
  }

  const { doctorId } =
    await context.params;

  const doctorUserId =
    doctorId.trim();

  if (!doctorUserId) {
    return {
      response:
        NextResponse.json(
          {
            error:
              "Doctor user ID is required.",
          },
          {
            status: 400,
          }
        ),

      doctor: null,
    };
  }

  const doctor =
    await getDoctorProfile(
      doctorUserId
    );

  if (
    !doctor ||
    doctor.user.role !==
      "DOCTOR"
  ) {
    return {
      response:
        NextResponse.json(
          {
            error:
              "Doctor profile not found.",
          },
          {
            status: 404,
          }
        ),

      doctor: null,
    };
  }

  return {
    response: null,
    doctor,
    doctorUserId,
  };
}

/* ==============================
   GET
============================== */

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const resolved =
      await resolveDoctor(
        request,
        context
      );

    if (
      resolved.response ||
      !resolved.doctor
    ) {
      return resolved.response!;
    }

    return NextResponse.json(
      formatResponse(
        resolved.doctor
      )
    );
  } catch (error) {
    console.error(
      "Could not load admin doctor procedures:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Could not load the doctor's procedures.",
      },
      {
        status: 500,
      }
    );
  }
}

/* ==============================
   PATCH
============================== */

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const resolved =
      await resolveDoctor(
        request,
        context
      );

    if (
      resolved.response ||
      !resolved.doctor
    ) {
      return resolved.response!;
    }

    const body =
      (await request
        .json()
        .catch(() => null)) as
        | ProcedureMutationBody
        | null;

    if (!body) {
      return NextResponse.json(
        {
          error:
            "A valid JSON body is required.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * categoryIds is the new field.
     *
     * subcategoryIds remains accepted
     * temporarily because the old UI
     * used that property for CATEGORY IDs.
     */
    const rawCategoryIds =
      body.categoryIds !==
      undefined
        ? body.categoryIds
        : body.subcategoryIds;

    const categoryResult =
      normalizeStringArray(
        rawCategoryIds,
        "categoryIds"
      );

    const procedureResult =
      normalizeStringArray(
        body.procedureIds,
        "procedureIds"
      );

    if (!categoryResult.success) {
      return NextResponse.json(
        {
          error:
            categoryResult.error,
        },
        {
          status: 400,
        }
      );
    }

    if (
      !procedureResult.success
    ) {
      return NextResponse.json(
        {
          error:
            procedureResult.error,
        },
        {
          status: 400,
        }
      );
    }

    const categoryIds =
      normalizeCategoryIds(
        categoryResult.value
      );

    const result =
      await replaceSelections(
        resolved.doctor,
        categoryIds,
        procedureResult.value
      );

    if (result.error) {
      return NextResponse.json(
        {
          error:
            result.error,
        },
        {
          status: 400,
        }
      );
    }

    const updated =
      await getDoctorProfile(
        resolved.doctor.userId
      );

    if (!updated) {
      return NextResponse.json(
        {
          error:
            "Doctor profile not found.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(
      formatResponse(updated)
    );
  } catch (error) {
    console.error(
      "Could not update admin doctor procedures:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Could not update the doctor's procedures.",
      },
      {
        status: 500,
      }
    );
  }
}