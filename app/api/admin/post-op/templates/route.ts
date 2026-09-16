import {
  type NextRequest,
  NextResponse,
} from "next/server";

import { prisma } from "@/lib/database/prisma";

import {
  requirePostOpAdmin,
} from "@/lib/post-op/authorization";

import {
  handlePostOpAuthorizationError,
} from "@/lib/post-op/authorization-response";

import {
  getDefaultPostOpTemplate,
  getDefaultPostOpTemplateKey,
} from "@/lib/post-op/default-templates";

import {
  postOpTemplateListSelect,
  postOpTemplateSelect,
} from "@/lib/post-op/selects";

/* ═══════════════════════════════════════════════════════════════
   GET
   List default templates

   Supports:
   ?procedureId=...
   ?localeCode=en
═══════════════════════════════════════════════════════════════ */

export async function GET(
  request: NextRequest,
) {
  try {
    await requirePostOpAdmin();

    const procedureId =
      request.nextUrl.searchParams.get(
        "procedureId",
      );

    const localeCode =
      request.nextUrl.searchParams.get(
        "localeCode",
      );

    /*
     * If both procedure + locale are supplied,
     * return the exact template.
     */
    if (procedureId && localeCode) {
      const template =
        await getDefaultPostOpTemplate({
          procedureId,
          localeCode,
          includeInactive: true,
        });

      return NextResponse.json({
        template,
      });
    }

    const templates =
      await prisma.postOpTemplate.findMany({
        where: {
          scope: "DEFAULT",

          doctorProfileId: null,

          ...(procedureId
            ? {
                procedureId,
              }
            : {}),

          ...(localeCode
            ? {
                localeCode,
              }
            : {}),
        },

        select:
          postOpTemplateListSelect,

        orderBy: {
          createdAt: "desc",
        },
      });

    return NextResponse.json({
      templates,
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
      "Failed to load default PostOp templates:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Failed to load PostOp templates.",
      },
      {
        status: 500,
      },
    );
  }
}

/* ═══════════════════════════════════════════════════════════════
   POST
   Create default template
═══════════════════════════════════════════════════════════════ */

export async function POST(
  request: NextRequest,
) {
  try {
    await requirePostOpAdmin();

    const body =
      await request.json();

    const procedureId =
      typeof body.procedureId === "string"
        ? body.procedureId.trim()
        : "";

    const localeCode =
      typeof body.localeCode === "string"
        ? body.localeCode.trim()
        : "";

    const title =
      typeof body.title === "string"
        ? body.title.trim()
        : "";

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : null;

    const isActive =
      typeof body.isActive === "boolean"
        ? body.isActive
        : true;

    if (!procedureId) {
      return NextResponse.json(
        {
          error:
            "procedureId is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!localeCode) {
      return NextResponse.json(
        {
          error:
            "localeCode is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!title) {
      return NextResponse.json(
        {
          error: "title is required.",
        },
        {
          status: 400,
        },
      );
    }

    const [
      procedure,
      locale,
    ] = await Promise.all([
      prisma.procedure.findUnique({
        where: {
          id: procedureId,
        },

        select: {
          id: true,
        },
      }),

      prisma.catalogLocale.findUnique({
        where: {
          code: localeCode,
        },

        select: {
          code: true,
        },
      }),
    ]);

    if (!procedure) {
      return NextResponse.json(
        {
          error:
            "Procedure not found.",
        },
        {
          status: 404,
        },
      );
    }

    if (!locale) {
      return NextResponse.json(
        {
          error:
            "Locale not found.",
        },
        {
          status: 404,
        },
      );
    }

    const existing =
      await getDefaultPostOpTemplate({
        procedureId,
        localeCode,
        includeInactive: true,
      });

    if (existing) {
      return NextResponse.json(
        {
          error:
            "A default PostOp template already exists for this procedure and locale.",

          templateId:
            existing.id,
        },
        {
          status: 409,
        },
      );
    }

    const templateKey =
      getDefaultPostOpTemplateKey(
        procedureId,
        localeCode,
      );

    const template =
      await prisma.postOpTemplate.create({
        data: {
          templateKey,

          procedureId,
          localeCode,

          scope: "DEFAULT",

          doctorProfileId: null,
          sourceTemplateId: null,

          title,
          description,

          version: 1,
          isActive,
        },

        select:
          postOpTemplateSelect,
      });

    return NextResponse.json(
      {
        template,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    const authResponse =
      handlePostOpAuthorizationError(
        error,
      );

    if (authResponse) {
      return authResponse;
    }

    console.error(
      "Failed to create default PostOp template:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Failed to create PostOp template.",
      },
      {
        status: 500,
      },
    );
  }
}