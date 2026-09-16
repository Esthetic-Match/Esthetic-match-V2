import type { Prisma } from "@/generated/prisma/client";

/* ═══════════════════════════════════════════════════════════════
   PROCEDURE
═══════════════════════════════════════════════════════════════ */

export const postOpProcedureSelect = {
  id: true,

  translations: {
    select: {
      localeCode: true,
      name: true,
      description: true,
    },
  },
} as const satisfies Prisma.ProcedureSelect;

/* ═══════════════════════════════════════════════════════════════
   TEMPLATE BLOCK
═══════════════════════════════════════════════════════════════ */

export const postOpTemplateBlockSelect = {
  id: true,
  stepId: true,

  type: true,

  text: true,

  objectPath: true,
  externalUrl: true,
  mediaAlt: true,

  bookingType: true,
  bookingUrl: true,
  buttonLabel: true,

  sortOrder: true,

  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.PostOpTemplateBlockSelect;

/* ═══════════════════════════════════════════════════════════════
   TEMPLATE REMINDER
═══════════════════════════════════════════════════════════════ */

export const postOpTemplateReminderSelect = {
  id: true,

  templateId: true,
  stepId: true,

  type: true,
  text: true,

  startsAfterHours: true,
  endsAfterHours: true,

  notificationsEnabled: true,
  repeatEveryHours: true,

  isPinned: true,

  sortOrder: true,

  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.PostOpTemplateReminderSelect;

/* ═══════════════════════════════════════════════════════════════
   TEMPLATE STEP
═══════════════════════════════════════════════════════════════ */

export const postOpTemplateStepSelect = {
  id: true,
  templateId: true,

  title: true,
  description: true,

  startsAfterHours: true,
  completesAfterHours: true,

  completionMode: true,

  sortOrder: true,

  blocks: {
    select: postOpTemplateBlockSelect,

    orderBy: {
      sortOrder: "asc",
    },
  },

  reminders: {
    select: postOpTemplateReminderSelect,

    orderBy: {
      sortOrder: "asc",
    },
  },

  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.PostOpTemplateStepSelect;

/* ═══════════════════════════════════════════════════════════════
   TEMPLATE
═══════════════════════════════════════════════════════════════ */

export const postOpTemplateSelect = {
  id: true,

  templateKey: true,

  procedureId: true,
  localeCode: true,

  scope: true,

  doctorProfileId: true,
  sourceTemplateId: true,

  title: true,
  description: true,

  version: true,
  isActive: true,

  procedure: {
    select: postOpProcedureSelect,
  },

  steps: {
    select: postOpTemplateStepSelect,

    orderBy: {
      sortOrder: "asc",
    },
  },

  /*
   * Only global reminders here.
   *
   * Step reminders already come through
   * each PostOpTemplateStep.
   */
  reminders: {
    where: {
      stepId: null,
    },

    select: postOpTemplateReminderSelect,

    orderBy: {
      sortOrder: "asc",
    },
  },

  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.PostOpTemplateSelect;

/* ═══════════════════════════════════════════════════════════════
   TEMPLATE LIST
═══════════════════════════════════════════════════════════════ */

export const postOpTemplateListSelect = {
  id: true,

  templateKey: true,

  procedureId: true,
  localeCode: true,

  scope: true,

  doctorProfileId: true,

  title: true,
  description: true,

  version: true,
  isActive: true,

  procedure: {
    select: postOpProcedureSelect,
  },

  _count: {
    select: {
      steps: true,
      reminders: true,
      patientCases: true,
    },
  },

  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.PostOpTemplateSelect;

/* ═══════════════════════════════════════════════════════════════
   CASE BLOCK
═══════════════════════════════════════════════════════════════ */

export const postOpCaseBlockSelect = {
  id: true,
  stepId: true,

  type: true,

  text: true,

  objectPath: true,
  externalUrl: true,
  mediaAlt: true,

  bookingType: true,
  bookingUrl: true,
  buttonLabel: true,

  sortOrder: true,

  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.PostOpCaseBlockSelect;

/* ═══════════════════════════════════════════════════════════════
   CASE REMINDER
═══════════════════════════════════════════════════════════════ */

export const postOpCaseReminderSelect = {
  id: true,

  caseId: true,
  stepId: true,

  type: true,

  text: true,

  startsAt: true,
  endsAt: true,

  notificationsEnabled: true,
  repeatEveryHours: true,

  nextNotificationAt: true,
  lastNotificationAt: true,

  isPinned: true,
  isActive: true,

  sortOrder: true,

  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.PostOpCaseReminderSelect;

/* ═══════════════════════════════════════════════════════════════
   CASE STEP
═══════════════════════════════════════════════════════════════ */

export const postOpCaseStepSelect = {
  id: true,
  caseId: true,

  sourceTemplateStepId: true,

  title: true,
  description: true,

  sortOrder: true,

  completionMode: true,

  startsAt: true,
  completesAt: true,

  completedAt: true,
  skippedAt: true,

  blocks: {
    select: postOpCaseBlockSelect,

    orderBy: {
      sortOrder: "asc",
    },
  },

  reminders: {
    select: postOpCaseReminderSelect,

    orderBy: {
      sortOrder: "asc",
    },
  },

  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.PostOpCaseStepSelect;

/* ═══════════════════════════════════════════════════════════════
   PATIENT NOTE ATTACHMENT
═══════════════════════════════════════════════════════════════ */

export const postOpPatientNoteAttachmentSelect = {
  id: true,
  noteId: true,

  objectPath: true,

  fileName: true,
  contentType: true,
  sizeBytes: true,

  createdAt: true,
} as const satisfies Prisma.PostOpPatientNoteAttachmentSelect;

/* ═══════════════════════════════════════════════════════════════
   PATIENT NOTE
═══════════════════════════════════════════════════════════════ */

export const postOpPatientNoteSelect = {
  id: true,

  caseId: true,
  stepId: true,
  patientUserId: true,

  text: true,

  attachments: {
    select: postOpPatientNoteAttachmentSelect,

    orderBy: {
      createdAt: "asc",
    },
  },

  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.PostOpPatientNoteSelect;

/* ═══════════════════════════════════════════════════════════════
   ALERT
═══════════════════════════════════════════════════════════════ */

export const postOpAlertSelect = {
  id: true,

  caseId: true,
  stepId: true,
  patientUserId: true,

  severity: true,
  status: true,

  message: true,

  doctorNotifiedAt: true,

  acknowledgedAt: true,
  resolvedAt: true,

  doctorResponse: true,

  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.PostOpAlertSelect;

/* ═══════════════════════════════════════════════════════════════
   INVITATION
═══════════════════════════════════════════════════════════════ */

export const postOpInvitationSelect = {
  id: true,

  caseId: true,
  patientUserId: true,

  recipientName: true,
  recipientEmail: true,

  /*
   * IMPORTANT:
   *
   * tokenHash intentionally not exposed through
   * shared application query selects.
   */

  expiresAt: true,

  sentAt: true,
  openedAt: true,
  usedAt: true,
  revokedAt: true,

  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.PostOpInvitationSelect;

/* ═══════════════════════════════════════════════════════════════
   CASE LIST
   Doctor + patient dashboard cards
═══════════════════════════════════════════════════════════════ */

export const postOpCaseListSelect = {
  id: true,

  doctorProfileId: true,
  procedureId: true,
  patientUserId: true,

  patientName: true,
  patientEmail: true,

  localeCode: true,

  procedurePerformedAt: true,

  status: true,

  activatedAt: true,
  completedAt: true,
  cancelledAt: true,

  procedure: {
    select: postOpProcedureSelect,
  },

doctorProfile: {
  select: {
    id: true,

    slug: true,

    avatar: true,

    clinicName: true,
    clinicBanner: true,

    inClinicLink: true,
    bookingLinks: true,
    onlineActive: true,
  },
},

  steps: {
    select: {
      id: true,
      title: true,

      sortOrder: true,

      completionMode: true,

      startsAt: true,
      completesAt: true,

      completedAt: true,
      skippedAt: true,
    },

    orderBy: {
      sortOrder: "asc",
    },
  },

  alerts: {
    where: {
      status: {
        in: ["OPEN", "ACKNOWLEDGED"],
      },
    },

    select: {
      id: true,
      severity: true,
      status: true,
      createdAt: true,
    },

    orderBy: {
      createdAt: "desc",
    },
  },

  _count: {
    select: {
      notes: true,
      alerts: true,
      steps: true,
    },
  },

  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.PostOpCaseSelect;

/* ═══════════════════════════════════════════════════════════════
   FULL CASE
   Individual doctor/patient PostOp page
═══════════════════════════════════════════════════════════════ */

export const postOpCaseDetailSelect = {
  id: true,

  doctorProfileId: true,
  procedureId: true,
  patientUserId: true,

  patientName: true,
  patientEmail: true,

  localeCode: true,

  sourceTemplateId: true,
  sourceTemplateVersion: true,

  procedurePerformedAt: true,

  status: true,

  activatedAt: true,
  completedAt: true,
  cancelledAt: true,

  procedure: {
    select: postOpProcedureSelect,
  },

  doctorProfile: {
    select: {
      id: true,
  
      slug: true,
  
      avatar: true,
  
      clinicName: true,
      clinicBanner: true,
  
      workAddress: true,
      city: true,
      country: true,
  
      inClinicLink: true,
      bookingLinks: true,
      onlineActive: true,
    },
  },

  sourceTemplate: {
    select: {
      id: true,
      title: true,
      version: true,
    },
  },

  steps: {
    select: postOpCaseStepSelect,

    orderBy: {
      sortOrder: "asc",
    },
  },

  /*
   * Global case reminders.
   *
   * Step reminders already exist inside steps.
   */
  reminders: {
    where: {
      stepId: null,
    },

    select: postOpCaseReminderSelect,

    orderBy: {
      sortOrder: "asc",
    },
  },

  notes: {
    select: postOpPatientNoteSelect,

    orderBy: {
      createdAt: "desc",
    },
  },

  alerts: {
    select: postOpAlertSelect,

    orderBy: {
      createdAt: "desc",
    },
  },

  invitation: {
    select: postOpInvitationSelect,
  },

  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.PostOpCaseSelect;