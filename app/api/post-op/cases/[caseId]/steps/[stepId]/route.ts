import {
  type NextRequest,
  NextResponse,
} from "next/server";

import { prisma } from "@/lib/database/prisma";

import {
  requireDoctorPostOpCaseAccess,
  requirePatientPostOpCaseAccess,
} from "@/lib/post-op/authorization";

import {
  handlePostOpAuthorizationError,
} from "@/lib/post-op/authorization-response";

type RouteContext = {
  params: Promise<{
    caseId: string;
    stepId: string;
  }>;
};

type StepAction =
  | "COMPLETE"
  | "REOPEN";

/* ═══════════════════════════════════════════════════════════════
   ACCESS
═══════════════════════════════════════════════════════════════ */

async function requireCaseAccess(
  caseId: string,
) {
  try {
    return await requireDoctorPostOpCaseAccess(
      caseId,
    );
  } catch {
    return await requirePatientPostOpCaseAccess(
      caseId,
    );
  }
}

/* ═══════════════════════════════════════════════════════════════
   PATCH
   Complete or reopen a case step
═══════════════════════════════════════════════════════════════ */

export async function PATCH(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    const {
      caseId,
      stepId,
    } = await context.params;

    await requireCaseAccess(
      caseId,
    );

    /* ─────────────────────────────────────
       FIND STEP
    ───────────────────────────────────── */

    const existing =
      await prisma.postOpCaseStep.findFirst({
        where: {
          id: stepId,
          caseId,
        },

        select: {
          id: true,
          caseId: true,

          sourceTemplateStepId:
            true,

          title: true,
          description: true,

          sortOrder: true,

          completionMode: true,

          startsAt: true,
          completesAt: true,

          completedAt: true,
          skippedAt: true,
        },
      });

    if (!existing) {
      return NextResponse.json(
        {
          error:
            "PostOp case step not found.",
        },
        {
          status: 404,
        },
      );
    }

    /* ─────────────────────────────────────
       BODY
    ───────────────────────────────────── */

    const body =
      await request.json();

    const action =
      body.action as
        | StepAction
        | undefined;

    if (
      action !== "COMPLETE" &&
      action !== "REOPEN"
    ) {
      return NextResponse.json(
        {
          error:
            "action must be COMPLETE or REOPEN.",
        },
        {
          status: 400,
        },
      );
    }

    /* ─────────────────────────────────────
       COMPLETE
    ───────────────────────────────────── */

    if (
      action === "COMPLETE"
    ) {
      const step =
        await prisma.postOpCaseStep.update({
          where: {
            id: stepId,
          },

          data: {
            completedAt:
              new Date(),

            skippedAt:
              null,
          },

          select: {
            id: true,
            caseId: true,

            sourceTemplateStepId:
              true,

            title: true,
            description: true,

            sortOrder: true,

            completionMode: true,

            startsAt: true,
            completesAt: true,

            completedAt: true,
            skippedAt: true,

            blocks: {
              orderBy: {
                sortOrder:
                  "asc",
              },
            },

            reminders: {
              orderBy: {
                sortOrder:
                  "asc",
              },
            },
          },
        });

      return NextResponse.json({
        step,
      });
    }

    /* ─────────────────────────────────────
       REOPEN
    ───────────────────────────────────── */

    const step =
      await prisma.postOpCaseStep.update({
        where: {
          id: stepId,
        },

        data: {
          completedAt:
            null,

          skippedAt:
            null,
        },

        select: {
          id: true,
          caseId: true,

          sourceTemplateStepId:
            true,

          title: true,
          description: true,

          sortOrder: true,

          completionMode: true,

          startsAt: true,
          completesAt: true,

          completedAt: true,
          skippedAt: true,

          blocks: {
            orderBy: {
              sortOrder:
                "asc",
            },
          },

          reminders: {
            orderBy: {
              sortOrder:
                "asc",
            },
          },
        },
      });

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
      "Failed to update PostOp case step:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Failed to update PostOp case step.",
      },
      {
        status: 500,
      },
    );
  }
}