import {
  type NextRequest,
  NextResponse,
} from "next/server";

import { prisma } from "@/lib/database/prisma";

import {
  requireDoctorPostOpCaseAccess,
} from "@/lib/post-op/authorization";

import {
  handlePostOpAuthorizationError,
} from "@/lib/post-op/authorization-response";


import {
  requirePostOpAdmin,
} from "@/lib/post-op/authorization";


import {
  validatePostOpCompletionConfig,
} from "@/lib/post-op/completion";

import {
  postOpTemplateStepSelect,
} from "@/lib/post-op/selects";


type RouteContext = {
  params: Promise<{
    caseId: string;
    stepId: string;
  }>;
};

type StepAction =
  | "COMPLETE"
  | "REOPEN";

export async function PATCH(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    const {
      caseId,
      stepId,
    } = await context.params;

    /*
     * First prove that this doctor owns
     * the PostOp case.
     */
    await requireDoctorPostOpCaseAccess(
      caseId,
    );

    const step =
      await prisma.postOpCaseStep.findFirst({
        where: {
          id: stepId,
          caseId,
        },

        select: {
          id: true,

          caseId: true,

          completionMode: true,

          startsAt: true,
          completesAt: true,

          completedAt: true,
          skippedAt: true,
        },
      });

    if (!step) {
      return NextResponse.json(
        {
          error:
            "PostOp step not found.",
        },
        {
          status: 404,
        },
      );
    }

    /*
     * TIME_BASED steps are calculated
     * automatically.
     *
     * They should not normally be manually
     * completed.
     */
    if (
      step.completionMode !==
      "MANUAL"
    ) {
      return NextResponse.json(
        {
          error:
            "Only MANUAL PostOp steps can be manually completed.",
        },
        {
          status: 400,
        },
      );
    }

    const body =
      await request.json();

    const action =
      body.action as StepAction;

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

    if (
      action === "COMPLETE" &&
      step.skippedAt
    ) {
      return NextResponse.json(
        {
          error:
            "A skipped step cannot be completed.",
        },
        {
          status: 409,
        },
      );
    }

    const updatedStep =
      await prisma.postOpCaseStep.update({
        where: {
          id: step.id,
        },

        data:
          action === "COMPLETE"
            ? {
                completedAt:
                  new Date(),
              }
            : {
                completedAt:
                  null,
              },

        select: {
          id: true,

          caseId: true,

          title: true,

          completionMode: true,

          startsAt: true,
          completesAt: true,

          completedAt: true,
          skippedAt: true,

          sortOrder: true,
        },
      });

    return NextResponse.json({
      step: updatedStep,
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
      "Failed to update PostOp step:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Failed to update PostOp step.",
      },
      {
        status: 500,
      },
    );
  }
}
