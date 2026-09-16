import {
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
  validateDefaultPostOpTemplateForPublish,
} from "@/lib/post-op/template-validation";

import {
  postOpTemplateSelect,
} from "@/lib/post-op/selects";

type RouteContext = {
  params: Promise<{
    templateId: string;
  }>;
};

export async function POST(
  _request: Request,
  context: RouteContext,
) {
  try {
    await requirePostOpAdmin();

    const { templateId } =
      await context.params;

    const validation =
      await validateDefaultPostOpTemplateForPublish(
        templateId,
      );

    if (!validation.template) {
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

    if (!validation.valid) {
      return NextResponse.json(
        {
          error:
            "PostOp template cannot be published.",

          validationErrors:
            validation.errors,
        },
        {
          status: 400,
        },
      );
    }

    const template =
      await prisma.$transaction(
        async (tx) => {
          /*
           * Publishing creates a new version.
           */
          await tx.postOpTemplate.update({
            where: {
              id: templateId,
            },

            data: {
              isActive: true,

              version: {
                increment: 1,
              },
            },
          });

          return tx.postOpTemplate.findUniqueOrThrow(
            {
              where: {
                id: templateId,
              },

              select:
                postOpTemplateSelect,
            },
          );
        },
      );

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
      "Failed to publish PostOp template:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Failed to publish PostOp template.",
      },
      {
        status: 500,
      },
    );
  }
}