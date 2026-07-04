import { headers } from "next/headers";
import { ApiError, apiSuccess } from "@/lib/api/error-handler";
import { withApiHandler } from "@/lib/api/with-api-handler";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/database/prisma";

export const dynamic = "force-dynamic";

type InstagramReelUpdateData = {
  url?: string;
  sortOrder?: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeInstagramReelUrl(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new ApiError(
      "Instagram Reel URL is required.",
      400,
      "INVALID_INSTAGRAM_REEL_URL"
    );
  }

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(value.trim());
  } catch {
    throw new ApiError(
      "Invalid Instagram Reel URL.",
      400,
      "INVALID_INSTAGRAM_REEL_URL"
    );
  }

  const hostname = parsedUrl.hostname.toLowerCase();

  const isInstagramHostname =
    hostname === "instagram.com" ||
    hostname.endsWith(".instagram.com");

  if (!isInstagramHostname) {
    throw new ApiError(
      "The URL must be an Instagram URL.",
      400,
      "INVALID_INSTAGRAM_HOST"
    );
  }

  const pathParts = parsedUrl.pathname
    .split("/")
    .filter((part: string) => part.length > 0);

  const reelIndex = pathParts.findIndex(
    (part: string) => part === "reel"
  );

  if (reelIndex === -1) {
    throw new ApiError(
      "The URL must be a valid Instagram Reel URL.",
      400,
      "INVALID_INSTAGRAM_REEL_URL"
    );
  }

  const shortcode = pathParts[reelIndex + 1];

  if (!shortcode) {
    throw new ApiError(
      "The URL must contain a valid Instagram Reel shortcode.",
      400,
      "INVALID_INSTAGRAM_REEL_URL"
    );
  }

  return `https://www.instagram.com/reel/${shortcode}/`;
}

function readSortOrder(
  value: unknown,
  fallback: number
): number {
  if (value === undefined) {
    return fallback;
  }

  if (
    typeof value !== "number" ||
    !Number.isInteger(value) ||
    value < 0
  ) {
    throw new ApiError(
      "sortOrder must be a positive integer.",
      400,
      "INVALID_SORT_ORDER"
    );
  }

  return value;
}

async function requireAdmin(): Promise<void> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new ApiError(
      "Administrator access required.",
      403,
      "ADMIN_ACCESS_REQUIRED"
    );
  }
}

/* -------------------------------------------------------------------------- */
/*                                    GET                                     */
/* -------------------------------------------------------------------------- */

export const GET = withApiHandler(async () => {
  const reels = await prisma.instagramReel.findMany({
    orderBy: [
      {
        sortOrder: "asc",
      },
      {
        createdAt: "asc",
      },
    ],
  });

  return apiSuccess({
    reels,
  });
});

/* -------------------------------------------------------------------------- */
/*                                   POST                                     */
/* -------------------------------------------------------------------------- */

export const POST = withApiHandler(async (req: Request) => {
  await requireAdmin();

  const body: unknown = await req.json();

  if (!isRecord(body)) {
    throw new ApiError(
      "Invalid request body.",
      400,
      "INVALID_REQUEST_BODY"
    );
  }

  const url = normalizeInstagramReelUrl(body.url);

  const existingReel = await prisma.instagramReel.findUnique({
    where: {
      url,
    },
    select: {
      id: true,
    },
  });

  if (existingReel) {
    throw new ApiError(
      "This Instagram Reel has already been added.",
      409,
      "INSTAGRAM_REEL_ALREADY_EXISTS"
    );
  }

  const lastReel = await prisma.instagramReel.findFirst({
    orderBy: {
      sortOrder: "desc",
    },
    select: {
      sortOrder: true,
    },
  });

  const defaultSortOrder = (lastReel?.sortOrder ?? -1) + 1;

  const sortOrder = readSortOrder(
    body.sortOrder,
    defaultSortOrder
  );

  const reel = await prisma.instagramReel.create({
    data: {
      url,
      sortOrder,
    },
  });

  return apiSuccess({
    reel,
  });
});

/* -------------------------------------------------------------------------- */
/*                                   PATCH                                    */
/* -------------------------------------------------------------------------- */

export const PATCH = withApiHandler(async (req: Request) => {
  await requireAdmin();

  const body: unknown = await req.json();

  if (!isRecord(body)) {
    throw new ApiError(
      "Invalid request body.",
      400,
      "INVALID_REQUEST_BODY"
    );
  }

  if (typeof body.id !== "string" || !body.id.trim()) {
    throw new ApiError(
      "Instagram Reel ID is required.",
      400,
      "INSTAGRAM_REEL_ID_REQUIRED"
    );
  }

  const existingReel = await prisma.instagramReel.findUnique({
    where: {
      id: body.id,
    },
  });

  if (!existingReel) {
    throw new ApiError(
      "Instagram Reel not found.",
      404,
      "INSTAGRAM_REEL_NOT_FOUND"
    );
  }

  const data: InstagramReelUpdateData = {};

  if (body.url !== undefined) {
    const normalizedUrl = normalizeInstagramReelUrl(body.url);

    const duplicateReel = await prisma.instagramReel.findUnique({
      where: {
        url: normalizedUrl,
      },
      select: {
        id: true,
      },
    });

    if (duplicateReel && duplicateReel.id !== body.id) {
      throw new ApiError(
        "This Instagram Reel has already been added.",
        409,
        "INSTAGRAM_REEL_ALREADY_EXISTS"
      );
    }

    data.url = normalizedUrl;
  }

  if (body.sortOrder !== undefined) {
    data.sortOrder = readSortOrder(
      body.sortOrder,
      existingReel.sortOrder
    );
  }

  if (Object.keys(data).length === 0) {
    throw new ApiError(
      "No changes were provided.",
      400,
      "NO_REEL_CHANGES"
    );
  }

  const reel = await prisma.instagramReel.update({
    where: {
      id: body.id,
    },
    data,
  });

  return apiSuccess({
    reel,
  });
});

/* -------------------------------------------------------------------------- */
/*                                   DELETE                                   */
/* -------------------------------------------------------------------------- */

export const DELETE = withApiHandler(async (req: Request) => {
  await requireAdmin();

  const body: unknown = await req.json();

  if (!isRecord(body)) {
    throw new ApiError(
      "Invalid request body.",
      400,
      "INVALID_REQUEST_BODY"
    );
  }

  if (typeof body.id !== "string" || !body.id.trim()) {
    throw new ApiError(
      "Instagram Reel ID is required.",
      400,
      "INSTAGRAM_REEL_ID_REQUIRED"
    );
  }

  const existingReel = await prisma.instagramReel.findUnique({
    where: {
      id: body.id,
    },
    select: {
      id: true,
    },
  });

  if (!existingReel) {
    throw new ApiError(
      "Instagram Reel not found.",
      404,
      "INSTAGRAM_REEL_NOT_FOUND"
    );
  }

  await prisma.instagramReel.delete({
    where: {
      id: body.id,
    },
  });

  return apiSuccess({
    deleted: true,
  });
});