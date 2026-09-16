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
  validatePostOpCompletionConfig,
} from "@/lib/post-op/completion";

import {
  postOpTemplateStepSelect,
} from "@/lib/post-op/selects";

import {
  incrementPostOpTemplateVersion,
} from "@/lib/post-op/template-version";

type RouteContext = {
  params: Promise<{
    templateId: string;
    stepId: string;
  }>;
};

/* ═══════════════════════════════════════════════════════════════
   PATCH
   Update template step
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
    } = await context.params;

    const existing =
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

          title: true,
          description: true,

          startsAfterHours: true,
          completesAfterHours: true,

          completionMode: true,

          sortOrder: true,
        },
      });

    if (!existing) {
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

    /* ─────────────────────────────────────
       TITLE
    ───────────────────────────────────── */

    const title =
      body.title !== undefined
        ? typeof body.title === "string"
          ? body.title.trim()
          : ""
        : existing.title;

    if (!title) {
      return NextResponse.json(
        {
          error:
            "title is required.",
        },
        {
          status: 400,
        },
      );
    }

    /* ─────────────────────────────────────
       DESCRIPTION
    ───────────────────────────────────── */

    const description =
      body.description !== undefined
        ? body.description === null
          ? null
          : typeof body.description ===
              "string"
            ? body.description.trim()
            : null
        : existing.description;

    /* ─────────────────────────────────────
       COMPLETION MODE
    ───────────────────────────────────── */

    const completionMode =
      body.completionMode !== undefined
        ? body.completionMode
        : existing.completionMode;

    if (
      completionMode !==
        "TIME_BASED" &&
      completionMode !== "MANUAL"
    ) {
      return NextResponse.json(
        {
          error:
            "completionMode must be TIME_BASED or MANUAL.",
        },
        {
          status: 400,
        },
      );
    }

    /* ─────────────────────────────────────
       TIMING
    ───────────────────────────────────── */

    const startsAfterHours =
      body.startsAfterHours !==
      undefined
        ? body.startsAfterHours
        : existing.startsAfterHours;

    let completesAfterHours =
      body.completesAfterHours !==
      undefined
        ? body.completesAfterHours
        : existing.completesAfterHours;

    /*
     * When switching from TIME_BASED
     * to MANUAL, null completion is valid.
     */
    if (
      completionMode === "MANUAL" &&
      body.completesAfterHours ===
        undefined &&
      body.completionMode ===
        "MANUAL"
    ) {
      completesAfterHours = null;
    }

    const timingValidation =
      validatePostOpCompletionConfig({
        completionMode,

        startsAfterHours,

        completesAfterHours,
      });

    if (!timingValidation.valid) {
      return NextResponse.json(
        {
          error:
            timingValidation.error,
        },
        {
          status: 400,
        },
      );
    }

    /* ─────────────────────────────────────
       SORT ORDER
    ───────────────────────────────────── */

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

    /* ─────────────────────────────────────
       UPDATE
    ───────────────────────────────────── */

    const step =
      await prisma.$transaction(
        async (tx) => {
          const updated =
            await tx.postOpTemplateStep.update({
              where: {
                id: stepId,
              },

              data: {
                title,
                description,

                startsAfterHours,
                completesAfterHours,

                completionMode,

                sortOrder,
              },

              select:
                postOpTemplateStepSelect,
            });

          await incrementPostOpTemplateVersion(
            tx,
            templateId,
          );

          return updated;
        },
      );

    return NextResponse.json({
      step,
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
      "Failed to update PostOp template step:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Failed to update PostOp template step.",
      },
      {
        status: 500,
      },
    );
  }
}

/* ═══════════════════════════════════════════════════════════════
   DELETE
   Delete template step
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
    } = await context.params;

    const existing =
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

    if (!existing) {
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

    await prisma.$transaction(
      async (tx) => {
        /*
         * Blocks + step reminders should
         * cascade from this step based on
         * the schema we created.
         */
        await tx.postOpTemplateStep.delete({
          where: {
            id: stepId,
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
      "Failed to delete PostOp template step:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Failed to delete PostOp template step.",
      },
      {
        status: 500,
      },
    );
  }
}