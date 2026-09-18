import {
  NextResponse,
} from "next/server";

import {
  handlePostOpAuthorizationError,
} from "@/lib/post-op/authorization-response";

import {
  requirePostOpDoctorActor,
  resetDoctorPostOpTemplate,
} from "@/lib/post-op/doctor-templates";

type RouteContext = {
  params: Promise<{
    templateId: string;
  }>;
};

export async function POST(
  _request: Request,
  context: RouteContext,
) {
  try {
    const {
      doctorProfile,
    } =
      await requirePostOpDoctorActor();

    const { templateId } =
      await context.params;

    const result =
      await resetDoctorPostOpTemplate({
        doctorProfileId:
          doctorProfile.id,

        templateId,
      });

    return NextResponse.json({
      success: true,

      template:
        result.template,

      source:
        result.source,

      customized:
        result.customized,
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
      "Failed to reset PostOp template:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Failed to reset PostOp template.",
      },
      {
        status: 500,
      },
    );
  }
}