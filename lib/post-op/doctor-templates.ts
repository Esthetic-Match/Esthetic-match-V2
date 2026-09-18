import "server-only";

import { headers } from "next/headers";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/database/prisma";

import {
  PostOpAuthorizationError,
} from "@/lib/post-op/authorization";

import {
  postOpTemplateSelect,
} from "@/lib/post-op/selects";

/* ═══════════════════════════════════════════════════════════════
   ACTOR
═══════════════════════════════════════════════════════════════ */

export async function requirePostOpDoctorActor() {
  const session =
    await auth.api.getSession({
      headers: await headers(),
    });

  if (!session?.user?.id) {
    throw new PostOpAuthorizationError(
      "Unauthorized.",
      401,
    );
  }

  if (session.user.role !== "DOCTOR") {
    throw new PostOpAuthorizationError(
      "Doctor access required.",
      403,
    );
  }

  const doctorProfile =
    await prisma.doctorProfile.findUnique({
      where: {
        userId: session.user.id,
      },

      select: {
        id: true,
        userId: true,
      },
    });

  if (!doctorProfile) {
    throw new PostOpAuthorizationError(
      "Doctor profile not found.",
      404,
    );
  }

  return {
    session,
    doctorProfile,
  };
}

/* ═══════════════════════════════════════════════════════════════
   PROCEDURE ACCESS
═══════════════════════════════════════════════════════════════ */

export async function requireDoctorOffersProcedure(
  doctorProfileId: string,
  procedureId: string,
) {
  const association =
    await prisma.doctorProcedure.findUnique({
      where: {
        doctorProfileId_procedureId: {
          doctorProfileId,
          procedureId,
        },
      },

      select: {
        doctorProfileId: true,
        procedureId: true,

        procedure: {
          select: {
            isActive: true,
          },
        },
      },
    });

  if (
    !association ||
    !association.procedure.isActive
  ) {
    throw new PostOpAuthorizationError(
      "This procedure is not associated with your doctor profile.",
      403,
    );
  }

  return association;
}

/* ═══════════════════════════════════════════════════════════════
   TEMPLATE KEY
═══════════════════════════════════════════════════════════════ */

export function getDoctorPostOpTemplateKey({
  doctorProfileId,
  procedureId,
  localeCode,
}: {
  doctorProfileId: string;
  procedureId: string;
  localeCode: string;
}) {
  return [
    "doctor",
    doctorProfileId,
    procedureId,
    localeCode.toLowerCase(),
  ].join(":");
}

/* ═══════════════════════════════════════════════════════════════
   OWNERSHIP
═══════════════════════════════════════════════════════════════ */

export async function requireDoctorOwnedPostOpTemplate({
  doctorProfileId,
  templateId,
}: {
  doctorProfileId: string;
  templateId: string;
}) {
  const template =
    await prisma.postOpTemplate.findFirst({
      where: {
        id: templateId,

        scope: "DOCTOR",

        doctorProfileId,
      },

      select: postOpTemplateSelect,
    });

  if (!template) {
    /*
     * A DEFAULT template will deliberately
     * fail this check.
     */
    throw new PostOpAuthorizationError(
      "Doctor PostOp template not found.",
      404,
    );
  }

  return template;
}

/* ═══════════════════════════════════════════════════════════════
   EFFECTIVE TEMPLATE
═══════════════════════════════════════════════════════════════ */

export async function getEffectiveDoctorPostOpTemplate({
  doctorProfileId,
  procedureId,
  localeCode,
}: {
  doctorProfileId: string;
  procedureId: string;
  localeCode: string;
}) {
  await requireDoctorOffersProcedure(
    doctorProfileId,
    procedureId,
  );

  const normalizedLocale =
    localeCode.toLowerCase();

  /*
   * 1. Doctor custom wins.
   */
  const customTemplate =
    await prisma.postOpTemplate.findFirst({
      where: {
        doctorProfileId,

        procedureId,

        localeCode:
          normalizedLocale,

        scope: "DOCTOR",

        isActive: true,
      },

      select:
        postOpTemplateSelect,
    });

  if (customTemplate) {
    return {
      template:
        customTemplate,

      source:
        "DOCTOR" as const,

      customized: true,
    };
  }

  /*
   * 2. Fall back to platform default.
   */
  const defaultTemplate =
    await prisma.postOpTemplate.findFirst({
      where: {
        doctorProfileId: null,

        procedureId,

        localeCode:
          normalizedLocale,

        scope: "DEFAULT",

        isActive: true,
      },

      select:
        postOpTemplateSelect,
    });

  return {
    template:
      defaultTemplate,

    source:
      defaultTemplate
        ? ("DEFAULT" as const)
        : null,

    customized: false,
  };
}

/* ═══════════════════════════════════════════════════════════════
   CLONE DEFAULT → DOCTOR
═══════════════════════════════════════════════════════════════ */

