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
  }>;
};

type CompletionMode =
  | "TIME_BASED"
  | "MANUAL";

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

  return {
    doctorProfile,
    template,
  };
}

/* ═══════════════════════════════════════════════════════════════
   GET
═══════════════════════════════════════════════════════════════ */

export async function GET(
  _request: NextRequest,
  context: RouteContext,
) {
  try {
    const { templateId } =
      await context.params;

    await requireTemplateAccess(
      templateId,
    );

    const steps =
      await prisma.postOpTemplateStep.findMany({
        where: {
          templateId,
        },

        select:
          postOpTemplateStepSelect,

        orderBy: {
          sortOrder: "asc",
        },
      });

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
      "Failed to load doctor PostOp template steps:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Failed to load PostOp template steps.",
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
    const { templateId } =
      await context.params;

    await requireTemplateAccess(
      templateId,
    );

    const body =
      await request.json();

    const title =
      typeof body.title === "string"
        ? body.title.trim()
        : "";

    const description =
      typeof body.description ===
      "string"
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

    const rawCompletionMode =
      body.completionMode ??
      "MANUAL";

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

    const startsAfterHours =
      body.startsAfterHours ?? 0;

    const completesAfterHours =
      body.completesAfterHours ===
        null ||
      body.completesAfterHours ===
        undefined
        ? null
        : body.completesAfterHours;

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
        await prisma.postOpTemplateStep.findFirst({
          where: {
            templateId,
          },

          select: {
            sortOrder: true,
          },

          orderBy: {
            sortOrder: "desc",
          },
        });

      sortOrder =
        (lastStep?.sortOrder ??
          0) + 1;
    }

    const step =
      await prisma.$transaction(
        async (tx) => {
          const created =
            await tx.postOpTemplateStep.create({
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
      "Failed to create doctor PostOp template step:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Failed to create PostOp template step.",
      },
      {
        status: 500,
      },
    );
  }
}