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
import { incrementPostOpTemplateVersion } from "@/lib/post-op/template-version";

type RouteContext = {
  params: Promise<{
    templateId: string;
  }>;
};

type CompletionMode =
  | "TIME_BASED"
  | "MANUAL";

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

    const steps =
      await prisma.postOpTemplateStep.findMany(
        {
          where: {
            templateId,
          },

          select:
            postOpTemplateStepSelect,

          orderBy: {
            sortOrder: "asc",
          },
        },
      );

    return NextResponse.json({
      steps,
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
      "Failed to load PostOp steps:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Failed to load PostOp steps.",
      },
      {
        status: 500,
      },
    );
  }
}

/* ═══════════════════════════════════════════════════════════════
   POST
═══════════════════════════════════════════════════════════════ */

export async function POST(
  request: NextRequest,
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

    const body =
      await request.json();

    /* ─────────────────────────────────────
       BASIC FIELDS
    ───────────────────────────────────── */

    const title =
      typeof body.title === "string"
        ? body.title.trim()
        : "";

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : null;

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
       COMPLETION MODE
    ───────────────────────────────────── */

    const rawCompletionMode =
      body.completionMode ??
      "TIME_BASED";

    if (
      rawCompletionMode !==
        "TIME_BASED" &&
      rawCompletionMode !== "MANUAL"
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

    const completionMode: CompletionMode =
      rawCompletionMode;

    /* ─────────────────────────────────────
       TIMING
    ───────────────────────────────────── */

    const startsAfterHours =
      body.startsAfterHours;

    const completesAfterHours =
      body.completesAfterHours === null ||
      body.completesAfterHours ===
        undefined
        ? null
        : body.completesAfterHours;

    /*
     * Central validation:
     *
     * TIME_BASED
     * - requires completesAfterHours
     * - completion > start
     *
     * MANUAL
     * - completion can be null
     */
    const completionValidation =
      validatePostOpCompletionConfig({
        completionMode,
        startsAfterHours,
        completesAfterHours,
      });

    if (
      !completionValidation.valid
    ) {
      return NextResponse.json(
        {
          error:
            completionValidation.error,
        },
        {
          status: 400,
        },
      );
    }

    /* ─────────────────────────────────────
       SORT ORDER
    ───────────────────────────────────── */

    const requestedSortOrder =
      body.sortOrder;

    if (
      requestedSortOrder !==
        undefined &&
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
      requestedSortOrder !==
      undefined
    ) {
      sortOrder =
        requestedSortOrder;
    } else {
      const lastStep =
        await prisma.postOpTemplateStep.findFirst(
          {
            where: {
              templateId,
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
        (lastStep?.sortOrder ??
          0) + 1;
    }

    /* ─────────────────────────────────────
       CREATE
    ───────────────────────────────────── */

    const step =
      await prisma.$transaction(
        async (tx) => {
          const createdStep =
            await tx.postOpTemplateStep.create(
              {
                data: {
                  templateId,

                  title,
                  description,

                  startsAfterHours,
                  completesAfterHours,

                  completionMode,

                  sortOrder,
                },

                select:
                  postOpTemplateStepSelect,
              },
            );

          await incrementPostOpTemplateVersion(
            tx,
            templateId,
          );

          return createdStep;
        },
      );

    return NextResponse.json(
      {
        step,
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
      "Failed to create PostOp step:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Failed to create PostOp step.",
      },
      {
        status: 500,
      },
    );
  }
}