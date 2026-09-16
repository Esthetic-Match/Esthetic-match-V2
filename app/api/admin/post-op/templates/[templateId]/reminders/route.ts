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
  validatePostOpTemplateReminder,
  type PostOpReminderType,
} from "@/lib/post-op/reminders";

import {
  postOpTemplateReminderSelect,
} from "@/lib/post-op/selects";
import { incrementPostOpTemplateVersion } from "@/lib/post-op/template-version";

type RouteContext = {
  params: Promise<{
    templateId: string;
  }>;
};

/* ═══════════════════════════════════════════════════════════════
   GET
   Get template reminders

   Optional:
   ?stepId=...
   ?scope=global
═══════════════════════════════════════════════════════════════ */

export async function GET(
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

    const stepId =
      request.nextUrl.searchParams.get(
        "stepId",
      );

    const scope =
      request.nextUrl.searchParams.get(
        "scope",
      );

    const reminders =
      await prisma.postOpTemplateReminder.findMany(
        {
          where: {
            templateId,

            ...(scope === "global"
              ? {
                  stepId: null,
                }
              : stepId
                ? {
                    stepId,
                  }
                : {}),
          },

          select:
            postOpTemplateReminderSelect,

          orderBy: [
            {
              startsAfterHours: "asc",
            },
            {
              sortOrder: "asc",
            },
          ],
        },
      );

    return NextResponse.json({
      reminders,
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
      "Failed to load PostOp reminders:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Failed to load PostOp reminders.",
      },
      {
        status: 500,
      },
    );
  }
}

/* ═══════════════════════════════════════════════════════════════
   POST
   Create global OR step-specific reminder
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
       STEP
    ───────────────────────────────────── */

    const stepId =
      typeof body.stepId === "string" &&
      body.stepId.trim()
        ? body.stepId.trim()
        : null;

    /*
     * If stepId exists, prove that the step
     * actually belongs to THIS template.
     */
    if (stepId) {
      const step =
        await prisma.postOpTemplateStep.findFirst(
          {
            where: {
              id: stepId,
              templateId,
            },

            select: {
              id: true,
            },
          },
        );

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
    }

    /* ─────────────────────────────────────
       REMINDER
    ───────────────────────────────────── */

    const type =
      body.type as PostOpReminderType;

    const text =
      typeof body.text === "string"
        ? body.text.trim()
        : "";

    const startsAfterHours =
      body.startsAfterHours ?? 0;

    const endsAfterHours =
      body.endsAfterHours === null ||
      body.endsAfterHours ===
        undefined
        ? null
        : body.endsAfterHours;

    const notificationsEnabled =
      typeof body.notificationsEnabled ===
      "boolean"
        ? body.notificationsEnabled
        : false;

    const repeatEveryHours =
      body.repeatEveryHours === null ||
      body.repeatEveryHours ===
        undefined
        ? null
        : body.repeatEveryHours;

    const isPinned =
      typeof body.isPinned === "boolean"
        ? body.isPinned
        : true;

    const validation =
      validatePostOpTemplateReminder({
        type,

        text,

        startsAfterHours,
        endsAfterHours,

        notificationsEnabled,
        repeatEveryHours,

        isPinned,
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

    /* ─────────────────────────────────────
       SORT ORDER
    ───────────────────────────────────── */

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
      /*
       * Ordering is scoped to either:
       *
       * - this specific step
       * - global reminders
       */
      const lastReminder =
        await prisma.postOpTemplateReminder.findFirst(
          {
            where: {
              templateId,
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
        (lastReminder?.sortOrder ??
          0) + 1;
    }

    /* ─────────────────────────────────────
       CREATE
    ───────────────────────────────────── */

    const reminder =
      await prisma.$transaction(
        async (tx) => {
          const created =
            await tx.postOpTemplateReminder.create(
              {
                data: {
                  templateId,
                  stepId,

                  type,
                  text,

                  startsAfterHours,
                  endsAfterHours,

                  notificationsEnabled,
                  repeatEveryHours,

                  isPinned,

                  sortOrder,
                },

                select:
                  postOpTemplateReminderSelect,
              },
            );

            await incrementPostOpTemplateVersion(
              tx,
              templateId,
            );

          return created;
        },
      );

    return NextResponse.json(
      {
        reminder,
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
      "Failed to create PostOp reminder:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Failed to create PostOp reminder.",
      },
      {
        status: 500,
      },
    );
  }
}