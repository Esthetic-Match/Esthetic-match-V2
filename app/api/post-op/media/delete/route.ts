import { headers } from "next/headers";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/database/prisma";
import { storage } from "@/lib/google/gcs";

import {
  ApiError,
  apiSuccess,
} from "@/lib/api/error-handler";

import {
  withApiHandler,
} from "@/lib/api/with-api-handler";

export const DELETE =
  withApiHandler(
    async (req: Request) => {
      const session =
        await auth.api.getSession({
          headers: await headers(),
        });

      if (!session?.user?.id) {
        throw new ApiError(
          "Unauthorized",
          401,
          "UNAUTHORIZED",
        );
      }

      const {
        objectPath,
      } = await req.json();

      if (
        typeof objectPath !==
          "string"
      ) {
        throw new ApiError(
          "objectPath is required",
          400,
          "OBJECT_PATH_REQUIRED",
        );
      }

      /*
       * Only PostOp objects can ever
       * be deleted through this route.
       */
      const validPrefix =
        process.env.DEVELOPMENT ===
        "true"
          ? "DEV/post-op/"
          : "post-op/";

      if (
        !objectPath.startsWith(
          validPrefix,
        )
      ) {
        throw new ApiError(
          "Forbidden path",
          403,
          "FORBIDDEN_PATH",
        );
      }

      /*
       * Determine whether anything in Prisma
       * still references this object.
       */

      const [
        templateBlock,
        caseBlock,
        noteAttachment,
      ] = await Promise.all([
        prisma.postOpTemplateBlock.findFirst(
          {
            where: {
              objectPath,
            },

            select: {
              id: true,

              step: {
                select: {
                  template: {
                    select: {
                      scope: true,

                      doctorProfile: {
                        select: {
                          userId: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        ),

        prisma.postOpCaseBlock.findFirst(
          {
            where: {
              objectPath,
            },

            select: {
              id: true,

              step: {
                select: {
                  case: {
                    select: {
                      patientUserId:
                        true,

                      doctorProfile: {
                        select: {
                          userId:
                            true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        ),

        prisma.postOpPatientNoteAttachment.findFirst(
          {
            where: {
              objectPath,
            },

            select: {
              id: true,

              note: {
                select: {
                  patientUserId:
                    true,

                  case: {
                    select: {
                      doctorProfile: {
                        select: {
                          userId:
                            true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        ),
      ]);

      const isAdmin =
        session.user.role ===
        "ADMIN";

      let authorized = isAdmin;

      let publicObject = false;

      if (templateBlock) {
        publicObject = true;

        authorized =
          authorized ||
          templateBlock.step
            .template
            .doctorProfile
            ?.userId ===
            session.user.id;
      }

      if (caseBlock) {
        authorized =
          authorized ||
          caseBlock.step.case
            .doctorProfile.userId ===
            session.user.id;
      }

      if (noteAttachment) {
        authorized =
          authorized ||
          noteAttachment.note
            .patientUserId ===
            session.user.id ||
          noteAttachment.note.case
            .doctorProfile
            .userId ===
            session.user.id;
      }

      if (!authorized) {
        throw new ApiError(
          "Forbidden",
          403,
          "FORBIDDEN",
        );
      }

      /*
       * Don't delete an object that is
       * still referenced.
       *
       * Remove/replace the DB reference first,
       * then call this endpoint for cleanup.
       */
      if (
        templateBlock ||
        caseBlock ||
        noteAttachment
      ) {
        throw new ApiError(
          "Media is still in use",
          409,
          "MEDIA_STILL_REFERENCED",
        );
      }

      const bucketName =
        publicObject
          ? process.env
              .GCS_PUBLIC_BUCKET_NAME
          : process.env
              .GCS_PRIVATE_BUCKET_NAME;

      if (!bucketName) {
        throw new ApiError(
          "Storage bucket missing",
          500,
          "BUCKET_MISSING",
        );
      }

      await storage
        .bucket(bucketName)
        .file(objectPath)
        .delete({
          ignoreNotFound: true,
        });

      return apiSuccess({
        deleted: true,
      });
    },
  );