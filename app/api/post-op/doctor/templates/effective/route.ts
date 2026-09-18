import {
  type NextRequest,
  NextResponse,
} from "next/server";

import {
  handlePostOpAuthorizationError,
} from "@/lib/post-op/authorization-response";

import {
  getEffectiveDoctorPostOpTemplate,
  requirePostOpDoctorActor,
} from "@/lib/post-op/doctor-templates";

export async function GET(
  request: NextRequest,
) {
  try {
    const {
      doctorProfile,
    } =
      await requirePostOpDoctorActor();

    const procedureId =
      request.nextUrl.searchParams.get(
        "procedureId",
      );

    const localeCode =
      request.nextUrl.searchParams.get(
        "localeCode",
      );

    if (!procedureId) {
      return NextResponse.json(
        {
          error:
            "procedureId is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!localeCode) {
      return NextResponse.json(
        {
          error:
            "localeCode is required.",
        },
        {
          status: 400,
        },
      );
    }

    const result =
      await getEffectiveDoctorPostOpTemplate({
        doctorProfileId:
          doctorProfile.id,

        procedureId,

        localeCode,
      });

    return NextResponse.json(
      result,
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
      "Failed to resolve effective PostOp template:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Failed to resolve PostOp template.",
      },
      {
        status: 500,
      },
    );
  }
}