import { NextResponse } from "next/server";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/database/prisma";

type UpdateTranslationInput = {
  localeCode: string;
  description: string | null;
};

type UpdateProcedureBody = {
  defaultPrice?: string | number | null;
  translations?: UpdateTranslationInput[];
};

export async function PATCH(
  request: Request,
  context: {
    params: Promise<{
      procedureId: string;
    }>;
  },
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 },
      );
    }

    const { procedureId } = await context.params;

    const body = (await request.json()) as UpdateProcedureBody;

    const procedure = await prisma.procedure.findUnique({
      where: {
        id: procedureId,
      },
      select: {
        id: true,
        translations: {
          select: {
            localeCode: true,
          },
        },
      },
    });

    if (!procedure) {
      return NextResponse.json(
        { error: "Procedure not found" },
        { status: 404 },
      );
    }

    let defaultPrice: string | null | undefined;

    if (body.defaultPrice !== undefined) {
      if (
        body.defaultPrice === null ||
        String(body.defaultPrice).trim() === ""
      ) {
        defaultPrice = null;
      } else {
        const numericPrice = Number(body.defaultPrice);

        if (!Number.isFinite(numericPrice) || numericPrice < 0) {
          return NextResponse.json(
            { error: "Default price must be a valid positive number." },
            { status: 400 },
          );
        }

        defaultPrice = numericPrice.toFixed(2);
      }
    }

    const translations = body.translations ?? [];

    const existingLocales = new Set(
      procedure.translations.map(
        (translation) => translation.localeCode,
      ),
    );

    for (const translation of translations) {
      if (
        !translation.localeCode ||
        !existingLocales.has(translation.localeCode)
      ) {
        return NextResponse.json(
          {
            error: `Invalid locale: ${translation.localeCode}`,
          },
          { status: 400 },
        );
      }
    }

    await prisma.$transaction(async (tx) => {
      if (defaultPrice !== undefined) {
        await tx.procedure.update({
          where: {
            id: procedureId,
          },
          data: {
            defaultPrice,
          },
        });
      }

      for (const translation of translations) {
        await tx.procedureTranslation.update({
          where: {
            procedureId_localeCode: {
              procedureId,
              localeCode: translation.localeCode,
            },
          },
          data: {
            description:
              translation.description?.trim() || null,
          },
        });
      }
    });

    const updatedProcedure = await prisma.procedure.findUnique({
      where: {
        id: procedureId,
      },
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

    if (!updatedProcedure) {
      return NextResponse.json(
        { error: "Procedure not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      procedure: {
        ...updatedProcedure,
        defaultPrice:
          updatedProcedure.defaultPrice?.toString() ?? null,
      },
    });
  } catch (error) {
    console.error("Failed to update procedure:", error);

    return NextResponse.json(
      { error: "Failed to update procedure." },
      { status: 500 },
    );
  }
}