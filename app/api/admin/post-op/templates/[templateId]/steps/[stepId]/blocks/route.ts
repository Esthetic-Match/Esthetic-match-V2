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
  }>;
};

/* ═══════════════════════════════════════════════════════════════
   GET
   Ordered blocks for a template step
═══════════════════════════════════════════════════════════════ */

export async function GET(
  _request: NextRequest,
  context: RouteContext,
) {
  try {
    await requirePostOpAdmin();

    const {
      templateId,
      stepId,
    } = await context.params;

    const step =
      await prisma.postOpTemplateStep.findFirst({
        where: {
          id: stepId,
          templateId,

          template: {
            scope: "DEFAULT",
            doctorProfileId: null,
          },
        },

        select: {
          id: true,
        },
      });

    if (!step) {
      return NextResponse.json(
        {
          error:
            "PostOp template step not found.",
        },
        {
          status: 404,
        },
      );
    }

    const blocks =
      await prisma.postOpTemplateBlock.findMany(
        {
          where: {
            stepId,
          },

          select:
            postOpTemplateBlockSelect,

          orderBy: {
            sortOrder: "asc",
          },
        },
      );

    return NextResponse.json({
      blocks,
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
      "Failed to load PostOp blocks:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Failed to load PostOp blocks.",
      },
      {
        status: 500,
      },
    );
  }
}

/* ═══════════════════════════════════════════════════════════════
   POST
   Add block to step
═══════════════════════════════════════════════════════════════ */

export async function POST(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    await requirePostOpAdmin();

    const {
      templateId,
      stepId,
    } = await context.params;

    const step =
      await prisma.postOpTemplateStep.findFirst({
        where: {
          id: stepId,
          templateId,

          template: {
            scope: "DEFAULT",
            doctorProfileId: null,
          },
        },

        select: {
          id: true,
        },
      });

    if (!step) {
      return NextResponse.json(
        {
          error:
            "PostOp template step not found.",
        },
        {
          status: 404,
        },
      );
    }

    const body =
      await request.json();

    const type =
      body.type as PostOpBlockType;

    const text =
      typeof body.text === "string"
        ? body.text.trim()
        : null;

    const objectPath =
      typeof body.objectPath === "string"
        ? body.objectPath.trim()
        : null;

    const externalUrl =
      typeof body.externalUrl === "string"
        ? body.externalUrl.trim()
        : null;

    const mediaAlt =
      typeof body.mediaAlt === "string"
        ? body.mediaAlt.trim()
        : null;

    const bookingType =
      body.bookingType ?? null;

    const bookingUrl =
      typeof body.bookingUrl === "string"
        ? body.bookingUrl.trim()
        : null;

    const buttonLabel =
      typeof body.buttonLabel === "string"
        ? body.buttonLabel.trim()
        : null;

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

    const requestedSortOrder =
      body.sortOrder;

    if (
      requestedSortOrder !== undefined &&
      (!Number.isInteger(
        requestedSortOrder,
      ) ||
        requestedSortOrder < 0)
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

    let sortOrder: number;

    if (
      requestedSortOrder !== undefined
    ) {
      sortOrder =
        requestedSortOrder;
    } else {
      const lastBlock =
        await prisma.postOpTemplateBlock.findFirst(
          {
            where: {
              stepId,
            },

            select: {
              sortOrder: true,
            },

            orderBy: {
              sortOrder: "desc",
            },
          },
        );

      sortOrder =
        (lastBlock?.sortOrder ??
          0) + 1;
    }

    const block =
      await prisma.$transaction(
        async (tx) => {
          const createdBlock =
            await tx.postOpTemplateBlock.create(
              {
                data: {
                  stepId,

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

          return createdBlock;
        },
      );

    return NextResponse.json(
      {
        block,
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
      "Failed to create PostOp block:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Failed to create PostOp block.",
      },
      {
        status: 500,
      },
    );
  }
}