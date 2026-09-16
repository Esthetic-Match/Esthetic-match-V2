import { prisma } from "@/lib/database/prisma";

/*
 * Change this to the English procedure name
 * that already exists in your catalogue.
 *
 * You can override it with:
 *
 * TEST_POSTOP_PROCEDURE_NAME="Rhinoplasty"
 * npx tsx scripts/seed-test-post-op.ts
 */
const PROCEDURE_NAME =
  process.env.TEST_POSTOP_PROCEDURE_NAME ??
  "Rhinoplasty";

const LOCALE = "en";

async function main() {
  console.log(
    `Seeding test PostOp template for "${PROCEDURE_NAME}"...`,
  );

  /*
   * Procedure itself has no `key` or `name`.
   * The translated name lives in ProcedureTranslation.
   */
  const procedureTranslation =
    await prisma.procedureTranslation.findFirst({
      where: {
        localeCode: LOCALE,
        name: {
          equals: PROCEDURE_NAME,
          mode: "insensitive",
        },
      },

      select: {
        name: true,

        procedure: {
          select: {
            id: true,
          },
        },
      },
    });

  if (!procedureTranslation) {
    throw new Error(
      `Procedure "${PROCEDURE_NAME}" with locale "${LOCALE}" was not found.`,
    );
  }

  const procedureId =
    procedureTranslation.procedure.id;

  const procedureName =
    procedureTranslation.name;

  const locale =
    await prisma.catalogLocale.findUnique({
      where: {
        code: LOCALE,
      },

      select: {
        code: true,
      },
    });

  if (!locale) {
    throw new Error(
      `Catalog locale "${LOCALE}" was not found.`,
    );
  }

  /*
   * Since Procedure has no key/slug,
   * use its stable database ID.
   */
  const templateKey =
    `default:${procedureId}:${LOCALE}`;

  /*
   * Create/update the base template.
   */
  const template =
    await prisma.postOpTemplate.upsert({
      where: {
        templateKey,
      },

      update: {
        title: `${procedureName} Recovery`,

        description:
          "Test PostOp recovery template for development.",

        scope: "DEFAULT",

        doctorProfileId: null,

        localeCode: LOCALE,

        procedureId,

        isActive: true,

        version: {
          increment: 1,
        },
      },

      create: {
        templateKey,

        procedureId,

        localeCode: LOCALE,

        scope: "DEFAULT",

        title: `${procedureName} Recovery`,

        description:
          "Test PostOp recovery template for development.",

        version: 1,

        isActive: true,
      },
    });

  /*
   * Remove the previous seed content so this
   * script can safely be run multiple times.
   */
  await prisma.postOpTemplateReminder.deleteMany({
    where: {
      templateId: template.id,
    },
  });

  await prisma.postOpTemplateStep.deleteMany({
    where: {
      templateId: template.id,
    },
  });

  /*
   * ═══════════════════════════════════════
   * STEP 1
   * First 24 Hours
   * ═══════════════════════════════════════
   */

  const step1 =
    await prisma.postOpTemplateStep.create({
      data: {
        templateId: template.id,

        title: "First 24 Hours",

        description:
          "Focus on rest and follow the instructions provided by your doctor.",

        startsAfterHours: 0,

        completesAfterHours: 24,

        completionMode: "TIME_BASED",

        sortOrder: 1,
      },
    });

  await prisma.postOpTemplateBlock.createMany({
    data: [
      {
        stepId: step1.id,

        type: "TEXT",

        text:
          "Your recovery has started. Rest and follow the specific instructions given to you by your doctor.",

        sortOrder: 1,
      },

      {
        stepId: step1.id,

        type: "IMAGE",

        /*
         * Test Supabase object path.
         *
         * Replace this later with a real uploaded
         * PostOp image.
         */
        objectPath:
          "post-op/demo/first-24-hours.jpg",

        mediaAlt:
          "Post-operative recovery guidance",

        sortOrder: 2,
      },

      {
        stepId: step1.id,

        type: "TEXT",

        text:
          "If anything feels unusual or concerning, use the alert feature on your PostOp page to contact your doctor.",

        sortOrder: 3,
      },
    ],
  });

  await prisma.postOpTemplateReminder.createMany({
    data: [
      {
        templateId: template.id,

        stepId: step1.id,

        type: "DO",

        text:
          "Follow the medication and aftercare instructions provided by your doctor.",

        startsAfterHours: 0,

        endsAfterHours: 24,

        isPinned: true,

        sortOrder: 1,
      },

      {
        templateId: template.id,

        stepId: step1.id,

        type: "DONT",

        text:
          "Do not modify your wound care routine unless instructed by your doctor.",

        startsAfterHours: 0,

        endsAfterHours: 24,

        isPinned: true,

        sortOrder: 2,
      },
    ],
  });

  /*
   * ═══════════════════════════════════════
   * STEP 2
   * Days 2–7
   * ═══════════════════════════════════════
   */

  const step2 =
    await prisma.postOpTemplateStep.create({
      data: {
        templateId: template.id,

        title: "Days 2–7",

        description:
          "Continue your recovery routine and monitor how you are progressing.",

        startsAfterHours: 24,

        completesAfterHours: 168,

        completionMode: "TIME_BASED",

        sortOrder: 2,
      },
    });

  await prisma.postOpTemplateBlock.createMany({
    data: [
      {
        stepId: step2.id,

        type: "TEXT",

        text:
          "Continue following your doctor's recovery instructions. You can leave notes to keep track of changes in your recovery.",

        sortOrder: 1,
      },

      {
        stepId: step2.id,

        type: "VIDEO",

        /*
         * Replace with a real recovery video
         * when available.
         */
        externalUrl:
          "https://www.youtube.com/watch?v=dQw4w9WgXcQ",

        mediaAlt:
          "Recovery guidance video",

        sortOrder: 2,
      },
    ],
  });

  await prisma.postOpTemplateReminder.createMany({
    data: [
      {
        templateId: template.id,

        stepId: step2.id,

        type: "DO",

        text:
          "Keep track of any changes in your recovery and add a note if needed.",

        startsAfterHours: 24,

        endsAfterHours: 168,

        isPinned: true,

        sortOrder: 1,
      },

      {
        templateId: template.id,

        stepId: step2.id,

        type: "GENERAL",

        text:
          "Contact your doctor if you have concerns about your recovery.",

        startsAfterHours: 24,

        endsAfterHours: 168,

        isPinned: true,

        sortOrder: 2,
      },
    ],
  });

  /*
   * ═══════════════════════════════════════
   * STEP 3
   * Week 2
   * ═══════════════════════════════════════
   */

  const step3 =
    await prisma.postOpTemplateStep.create({
      data: {
        templateId: template.id,

        title: "Week 2",

        description:
          "Your doctor may want to review your recovery during this stage.",

        startsAfterHours: 168,

        completesAfterHours: 336,

        completionMode: "TIME_BASED",

        sortOrder: 3,
      },
    });

  await prisma.postOpTemplateBlock.createMany({
    data: [
      {
        stepId: step3.id,

        type: "TEXT",

        text:
          "You are now entering the next stage of your recovery. Continue following your doctor's instructions.",

        sortOrder: 1,
      },

      {
        stepId: step3.id,

        type: "BOOKING",

        bookingType: "EITHER",

        buttonLabel:
          "Book your follow-up appointment",

        bookingUrl: null,

        sortOrder: 2,
      },
    ],
  });

  await prisma.postOpTemplateReminder.create({
    data: {
      templateId: template.id,

      stepId: step3.id,

      type: "GENERAL",

      text:
        "Your follow-up consultation may be due during this stage.",

      startsAfterHours: 168,

      endsAfterHours: 336,

      isPinned: true,

      sortOrder: 1,
    },
  });

  /*
   * ═══════════════════════════════════════
   * GLOBAL REMINDER
   * ═══════════════════════════════════════
   */

  await prisma.postOpTemplateReminder.create({
    data: {
      templateId: template.id,

      /*
       * No step means this applies to
       * the entire PostOp.
       */
      stepId: null,

      type: "GENERAL",

      text:
        "If you have a serious concern about your recovery, contact your doctor using the PostOp alert feature.",

      startsAfterHours: 0,

      isPinned: true,

      sortOrder: 1,
    },
  });

  console.log("");
  console.log(
    "✅ Test PostOp template seeded successfully.",
  );

  console.log(
    `Procedure: ${procedureName}`,
  );

  console.log(
    `Procedure ID: ${procedureId}`,
  );

  console.log(
    `Template ID: ${template.id}`,
  );

  console.log(
    `Template key: ${templateKey}`,
  );

  console.log("Steps: 3");
}

main()
  .catch((error) => {
    console.error(
      "❌ Failed to seed PostOp template:",
      error,
    );

    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });