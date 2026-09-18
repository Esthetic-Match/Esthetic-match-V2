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

export async function GET(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    const { templateId } =
      await context.params;

    await requireTemplateAccess(
      templateId,
    );

    const stepId =
      request.nextUrl.searchParams.get(
        "stepId",
      );

    const scope =
      request.nextUrl.searchParams.get(
        "scope",
      );

    const reminders =
      await prisma.postOpTemplateReminder.findMany({
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

        orderBy: {
          sortOrder: "asc",
        },
      });

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

export async function POST(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    const { templateId } =
      await context.params;

    await requireTemplateAccess(
      templateId,
    );

    const body =
      await request.json();

    const stepId =
      typeof body.stepId ===
        "string" &&
      body.stepId.trim()
        ? body.stepId.trim()
        : null;

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
      body.type as PostOpReminderType;

    const text =
      typeof body.text === "string"
        ? body.text.trim()
        : "";

    const startsAfterHours =
      body.startsAfterHours ?? 0;

    const endsAfterHours =
      body.endsAfterHours ===
        null ||
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
      body.repeatEveryHours ===
        null ||
      body.repeatEveryHours ===
        undefined
        ? null
        : body.repeatEveryHours;

    const isPinned =
      typeof body.isPinned ===
      "boolean"
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
      const last =
        await prisma.postOpTemplateReminder.findFirst({
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
        });

      sortOrder =
        (last?.sortOrder ?? 0) +
        1;
    }

    const reminder =
      await prisma.$transaction(
        async (tx) => {
          const created =
            await tx.postOpTemplateReminder.create({
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
            });

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
      "Failed to create doctor PostOp reminder:",
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