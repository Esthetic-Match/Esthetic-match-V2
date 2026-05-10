import { NextRequest, NextResponse } from "next/server";
import { Storage } from "@google-cloud/storage";
import { prisma } from "@/lib/prisma";

const storage = new Storage();
const bucketName = process.env.GCS_PRIVATE_BUCKET_NAME;

async function getSignedImageUrl(objectPath: string) {
  if (!bucketName) {
    throw new Error("Missing GCS_PRIVATE_BUCKET_NAME");
  }

  const [url] = await storage
    .bucket(bucketName)
    .file(objectPath)
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
        beforeImage: {
          not: null,
        },
        afterImage: {
          not: null,
        },
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
      { error: "Failed to fetch gallery" },
      { status: 500 }
    );
  }
}