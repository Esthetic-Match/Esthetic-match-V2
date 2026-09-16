import "server-only";

import { prisma } from "@/lib/database/prisma";

import {
  validatePostOpBlock,
  type PostOpBlockType,
} from "@/lib/post-op/blocks";

import {
  validatePostOpCompletionConfig,
} from "@/lib/post-op/completion";

import {
  validatePostOpTemplateReminder,
  type PostOpReminderType,
} from "@/lib/post-op/reminders";

export async function validateDefaultPostOpTemplateForPublish(
  templateId: string,
) {
  const template =
    await prisma.postOpTemplate.findFirst({
      where: {
        id: templateId,
        scope: "DEFAULT",
        doctorProfileId: null,
      },

      select: {
        id: true,
        title: true,
        procedureId: true,
        localeCode: true,

        procedure: {
          select: {
            id: true,
            isActive: true,
          },
        },

        locale: {
          select: {
            code: true,
            isActive: true,
          },
        },

        steps: {
          orderBy: {
            sortOrder: "asc",
          },

          select: {
            id: true,
            title: true,

            startsAfterHours: true,
            completesAfterHours: true,

            completionMode: true,
            sortOrder: true,

            blocks: {
              orderBy: {
                sortOrder: "asc",
              },

              select: {
                id: true,

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
         * Validate ALL reminders here,
         * both global and step-specific.
         */
        reminders: {
          select: {
            id: true,

            stepId: true,

            type: true,
            text: true,

            startsAfterHours: true,
            endsAfterHours: true,

            notificationsEnabled: true,
            repeatEveryHours: true,

            isPinned: true,

            sortOrder: true,
          },
        },
      },
    });

  if (!template) {
    return {
      template: null,
      valid: false as const,

      errors: [
        "Default PostOp template not found.",
      ],
    };
  }

  const errors: string[] = [];

  /* ═══════════════════════════════════════
     TEMPLATE
  ═══════════════════════════════════════ */

  if (!template.title.trim()) {
    errors.push(
      "Template title cannot be empty.",
    );
  }

  if (!template.procedure) {
    errors.push(
      "Template must have a valid procedure.",
    );
  } else if (!template.procedure.isActive) {
    errors.push(
      "Cannot publish a template for an inactive procedure.",
    );
  }

  if (!template.locale) {
    errors.push(
      "Template must have a valid locale.",
    );
  } else if (!template.locale.isActive) {
    errors.push(
      "Cannot publish a template using an inactive locale.",
    );
  }

  /* ═══════════════════════════════════════
     STEPS
  ═══════════════════════════════════════ */

  if (template.steps.length === 0) {
    errors.push(
      "Template must contain at least one step.",
    );
  }

  const stepIds =
    new Set(
      template.steps.map(
        (step) => step.id,
      ),
    );

  const stepSortOrders =
    new Set<number>();

  for (const step of template.steps) {
    if (!step.title.trim()) {
      errors.push(
        `Step ${step.id} has an empty title.`,
      );
    }

    if (
      stepSortOrders.has(
        step.sortOrder,
      )
    ) {
      errors.push(
        `Duplicate step sortOrder ${step.sortOrder}.`,
      );
    }

    stepSortOrders.add(
      step.sortOrder,
    );

    const timingValidation =
      validatePostOpCompletionConfig({
        completionMode:
          step.completionMode,

        startsAfterHours:
          step.startsAfterHours,

        completesAfterHours:
          step.completesAfterHours,
      });

    if (!timingValidation.valid) {
      errors.push(
        `Step "${step.title}": ${timingValidation.error}`,
      );
    }

    /*
     * A recovery step with no content is
     * considered malformed.
     */
    if (step.blocks.length === 0) {
      errors.push(
        `Step "${step.title}" must contain at least one content block.`,
      );
    }

    /* ─────────────────────────────────────
       BLOCKS
    ───────────────────────────────────── */

    const blockSortOrders =
      new Set<number>();

    for (const block of step.blocks) {
      if (
        blockSortOrders.has(
          block.sortOrder,
        )
      ) {
        errors.push(
          `Step "${step.title}" contains duplicate block sortOrder ${block.sortOrder}.`,
        );
      }

      blockSortOrders.add(
        block.sortOrder,
      );

      const blockValidation =
        validatePostOpBlock({
          type:
            block.type as PostOpBlockType,

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
        });

      if (!blockValidation.valid) {
        errors.push(
          `Step "${step.title}", block ${block.id}: ${blockValidation.error}`,
        );
      }
    }
  }

  /* ═══════════════════════════════════════
     REMINDERS
  ═══════════════════════════════════════ */

  const reminderSortOrders =
    new Map<
      string,
      Set<number>
    >();

  for (
    const reminder of template.reminders
  ) {
    /*
     * Step-specific reminder must reference
     * a step in THIS template.
     */
    if (
      reminder.stepId &&
      !stepIds.has(reminder.stepId)
    ) {
      errors.push(
        `Reminder ${reminder.id} references a step outside this template.`,
      );
    }

    const reminderValidation =
      validatePostOpTemplateReminder({
        type:
          reminder.type as PostOpReminderType,

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
      });

    if (
      !reminderValidation.valid
    ) {
      errors.push(
        `Reminder ${reminder.id}: ${reminderValidation.error}`,
      );
    }

    /*
     * Global reminders have their own ordering.
     * Each step has its own reminder ordering.
     */
    const scopeKey =
      reminder.stepId ??
      "__GLOBAL__";

    let scopeOrders =
      reminderSortOrders.get(
        scopeKey,
      );

    if (!scopeOrders) {
      scopeOrders =
        new Set<number>();

      reminderSortOrders.set(
        scopeKey,
        scopeOrders,
      );
    }

    if (
      scopeOrders.has(
        reminder.sortOrder,
      )
    ) {
      errors.push(
        `Duplicate reminder sortOrder ${reminder.sortOrder} in ${
          reminder.stepId
            ? `step ${reminder.stepId}`
            : "global reminders"
        }.`,
      );
    }

    scopeOrders.add(
      reminder.sortOrder,
    );
  }

  return {
    template,

    valid:
      errors.length === 0,

    errors,
  };
}