import { headers } from "next/headers";

import { storage } from "@/lib/google/gcs";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/database/prisma";
import {
  ApiError,
  apiSuccess,
} from "@/lib/api/error-handler";
import { withApiHandler } from "@/lib/api/with-api-handler";

function isRecord(
  value: unknown
): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readOptionalString(
  value: unknown,
  fieldName: string
): string | null | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  if (typeof value !== "string") {
    throw new ApiError(
      `${fieldName} must be a string.`,
      400,
      "INVALID_BEFORE_AFTER_FIELD"
    );
  }

  const trimmedValue = value.trim();

  return trimmedValue || null;
}

async function requireAdminSession(): Promise<void> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new ApiError(
      "Unauthorized.",
      401,
      "UNAUTHORIZED"
    );
  }

  if (session.user.role !== "ADMIN") {
    throw new ApiError(
      "Forbidden.",
      403,
      "FORBIDDEN"
    );
  }
}

/*
 * GET
 * Returns every doctor, including doctors with no cases.
 */
export const GET = withApiHandler(
  async () => {
    await requireAdminSession();

    const [doctorProfiles, cases] =
      await Promise.all([
        prisma.doctorProfile.findMany({
          select: {
            id: true,
            userId: true,
            clinicName: true,
            avatar: true,
            procedureIds: true,

            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },

          orderBy: {
            createdAt: "desc",
          },
        }),

        prisma.beforeAfterCase.findMany({
          orderBy: {
            createdAt: "desc",
          },
        }),
      ]);

    const casesByDoctorId = new Map<
      string,
      typeof cases
    >();

    for (const beforeAfterCase of cases) {
      const currentCases =
        casesByDoctorId.get(
          beforeAfterCase.doctorId
        ) ?? [];

      currentCases.push(beforeAfterCase);

      casesByDoctorId.set(
        beforeAfterCase.doctorId,
        currentCases
      );
    }

    const doctors = doctorProfiles.map(
      (doctorProfile) => {
        return {
          doctorProfileId: doctorProfile.id,

          /*
           * This is the value the existing
           * BeforeAfterUploadModal expects.
           */
          doctorId: doctorProfile.userId,

          name: doctorProfile.user.name,
          email: doctorProfile.user.email,
          clinicName:
            doctorProfile.clinicName,
          avatar: doctorProfile.avatar,
          procedureIds:
            doctorProfile.procedureIds,

          cases:
            casesByDoctorId.get(
              doctorProfile.userId
            ) ?? [],
        };
      }
    );

    return apiSuccess({
      doctors,
    });
  }
);

/*
 * POST
 */
export const POST = withApiHandler(
  async (req: Request) => {
    await requireAdminSession();

    const body: unknown = await req.json();

    if (!isRecord(body)) {
      throw new ApiError(
        "Invalid request body.",
        400,
        "INVALID_REQUEST_BODY"
      );
    }

    if (
      typeof body.doctorId !== "string" ||
      !body.doctorId.trim()
    ) {
      throw new ApiError(
        "Doctor ID is required.",
        400,
        "DOCTOR_ID_REQUIRED"
      );
    }

    const doctorId = body.doctorId.trim();

    const doctorProfile =
      await prisma.doctorProfile.findUnique({
        where: {
          userId: doctorId,
        },

        select: {
          userId: true,
          procedureIds: true,
        },
      });

    if (!doctorProfile) {
      throw new ApiError(
        "Doctor profile not found.",
        404,
        "DOCTOR_PROFILE_NOT_FOUND"
      );
    }

    const title = readOptionalString(
      body.title,
      "Title"
    );

    /*
     * The UI can call this Description,
     * but the schema stores it as notes.
     */
    const notes = readOptionalString(
      body.notes ?? body.description,
      "Description"
    );

    const procedure = readOptionalString(
      body.procedure,
      "Procedure"
    );

    const beforeImage = readOptionalString(
      body.beforeImage,
      "Before image"
    );

    const afterImage = readOptionalString(
      body.afterImage,
      "After image"
    );

    if (
      procedure &&
      !doctorProfile.procedureIds.includes(
        procedure
      )
    ) {
      throw new ApiError(
        "The selected procedure is not associated with this doctor.",
        400,
        "INVALID_DOCTOR_PROCEDURE"
      );
    }

    if (
      body.isPublic !== undefined &&
      typeof body.isPublic !== "boolean"
    ) {
      throw new ApiError(
        "isPublic must be a boolean.",
        400,
        "INVALID_PUBLIC_STATUS"
      );
    }

    const beforeAfterCase =
      await prisma.beforeAfterCase.create({
        data: {
          doctorId,
          patientId: null,
          title: title ?? null,
          notes: notes ?? null,
          procedure: procedure ?? null,
          beforeImage: beforeImage ?? null,
          afterImage: afterImage ?? null,
          isPublic:
            typeof body.isPublic === "boolean"
              ? body.isPublic
              : false,
        },
      });

    return apiSuccess({
      beforeAfterCase,
    });
  }
);

