import {
  NextResponse,
} from "next/server";

import { prisma } from "@/lib/database/prisma";

import {
  requireDoctorPostOpCaseAccess,
} from "@/lib/post-op/authorization";

import {
  handlePostOpAuthorizationError,
} from "@/lib/post-op/authorization-response";

import {
  createPostOpInvitationToken,
  getPostOpInvitationExpiry,
  getPostOpInvitationUrl,
  sendPostOpInvitationEmail,
} from "@/lib/post-op/invitations";

type RouteContext = {
  params: Promise<{
    caseId: string;
  }>;
};

export async function POST(
  _request: Request,
  context: RouteContext,
) {
  try {
    const { caseId } =
      await context.params;

    await requireDoctorPostOpCaseAccess(
      caseId,
    );

    const postOpCase =
      await prisma.postOpCase.findUnique({
        where: {
          id: caseId,
        },

        select: {
          id: true,

          status: true,

          patientUserId:
            true,

          patientName: true,
          patientEmail: true,

          localeCode: true,

          procedurePerformedAt:
            true,

          doctorProfile: {
            select: {
              clinicName: true,

              user: {
                select: {
                  name: true,
                },
              },
            },
          },

          procedure: {
            select: {
              translations: {
                where: {
                  localeCode: {
                    in: [
                      "en",
                      "fr",
                    ],
                  },
                },

                select: {
                  localeCode:
                    true,

                  name: true,
                },
              },
            },
          },

          invitation: {
            select: {
              id: true,

              usedAt: true,
              revokedAt: true,
            },
          },
        },
      });

    if (!postOpCase) {
      return NextResponse.json(
        {
          error:
            "PostOp case not found.",
        },
        {
          status: 404,
        },
      );
    }

    if (
      postOpCase.status ===
      "CANCELLED"
    ) {
      return NextResponse.json(
        {
          error:
            "A cancelled PostOp case cannot be resent.",
        },
        {
          status: 409,
        },
      );
    }

    if (
      !postOpCase.invitation
    ) {
      return NextResponse.json(
        {
          error:
            "PostOp invitation not found.",
        },
        {
          status: 404,
        },
      );
    }

    if (
      postOpCase.invitation.usedAt
    ) {
      return NextResponse.json(
        {
          error:
            "This invitation has already been claimed.",
        },
        {
          status: 409,
        },
      );
    }

    const {
      rawToken,
      tokenHash,
    } =
      createPostOpInvitationToken();

    const expiresAt =
      getPostOpInvitationExpiry();

    /*
     * Replace the previous hash.
     *
     * This automatically makes every
     * previous invitation URL invalid.
     */
    const invitation =
      await prisma.postOpInvitation.update({
        where: {
          id:
            postOpCase.invitation.id,
        },

        data: {
          tokenHash,

          expiresAt,

          revokedAt:
            null,

          openedAt:
            null,

          sentAt:
            null,
        },

        select: {
          id: true,
        },
      });

    const procedureName =
      postOpCase.procedure.translations.find(
        (translation) =>
          translation.localeCode ===
          postOpCase.localeCode,
      )?.name ??
      postOpCase.procedure.translations.find(
        (translation) =>
          translation.localeCode ===
          "en",
      )?.name ??
      "Procedure";

    const doctorName =
      postOpCase.doctorProfile.user.name ??
      postOpCase.doctorProfile.clinicName;

    const invitationUrl =
      getPostOpInvitationUrl({
        rawToken,

        localeCode:
          postOpCase.localeCode,
      });

    try {
      await sendPostOpInvitationEmail({
        recipientName:
          postOpCase.patientName,

        recipientEmail:
          postOpCase.patientEmail,

        registeredPatient:
          Boolean(
            postOpCase.patientUserId,
          ),

        doctorName,

        procedureName,

        procedurePerformedAt:
          postOpCase.procedurePerformedAt,

        invitationUrl,

        expiresAt,

        localeCode:
          postOpCase.localeCode,
      });

      await prisma.postOpInvitation.update({
        where: {
          id:
            invitation.id,
        },

        data: {
          sentAt:
            new Date(),
        },
      });

      return NextResponse.json({
        success: true,

        emailSent: true,

        expiresAt,
      });
    } catch (emailError) {
      console.error(
        "PostOp invitation resend failed:",
        emailError,
      );

      /*
       * New hash remains valid.
       * sentAt remains null.
       *
       * The case itself is untouched.
       */
      return NextResponse.json(
        {
          success: true,

          emailSent: false,

          warning:
            "The invitation was renewed, but the email could not be sent.",

          expiresAt,
        },
        {
          status: 200,
        },
      );
    }
  } catch (error) {
    const authResponse =
      handlePostOpAuthorizationError(
        error,
      );

    if (authResponse) {
      return authResponse;
    }

    console.error(
      "Failed to resend PostOp invitation:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Failed to resend invitation.",
      },
      {
        status: 500,
      },
    );
  }
}