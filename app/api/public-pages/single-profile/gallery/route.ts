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

type BeforeAfterGalleryCaseRow = {
  beforeImage: string | null;
  afterImage: string | null;
  isPublic: boolean;
};

type CompleteBeforeAfterGalleryCaseRow = {
  beforeImage: string;
  afterImage: string;
  isPublic: boolean;
};

function hasCompleteImages(
  item: BeforeAfterGalleryCaseRow
): item is CompleteBeforeAfterGalleryCaseRow {
  return item.beforeImage !== null && item.afterImage !== null;
}

const cases: BeforeAfterGalleryCaseRow[] =
  await prisma.beforeAfterCase.findMany({
    where: {
      doctorId,
      beforeImage: {
        not: null,
      },
      afterImage: {
        not: null,
      },
    },
    select: {
      beforeImage: true,
      afterImage: true,
      isPublic: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

const completeCases = cases.filter(hasCompleteImages);

const gallery = await Promise.all(
  completeCases.map(async (item: CompleteBeforeAfterGalleryCaseRow) => ({
    beforeImageUrl: await getSignedImageUrl(item.beforeImage),
    afterImageUrl: await getSignedImageUrl(item.afterImage),
    isPublic: item.isPublic,
  }))
);

  return apiSuccess(gallery);
});