// app/api/images/read-url/route.ts

import { storage } from "@/lib/google/gcs";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { ApiError, apiSuccess } from "@/lib/api/error-handler";
import { withApiHandler } from "@/lib/api/with-api-handler";

export const POST = withApiHandler(async (req: Request) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new ApiError("Unauthorized", 401, "UNAUTHORIZED");
  }

  const { objectPath } = await req.json();

  if (!objectPath) {
    throw new ApiError("Missing objectPath", 400, "OBJECT_PATH_REQUIRED");
  }

  if (
    objectPath.startsWith("doctor-profile") &&
    !objectPath.includes(session.user.id)
  ) {
    throw new ApiError("Forbidden", 403, "FORBIDDEN");
  }

  const privateBucketName = process.env.GCS_PRIVATE_BUCKET_NAME;

  if (!privateBucketName) {
    throw new ApiError(
      "Missing GCS_PRIVATE_BUCKET_NAME",
      500,
      "GCS_PRIVATE_BUCKET_NAME_MISSING"
    );
  }

  const bucket = storage.bucket(privateBucketName);

  const [signedUrl] = await bucket.file(objectPath).getSignedUrl({
    version: "v4",
    action: "read",
    expires: Date.now() + 15 * 60 * 1000,
  });

  return apiSuccess({
    signedUrl,
  });
});