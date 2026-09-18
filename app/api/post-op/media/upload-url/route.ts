import { headers } from "next/headers";

import { storage } from "@/lib/google/gcs";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/database/prisma";

import {
  ApiError,
  apiSuccess,
} from "@/lib/api/error-handler";

import {
  withApiHandler,
} from "@/lib/api/with-api-handler";

import {
  createPostOpObjectPath,
  getPostOpMediaLimit,
  isPostOpImageType,
  isPostOpVideoType,
  type PostOpMediaPurpose,
} from "@/lib/post-op/media";

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

      const body =
        await req.json();

      const contentType =
        typeof body.contentType ===
        "string"
          ? body.contentType
          : "";

      const sizeBytes =
        body.sizeBytes;

      const purpose =
        body.purpose as PostOpMediaPurpose;

      const templateId =
        typeof body.templateId ===
        "string"
          ? body.templateId
          : null;

      const caseId =
        typeof body.caseId ===
        "string"
          ? body.caseId
          : null;

      /* ═══════════════════════════════════
         MIME TYPE
      ═══════════════════════════════════ */

      if (
        !isPostOpImageType(
          contentType,
        ) &&
        !isPostOpVideoType(
          contentType,
        )
      ) {
        throw new ApiError(
          "Unsupported PostOp media type",
          400,
          "INVALID_MEDIA_TYPE",
        );
      }

      /* ═══════════════════════════════════
         FILE SIZE
      ═══════════════════════════════════ */

      if (
        !Number.isInteger(
          sizeBytes,
        ) ||
        sizeBytes <= 0
      ) {
        throw new ApiError(
          "Invalid file size",
          400,
          "INVALID_FILE_SIZE",
        );
      }

      const maxBytes =
        getPostOpMediaLimit(
          contentType,
        );

      if (!maxBytes) {
        throw new ApiError(
          "Unsupported media type",
          400,
          "INVALID_MEDIA_TYPE",
        );
      }

      if (sizeBytes > maxBytes) {
        throw new ApiError(
          isPostOpImageType(
            contentType,
          )
            ? "Images must be 10 MB or smaller"
            : "Videos must be 250 MB or smaller",
          413,
          "FILE_TOO_LARGE",
        );
      }

      const isAdmin =
        session.user.role ===
        "ADMIN";

      let folder: string;
      let access:
        | "public"
        | "private";

      /* ═══════════════════════════════════
         TEMPLATE MEDIA
      ═══════════════════════════════════ */

      if (purpose === "TEMPLATE") {
        if (!templateId) {
          throw new ApiError(
            "templateId is required",
            400,
            "TEMPLATE_ID_REQUIRED",
          );
        }

        const template =
          await prisma.postOpTemplate.findUnique(
            {
              where: {
                id: templateId,
              },

              select: {
                id: true,
                scope: true,

                doctorProfileId:
                  true,

                doctorProfile: {
                  select: {
                    userId: true,
                  },
                },
              },
            },
          );

        if (!template) {
          throw new ApiError(
            "PostOp template not found",
            404,
            "TEMPLATE_NOT_FOUND",
          );
        }

        /*
         * Platform defaults:
         * ADMIN only.
         */
        if (
          template.scope ===
          "DEFAULT"
        ) {
          if (!isAdmin) {
            throw new ApiError(
              "Forbidden",
              403,
              "FORBIDDEN",
            );
          }

          folder =
            `post-op/templates/default/${template.id}`;
        } else {
          /*
           * Doctor templates:
           * owning doctor OR admin.
           */
          const ownsTemplate =
            template.doctorProfile
              ?.userId ===
            session.user.id;

          if (
            !isAdmin &&
            !ownsTemplate
          ) {
            throw new ApiError(
              "Forbidden",
              403,
              "FORBIDDEN",
            );
          }

          folder =
            `post-op/templates/doctors/${
              template.doctorProfileId
            }/${template.id}`;
        }

        /*
         * Instructional media contains no
         * patient information.
         *
         * Public delivery avoids generating
         * signed read URLs repeatedly.
         */
        access = "public";
      }

      /* ═══════════════════════════════════
         DOCTOR CASE MEDIA
      ═══════════════════════════════════ */

      else if (purpose === "CASE") {
        if (!caseId) {
          throw new ApiError(
            "caseId is required",
            400,
            "CASE_ID_REQUIRED",
          );
        }

        const postOpCase =
          await prisma.postOpCase.findUnique(
            {
              where: {
                id: caseId,
              },

              select: {
                id: true,

                doctorProfile: {
                  select: {
                    id: true,
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

        const ownsCase =
          postOpCase.doctorProfile
            .userId ===
          session.user.id;

        if (
          !isAdmin &&
          !ownsCase
        ) {
          throw new ApiError(
            "Forbidden",
            403,
            "FORBIDDEN",
          );
        }

        folder =
          `post-op/cases/${caseId}/doctor-media`;

        access = "private";
      }

      /* ═══════════════════════════════════
         PATIENT RECOVERY MEDIA
      ═══════════════════════════════════ */

      else if (
        purpose ===
        "PATIENT_MEDIA"
      ) {
        if (!caseId) {
          throw new ApiError(
            "caseId is required",
            400,
            "CASE_ID_REQUIRED",
          );
        }

        const postOpCase =
          await prisma.postOpCase.findUnique(
            {
              where: {
                id: caseId,
              },

              select: {
                id: true,

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

        const isPatient =
          postOpCase.patientUserId ===
          session.user.id;

        const isDoctor =
          postOpCase.doctorProfile
            .userId ===
          session.user.id;

        if (
          !isAdmin &&
          !isPatient &&
          !isDoctor
        ) {
          throw new ApiError(
            "Forbidden",
            403,
            "FORBIDDEN",
          );
        }

        folder =
          `post-op/cases/${caseId}/patient-media/${session.user.id}`;

        /*
         * Patient recovery images/videos
         * must NEVER be public.
         */
        access = "private";
      } else {
        throw new ApiError(
          "Invalid PostOp media purpose",
          400,
          "INVALID_MEDIA_PURPOSE",
        );
      }

      /* ═══════════════════════════════════
         BUCKET
      ═══════════════════════════════════ */

      const bucketName =
        access === "public"
          ? process.env
              .GCS_PUBLIC_BUCKET_NAME
          : process.env
              .GCS_PRIVATE_BUCKET_NAME;

      if (!bucketName) {
        throw new ApiError(
          "Google Storage bucket is not configured",
          500,
          "GCS_BUCKET_MISSING",
        );
      }

      const objectPath =
        createPostOpObjectPath({
          folder,
          contentType,
        });

      const file =
        storage
          .bucket(bucketName)
          .file(objectPath);

      /*
       * Signed POST policy rather than signed
       * PUT so Google Storage itself enforces
       * the maximum upload size.
       */
      const [policy] =
        await file.generateSignedPostPolicyV4(
          {
            expires:
              Date.now() +
              5 * 60 * 1000,

            fields: {
              "Content-Type":
                contentType,
            },

            conditions: [
              [
                "eq",
                "$Content-Type",
                contentType,
              ],

              [
                "content-length-range",
                1,
                maxBytes,
              ],
            ],
          },
        );

      const publicUrl =
        access === "public"
          ? `https://storage.googleapis.com/${bucketName}/${objectPath}`
          : null;

      return apiSuccess({
        uploadUrl:
          policy.url,

        uploadFields:
          policy.fields,

        objectPath,

        publicUrl,

        access,

        maxBytes,
      });
    },
  );