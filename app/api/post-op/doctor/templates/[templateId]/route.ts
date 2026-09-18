import {
  type NextRequest,
  NextResponse,
} from "next/server";

import { prisma } from "@/lib/database/prisma";

import {
  handlePostOpAuthorizationError,
} from "@/lib/post-op/authorization-response";

import {
  requireDoctorOwnedPostOpTemplate,
  requirePostOpDoctorActor,
} from "@/lib/post-op/doctor-templates";

import {
  postOpTemplateSelect,
} from "@/lib/post-op/selects";

import {
  incrementPostOpTemplateVersion,
} from "@/lib/post-op/template-version";

type RouteContext = {
  params: Promise<{
    templateId: string;
  }>;
};

export async function GET(
  _request: NextRequest,
  context: RouteContext,
) {
  try {
    const {
      doctorProfile,
    } =
      await requirePostOpDoctorActor();

    const { templateId } =
      await context.params;

    const template =
      await requireDoctorOwnedPostOpTemplate({
        doctorProfileId:
          doctorProfile.id,

        templateId,
      });

    return NextResponse.json({
      template,
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
          "Failed to load doctor PostOp template.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    const {
      doctorProfile,
    } =
      await requirePostOpDoctorActor();

    const { templateId } =
      await context.params;

    await requireDoctorOwnedPostOpTemplate({
      doctorProfileId:
        doctorProfile.id,

      templateId,
    });

    const body =
      await request.json();

    const hasTitle =
      Object.prototype.hasOwnProperty.call(
        body,
        "title",
      );

    const hasDescription =
      Object.prototype.hasOwnProperty.call(
        body,
        "description",
      );

    if (
      !hasTitle &&
      !hasDescription
    ) {
      return NextResponse.json(
        {
          error:
            "No supported fields supplied.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      hasTitle &&
      (typeof body.title !==
        "string" ||
        !body.title.trim())
    ) {
      return NextResponse.json(
        {
          error:
            "title must be a non-empty string.",
        },
        {
          status: 400,
        },
      );
    }

    const template =
      await prisma.$transaction(
        async (tx) => {
          await tx.postOpTemplate.update({
            where: {
              id: templateId,
            },

            data: {
              ...(hasTitle
                ? {
                    title:
                      body.title.trim(),
                  }
                : {}),

              ...(hasDescription
                ? {
                    description:
                      body.description ===
                      null
                        ? null
                        : typeof body.description ===
                            "string"
                          ? body.description.trim()
                          : null,
                  }
                : {}),
            },
          });

          await incrementPostOpTemplateVersion(
            tx,
            templateId,
          );

          return tx.postOpTemplate.findUniqueOrThrow(
            {
              where: {
                id: templateId,
              },

              select:
                postOpTemplateSelect,
            },
          );
        },
      );

    return NextResponse.json({
      template,
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
      "Failed to update doctor PostOp template:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Failed to update doctor PostOp template.",
      },
      {
        status: 500,
      },
    );
  }
}