export async function createDoctorPostOpTemplateFromDefault({
  doctorProfileId,
  procedureId,
  localeCode,
}: {
  doctorProfileId: string;
  procedureId: string;
  localeCode: string;
}) {
  await requireDoctorOffersProcedure(
    doctorProfileId,
    procedureId,
  );

  const normalizedLocale =
    localeCode.toLowerCase();

  /*
   * Idempotent:
   * if already customized, return it.
   */
  const existing =
    await prisma.postOpTemplate.findFirst({
      where: {
        doctorProfileId,

        procedureId,

        localeCode:
          normalizedLocale,

        scope: "DOCTOR",
      },

      select:
        postOpTemplateSelect,
    });

  if (existing) {
    return {
      template: existing,
      created: false,
    };
  }

  /* ─────────────────────────────────────
     LOAD DEFAULT
  ───────────────────────────────────── */

  const source =
    await prisma.postOpTemplate.findFirst({
      where: {
        procedureId,

        localeCode:
          normalizedLocale,

        scope: "DEFAULT",

        doctorProfileId: null,

        isActive: true,
      },

      select: {
        id: true,

        procedureId: true,
        localeCode: true,

        title: true,
        description: true,

        version: true,

        steps: {
          orderBy: {
            sortOrder: "asc",
          },

          select: {
            id: true,

            title: true,
            description: true,

            startsAfterHours: true,
            completesAfterHours: true,

            completionMode: true,

            sortOrder: true,

            blocks: {
              orderBy: {
                sortOrder: "asc",
              },

              select: {
                type: true,

                text: true,

                objectPath: true,
                externalUrl: true,
                mediaAlt: true,

                bookingType: true,
                bookingUrl: true,
                buttonLabel: true,

                sortOrder: true,
              },
            },
          },
        },

        /*
         * Contains global + step reminders.
         */
        reminders: {
          orderBy: {
            sortOrder: "asc",
          },

          select: {
            stepId: true,

            type: true,
            text: true,

            startsAfterHours: true,
            endsAfterHours: true,

            notificationsEnabled:
              true,

            repeatEveryHours:
              true,

            isPinned: true,

            sortOrder: true,
          },
        },
      },
    });

  if (!source) {
    throw new PostOpAuthorizationError(
      "No active default PostOp template exists for this procedure and locale.",
      404,
    );
  }

  const templateKey =
    getDoctorPostOpTemplateKey({
      doctorProfileId,

      procedureId,

      localeCode:
        normalizedLocale,
    });

  /* ═══════════════════════════════════════
     TRANSACTIONAL CLONE
  ═══════════════════════════════════════ */

  const template =
    await prisma.$transaction(
      async (tx) => {
        const createdTemplate =
          await tx.postOpTemplate.create({
            data: {
              templateKey,

              procedureId,

              localeCode:
                normalizedLocale,

              scope: "DOCTOR",

              doctorProfileId,

              sourceTemplateId:
                source.id,

              title:
                source.title,

              description:
                source.description,

              /*
               * Doctor template starts its
               * own version history.
               */
              version: 1,

              isActive: true,
            },

            select: {
              id: true,
            },
          });

        /*
         * Required because reminders reference
         * newly-created step IDs.
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
          source.steps
        ) {
          const createdStep =
            await tx.postOpTemplateStep.create({
              data: {
                templateId:
                  createdTemplate.id,

                title:
                  sourceStep.title,

                description:
                  sourceStep.description,

                startsAfterHours:
                  sourceStep.startsAfterHours,

                completesAfterHours:
                  sourceStep.completesAfterHours,

                completionMode:
                  sourceStep.completionMode,

                sortOrder:
                  sourceStep.sortOrder,
              },

              select: {
                id: true,
              },
            });

          stepIdMap.set(
            sourceStep.id,
            createdStep.id,
          );

          if (
            sourceStep.blocks.length >
            0
          ) {
            await tx.postOpTemplateBlock.createMany(
              {
                data:
                  sourceStep.blocks.map(
                    (block) => ({
                      stepId:
                        createdStep.id,

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
          source.reminders.length >
          0
        ) {
          await tx.postOpTemplateReminder.createMany(
            {
              data:
                source.reminders.map(
                  (reminder) => {
                    let newStepId:
                      | string
                      | null = null;

                    if (
                      reminder.stepId
                    ) {
                      newStepId =
                        stepIdMap.get(
                          reminder.stepId,
                        ) ?? null;

                      if (!newStepId) {
                        throw new Error(
                          `Could not map source reminder step ${reminder.stepId}.`,
                        );
                      }
                    }

                    return {
                      templateId:
                        createdTemplate.id,

                      stepId:
                        newStepId,

                      type:
                        reminder.type,

                      text:
                        reminder.text,

                      startsAfterHours:
                        reminder.startsAfterHours,

                      endsAfterHours:
                        reminder.endsAfterHours,

                      notificationsEnabled:
                        reminder.notificationsEnabled,

                      repeatEveryHours:
                        reminder.repeatEveryHours,

                      isPinned:
                        reminder.isPinned,

                      sortOrder:
                        reminder.sortOrder,
                    };
                  },
                ),
            },
          );
        }

        return tx.postOpTemplate.findUniqueOrThrow(
          {
            where: {
              id:
                createdTemplate.id,
            },

            select:
              postOpTemplateSelect,
          },
        );
      },
    );

  return {
    template,
    created: true,
  };
}

/* ═══════════════════════════════════════════════════════════════
   RESET TO DEFAULT
═══════════════════════════════════════════════════════════════ */

export async function resetDoctorPostOpTemplate({
  doctorProfileId,
  templateId,
}: {
  doctorProfileId: string;
  templateId: string;
}) {
  const template =
    await prisma.postOpTemplate.findFirst({
      where: {
        id: templateId,

        doctorProfileId,

        scope: "DOCTOR",
      },

      select: {
        id: true,
        procedureId: true,
        localeCode: true,
      },
    });

  if (!template) {
    throw new PostOpAuthorizationError(
      "Doctor PostOp template not found.",
      404,
    );
  }

  await prisma.postOpTemplate.delete({
    where: {
      id: template.id,
    },
  });

  /*
   * Deleting the custom template means
   * effective resolution automatically
   * falls back to DEFAULT.
   */
  return getEffectiveDoctorPostOpTemplate({
    doctorProfileId,

    procedureId:
      template.procedureId,

    localeCode:
      template.localeCode,
  });
}