import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/database/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

const SOCIAL_MEDIA_PLATFORMS = [
  "INSTAGRAM",
  "FACEBOOK",
  "TIKTOK",
  "YOUTUBE",
  "LINKEDIN",
  "X",
  "SNAPCHAT",
  "WEBSITE",
  "OTHER",
] as const;

type SocialMediaPlatform = (typeof SOCIAL_MEDIA_PLATFORMS)[number];

type RouteContext = {
  params: Promise<{
    doctorId: string;
  }>;
};

type SocialMediaBody = {
  id?: unknown;
  platform?: unknown;
  url?: unknown;
  username?: unknown;
  label?: unknown;
  isVisible?: unknown;
  sortOrder?: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isPlatform(value: unknown): value is SocialMediaPlatform {
  return (
    typeof value === "string" &&
    SOCIAL_MEDIA_PLATFORMS.includes(value as SocialMediaPlatform)
  );
}

function normalizeOptionalText(value: unknown, fieldName: string) {
  if (value == null || value === "") return null;

  if (typeof value !== "string") {
    throw new RouteError(`${fieldName} must be a string.`, 400);
  }

  const normalized = value.trim();

  if (normalized.length > 100) {
    throw new RouteError(`${fieldName} must be 100 characters or fewer.`, 400);
  }

  return normalized || null;
}

function normalizeUrl(value: unknown) {
  if (typeof value !== "string" || !value.trim()) {
    throw new RouteError("A social media URL is required.", 400);
  }

  const normalized = value.trim();

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(normalized);
  } catch {
    throw new RouteError("Enter a valid social media URL.", 400);
  }

  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    throw new RouteError("The URL must use http or https.", 400);
  }

  return normalized;
}

function normalizeSortOrder(value: unknown, fallback = 0) {
  if (value == null) return fallback;

  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    throw new RouteError("sortOrder must be a non-negative integer.", 400);
  }

  return value;
}

class RouteError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function requireAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new RouteError("Unauthorized", 401);
  }

  if (session.user.role !== "ADMIN") {
    throw new RouteError("Forbidden", 403);
  }

  return session.user;
}

async function getDoctorProfile(doctorId: string) {
  const normalizedDoctorId = doctorId.trim();

  if (!normalizedDoctorId) {
    throw new RouteError("A doctor user ID is required.", 400);
  }

  const doctorProfile = await prisma.doctorProfile.findUnique({
    where: {
      userId: normalizedDoctorId,
    },
    select: {
      id: true,
      userId: true,
      user: {
        select: {
          role: true,
        },
      },
    },
  });

  if (!doctorProfile || doctorProfile.user.role !== "DOCTOR") {
    throw new RouteError("Doctor profile not found.", 404);
  }

  return doctorProfile;
}

function errorResponse(error: unknown) {
  if (error instanceof RouteError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  if (isRecord(error) && error.code === "P2002") {
    return NextResponse.json(
      { error: "This social media link already exists for this doctor." },
      { status: 409 },
    );
  }

  console.error("Admin doctor social media route failed:", error);

  return NextResponse.json(
    { error: "An unexpected error occurred." },
    { status: 500 },
  );
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    await requireAdmin();

    const { doctorId } = await context.params;
    const doctorProfile = await getDoctorProfile(doctorId);

    const links = await prisma.doctorSocialMedia.findMany({
      where: {
        doctorProfileId: doctorProfile.id,
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });

    return NextResponse.json({ links });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    await requireAdmin();

    const { doctorId } = await context.params;
    const doctorProfile = await getDoctorProfile(doctorId);
    const body = (await request.json()) as SocialMediaBody;

    if (!isPlatform(body.platform)) {
      throw new RouteError("Select a valid social media platform.", 400);
    }

    const link = await prisma.doctorSocialMedia.create({
      data: {
        doctorProfileId: doctorProfile.id,
        platform: body.platform,
        url: normalizeUrl(body.url),
        username: normalizeOptionalText(body.username, "Username"),
        label: normalizeOptionalText(body.label, "Display label"),
        isVisible:
          typeof body.isVisible === "boolean" ? body.isVisible : true,
        sortOrder: normalizeSortOrder(body.sortOrder),
      },
    });

    return NextResponse.json({ link }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await requireAdmin();

    const { doctorId } = await context.params;
    const doctorProfile = await getDoctorProfile(doctorId);
    const body = (await request.json()) as SocialMediaBody;

    if (typeof body.id !== "string" || !body.id.trim()) {
      throw new RouteError("A social media link ID is required.", 400);
    }

    if (!isPlatform(body.platform)) {
      throw new RouteError("Select a valid social media platform.", 400);
    }

    const existingLink = await prisma.doctorSocialMedia.findFirst({
      where: {
        id: body.id.trim(),
        doctorProfileId: doctorProfile.id,
      },
      select: {
        id: true,
        sortOrder: true,
      },
    });

    if (!existingLink) {
      throw new RouteError("Social media link not found.", 404);
    }

    const link = await prisma.doctorSocialMedia.update({
      where: {
        id: existingLink.id,
      },
      data: {
        platform: body.platform,
        url: normalizeUrl(body.url),
        username: normalizeOptionalText(body.username, "Username"),
        label: normalizeOptionalText(body.label, "Display label"),
        isVisible:
          typeof body.isVisible === "boolean" ? body.isVisible : true,
        sortOrder: normalizeSortOrder(body.sortOrder, existingLink.sortOrder),
      },
    });

    return NextResponse.json({ link });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    await requireAdmin();

    const { doctorId } = await context.params;
    const doctorProfile = await getDoctorProfile(doctorId);
    const linkId = new URL(request.url).searchParams.get("id")?.trim();

    if (!linkId) {
      throw new RouteError("A social media link ID is required.", 400);
    }

    const result = await prisma.doctorSocialMedia.deleteMany({
      where: {
        id: linkId,
        doctorProfileId: doctorProfile.id,
      },
    });

    if (result.count === 0) {
      throw new RouteError("Social media link not found.", 404);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}