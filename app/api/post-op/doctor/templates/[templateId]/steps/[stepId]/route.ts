import {
  type NextRequest,
  NextResponse,
} from "next/server";

import { prisma } from "@/lib/database/prisma";

import {
  handlePostOpAuthorizationError,
} from "@/lib/post-op/authorization-response";

import {
  requireDoctorOffersProcedure,
  requireDoctorOwnedPostOpTemplate,
  requirePostOpDoctorActor,
} from "@/lib/post-op/doctor-templates";

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

async function requireTemplateAccess(
  templateId: string,
) {
  const {
    doctorProfile,
  } =
    await requirePostOpDoctorActor();

  const template =
    await requireDoctorOwnedPostOpTemplate({
      doctorProfileId:
        doctorProfile.id,

      templateId,
    });

  await requireDoctorOffersProcedure(
    doctorProfile.id,
    template.procedureId,
  );

  return template;
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    const {
      templateId,
      stepId,
    } = await context.params;

    await requireTemplateAccess(
      templateId,
    );

    const existing =
      await prisma.postOpTemplateStep.findFirst({
        where: {
          id: stepId,
          templateId,
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

    const title =
      body.title !== undefined
        ? typeof body.title ===
          "string"
          ? body.title.trim()
          : ""
        : existing.title;

    if (!title) {
      return NextResponse.json(
        {
          error:
            "Step title is required.",
        },
        {
          status: 400,
        },
      );
    }

    const description =
      body.description !== undefined
        ? body.description === null
          ? null
          : typeof body.description ===
              "string"
            ? body.description.trim()
            : null
        : existing.description;

    const completionMode =
      body.completionMode !==
      undefined
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

    if (
      body.completionMode ===
        "MANUAL" &&
      body.completesAfterHours ===
        undefined
    ) {
      completesAfterHours = null;
    }

    const validation =
      validatePostOpCompletionConfig({
        completionMode,
        startsAfterHours,
        completesAfterHours,
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
      "Failed to update doctor PostOp step:",
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

export async function DELETE(
  _request: NextRequest,
  context: RouteContext,
) {
  try {
    const {
      templateId,
      stepId,
    } = await context.params;

    await requireTemplateAccess(
      templateId,
    );

    const step =
      await prisma.postOpTemplateStep.findFirst({
        where: {
          id: stepId,
          templateId,
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

    await prisma.$transaction(
      async (tx) => {
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
      "Failed to delete doctor PostOp step:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Failed to delete PostOp step.",
      },
      {
        status: 500,
      },
    );
  }
}