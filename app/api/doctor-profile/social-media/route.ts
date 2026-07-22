import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/database/prisma";

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

type SocialMediaPlatformValue = (typeof SOCIAL_MEDIA_PLATFORMS)[number];

type SocialMediaInput = {
  id?: unknown;
  platform?: unknown;
  url?: unknown;
  username?: unknown;
  label?: unknown;
  isVisible?: unknown;
  sortOrder?: unknown;
};

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function normalizeOptionalText(value: unknown, maxLength: number) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value !== "string") {
    throw new Error("INVALID_TEXT");
  }

  const normalized = value.trim();

  if (!normalized) {
    return null;
  }

  if (normalized.length > maxLength) {
    throw new Error("TEXT_TOO_LONG");
  }

  return normalized;
}

function normalizeUrl(value: unknown) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error("URL_REQUIRED");
  }

  const normalized = value.trim();

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(normalized);
  } catch {
    throw new Error("INVALID_URL");
  }

  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    throw new Error("INVALID_URL_PROTOCOL");
  }

  if (normalized.length > 2048) {
    throw new Error("URL_TOO_LONG");
  }

  return normalized;
}

function normalizePlatform(value: unknown): SocialMediaPlatformValue {
  if (
    typeof value !== "string" ||
    !SOCIAL_MEDIA_PLATFORMS.includes(value as SocialMediaPlatformValue)
  ) {
    throw new Error("INVALID_PLATFORM");
  }

  return value as SocialMediaPlatformValue;
}

function normalizeVisibility(value: unknown, fallback: boolean) {
  if (value === undefined) {
    return fallback;
  }

  if (typeof value !== "boolean") {
    throw new Error("INVALID_VISIBILITY");
  }

  return value;
}

function normalizeSortOrder(value: unknown, fallback: number) {
  if (value === undefined) {
    return fallback;
  }

  if (
    typeof value !== "number" ||
    !Number.isInteger(value) ||
    value < 0 ||
    value > 1000
  ) {
    throw new Error("INVALID_SORT_ORDER");
  }

  return value;
}

function validationError(error: unknown) {
  if (!(error instanceof Error)) {
    return null;
  }

  switch (error.message) {
    case "URL_REQUIRED":
      return errorResponse("A social media URL is required.", 400);
    case "INVALID_URL":
      return errorResponse("Enter a valid social media URL.", 400);
    case "INVALID_URL_PROTOCOL":
      return errorResponse("The URL must begin with http:// or https://.", 400);
    case "URL_TOO_LONG":
      return errorResponse("The social media URL is too long.", 400);
    case "INVALID_PLATFORM":
      return errorResponse("Select a valid social media platform.", 400);
    case "INVALID_TEXT":
      return errorResponse("The username and label must be text.", 400);
    case "TEXT_TOO_LONG":
      return errorResponse("The username or label is too long.", 400);
    case "INVALID_VISIBILITY":
      return errorResponse("Visibility must be true or false.", 400);
    case "INVALID_SORT_ORDER":
      return errorResponse("Sort order must be a non-negative whole number.", 400);
    default:
      return null;
  }
}

type AuthenticatedDoctorProfileResult =
  | {
      error: null;
      profile: { id: string };
    }
  | {
      error: NextResponse;
      profile: null;
    };

async function getAuthenticatedDoctorProfile(): Promise<AuthenticatedDoctorProfileResult> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return {
      error: errorResponse("Unauthorized", 401),
      profile: null,
    };
  }

  if (session.user.role !== "DOCTOR") {
    return {
      error: errorResponse("Forbidden", 403),
      profile: null,
    };
  }

  const profile = await prisma.doctorProfile.findUnique({
    where: {
      userId: session.user.id,
    },
    select: {
      id: true,
    },
  });

  if (!profile) {
    return {
      error: errorResponse("Doctor profile not found.", 404),
      profile: null,
    };
  }

  return {
    error: null,
    profile,
  };
}

