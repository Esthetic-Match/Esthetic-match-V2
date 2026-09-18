import {
  type NextRequest,
  NextResponse,
} from "next/server";

import {
  handlePostOpAuthorizationError,
} from "@/lib/post-op/authorization-response";

import {
  createDoctorPostOpTemplateFromDefault,
  requirePostOpDoctorActor,
} from "@/lib/post-op/doctor-templates";

export async function POST(
  request: NextRequest,
) {
  try {
    const {
      doctorProfile,
    } =
      await requirePostOpDoctorActor();

    const body =
      await request.json();

    const procedureId =
      typeof body.procedureId ===
      "string"
        ? body.procedureId.trim()
        : "";

    const localeCode =
      typeof body.localeCode ===
      "string"
        ? body.localeCode
            .trim()
            .toLowerCase()
        : "";

    if (
      !procedureId ||
      !localeCode
    ) {
      return NextResponse.json(
        {
          error:
            "procedureId and localeCode are required.",
        },
        {
          status: 400,
        },
      );
    }

    const result =
      await createDoctorPostOpTemplateFromDefault(
        {
          doctorProfileId:
            doctorProfile.id,

          procedureId,

          localeCode,
        },
      );

    return NextResponse.json(
      result,
      {
        status:
          result.created
            ? 201
            : 200,
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
      "Failed to customize PostOp template:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Failed to customize PostOp template.",
      },
      {
        status: 500,
      },
    );
  }
}