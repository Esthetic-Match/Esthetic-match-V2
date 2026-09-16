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
  validatePostOpBlock,
  type PostOpBlockType,
} from "@/lib/post-op/blocks";

import {
  postOpTemplateBlockSelect,
} from "@/lib/post-op/selects";
import { incrementPostOpTemplateVersion } from "@/lib/post-op/template-version";

type RouteContext = {
  params: Promise<{
    templateId: string;
    stepId: string;
    blockId: string;
  }>;
};

/* ═══════════════════════════════════════════════════════════════
   PATCH
═══════════════════════════════════════════════════════════════ */

export async function PATCH(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    await requirePostOpAdmin();

    const {
      templateId,
      stepId,
      blockId,
    } = await context.params;

    const existing =
      await prisma.postOpTemplateBlock.findFirst({
        where: {
          id: blockId,
          stepId,

          step: {
            templateId,

            template: {
              scope: "DEFAULT",
              doctorProfileId: null,
            },
          },
        },

        select:
          postOpTemplateBlockSelect,
      });

    if (!existing) {
      return NextResponse.json(
        {
          error:
            "PostOp block not found.",
        },
        {
          status: 404,
        },
      );
    }

    const body =
      await request.json();

    const type =
      (body.type ??
        existing.type) as PostOpBlockType;

    const text =
      body.text !== undefined
        ? typeof body.text === "string"
          ? body.text.trim()
          : null
        : existing.text;

    const objectPath =
      body.objectPath !== undefined
        ? typeof body.objectPath ===
          "string"
          ? body.objectPath.trim()
          : null
        : existing.objectPath;

    const externalUrl =
      body.externalUrl !== undefined
        ? typeof body.externalUrl ===
          "string"
          ? body.externalUrl.trim()
          : null
        : existing.externalUrl;

    const mediaAlt =
      body.mediaAlt !== undefined
        ? typeof body.mediaAlt ===
          "string"
          ? body.mediaAlt.trim()
          : null
        : existing.mediaAlt;

    const bookingType =
      body.bookingType !== undefined
        ? body.bookingType
        : existing.bookingType;

    const bookingUrl =
      body.bookingUrl !== undefined
        ? typeof body.bookingUrl ===
          "string"
          ? body.bookingUrl.trim()
          : null
        : existing.bookingUrl;

    const buttonLabel =
      body.buttonLabel !== undefined
        ? typeof body.buttonLabel ===
          "string"
          ? body.buttonLabel.trim()
          : null
        : existing.buttonLabel;

    const validation =
      validatePostOpBlock({
        type,
        text,
        objectPath,
        externalUrl,
        mediaAlt,
        bookingType,
        bookingUrl,
        buttonLabel,
      });

    if (!validation.valid) {
      return NextResponse.json(
        {
          error:
            validation.error,
        },
        {
          status: 400,
        },
      );
    }

    const sortOrder =
      body.sortOrder !== undefined
        ? body.sortOrder
        : existing.sortOrder;

    if (
      !Number.isInteger(sortOrder) ||
      sortOrder < 0
    ) {
      return NextResponse.json(
        {
          error:
            "sortOrder must be a non-negative integer.",
        },
        {
          status: 400,
        },
      );
    }

    const block =
      await prisma.$transaction(
        async (tx) => {
          const updatedBlock =
            await tx.postOpTemplateBlock.update(
              {
                where: {
                  id: blockId,
                },

                data: {
                  type,

                  text:
                    type === "TEXT"
                      ? text
                      : null,

                  objectPath:
                    type === "IMAGE"
                      ? objectPath
                      : null,

                  externalUrl:
                    type === "VIDEO"
                      ? externalUrl
                      : null,

                  mediaAlt:
                    type === "IMAGE" ||
                    type === "VIDEO"
                      ? mediaAlt
                      : null,

                  bookingType:
                    type === "BOOKING"
                      ? bookingType
                      : null,

                  bookingUrl:
                    type === "BOOKING"
                      ? bookingUrl
                      : null,

                  buttonLabel:
                    type === "BOOKING"
                      ? buttonLabel
                      : null,

                  sortOrder,
                },

                select:
                  postOpTemplateBlockSelect,
              },
            );

          await incrementPostOpTemplateVersion(
            tx,
            templateId,
          );

          return updatedBlock;
        },
      );

    return NextResponse.json({
      block,
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
      "Failed to update PostOp block:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Failed to update PostOp block.",
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

    const {
      templateId,
      stepId,
      blockId,
    } = await context.params;

    const block =
      await prisma.postOpTemplateBlock.findFirst({
        where: {
          id: blockId,
          stepId,

          step: {
            templateId,

            template: {
              scope: "DEFAULT",
              doctorProfileId: null,
            },
          },
        },

        select: {
          id: true,
        },
      });

    if (!block) {
      return NextResponse.json(
        {
          error:
            "PostOp block not found.",
        },
        {
          status: 404,
        },
      );
    }

    await prisma.$transaction(
      async (tx) => {
        await tx.postOpTemplateBlock.delete({
          where: {
            id: blockId,
          },
        });

        await incrementPostOpTemplateVersion(
          tx,
          templateId,
        );
      },
    );

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
      "Failed to delete PostOp block:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Failed to delete PostOp block.",
      },
      {
        status: 500,
      },
    );
  }
}