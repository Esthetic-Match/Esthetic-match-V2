import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/database/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    const currentUser = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        role: true,
        doctorProfile: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!currentUser) {
      return NextResponse.json(
        {
          error: "User not found.",
        },
        {
          status: 404,
        }
      );
    }

    if (currentUser.role !== "DOCTOR") {
      return NextResponse.json(
        {
          error: "Only doctors can access this metric.",
        },
        {
          status: 403,
        }
      );
    }

    if (!currentUser.doctorProfile) {
      return NextResponse.json(
        {
          error: "Doctor profile not found.",
        },
        {
          status: 404,
        }
      );
    }

    const totalLikes = await prisma.patientProfile.count({
      where: {
        favorite: {
          has: currentUser.doctorProfile.id,
        },
      },
    });

    return NextResponse.json(
      {
        totalLikes,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Could not load doctor likes:", error);

    return NextResponse.json(
      {
        error: "Could not load doctor likes.",
      },
      {
        status: 500,
      }
    );
  }
}
