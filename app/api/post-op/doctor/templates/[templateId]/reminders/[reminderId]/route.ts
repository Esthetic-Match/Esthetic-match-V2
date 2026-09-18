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
  validatePostOpTemplateReminder,
  type PostOpReminderType,
} from "@/lib/post-op/reminders";

import {
  postOpTemplateReminderSelect,
} from "@/lib/post-op/selects";

import {
  incrementPostOpTemplateVersion,
} from "@/lib/post-op/template-version";

type RouteContext = {
  params: Promise<{
    templateId: string;
    reminderId: string;
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
      reminderId,
    } = await context.params;

    await requireTemplateAccess(
      templateId,
    );

    const existing =
      await prisma.postOpTemplateReminder.findFirst({
        where: {
          id: reminderId,
          templateId,
        },

        select:
          postOpTemplateReminderSelect,
      });

    if (!existing) {
      return NextResponse.json(
        {
          error:
            "PostOp reminder not found.",
        },
        {
          status: 404,
        },
      );
    }

    const body =
      await request.json();

    let stepId =
      existing.stepId;

    if (
      Object.prototype.hasOwnProperty.call(
        body,
        "stepId",
      )
    ) {
      stepId =
        typeof body.stepId ===
          "string" &&
        body.stepId.trim()
          ? body.stepId.trim()
          : null;
    }

    if (stepId) {
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
    }

    const type =
      (body.type ??
        existing.type) as PostOpReminderType;

    const text =
      body.text !== undefined
        ? typeof body.text ===
          "string"
          ? body.text.trim()
          : ""
        : existing.text;

    const startsAfterHours =
      body.startsAfterHours !==
      undefined
        ? body.startsAfterHours
        : existing.startsAfterHours;

    const endsAfterHours =
      body.endsAfterHours !==
      undefined
        ? body.endsAfterHours
        : existing.endsAfterHours;

    const notificationsEnabled =
      body.notificationsEnabled !==
      undefined
        ? body.notificationsEnabled
        : existing.notificationsEnabled;

    const repeatEveryHours =
      body.repeatEveryHours !==
      undefined
        ? body.repeatEveryHours
        : existing.repeatEveryHours;

    const isPinned =
      body.isPinned !== undefined
        ? body.isPinned
        : existing.isPinned;

    const sortOrder =
      body.sortOrder !== undefined
        ? body.sortOrder
        : existing.sortOrder;

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

    const reminder =
      await prisma.$transaction(
        async (tx) => {
          const updated =
            await tx.postOpTemplateReminder.update({
              where: {
                id: reminderId,
              },

              data: {
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
            });

          await incrementPostOpTemplateVersion(
            tx,
            templateId,
          );

          return updated;
        },
      );

    return NextResponse.json({
      reminder,
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
      "Failed to update doctor PostOp reminder:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Failed to update PostOp reminder.",
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
      reminderId,
    } = await context.params;

    await requireTemplateAccess(
      templateId,
    );

    const existing =
      await prisma.postOpTemplateReminder.findFirst({
        where: {
          id: reminderId,
          templateId,
        },

        select: {
          id: true,
        },
      });

    if (!existing) {
      return NextResponse.json(
        {
          error:
            "PostOp reminder not found.",
        },
        {
          status: 404,
        },
      );
    }

    await prisma.$transaction(
      async (tx) => {
        await tx.postOpTemplateReminder.delete({
          where: {
            id: reminderId,
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
      "Failed to delete doctor PostOp reminder:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Failed to delete PostOp reminder.",
      },
      {
        status: 500,
      },
    );
  }
}