import { NextRequest } from "next/server";
import { Storage } from "@google-cloud/storage";
import { prisma } from "@/lib/database/prisma";
import { ApiError, apiSuccess } from "@/lib/api/error-handler";
import { withApiHandler } from "@/lib/api/with-api-handler";

function getStorage() {
  const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

  if (!credentialsJson) {
    return new Storage();
  }

  return new Storage({
    credentials: JSON.parse(credentialsJson),
  });
}

const storage = getStorage();

function getBucketName() {
  const bucketName = process.env.GCS_PRIVATE_BUCKET_NAME;

  if (!bucketName) {
    throw new ApiError(
      "Missing GCS_PRIVATE_BUCKET_NAME",
      500,
      "GCS_PRIVATE_BUCKET_NAME_MISSING"
    );
  }

  return bucketName;
}

function cleanObjectPath(path: string) {
  const bucketName = getBucketName();

  return path
    .replace(`gs://${bucketName}/`, "")
    .replace(`${bucketName}/`, "")
    .replace(/^\/+/, "");
}

async function getSignedImageUrl(objectPath: string) {
  const bucketName = getBucketName();
  const cleanedPath = cleanObjectPath(objectPath);

  const [url] = await storage
    .bucket(bucketName)
    .file(cleanedPath)
    .getSignedUrl({
      version: "v4",
      action: "read",
      expires: Date.now() + 1000 * 60 * 10,
    });

  return url;
}

export const GET = withApiHandler<unknown, NextRequest>(async (req) => {
  const doctorId = req.nextUrl.searchParams.get("doctorId");

  if (!doctorId) {
    throw new ApiError("Missing doctorId", 400, "DOCTOR_ID_REQUIRED");
  }

  const cases = await prisma.beforeAfterCase.findMany({
    where: {
      doctorId,
      beforeImage: { not: null },
      afterImage: { not: null },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const gallery = await Promise.all(
    cases.map(async (item) => ({
      beforeImageUrl: await getSignedImageUrl(item.beforeImage!),
      afterImageUrl: await getSignedImageUrl(item.afterImage!),
      isPublic: item.isPublic,
    }))
  );

  return apiSuccess(gallery);
});