export async function GET() {
  const authentication = await getAuthenticatedDoctorProfile();

  if (authentication.error) {
    return authentication.error;
  }

  const links = await prisma.doctorSocialMedia.findMany({
    where: {
      doctorProfileId: authentication.profile.id,
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return NextResponse.json({ links });
}

export async function POST(request: Request) {
  const authentication = await getAuthenticatedDoctorProfile();

  if (authentication.error) {
    return authentication.error;
  }

  let body: SocialMediaInput;

  try {
    body = (await request.json()) as SocialMediaInput;
  } catch {
    return errorResponse("Invalid JSON body.", 400);
  }

  try {
    const platform = normalizePlatform(body.platform);
    const url = normalizeUrl(body.url);
    const username = normalizeOptionalText(body.username, 100);
    const label = normalizeOptionalText(body.label, 100);
    const isVisible = normalizeVisibility(body.isVisible, true);

    const existingCount = await prisma.doctorSocialMedia.count({
      where: {
        doctorProfileId: authentication.profile.id,
      },
    });

    const sortOrder = normalizeSortOrder(body.sortOrder, existingCount);

    const link = await prisma.doctorSocialMedia.create({
      data: {
        doctorProfileId: authentication.profile.id,
        platform,
        url,
        username,
        label,
        isVisible,
        sortOrder,
      },
    });

    return NextResponse.json({ link }, { status: 201 });
  } catch (error) {
    const validationResponse = validationError(error);

    if (validationResponse) {
      return validationResponse;
    }

    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return errorResponse("This social media link already exists.", 409);
    }

    console.error("Could not create doctor social media link:", error);
    return errorResponse("Could not create the social media link.", 500);
  }
}

export async function PATCH(request: Request) {
  const authentication = await getAuthenticatedDoctorProfile();

  if (authentication.error) {
    return authentication.error;
  }

  let body: SocialMediaInput;

  try {
    body = (await request.json()) as SocialMediaInput;
  } catch {
    return errorResponse("Invalid JSON body.", 400);
  }

  if (typeof body.id !== "string" || !body.id.trim()) {
    return errorResponse("A social media link ID is required.", 400);
  }

  const existingLink = await prisma.doctorSocialMedia.findFirst({
    where: {
      id: body.id.trim(),
      doctorProfileId: authentication.profile.id,
    },
  });

  if (!existingLink) {
    return errorResponse("Social media link not found.", 404);
  }

  try {
    const platform =
      body.platform === undefined
        ? existingLink.platform
        : normalizePlatform(body.platform);
    const url =
      body.url === undefined ? existingLink.url : normalizeUrl(body.url);
    const username =
      body.username === undefined
        ? existingLink.username
        : normalizeOptionalText(body.username, 100);
    const label =
      body.label === undefined
        ? existingLink.label
        : normalizeOptionalText(body.label, 100);
    const isVisible = normalizeVisibility(
      body.isVisible,
      existingLink.isVisible,
    );
    const sortOrder = normalizeSortOrder(body.sortOrder, existingLink.sortOrder);

    const link = await prisma.doctorSocialMedia.update({
      where: {
        id: existingLink.id,
      },
      data: {
        platform,
        url,
        username,
        label,
        isVisible,
        sortOrder,
      },
    });

    return NextResponse.json({ link });
  } catch (error) {
    const validationResponse = validationError(error);

    if (validationResponse) {
      return validationResponse;
    }

    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return errorResponse("This social media link already exists.", 409);
    }

    console.error("Could not update doctor social media link:", error);
    return errorResponse("Could not update the social media link.", 500);
  }
}

export async function DELETE(request: Request) {
  const authentication = await getAuthenticatedDoctorProfile();

  if (authentication.error) {
    return authentication.error;
  }

  const id = new URL(request.url).searchParams.get("id")?.trim();

  if (!id) {
    return errorResponse("A social media link ID is required.", 400);
  }

  const result = await prisma.doctorSocialMedia.deleteMany({
    where: {
      id,
      doctorProfileId: authentication.profile.id,
    },
  });

  if (result.count === 0) {
    return errorResponse("Social media link not found.", 404);
  }

  return NextResponse.json({ success: true });
}