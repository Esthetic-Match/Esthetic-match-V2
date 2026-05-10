import { NextRequest, NextResponse } from "next/server";
import { Storage } from "@google-cloud/storage";
import { prisma } from "@/lib/prisma";

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
    throw new Error("Missing GCS_PRIVATE_BUCKET_NAME");
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

export async function GET(req: NextRequest) {
  try {
    const doctorId = req.nextUrl.searchParams.get("doctorId");

    if (!doctorId) {
      return NextResponse.json(
        { error: "Missing doctorId" },
        { status: 400 }
      );
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
      }))
    );

    return NextResponse.json(gallery);
  } catch (error) {
    console.error("Failed to fetch public gallery:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch gallery",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}