/*
 * DELETE /api/admin/before-after?id=CASE_ID
 */
export const DELETE = withApiHandler(
  async (req: Request) => {
    await requireAdminSession();

    const url = new URL(req.url);

    const caseId =
      url.searchParams.get("id")?.trim();

    if (!caseId) {
      throw new ApiError(
        "Before and after case ID is required.",
        400,
        "BEFORE_AFTER_CASE_ID_REQUIRED"
      );
    }

    const existingCase =
      await prisma.beforeAfterCase.findUnique({
        where: {
          id: caseId,
        },

        select: {
          id: true,
          beforeImage: true,
          afterImage: true,
        },
      });

    if (!existingCase) {
      throw new ApiError(
        "Before and after case not found.",
        404,
        "BEFORE_AFTER_CASE_NOT_FOUND"
      );
    }

    await prisma.beforeAfterCase.delete({
      where: {
        id: existingCase.id,
      },
    });

    const privateBucketName =
      process.env.GCS_PRIVATE_BUCKET_NAME;

    if (privateBucketName) {
      const bucket = storage.bucket(
        privateBucketName
      );

      const objectPaths = [
        existingCase.beforeImage,
        existingCase.afterImage,
      ].filter(
        (
          objectPath: string | null
        ): objectPath is string => {
          return (
            typeof objectPath === "string" &&
            objectPath.length > 0
          );
        }
      );

      const deleteResults =
        await Promise.allSettled(
          objectPaths.map(
            (objectPath: string) => {
              return bucket
                .file(objectPath)
                .delete({
                  ignoreNotFound: true,
                });
            }
          )
        );

      for (const result of deleteResults) {
        if (result.status === "rejected") {
          console.error(
            "Could not delete private gallery object:",
            result.reason
          );
        }
      }
    }

    return apiSuccess({
      deletedCaseId: existingCase.id,
    });
  }
);

/*
 * PATCH
 */
export const PATCH = withApiHandler(
  async (req: Request) => {
    await requireAdminSession();

    const body: unknown = await req.json();

    if (!isRecord(body)) {
      throw new ApiError(
        "Invalid request body.",
        400,
        "INVALID_REQUEST_BODY"
      );
    }

    if (
      typeof body.id !== "string" ||
      !body.id.trim()
    ) {
      throw new ApiError(
        "Before and after case ID is required.",
        400,
        "BEFORE_AFTER_CASE_ID_REQUIRED"
      );
    }

    if (typeof body.isPublic !== "boolean") {
      throw new ApiError(
        "isPublic must be a boolean.",
        400,
        "INVALID_PUBLIC_STATUS"
      );
    }

    const caseId = body.id.trim();

    const existingCase =
      await prisma.beforeAfterCase.findUnique({
        where: {
          id: caseId,
        },

        select: {
          id: true,
        },
      });

    if (!existingCase) {
      throw new ApiError(
        "Before and after case not found.",
        404,
        "BEFORE_AFTER_CASE_NOT_FOUND"
      );
    }

    const beforeAfterCase =
      await prisma.beforeAfterCase.update({
        where: {
          id: caseId,
        },

        data: {
          isPublic: body.isPublic,
        },

        select: {
          id: true,
          doctorId: true,
          patientId: true,
          procedure: true,
          notes: true,
          title: true,
          isPublic: true,
          beforeImage: true,
          afterImage: true,
          createdAt: true,
          updatedAt: true,
        },
      });

    return apiSuccess({
      beforeAfterCase,
    });
  }
);