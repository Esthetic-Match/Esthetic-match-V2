// app/api/images/read-url/route.ts

import { NextResponse } from "next/server";
import { storage } from "@/lib/gcs";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { objectPath } = await req.json();

  if (!objectPath) {
    return NextResponse.json({ error: "Missing objectPath" }, { status: 400 });
  }

  if (
    objectPath.startsWith("doctor-profile") &&
    !objectPath.includes(session.user.id)
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const bucket = storage.bucket(process.env.GCS_PRIVATE_BUCKET_NAME!);

  const [signedUrl] = await bucket.file(objectPath).getSignedUrl({
    version: "v4",
    action: "read",
    expires: Date.now() + 15 * 60 * 1000,
  });

  return NextResponse.json({ signedUrl });
}