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
  validatePostOpBlock,
  type PostOpBlockType,
  type PostOpBookingType,
} from "@/lib/post-op/blocks";

import {
  postOpTemplateBlockSelect,
} from "@/lib/post-op/selects";

import {
  incrementPostOpTemplateVersion,
} from "@/lib/post-op/template-version";

type RouteContext = {
  params: Promise<{
    templateId: string;
    stepId: string;
    blockId: string;
  }>;
};

async function requireBlockAccess({
  templateId,
  stepId,
  blockId,
}: {
  templateId: string;
  stepId: string;
  blockId: string;
}) {
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

  return prisma.postOpTemplateBlock.findFirst({
    where: {
      id: blockId,

      stepId,

      step: {
        templateId,
      },
    },

    select:
      postOpTemplateBlockSelect,
  });
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    const {
      templateId,
      stepId,
      blockId,
    } = await context.params;

    const existing =
      await requireBlockAccess({
        templateId,
        stepId,
        blockId,
      });

    if (!existing) {
      return NextResponse.json(
        {
          error:
            "PostOp block not found.",
        },
        {
          status: 404,
        },
      );
    }

    const body =
      await request.json();

    const type =
      (body.type ??
        existing.type) as PostOpBlockType;

    const text =
      body.text !== undefined
        ? typeof body.text ===
          "string"
          ? body.text.trim()
          : null
        : existing.text;

    const objectPath =
      body.objectPath !== undefined
        ? typeof body.objectPath ===
          "string"
          ? body.objectPath.trim()
          : null
        : existing.objectPath;

    const externalUrl =
      body.externalUrl !== undefined
        ? typeof body.externalUrl ===
          "string"
          ? body.externalUrl.trim()
          : null
        : existing.externalUrl;

    const mediaAlt =
      body.mediaAlt !== undefined
        ? typeof body.mediaAlt ===
          "string"
          ? body.mediaAlt.trim()
          : null
        : existing.mediaAlt;

    const bookingType =
      (body.bookingType !==
      undefined
        ? body.bookingType
        : existing.bookingType) as
        | PostOpBookingType
        | null;

    const bookingUrl =
      body.bookingUrl !== undefined
        ? typeof body.bookingUrl ===
          "string"
          ? body.bookingUrl.trim()
          : null
        : existing.bookingUrl;

    const buttonLabel =
      body.buttonLabel !== undefined
        ? typeof body.buttonLabel ===
          "string"
          ? body.buttonLabel.trim()
          : null
        : existing.buttonLabel;

    const sortOrder =
      body.sortOrder !== undefined
        ? body.sortOrder
        : existing.sortOrder;

    const validation =
      validatePostOpBlock({
        type,

        text,

        objectPath,

        externalUrl,

        mediaAlt,

        bookingType,

        bookingUrl,

        buttonLabel,
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

    const block =
      await prisma.$transaction(
        async (tx) => {
          const updated =
            await tx.postOpTemplateBlock.update({
              where: {
                id: blockId,
              },

              data: {
                type,

                text:
                  type === "TEXT"
                    ? text
                    : null,

                objectPath:
                  type === "IMAGE" ||
                  type === "VIDEO"
                    ? objectPath
                    : null,

                externalUrl:
                  type === "IMAGE" ||
                  type === "VIDEO"
                    ? externalUrl
                    : null,

                mediaAlt:
                  type === "IMAGE" ||
                  type === "VIDEO"
                    ? mediaAlt
                    : null,

                bookingType:
                  type === "BOOKING"
                    ? bookingType
                    : null,

                bookingUrl:
                  type === "BOOKING"
                    ? bookingUrl
                    : null,

                buttonLabel:
                  type === "BOOKING"
                    ? buttonLabel
                    : null,

                sortOrder,
              },

              select:
                postOpTemplateBlockSelect,
            });

          await incrementPostOpTemplateVersion(
            tx,
            templateId,
          );

          return updated;
        },
      );

    return NextResponse.json({
      block,
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
      "Failed to update doctor PostOp block:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Failed to update PostOp block.",
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
      blockId,
    } = await context.params;

    const block =
      await requireBlockAccess({
        templateId,
        stepId,
        blockId,
      });

    if (!block) {
      return NextResponse.json(
        {
          error:
            "PostOp block not found.",
        },
        {
          status: 404,
        },
      );
    }

    await prisma.$transaction(
      async (tx) => {
        await tx.postOpTemplateBlock.delete({
          where: {
            id: blockId,
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
      "Failed to delete doctor PostOp block:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Failed to delete PostOp block.",
      },
      {
        status: 500,
      },
    );
  }
}