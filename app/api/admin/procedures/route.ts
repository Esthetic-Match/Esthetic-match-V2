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

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const procedures =
      await prisma.procedure.findMany({
        select: {
          id: true,
          isActive: true,
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
      });

    const formattedProcedures = procedures
      .map((procedure) => ({
        id: procedure.id,
        isActive: procedure.isActive,

        defaultPrice:
          procedure.defaultPrice?.toString() ?? "",

        translations: procedure.translations,
      }))
      .sort((a, b) => {
        const aName =
          a.translations.find(
            (translation) =>
              translation.localeCode === "en"
          )?.name ??
          a.translations[0]?.name ??
          a.id;

        const bName =
          b.translations.find(
            (translation) =>
              translation.localeCode === "en"
          )?.name ??
          b.translations[0]?.name ??
          b.id;

        return aName.localeCompare(bName);
      });

    return NextResponse.json({
      success: true,
      procedures: formattedProcedures,
    });
  } catch (error) {
    console.error(
      "Failed to load admin procedures:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to load procedures.",
      },
      {
        status: 500,
      }
    );
  }
}