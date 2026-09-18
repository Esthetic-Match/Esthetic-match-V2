import {
  type NextRequest,
  NextResponse,
} from "next/server";

import { prisma } from "@/lib/database/prisma";

import {
  handlePostOpAuthorizationError,
} from "@/lib/post-op/authorization-response";

import {
  getDoctorPostOpTemplateKey,
  requireDoctorOffersProcedure,
  requirePostOpDoctorActor,
} from "@/lib/post-op/doctor-templates";

import {
  postOpTemplateSelect,
} from "@/lib/post-op/selects";

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

    await requireDoctorOffersProcedure(
      doctorProfile.id,
      procedureId,
    );

    const existing =
      await prisma.postOpTemplate.findFirst({
        where: {
          doctorProfileId:
            doctorProfile.id,

          procedureId,

          localeCode,

          scope: "DOCTOR",
        },

        select:
          postOpTemplateSelect,
      });

    if (existing) {
      return NextResponse.json({
        template: existing,
        created: false,
      });
    }

    const locale =
      await prisma.catalogLocale.findFirst({
        where: {
          code: localeCode,
          isActive: true,
        },

        select: {
          code: true,
        },
      });

    if (!locale) {
      return NextResponse.json(
        {
          error:
            "Locale not found.",
        },
        {
          status: 404,
        },
      );
    }

    const procedure =
      await prisma.procedure.findUnique({
        where: {
          id: procedureId,
        },

        select: {
          id: true,

          translations: {
            where: {
              localeCode: {
                in: [
                  localeCode,
                  "en",
                ],
              },
            },

            select: {
              localeCode: true,
              name: true,
            },
          },
        },
      });

    if (!procedure) {
      return NextResponse.json(
        {
          error:
            "Procedure not found.",
        },
        {
          status: 404,
        },
      );
    }

    const localizedName =
      procedure.translations.find(
        (translation) =>
          translation.localeCode ===
          localeCode,
      )?.name ??
      procedure.translations.find(
        (translation) =>
          translation.localeCode ===
          "en",
      )?.name ??
      procedure.id;

    const templateKey =
      getDoctorPostOpTemplateKey({
        doctorProfileId:
          doctorProfile.id,

        procedureId,

        localeCode,
      });

    const template =
      await prisma.postOpTemplate.create({
        data: {
          templateKey,

          procedureId,
          localeCode,

          scope: "DOCTOR",

          doctorProfileId:
            doctorProfile.id,

          sourceTemplateId:
            null,

          title: `${localizedName} recovery plan`,

          description:
            null,

          version: 1,

          isActive: true,
        },

        select:
          postOpTemplateSelect,
      });

    return NextResponse.json(
      {
        template,
        created: true,
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
      "Failed to create blank doctor PostOp template:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Failed to create recovery template.",
      },
      {
        status: 500,
      },
    );
  }
}