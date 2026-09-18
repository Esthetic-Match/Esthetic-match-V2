import {
  type NextRequest,
  NextResponse,
} from "next/server";

import { prisma } from "@/lib/database/prisma";

import {
  requirePostOpDoctorActor,
} from "@/lib/post-op/doctor-templates";

import {
  handlePostOpAuthorizationError,
} from "@/lib/post-op/authorization-response";

export async function GET(
  request: NextRequest,
) {
  try {
    await requirePostOpDoctorActor();

    const query =
      request.nextUrl.searchParams
        .get("q")
        ?.trim() ?? "";

    if (query.length < 2) {
      return NextResponse.json({
        patients: [],
      });
    }

    const users =
      await prisma.user.findMany({
        where: {
          role: "PATIENT",

          OR: [
            {
              name: {
                contains: query,

                mode:
                  "insensitive",
              },
            },

            {
              email: {
                contains: query,

                mode:
                  "insensitive",
              },
            },
          ],
        },

        select: {
          id: true,
          name: true,
          email: true,
          image: true,

          patientProfile: {
            select: {
              avatar: true,
            },
          },
        },

        orderBy: {
          name: "asc",
        },

        take: 12,
      });

    return NextResponse.json({
      patients:
        users.map(
          (user) => ({
            id: user.id,

            name:
              user.name ??
              user.email,

            email:
              user.email,

            avatar:
              user.patientProfile
                ?.avatar ??
              user.image ??
              null,
          }),
        ),
    });
  } catch (error) {
    const authResponse =
      handlePostOpAuthorizationError(
        error,
      );

    if (authResponse) {
      return authResponse;
    }

    console.error(
      "Failed to search PostOp patients:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Failed to search patients.",
      },
      {
        status: 500,
      },
    );
  }
}