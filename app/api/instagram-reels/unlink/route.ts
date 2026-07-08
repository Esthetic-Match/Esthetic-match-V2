import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/database/prisma";

type PatchInstagramReelBody = {
  reelId?: unknown;
};

function isRecord(
  value: unknown
): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export async function PATCH(
  request: Request
): Promise<NextResponse> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    if (
      session.user.role !== "DOCTOR" &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json(
        {
          error: "Forbidden",
        },
        {
          status: 403,
        }
      );
    }

    const rawBody: unknown = await request
      .json()
      .catch(() => null);

    if (!isRecord(rawBody)) {
      return NextResponse.json(
        {
          error: "Invalid request body",
        },
        {
          status: 400,
        }
      );
    }

    const body: PatchInstagramReelBody =
      rawBody;

    if (
      typeof body.reelId !== "string" ||
      !body.reelId.trim()
    ) {
      return NextResponse.json(
        {
          error: "reelId is required",
        },
        {
          status: 400,
        }
      );
    }

    const reel = await prisma.instagramReel.findUnique({
      where: {
        id: body.reelId,
      },
      select: {
        id: true,
        doctorProfileId: true,
      },
    });

    if (!reel) {
      return NextResponse.json(
        {
          error: "Instagram Reel not found",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * Doctors can only unlink Reels attached
     * to their own DoctorProfile.
     *
     * Admins can unlink any Reel.
     */
    if (session.user.role === "DOCTOR") {
      const doctorProfile =
        await prisma.doctorProfile.findUnique({
          where: {
            userId: session.user.id,
          },
          select: {
            id: true,
          },
        });

      if (!doctorProfile) {
        return NextResponse.json(
          {
            error: "Doctor profile not found",
          },
          {
            status: 404,
          }
        );
      }

      if (
        reel.doctorProfileId !== doctorProfile.id
      ) {
        return NextResponse.json(
          {
            error:
              "You cannot remove this Reel from another doctor's profile",
          },
          {
            status: 403,
          }
        );
      }
    }

    const updatedReel =
      await prisma.instagramReel.update({
        where: {
          id: reel.id,
        },
        data: {
          doctorProfileId: null,
        },
        select: {
          id: true,
          url: true,
          sortOrder: true,
          doctorProfileId: true,
        },
      });

    return NextResponse.json({
      success: true,
      reel: updatedReel,
    });
  } catch (error) {
    console.error(
      "PATCH /api/instagram-reels failed:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Could not remove Instagram Reel from profile",
      },
      {
        status: 500,
      }
    );
  }
}