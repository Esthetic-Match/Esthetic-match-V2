import type { Prisma } from "@/generated/prisma/client";

import {
  postOpAlertSelect,
  postOpCaseBlockSelect,
  postOpCaseDetailSelect,
  postOpCaseListSelect,
  postOpCaseReminderSelect,
  postOpCaseStepSelect,
  postOpInvitationSelect,
  postOpPatientNoteAttachmentSelect,
  postOpPatientNoteSelect,
  postOpProcedureSelect,
  postOpTemplateBlockSelect,
  postOpTemplateListSelect,
  postOpTemplateReminderSelect,
  postOpTemplateSelect,
  postOpTemplateStepSelect,
} from "./selects";

/* ═══════════════════════════════════════════════════════════════
   PROCEDURES
═══════════════════════════════════════════════════════════════ */

export type PostOpProcedure =
  Prisma.ProcedureGetPayload<{
    select: typeof postOpProcedureSelect;
  }>;

/* ═══════════════════════════════════════════════════════════════
   TEMPLATES
═══════════════════════════════════════════════════════════════ */

export type PostOpTemplateBlock =
  Prisma.PostOpTemplateBlockGetPayload<{
    select: typeof postOpTemplateBlockSelect;
  }>;

export type PostOpTemplateReminder =
  Prisma.PostOpTemplateReminderGetPayload<{
    select: typeof postOpTemplateReminderSelect;
  }>;

export type PostOpTemplateStep =
  Prisma.PostOpTemplateStepGetPayload<{
    select: typeof postOpTemplateStepSelect;
  }>;

export type PostOpTemplate =
  Prisma.PostOpTemplateGetPayload<{
    select: typeof postOpTemplateSelect;
  }>;

export type PostOpTemplateListItem =
  Prisma.PostOpTemplateGetPayload<{
    select: typeof postOpTemplateListSelect;
  }>;

/* ═══════════════════════════════════════════════════════════════
   CASES
═══════════════════════════════════════════════════════════════ */

export type PostOpCaseBlock =
  Prisma.PostOpCaseBlockGetPayload<{
    select: typeof postOpCaseBlockSelect;
  }>;

export type PostOpCaseReminder =
  Prisma.PostOpCaseReminderGetPayload<{
    select: typeof postOpCaseReminderSelect;
  }>;

export type PostOpCaseStep =
  Prisma.PostOpCaseStepGetPayload<{
    select: typeof postOpCaseStepSelect;
  }>;

export type PostOpCaseListItem =
  Prisma.PostOpCaseGetPayload<{
    select: typeof postOpCaseListSelect;
  }>;

export type PostOpCaseDetail =
  Prisma.PostOpCaseGetPayload<{
    select: typeof postOpCaseDetailSelect;
  }>;

/* ═══════════════════════════════════════════════════════════════
   NOTES
═══════════════════════════════════════════════════════════════ */

export type PostOpPatientNoteAttachment =
  Prisma.PostOpPatientNoteAttachmentGetPayload<{
    select: typeof postOpPatientNoteAttachmentSelect;
  }>;

export type PostOpPatientNote =
  Prisma.PostOpPatientNoteGetPayload<{
    select: typeof postOpPatientNoteSelect;
  }>;

/* ═══════════════════════════════════════════════════════════════
   ALERTS
═══════════════════════════════════════════════════════════════ */

export type PostOpAlert =
  Prisma.PostOpAlertGetPayload<{
    select: typeof postOpAlertSelect;
  }>;

/* ═══════════════════════════════════════════════════════════════
   INVITATIONS
═══════════════════════════════════════════════════════════════ */

export type PostOpInvitation =
  Prisma.PostOpInvitationGetPayload<{
    select: typeof postOpInvitationSelect;
  }>;

/* ═══════════════════════════════════════════════════════════════
   CONVENIENCE TYPES
═══════════════════════════════════════════════════════════════ */

export type PostOpTemplateBlockType =
  PostOpTemplate["steps"][number]["blocks"][number];

export type PostOpCaseStepType =
  PostOpCaseDetail["steps"][number];

export type PostOpCaseBlockType =
  PostOpCaseDetail["steps"][number]["blocks"][number];

export type PostOpCaseStepReminder =
  PostOpCaseDetail["steps"][number]["reminders"][number];

export type PostOpCaseGlobalReminder =
  PostOpCaseDetail["reminders"][number];

export type PostOpCaseNote =
  PostOpCaseDetail["notes"][number];

export type PostOpCaseAlert =
  PostOpCaseDetail["alerts"][number];

/* ═══════════════════════════════════════════════════════════════
   LOCALIZED PROCEDURE HELPERS
═══════════════════════════════════════════════════════════════ */

export type PostOpProcedureTranslation =
  PostOpProcedure["translations"][number];

export function getPostOpProcedureTranslation(
  procedure: PostOpProcedure,
  locale: string,
) {
  return (
    procedure.translations.find(
      (translation) =>
        translation.localeCode === locale,
    ) ??
    procedure.translations.find(
      (translation) =>
        translation.localeCode === "en",
    ) ??
    procedure.translations[0] ??
    null
  );
}

export function getPostOpProcedureName(
  procedure: PostOpProcedure,
  locale: string,
) {
  return (
    getPostOpProcedureTranslation(
      procedure,
      locale,
    )?.name ?? "Procedure"
  );
}