import { headers } from "next/headers";

import { ApiError, apiSuccess } from "@/lib/api/error-handler";
import { withApiHandler } from "@/lib/api/with-api-handler";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/database/prisma";

export const dynamic = "force-dynamic";

type InstagramReelUpdateData = {
  url?: string;
  sortOrder?: number;
  doctorProfileId?: string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeInstagramUrl(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new ApiError(
      "Instagram URL is required.",
      400,
      "INVALID_INSTAGRAM_URL"
    );
  }

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(value.trim());
  } catch {
    throw new ApiError(
      "Invalid Instagram URL.",
      400,
      "INVALID_INSTAGRAM_URL"
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

  const contentTypeIndex = pathParts.findIndex(
    (part: string) => part === "reel" || part === "p"
  );

  if (contentTypeIndex === -1) {
    throw new ApiError(
      "The URL must be a valid Instagram Reel or post URL.",
      400,
      "INVALID_INSTAGRAM_URL"
    );
  }

  const contentType = pathParts[contentTypeIndex];
  const shortcode = pathParts[contentTypeIndex + 1];

  if (!shortcode) {
    throw new ApiError(
      "The Instagram URL does not contain a valid shortcode.",
      400,
      "INVALID_INSTAGRAM_URL"
    );
  }

  return `https://www.instagram.com/${contentType}/${shortcode}/`;
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
      "sortOrder must be a non-negative integer.",
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

  if (!session?.user) {
    throw new ApiError(
      "Authentication required.",
      401,
      "UNAUTHORIZED"
    );
  }

  if (session.user.role !== "ADMIN") {
    throw new ApiError(
      "Administrator access required.",
      403,
      "ADMIN_ACCESS_REQUIRED"
    );
  }
}

async function validateDoctorProfileId(
  value: unknown
): Promise<string | null> {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  if (typeof value !== "string" || !value.trim()) {
    throw new ApiError(
      "Invalid doctor profile ID.",
      400,
      "INVALID_DOCTOR_PROFILE_ID"
    );
  }

  const doctorProfile = await prisma.doctorProfile.findUnique({
    where: {
      id: value.trim(),
    },
    select: {
      id: true,
    },
  });

  if (!doctorProfile) {
    throw new ApiError(
      "Doctor profile not found.",
      404,
      "DOCTOR_PROFILE_NOT_FOUND"
    );
  }

  return doctorProfile.id;
}

/* -------------------------------------------------------------------------- */
/*                                    GET                                     */
/* -------------------------------------------------------------------------- */

export const GET = withApiHandler(async (req: Request) => {
  const requestUrl = new URL(req.url);

  const doctorProfileId =
    requestUrl.searchParams.get("doctorProfileId");

  const reels = await prisma.instagramReel.findMany({
    where: doctorProfileId
      ? {
          doctorProfileId,
        }
      : undefined,

    orderBy: [
      {
        sortOrder: "asc",
      },
      {
        createdAt: "asc",
      },
    ],

    select: {
      id: true,
      url: true,
      sortOrder: true,
      doctorProfileId: true,
      createdAt: true,
      updatedAt: true,

      doctorProfile: {
        select: {
          id: true,
          slug: true,
          clinicName: true,
          avatar: true,

          user: {
            select: {
              name: true,
            },
          },
        },
      },
    },
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

  const url = normalizeInstagramUrl(body.url);

  const doctorProfileId =
    await validateDoctorProfileId(body.doctorProfileId);

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

  const defaultSortOrder =
    (lastReel?.sortOrder ?? -1) + 1;

  const sortOrder = readSortOrder(
    body.sortOrder,
    defaultSortOrder
  );

  const reel = await prisma.instagramReel.create({
    data: {
      url,
      sortOrder,
      doctorProfileId,
    },

    select: {
      id: true,
      url: true,
      sortOrder: true,
      doctorProfileId: true,
      createdAt: true,
      updatedAt: true,

      doctorProfile: {
        select: {
          id: true,
          slug: true,
          clinicName: true,
          avatar: true,

          user: {
            select: {
              name: true,
            },
          },
        },
      },
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

  if (
    typeof body.id !== "string" ||
    !body.id.trim()
  ) {
    throw new ApiError(
      "Instagram Reel ID is required.",
      400,
      "INSTAGRAM_REEL_ID_REQUIRED"
    );
  }

  const reelId = body.id.trim();

  const existingReel =
    await prisma.instagramReel.findUnique({
      where: {
        id: reelId,
      },

      select: {
        id: true,
        url: true,
        sortOrder: true,
        doctorProfileId: true,
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
    const normalizedUrl = normalizeInstagramUrl(body.url);

    const duplicateReel =
      await prisma.instagramReel.findUnique({
        where: {
          url: normalizedUrl,
        },

        select: {
          id: true,
        },
      });

    if (
      duplicateReel &&
      duplicateReel.id !== reelId
    ) {
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

  if (body.doctorProfileId !== undefined) {
    data.doctorProfileId =
      await validateDoctorProfileId(
        body.doctorProfileId
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
      id: reelId,
    },

    data,

    select: {
      id: true,
      url: true,
      sortOrder: true,
      doctorProfileId: true,
      createdAt: true,
      updatedAt: true,

      doctorProfile: {
        select: {
          id: true,
          slug: true,
          clinicName: true,
          avatar: true,

          user: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  return apiSuccess({
    reel,
  });
});

/* -------------------------------------------------------------------------- */
/*                                   DELETE                                   */
/* -------------------------------------------------------------------------- */

export const DELETE = withApiHandler(
  async (req: Request) => {
    await requireAdmin();

    const body: unknown = await req.json();

    if (!isRecord(body)) {
      throw new ApiError(
        "Invalid request body.",
        400,
        "INVALID_REQUEST_BODY"
      );
    }

    if (
      typeof body.id !== "string" ||
      !body.id.trim()
    ) {
      throw new ApiError(
        "Instagram Reel ID is required.",
        400,
        "INSTAGRAM_REEL_ID_REQUIRED"
      );
    }

    const reelId = body.id.trim();

    const existingReel =
      await prisma.instagramReel.findUnique({
        where: {
          id: reelId,
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
        id: reelId,
      },
    });

    return apiSuccess({
      deleted: true,
      id: reelId,
    });
  }
);