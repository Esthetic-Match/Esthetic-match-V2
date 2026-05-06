import { NextResponse } from "next/server";
import { storage } from "@/lib/gcs";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { randomUUID } from "crypto";

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

export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const {
    contentType,
    type = "medical",
    access = "private", // 🔥 NEW
    folder,
  } = await req.json();

  if (!ALLOWED_TYPES.includes(contentType)) {
    return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
  }

  const bucketName =
    access === "public"
      ? process.env.GCS_PUBLIC_BUCKET_NAME!
      : process.env.GCS_PRIVATE_BUCKET_NAME!;

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

  // 🔐 Security check
  if (
    !safeFolder.includes(session.user.id) &&
    safeFolder.startsWith("doctor-profile")
  ) {
    return NextResponse.json({ error: "Forbidden path" }, { status: 403 });
  }

  const objectPath = `${safeFolder}/${randomUUID()}.${ext}`;

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

  return NextResponse.json({
    uploadUrl,
    objectPath,
    publicUrl,
  });
}