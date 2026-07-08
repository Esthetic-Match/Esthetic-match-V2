import { storage } from "@/lib/google/gcs";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import {
  ApiError,
  apiSuccess,
} from "@/lib/api/error-handler";
import { withApiHandler } from "@/lib/api/with-api-handler";

function normalizeObjectPath(
  objectPath: string
): string {
  const cleanedPath = objectPath.replace(
    /^\/+/,
    ""
  );

  if (cleanedPath.startsWith("DEV/")) {
    return cleanedPath.slice(4);
  }

  return cleanedPath;
}

function getDoctorProfileOwnerId(
  objectPath: string
): string | null {
  const normalizedPath =
    normalizeObjectPath(objectPath);

  const pathParts =
    normalizedPath.split("/");

  if (pathParts[0] !== "doctor-profile") {
    return null;
  }

  return pathParts[1] ?? null;
}

export const POST = withApiHandler(
  async (req: Request) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      throw new ApiError(
        "Unauthorized",
        401,
        "UNAUTHORIZED"
      );
    }

    const body: unknown = await req.json();

    if (
      typeof body !== "object" ||
      body === null ||
      !("objectPath" in body)
    ) {
      throw new ApiError(
        "Missing objectPath",
        400,
        "OBJECT_PATH_REQUIRED"
      );
    }

    const objectPathValue = (
      body as Record<string, unknown>
    ).objectPath;

    if (
      typeof objectPathValue !== "string" ||
      !objectPathValue.trim()
    ) {
      throw new ApiError(
        "Missing objectPath",
        400,
        "OBJECT_PATH_REQUIRED"
      );
    }

    const objectPath =
      objectPathValue.trim();

    const isAdmin =
      session.user.role === "ADMIN";

    const doctorProfileOwnerId =
      getDoctorProfileOwnerId(objectPath);

    if (
      doctorProfileOwnerId &&
      !isAdmin &&
      doctorProfileOwnerId !==
        session.user.id
    ) {
      throw new ApiError(
        "Forbidden",
        403,
        "FORBIDDEN"
      );
    }

    const privateBucketName =
      process.env.GCS_PRIVATE_BUCKET_NAME;

    if (!privateBucketName) {
      throw new ApiError(
        "Missing GCS_PRIVATE_BUCKET_NAME",
        500,
        "GCS_PRIVATE_BUCKET_NAME_MISSING"
      );
    }

    const bucket = storage.bucket(
      privateBucketName
    );

    const [signedUrl] = await bucket
      .file(objectPath)
      .getSignedUrl({
        version: "v4",
        action: "read",
        expires:
          Date.now() + 15 * 60 * 1000,
      });

    return apiSuccess({
      signedUrl,
    });
  }
);