import { NextResponse } from "next/server";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/database/prisma";

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.user.role !== "DOCTOR") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const doctorProfile =
      await prisma.doctorProfile.findUnique({
        where: {
          userId: session.user.id,
        },

        select: {
          id: true,
          currency: true,

          procedures: {
            orderBy: {
              position: "asc",
            },

            select: {
              procedureId: true,
              price: true,
              description: true,
              topRank: true,

              procedure: {
                select: {
                  defaultPrice: true,

                  translations: {
                    select: {
                      localeCode: true,
                      name: true,
                      description: true,
                    },

                    orderBy: {
                      localeCode: "asc",
                    },
                  },
                },
              },
            },
          },
        },
      });

    if (!doctorProfile) {
      return NextResponse.json(
        {
          error: "Doctor profile not found.",
        },
        {
          status: 404,
        }
      );
    }

    const procedures =
      doctorProfile.procedures.map((item) => {
        const doctorPrice =
          item.price?.toString() ?? null;

        const defaultPrice =
          item.procedure.defaultPrice?.toString() ??
          null;

        const effectivePrice =
          doctorPrice ?? defaultPrice;

        return {
          procedureId: item.procedureId,

          doctorPrice,

          defaultPrice,

          effectivePrice,

          // Doctor-specific override only.
          customDescription:
            item.description ?? null,

          topRank: item.topRank,

          translations:
            item.procedure.translations,
        };
      });

    const pricedCount =
      procedures.filter(
        (procedure) =>
          procedure.effectivePrice !== null
      ).length;

    const customDescriptionCount =
      procedures.filter((procedure) =>
        Boolean(
          procedure.customDescription?.trim()
        )
      ).length;

    const topThreeCount =
      procedures.filter(
        (procedure) =>
          procedure.topRank !== null
      ).length;

    return NextResponse.json({
      success: true,

      currency:
        doctorProfile.currency ?? "eur",

      summary: {
        total: procedures.length,

        priced: pricedCount,

        missingPrice:
          procedures.length -
          pricedCount,

        customDescriptions:
          customDescriptionCount,

        topThree:
          topThreeCount,
      },

      procedures,
    });
  } catch (error) {
    console.error(
      "Failed to load doctor procedures:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to load doctor procedures.",
      },
      {
        status: 500,
      }
    );
  }
}