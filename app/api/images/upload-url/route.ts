import { NextResponse } from "next/server";
import { bucket } from "@/lib/gcs";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { randomUUID } from "crypto";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { contentType, type } = await req.json();

  if (!ALLOWED_TYPES.includes(contentType)) {
    return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
  }

  const ext = contentType.split("/")[1];

  const folder =
    type === "profile"
      ? `profile-pictures/${session.user.id}`
      : `medical-images/${session.user.id}`;

  const objectPath = `${folder}/${randomUUID()}.${ext}`;

  const [uploadUrl] = await bucket.file(objectPath).getSignedUrl({
    version: "v4",
    action: "write",
    expires: Date.now() + 5 * 60 * 1000,
    contentType,
  });

  return NextResponse.json({ uploadUrl, objectPath });
}