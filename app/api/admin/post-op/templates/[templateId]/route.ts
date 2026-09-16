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
  postOpTemplateSelect,
} from "@/lib/post-op/selects";

type RouteContext = {
  params: Promise<{
    templateId: string;
  }>;
};

/* ═══════════════════════════════════════════════════════════════
   GET
═══════════════════════════════════════════════════════════════ */

export async function GET(
  _request: NextRequest,
  context: RouteContext,
) {
  try {
    await requirePostOpAdmin();

    const { templateId } =
      await context.params;

    const template =
      await prisma.postOpTemplate.findFirst({
        where: {
          id: templateId,

          scope: "DEFAULT",

          doctorProfileId: null,
        },

        select:
          postOpTemplateSelect,
      });

    if (!template) {
      return NextResponse.json(
        {
          error:
            "PostOp template not found.",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
      template,
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
      "Failed to load PostOp template:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Failed to load PostOp template.",
      },
      {
        status: 500,
      },
    );
  }
}

/* ═══════════════════════════════════════════════════════════════
   PATCH
═══════════════════════════════════════════════════════════════ */

export async function PATCH(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    await requirePostOpAdmin();

    const { templateId } =
      await context.params;

    const existing =
      await prisma.postOpTemplate.findFirst({
        where: {
          id: templateId,

          scope: "DEFAULT",

          doctorProfileId: null,
        },

        select: {
          id: true,
        },
      });

    if (!existing) {
      return NextResponse.json(
        {
          error:
            "PostOp template not found.",
        },
        {
          status: 404,
        },
      );
    }

    const body =
      await request.json();

    const hasTitle =
      Object.prototype.hasOwnProperty.call(
        body,
        "title",
      );

    const hasDescription =
      Object.prototype.hasOwnProperty.call(
        body,
        "description",
      );

    const hasIsActive =
      Object.prototype.hasOwnProperty.call(
        body,
        "isActive",
      );

    if (
      !hasTitle &&
      !hasDescription &&
      !hasIsActive
    ) {
      return NextResponse.json(
        {
          error:
            "No supported fields were supplied.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      hasTitle &&
      (typeof body.title !== "string" ||
        !body.title.trim())
    ) {
      return NextResponse.json(
        {
          error:
            "title must be a non-empty string.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      hasDescription &&
      body.description !== null &&
      typeof body.description !== "string"
    ) {
      return NextResponse.json(
        {
          error:
            "description must be a string or null.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      hasIsActive &&
      typeof body.isActive !== "boolean"
    ) {
      return NextResponse.json(
        {
          error:
            "isActive must be a boolean.",
        },
        {
          status: 400,
        },
      );
    }

    const template =
      await prisma.postOpTemplate.update({
        where: {
          id: templateId,
        },

        data: {
          ...(hasTitle
            ? {
                title:
                  body.title.trim(),
              }
            : {}),

          ...(hasDescription
            ? {
                description:
                  body.description === null
                    ? null
                    : body.description.trim(),
              }
            : {}),

          ...(hasIsActive
            ? {
                isActive:
                  body.isActive,
              }
            : {}),

          version: {
            increment: 1,
          },
        },

        select:
          postOpTemplateSelect,
      });

    return NextResponse.json({
      template,
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
      "Failed to update PostOp template:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Failed to update PostOp template.",
      },
      {
        status: 500,
      },
    );
  }
}

/* ═══════════════════════════════════════════════════════════════
   DELETE
═══════════════════════════════════════════════════════════════ */

export async function DELETE(
  _request: NextRequest,
  context: RouteContext,
) {
  try {
    await requirePostOpAdmin();

    const { templateId } =
      await context.params;

    const template =
      await prisma.postOpTemplate.findFirst({
        where: {
          id: templateId,

          scope: "DEFAULT",

          doctorProfileId: null,
        },

        select: {
          id: true,
        },
      });

    if (!template) {
      return NextResponse.json(
        {
          error:
            "PostOp template not found.",
        },
        {
          status: 404,
        },
      );
    }

    await prisma.postOpTemplate.delete({
      where: {
        id: templateId,
      },
    });

    return NextResponse.json({
      success: true,
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
      "Failed to delete PostOp template:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Failed to delete PostOp template.",
      },
      {
        status: 500,
      },
    );
  }
}