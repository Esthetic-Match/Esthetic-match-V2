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

type TopThreeMutationBody = {
  topThree?: unknown;
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

function normalizeTopThree(
  value: unknown
): NormalizedArrayResult {
  if (!Array.isArray(value)) {
    return {
      success: false,
      error:
        "topThree must be an array of procedure IDs.",
    };
  }

  const normalized: string[] = [];

  for (const item of value) {
    if (typeof item !== "string") {
      return {
        success: false,
        error:
          "topThree must contain only strings.",
      };
    }

    const procedureId = item.trim();

    if (!procedureId) {
      return {
        success: false,
        error:
          "topThree cannot contain empty values.",
      };
    }

    normalized.push(procedureId);
  }

  const uniqueValues = [
    ...new Set(normalized),
  ];

  if (uniqueValues.length > 3) {
    return {
      success: false,
      error:
        "A doctor can have no more than three top procedures.",
    };
  }

  return {
    success: true,
    value: uniqueValues,
  };
}

async function requireAdmin(
  request: NextRequest
): Promise<NextResponse | null> {
  const session =
    await auth.api.getSession({
      headers: request.headers,
    });

  if (!session?.user) {
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

function getLocale(
  request: NextRequest
) {
  return (
    request.nextUrl.searchParams.get(
      "locale"
    ) ?? "en"
  );
}

async function getDoctorProfile(
  doctorUserId: string,
  locale: string
) {
  const localeCodes = [
    ...new Set([
      locale,
      "en",
    ]),
  ];

  return prisma.doctorProfile.findUnique({
    where: {
      userId: doctorUserId,
    },

    select: {
      id: true,
      userId: true,

      user: {
        select: {
          name: true,
          email: true,
          role: true,
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

          procedure: {
            select: {
              id: true,

              translations: {
                where: {
                  localeCode: {
                    in: localeCodes,
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

function getTopThree(
  doctorProfile: DoctorProfileRecord
) {
  return doctorProfile.procedures
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
        a.topRank - b.topRank
    )
    .map(
      (item) =>
        item.procedureId
    );
}

function formatResponse(
  doctorProfile: DoctorProfileRecord,
  locale: string
) {
  return {
    doctor: {
      userId:
        doctorProfile.userId,

      doctorProfileId:
        doctorProfile.id,

      name:
        doctorProfile.user.name,

      email:
        doctorProfile.user.email,
    },

    procedureIds:
      doctorProfile.procedures.map(
        (item) =>
          item.procedureId
      ),

    topThree:
      getTopThree(
        doctorProfile
      ),

    procedures:
      doctorProfile.procedures.map(
        (item) => {
          const translation =
            item.procedure.translations.find(
              (translation) =>
                translation.localeCode ===
                locale
            ) ??
            item.procedure.translations.find(
              (translation) =>
                translation.localeCode ===
                "en"
            ) ??
            item.procedure.translations[0];

          return {
            id:
              item.procedureId,

            name:
              translation?.name ??
              item.procedureId,

            description:
              translation?.description ??
              null,

            position:
              item.position,

            topRank:
              item.topRank,
          };
        }
      ),
  };
}

type ResolveDoctorProfileResult =
  | {
      success: true;
      doctorProfile: DoctorProfileRecord;
      doctorUserId: string;
      locale: string;
    }
  | {
      success: false;
      response: NextResponse;
    };

async function resolveDoctorProfile(
  request: NextRequest,
  context: RouteContext
): Promise<ResolveDoctorProfileResult> {
  const authorizationError =
    await requireAdmin(request);

  if (authorizationError) {
    return {
      success: false,
      response:
        authorizationError,
    };
  }

  const { doctorId } =
    await context.params;

  const doctorUserId =
    doctorId.trim();

  if (!doctorUserId) {
    return {
      success: false,

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
    };
  }

  const locale =
    getLocale(request);

  const doctorProfile =
    await getDoctorProfile(
      doctorUserId,
      locale
    );

  if (
    !doctorProfile ||
    doctorProfile.user.role !==
      "DOCTOR"
  ) {
    return {
      success: false,

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
    };
  }

  return {
    success: true,
    doctorProfile,
    doctorUserId,
    locale,
  };
}

function validateSelectedProcedures(
  topThree: string[],
  doctorProfile: DoctorProfileRecord
): string | null {
  const availableProcedures =
    new Set(
      doctorProfile.procedures.map(
        (item) =>
          item.procedureId
      )
    );

  const invalidProcedureId =
    topThree.find(
      (procedureId) =>
        !availableProcedures.has(
          procedureId
        )
    );

  return invalidProcedureId
    ? `Procedure ${invalidProcedureId} is not assigned to this doctor.`
    : null;
}

async function setTopThree(
  doctorProfileId: string,
  topThree: string[]
) {
  await prisma.$transaction(
    async (tx) => {
      /*
       * Clear first because topRank is unique
       * per doctor and ranks may be reordered.
       */
      await tx.doctorProcedure.updateMany({
        where: {
          doctorProfileId,
        },

        data: {
          topRank: null,
        },
      });

      for (const [
        index,
        procedureId,
      ] of topThree.entries()) {
        await tx.doctorProcedure.update({
          where: {
            doctorProfileId_procedureId:
              {
                doctorProfileId,
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
  );
}

async function refreshedResponse(
  doctorUserId: string,
  locale: string,
  status = 200
) {
  const doctorProfile =
    await getDoctorProfile(
      doctorUserId,
      locale
    );

  if (!doctorProfile) {
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
    formatResponse(
      doctorProfile,
      locale
    ),
    {
      status,
    }
  );
}

/* ==============================
   GET
============================== */

export async function GET(
  request: NextRequest,
  context: RouteContext
): Promise<Response> {
  try {
    const resolved =
      await resolveDoctorProfile(
        request,
        context
      );

    if (!resolved.success) {
      return resolved.response;
    }

    return NextResponse.json(
      formatResponse(
        resolved.doctorProfile,
        resolved.locale
      )
    );
  } catch (error) {
    console.error(
      "Could not load admin doctor top three:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Could not load the doctor's top three procedures.",
      },
      {
        status: 500,
      }
    );
  }
}

/* ==============================
   POST
   Add procedures to current top three
============================== */

export async function POST(
  request: NextRequest,
  context: RouteContext
): Promise<Response> {
  try {
    const resolved =
      await resolveDoctorProfile(
        request,
        context
      );

    if (!resolved.success) {
      return resolved.response;
    }

    const body =
      (await request
        .json()
        .catch(() => null)) as
        | TopThreeMutationBody
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

    const normalized =
      normalizeTopThree(
        body.topThree
      );

    if (!normalized.success) {
      return NextResponse.json(
        {
          error:
            normalized.error,
        },
        {
          status: 400,
        }
      );
    }

    const currentTopThree =
      getTopThree(
        resolved.doctorProfile
      );

    const nextTopThree = [
      ...new Set([
        ...currentTopThree,
        ...normalized.value,
      ]),
    ];

    if (
      nextTopThree.length > 3
    ) {
      return NextResponse.json(
        {
          error:
            "A doctor can have no more than three top procedures.",
        },
        {
          status: 400,
        }
      );
    }

    const invalidSelection =
      validateSelectedProcedures(
        nextTopThree,
        resolved.doctorProfile
      );

    if (invalidSelection) {
      return NextResponse.json(
        {
          error:
            invalidSelection,
        },
        {
          status: 400,
        }
      );
    }

    await setTopThree(
      resolved.doctorProfile.id,
      nextTopThree
    );

    return refreshedResponse(
      resolved.doctorUserId,
      resolved.locale,
      201
    );
  } catch (error) {
    console.error(
      "Could not add admin doctor top three:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Could not add the doctor's top three procedures.",
      },
      {
        status: 500,
      }
    );
  }
}

/* ==============================
   PATCH
   Replace entire top three
============================== */

export async function PATCH(
  request: NextRequest,
  context: RouteContext
): Promise<Response> {
  try {
    const resolved =
      await resolveDoctorProfile(
        request,
        context
      );

    if (!resolved.success) {
      return resolved.response;
    }

    const body =
      (await request
        .json()
        .catch(() => null)) as
        | TopThreeMutationBody
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

    const normalized =
      normalizeTopThree(
        body.topThree
      );

    if (!normalized.success) {
      return NextResponse.json(
        {
          error:
            normalized.error,
        },
        {
          status: 400,
        }
      );
    }

    const invalidSelection =
      validateSelectedProcedures(
        normalized.value,
        resolved.doctorProfile
      );

    if (invalidSelection) {
      return NextResponse.json(
        {
          error:
            invalidSelection,
        },
        {
          status: 400,
        }
      );
    }

    await setTopThree(
      resolved.doctorProfile.id,
      normalized.value
    );

    return refreshedResponse(
      resolved.doctorUserId,
      resolved.locale
    );
  } catch (error) {
    console.error(
      "Could not update admin doctor top three:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Could not update the doctor's top three procedures.",
      },
      {
        status: 500,
      }
    );
  }
}

/* ==============================
   DELETE
============================== */

export async function DELETE(
  request: NextRequest,
  context: RouteContext
): Promise<Response> {
  try {
    const resolved =
      await resolveDoctorProfile(
        request,
        context
      );

    if (!resolved.success) {
      return resolved.response;
    }

    const body =
      (await request
        .json()
        .catch(() => null)) as
        | TopThreeMutationBody
        | null;

    const currentTopThree =
      getTopThree(
        resolved.doctorProfile
      );

    let nextTopThree: string[] =
      [];

    if (
      body?.topThree !== undefined
    ) {
      const normalized =
        normalizeTopThree(
          body.topThree
        );

      if (!normalized.success) {
        return NextResponse.json(
          {
            error:
              normalized.error,
          },
          {
            status: 400,
          }
        );
      }

      const idsToRemove =
        new Set(
          normalized.value
        );

      nextTopThree =
        currentTopThree.filter(
          (procedureId) =>
            !idsToRemove.has(
              procedureId
            )
        );
    }

    await setTopThree(
      resolved.doctorProfile.id,
      nextTopThree
    );

    return refreshedResponse(
      resolved.doctorUserId,
      resolved.locale
    );
  } catch (error) {
    console.error(
      "Could not delete admin doctor top three:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Could not delete the doctor's top three procedures.",
      },
      {
        status: 500,
      }
    );
  }
}