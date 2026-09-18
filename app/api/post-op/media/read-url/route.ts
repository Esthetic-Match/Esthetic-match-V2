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

export const POST =
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
        caseId,
        objectPath,
      } = await req.json();

      if (
        typeof caseId !== "string" ||
        typeof objectPath !==
          "string"
      ) {
        throw new ApiError(
          "Invalid request",
          400,
          "INVALID_REQUEST",
        );
      }

      /*
       * Prevent someone from requesting some
       * unrelated private GCS object.
       */
      const expectedPrefix =
        process.env.DEVELOPMENT ===
        "true"
          ? `DEV/post-op/cases/${caseId}/`
          : `post-op/cases/${caseId}/`;

      if (
        !objectPath.startsWith(
          expectedPrefix,
        )
      ) {
        throw new ApiError(
          "Forbidden object path",
          403,
          "FORBIDDEN_OBJECT_PATH",
        );
      }

      const postOpCase =
        await prisma.postOpCase.findUnique(
          {
            where: {
              id: caseId,
            },

            select: {
              patientUserId:
                true,

              doctorProfile: {
                select: {
                  userId: true,
                },
              },
            },
          },
        );

      if (!postOpCase) {
        throw new ApiError(
          "PostOp case not found",
          404,
          "CASE_NOT_FOUND",
        );
      }

      const authorized =
        session.user.role ===
          "ADMIN" ||
        postOpCase.patientUserId ===
          session.user.id ||
        postOpCase.doctorProfile
          .userId ===
          session.user.id;

      if (!authorized) {
        throw new ApiError(
          "Forbidden",
          403,
          "FORBIDDEN",
        );
      }

      const bucketName =
        process.env
          .GCS_PRIVATE_BUCKET_NAME;

      if (!bucketName) {
        throw new ApiError(
          "Private storage bucket is missing",
          500,
          "PRIVATE_BUCKET_MISSING",
        );
      }

      const [url] =
        await storage
          .bucket(bucketName)
          .file(objectPath)
          .getSignedUrl({
            version: "v4",
            action: "read",

            expires:
              Date.now() +
              10 * 60 * 1000,
          });

      return apiSuccess({
        url,
      });
    },
  );