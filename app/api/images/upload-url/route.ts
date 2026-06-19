import { storage } from "@/lib/google/gcs";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { randomUUID } from "crypto";
import { ApiError, apiSuccess } from "@/lib/api/error-handler";
import { withApiHandler } from "@/lib/api/with-api-handler";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

function getExtension(contentType: string) {
  if (contentType === "image/jpeg") return "jpg";
  if (contentType === "image/png") return "png";
  if (contentType === "image/webp") return "webp";
  return "jpg";
}

function cleanPath(path: string) {
  return path.replace(/^\/+|\/+$/g, "");
}

function withEnvironmentPrefix(path: string) {
  const isDevelopment = process.env.DEVELOPMENT === "true";

  if (!isDevelopment) return path;

  return `DEV/${cleanPath(path)}`;
}

export const POST = withApiHandler(async (req: Request) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new ApiError("Unauthorized", 401, "UNAUTHORIZED");
  }

  const {
    contentType,
    type = "medical",
    access = "private",
    folder,
  } = await req.json();

  if (!ALLOWED_TYPES.includes(contentType)) {
    throw new ApiError("Invalid file type", 400, "INVALID_FILE_TYPE");
  }

  const bucketName =
    access === "public"
      ? process.env.GCS_PUBLIC_BUCKET_NAME
      : process.env.GCS_PRIVATE_BUCKET_NAME;

  if (!bucketName) {
    throw new ApiError(
      access === "public"
        ? "Missing GCS_PUBLIC_BUCKET_NAME"
        : "Missing GCS_PRIVATE_BUCKET_NAME",
      500,
      access === "public"
        ? "GCS_PUBLIC_BUCKET_NAME_MISSING"
        : "GCS_PRIVATE_BUCKET_NAME_MISSING"
    );
  }

  const bucket = storage.bucket(bucketName);

  const ext = getExtension(contentType);

  const safeFolder =
    typeof folder === "string" && folder.trim().length > 0
      ? cleanPath(folder)
      : type === "banner"
        ? `doctor-profile/${session.user.id}/banner`
        : type === "profile"
          ? `doctor-profile/${session.user.id}/avatar`
          : `medical-images/${session.user.id}`;

  const isAdmin = session.user.role === "ADMIN";

  if (
    safeFolder.startsWith("doctor-profile") &&
    !isAdmin &&
    !safeFolder.includes(session.user.id)
  ) {
    throw new ApiError("Forbidden path", 403, "FORBIDDEN_PATH");
  }

  if (
    safeFolder.startsWith("conversations") &&
    !isAdmin &&
    !safeFolder.includes(session.user.id)
  ) {
    throw new ApiError("Forbidden path", 403, "FORBIDDEN_PATH");
  }

  const objectPath = withEnvironmentPrefix(
    `${safeFolder}/${randomUUID()}.${ext}`
  );

  const [uploadUrl] = await bucket.file(objectPath).getSignedUrl({
    version: "v4",
    action: "write",
    expires: Date.now() + 5 * 60 * 1000,
    contentType,
  });

  const publicUrl =
    access === "public"
      ? `https://storage.googleapis.com/${bucketName}/${objectPath}`
      : null;

  return apiSuccess({
    uploadUrl,
    objectPath,
    publicUrl,
  });
});