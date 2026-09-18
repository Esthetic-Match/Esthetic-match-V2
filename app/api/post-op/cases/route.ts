import {
  type NextRequest,
  NextResponse,
} from "next/server";

import { prisma } from "@/lib/database/prisma";

import {
  handlePostOpAuthorizationError,
} from "@/lib/post-op/authorization-response";

import {
  getEffectiveDoctorPostOpTemplate,
  requireDoctorOffersProcedure,
  requirePostOpDoctorActor,
} from "@/lib/post-op/doctor-templates";

import {
  createPostOpInvitationToken,
  getPostOpInvitationExpiry,
  getPostOpInvitationUrl,
  sendPostOpInvitationEmail,
} from "@/lib/post-op/invitations";

/* ═══════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════ */

function addHours(
  base: Date,
  hours: number,
) {
  return new Date(
    base.getTime() +
      hours *
        60 *
        60 *
        1000,
  );
}

function normalizeEmail(
  value: string,
) {
  return value
    .trim()
    .toLowerCase();
}

function isValidEmail(
  value: string,
) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    value,
  );
}

/* ═══════════════════════════════════════════════════════════════
   POST
═══════════════════════════════════════════════════════════════ */

export async function POST(
  request: NextRequest,
) {
  try {
    /* ─────────────────────────────────────
       AUTHENTICATED DOCTOR
    ───────────────────────────────────── */

    const {
      doctorProfile,
    } =
      await requirePostOpDoctorActor();

    const body =
      await request.json();

    /* ─────────────────────────────────────
       INPUT
    ───────────────────────────────────── */

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

    const requestedPatientUserId =
      typeof body.patientUserId ===
        "string" &&
      body.patientUserId.trim()
        ? body.patientUserId.trim()
        : null;

    const requestedPatientName =
      typeof body.patientName ===
      "string"
        ? body.patientName.trim()
        : "";

    const requestedPatientEmail =
      typeof body.patientEmail ===
      "string"
        ? normalizeEmail(
            body.patientEmail,
          )
        : "";

    const procedurePerformedAt =
      new Date(
        body.procedurePerformedAt,
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

    if (
      Number.isNaN(
        procedurePerformedAt.getTime(),
      )
    ) {
      return NextResponse.json(
        {
          error:
            "procedurePerformedAt must be a valid date.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      !requestedPatientUserId &&
      !requestedPatientName
    ) {
      return NextResponse.json(
        {
          error:
            "patientName is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      !requestedPatientUserId &&
      !isValidEmail(
        requestedPatientEmail,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "A valid patientEmail is required.",
        },
        {
          status: 400,
        },
      );
    }

    /* ─────────────────────────────────────
       PROCEDURE OWNERSHIP
    ───────────────────────────────────── */

    await requireDoctorOffersProcedure(
      doctorProfile.id,
      procedureId,
    );

    /* ─────────────────────────────────────
       RESOLVE PATIENT
    ───────────────────────────────────── */

    let patientUser:
      | {
          id: string;
          name: string | null;
          email: string;
        }
      | null = null;

    /*
     * Path 1:
     * doctor selected an existing patient.
     */
    if (
      requestedPatientUserId
    ) {
      patientUser =
        await prisma.user.findFirst({
          where: {
            id:
              requestedPatientUserId,

            role:
              "PATIENT",
          },

          select: {
            id: true,
            name: true,
            email: true,
          },
        });

      if (!patientUser) {
        return NextResponse.json(
          {
            error:
              "Selected patient was not found.",
          },
          {
            status: 404,
          },
        );
      }
    }

    /*
     * Path 2:
     * manual patient was entered, but that
     * email may already belong to a patient.
     */
    if (
      !patientUser &&
      requestedPatientEmail
    ) {
      patientUser =
        await prisma.user.findFirst({
          where: {
            role:
              "PATIENT",

            email: {
              equals:
                requestedPatientEmail,

              mode:
                "insensitive",
            },
          },

          select: {
            id: true,
            name: true,
            email: true,
          },
        });
    }

    /*
     * Always snapshot patient name/email.
     */
    const patientUserId =
      patientUser?.id ??
      null;

    const patientName =
      patientUser?.name?.trim() ||
      requestedPatientName;

    const patientEmail =
      normalizeEmail(
        patientUser?.email ??
          requestedPatientEmail,
      );

    if (!patientName) {
      return NextResponse.json(
        {
          error:
            "Patient name is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      !isValidEmail(
        patientEmail,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "A valid patient email is required.",
        },
        {
          status: 400,
        },
      );
    }

    /* ─────────────────────────────────────
       EFFECTIVE TEMPLATE
    ───────────────────────────────────── */

    const effective =
      await getEffectiveDoctorPostOpTemplate(
        {
          doctorProfileId:
            doctorProfile.id,

          procedureId,

          localeCode,
        },
      );

    if (
      !effective.template
    ) {
      return NextResponse.json(
        {
          error:
            "No PostOp recovery template exists for this procedure.",
        },
        {
          status: 409,
        },
      );
    }

    /*
     * Fetch the exact source again with all
     * snapshot data explicitly selected.
     *
     * We also fetch the localized procedure
     * name here for the invitation email.
     */
    const sourceTemplate =
      await prisma.postOpTemplate.findUnique(
        {
          where: {
            id:
              effective.template.id,
          },

          select: {
            id: true,
            version: true,
            procedureId: true,
            localeCode: true,

            procedure: {
              select: {
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
            },

            steps: {
              orderBy: {
                sortOrder:
                  "asc",
              },

              select: {
                id: true,

                title: true,
                description: true,

                startsAfterHours:
                  true,

                completesAfterHours:
                  true,

                completionMode:
                  true,

                sortOrder: true,

                blocks: {
                  orderBy: {
                    sortOrder:
                      "asc",
                  },

                  select: {
                    type: true,

                    text: true,

                    objectPath:
                      true,

                    externalUrl:
                      true,

                    mediaAlt: true,

                    bookingType:
                      true,

                    bookingUrl:
                      true,

                    buttonLabel:
                      true,

                    sortOrder:
                      true,
                  },
                },
              },
            },

            reminders: {
              orderBy: {
                sortOrder:
                  "asc",
              },

              select: {
                stepId: true,

                type: true,
                text: true,

                startsAfterHours:
                  true,

                endsAfterHours:
                  true,

                notificationsEnabled:
                  true,

                repeatEveryHours:
                  true,

                isPinned: true,

                sortOrder: true,
              },
            },
          },
        },
      );

    if (!sourceTemplate) {
      return NextResponse.json(
        {
          error:
            "Recovery template no longer exists.",
        },
        {
          status: 409,
        },
      );
    }

    if (
      sourceTemplate.procedureId !==
      procedureId
    ) {
      return NextResponse.json(
        {
          error:
            "Recovery template does not match the selected procedure.",
        },
        {
          status: 409,
        },
      );
    }

    if (
      sourceTemplate.steps.length ===
      0
    ) {
      return NextResponse.json(
        {
          error:
            "Recovery template must contain at least one step.",
        },
        {
          status: 409,
        },
      );
    }

    /* ─────────────────────────────────────
       EMAIL CONTEXT
    ───────────────────────────────────── */

    const doctorEmailContext =
      await prisma.doctorProfile.findUnique({
        where: {
          id:
            doctorProfile.id,
        },

        select: {
          clinicName: true,

          user: {
            select: {
              name: true,
            },
          },
        },
      });

    if (!doctorEmailContext) {
      return NextResponse.json(
        {
          error:
            "Doctor profile not found.",
        },
        {
          status: 404,
        },
      );
    }

    const procedureName =
      sourceTemplate.procedure.translations.find(
        (translation) =>
          translation.localeCode ===
          localeCode,
      )?.name ??
      sourceTemplate.procedure.translations.find(
        (translation) =>
          translation.localeCode ===
          "en",
      )?.name ??
      "Procedure";

    const doctorName =
      doctorEmailContext.user.name?.trim() ||
      doctorEmailContext.clinicName;

    /* ─────────────────────────────────────
       INVITATION TOKEN

       Raw token exists only in memory.
       Database receives SHA-256 hash only.
    ───────────────────────────────────── */

    const {
      rawToken,
      tokenHash,
    } =
      createPostOpInvitationToken();

    const invitationExpiresAt =
      getPostOpInvitationExpiry();

    /* ═══════════════════════════════════════
       DATABASE TRANSACTION
    ═══════════════════════════════════════ */

    const created =
      await prisma.$transaction(
        async (tx) => {
          /* ───────────────────────────────
             CASE
          ─────────────────────────────── */

          const postOpCase =
            await tx.postOpCase.create(
              {
                data: {
                  doctorProfileId:
                    doctorProfile.id,

                  procedureId,

                  patientUserId,

                  patientName,
                  patientEmail,

                  localeCode,

                  sourceTemplateId:
                    sourceTemplate.id,

                  sourceTemplateVersion:
                    sourceTemplate.version,

                  procedurePerformedAt,

                  status:
                    "INVITED",
                },

                select: {
                  id: true,

                  doctorProfileId:
                    true,

                  procedureId:
                    true,

                  patientUserId:
                    true,

                  patientName:
                    true,

                  patientEmail:
                    true,

                  localeCode:
                    true,

                  sourceTemplateId:
                    true,

                  sourceTemplateVersion:
                    true,

                  procedurePerformedAt:
                    true,

                  status: true,

                  createdAt: true,
                },
              },
            );

          /*
           * Maps TEMPLATE STEP ID
           * → CASE STEP ID.
           *
           * Required for step reminders.
           */
          const stepIdMap =
            new Map<
              string,
              string
            >();

          /* ───────────────────────────────
             STEPS + BLOCKS
          ─────────────────────────────── */

          for (
            const sourceStep of
            sourceTemplate.steps
          ) {
            const startsAt =
              addHours(
                procedurePerformedAt,
                sourceStep.startsAfterHours,
              );

            const completesAt =
              sourceStep.completesAfterHours ===
              null
                ? null
                : addHours(
                    procedurePerformedAt,
                    sourceStep.completesAfterHours,
                  );

            const caseStep =
              await tx.postOpCaseStep.create(
                {
                  data: {
                    caseId:
                      postOpCase.id,

                    sourceTemplateStepId:
                      sourceStep.id,

                    title:
                      sourceStep.title,

                    description:
                      sourceStep.description,

                    sortOrder:
                      sourceStep.sortOrder,

                    completionMode:
                      sourceStep.completionMode,

                    startsAt,
                    completesAt,
                  },

                  select: {
                    id: true,
                  },
                },
              );

            stepIdMap.set(
              sourceStep.id,
              caseStep.id,
            );

            if (
              sourceStep.blocks
                .length > 0
            ) {
              await tx.postOpCaseBlock.createMany(
                {
                  data:
                    sourceStep.blocks.map(
                      (
                        block,
                      ) => ({
                        stepId:
                          caseStep.id,

                        type:
                          block.type,

                        text:
                          block.text,

                        objectPath:
                          block.objectPath,

                        externalUrl:
                          block.externalUrl,

                        mediaAlt:
                          block.mediaAlt,

                        bookingType:
                          block.bookingType,

                        bookingUrl:
                          block.bookingUrl,

                        buttonLabel:
                          block.buttonLabel,

                        sortOrder:
                          block.sortOrder,
                      }),
                    ),
                },
              );
            }
          }

          /* ───────────────────────────────
             REMINDERS
          ─────────────────────────────── */

          if (
            sourceTemplate.reminders
              .length > 0
          ) {
            const reminderData =
              sourceTemplate.reminders.map(
                (
                  reminder,
                ) => {
                  let caseStepId:
                    | string
                    | null = null;

                  if (
                    reminder.stepId
                  ) {
                    caseStepId =
                      stepIdMap.get(
                        reminder.stepId,
                      ) ??
                      null;

                    if (
                      !caseStepId
                    ) {
                      throw new Error(
                        `Could not map template reminder step ${reminder.stepId}.`,
                      );
                    }
                  }

                  const startsAt =
                    addHours(
                      procedurePerformedAt,
                      reminder.startsAfterHours,
                    );

                  const endsAt =
                    reminder.endsAfterHours ===
                    null
                      ? null
                      : addHours(
                          procedurePerformedAt,
                          reminder.endsAfterHours,
                        );

                  return {
                    caseId:
                      postOpCase.id,

                    stepId:
                      caseStepId,

                    type:
                      reminder.type,

                    text:
                      reminder.text,

                    startsAt,
                    endsAt,

                    notificationsEnabled:
                      reminder.notificationsEnabled,

                    repeatEveryHours:
                      reminder.repeatEveryHours,

                    /*
                     * Notification worker can
                     * pick this up when due.
                     */
                    nextNotificationAt:
                      reminder.notificationsEnabled
                        ? startsAt
                        : null,

                    lastNotificationAt:
                      null,

                    isPinned:
                      reminder.isPinned,

                    isActive:
                      true,

                    sortOrder:
                      reminder.sortOrder,
                  };
                },
              );

            await tx.postOpCaseReminder.createMany(
              {
                data:
                  reminderData,
              },
            );
          }

          /* ───────────────────────────────
             INVITATION
          ─────────────────────────────── */

          const invitation =
            await tx.postOpInvitation.create(
              {
                data: {
                  caseId:
                    postOpCase.id,

                  patientUserId,

                  recipientName:
                    patientName,

                  recipientEmail:
                    patientEmail,

                  tokenHash,

                  expiresAt:
                    invitationExpiresAt,
                },

                select: {
                  id: true,
                  caseId: true,

                  recipientName:
                    true,

                  recipientEmail:
                    true,

                  expiresAt:
                    true,

                  sentAt:
                    true,
                },
              },
            );

          return {
            case:
              postOpCase,

            invitation,
          };
        },
      );

    /* ═══════════════════════════════════════
       EMAIL

       IMPORTANT:
       transaction is already committed.

       Email failure therefore cannot roll back
       or corrupt the PostOp case.
    ═══════════════════════════════════════ */

    let emailSent =
      false;

    let emailError:
      | string
      | null = null;

    try {
      const invitationUrl =
        getPostOpInvitationUrl({
          rawToken,
          localeCode,
        });

      await sendPostOpInvitationEmail({
        recipientName:
          patientName,

        recipientEmail:
          patientEmail,

        /*
         * patientUserId means either:
         *
         * - doctor selected an existing patient
         * - manual email matched an existing
         *   PATIENT account.
         */
        registeredPatient:
          Boolean(
            patientUserId,
          ),

        doctorName,

        procedureName,

        procedurePerformedAt,

        invitationUrl,

        expiresAt:
          invitationExpiresAt,

        localeCode,
      });

      emailSent =
        true;

      /*
       * sentAt is updated only AFTER the
       * mail provider confirms success.
       */
      try {
        await prisma.postOpInvitation.update(
          {
            where: {
              id:
                created.invitation.id,
            },

            data: {
              sentAt:
                new Date(),
            },
          },
        );
      } catch (
        sentAtError
      ) {
        /*
         * Email actually went out.
         * Do not report it as failed just
         * because sentAt persistence failed.
         */
        console.error(
          "PostOp invitation email sent, but sentAt could not be updated:",
          sentAtError,
        );
      }
    } catch (emailSendError) {
      /*
       * CASE REMAINS VALID.
       *
       * Invitation remains with sentAt = null,
       * allowing the doctor to retry/resend
       * safely later.
       */
      emailError =
        emailSendError instanceof
        Error
          ? emailSendError.message
          : "Invitation email could not be sent.";

      console.error(
        "PostOp case created but invitation email failed:",
        emailSendError,
      );
    }

    return NextResponse.json(
      {
        case:
          created.case,

        invitation: {
          id:
            created.invitation.id,

          expiresAt:
            created.invitation.expiresAt,

          emailSent,

          /*
           * We NEVER return rawToken.
           */
          ...(emailSent
            ? {}
            : {
                warning:
                  "The recovery journey was created, but the invitation email could not be sent.",

                emailError,
              }),
        },
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
      "Failed to create PostOp case:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Failed to create PostOp recovery journey.",
      },
      {
        status: 500,
      },
    );
  }
}