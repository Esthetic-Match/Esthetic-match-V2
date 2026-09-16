-- CreateEnum
CREATE TYPE "PostOpTemplateScope" AS ENUM ('DEFAULT', 'DOCTOR');

-- CreateEnum
CREATE TYPE "PostOpCaseStatus" AS ENUM ('INVITED', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PostOpContentType" AS ENUM ('TEXT', 'IMAGE', 'VIDEO', 'BOOKING');

-- CreateEnum
CREATE TYPE "PostOpBookingType" AS ENUM ('IN_CLINIC', 'ONLINE', 'EITHER');

-- CreateEnum
CREATE TYPE "PostOpReminderType" AS ENUM ('DO', 'DONT', 'GENERAL');

-- CreateEnum
CREATE TYPE "PostOpStepCompletionMode" AS ENUM ('TIME_BASED', 'MANUAL');

-- CreateEnum
CREATE TYPE "PostOpAlertSeverity" AS ENUM ('CONCERN', 'URGENT', 'EMERGENCY');

-- CreateEnum
CREATE TYPE "PostOpAlertStatus" AS ENUM ('OPEN', 'ACKNOWLEDGED', 'RESOLVED');

-- CreateTable
CREATE TABLE "post_op_template" (
    "id" TEXT NOT NULL,
    "templateKey" TEXT NOT NULL,
    "procedureId" TEXT NOT NULL,
    "localeCode" VARCHAR(35) NOT NULL,
    "scope" "PostOpTemplateScope" NOT NULL,
    "doctorProfileId" TEXT,
    "sourceTemplateId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "post_op_template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_op_template_step" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startsAfterHours" INTEGER NOT NULL DEFAULT 0,
    "completesAfterHours" INTEGER,
    "completionMode" "PostOpStepCompletionMode" NOT NULL DEFAULT 'TIME_BASED',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "post_op_template_step_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_op_template_block" (
    "id" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "type" "PostOpContentType" NOT NULL,
    "text" TEXT,
    "objectPath" TEXT,
    "externalUrl" TEXT,
    "mediaAlt" TEXT,
    "bookingType" "PostOpBookingType",
    "bookingUrl" TEXT,
    "buttonLabel" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "post_op_template_block_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_op_template_reminder" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "stepId" TEXT,
    "type" "PostOpReminderType" NOT NULL,
    "text" TEXT NOT NULL,
    "startsAfterHours" INTEGER NOT NULL DEFAULT 0,
    "endsAfterHours" INTEGER,
    "notificationsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "repeatEveryHours" INTEGER,
    "isPinned" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "post_op_template_reminder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_op_case" (
    "id" TEXT NOT NULL,
    "doctorProfileId" TEXT NOT NULL,
    "procedureId" TEXT NOT NULL,
    "patientUserId" TEXT,
    "patientName" TEXT NOT NULL,
    "patientEmail" TEXT NOT NULL,
    "localeCode" VARCHAR(35) NOT NULL,
    "sourceTemplateId" TEXT,
    "sourceTemplateVersion" INTEGER,
    "procedurePerformedAt" TIMESTAMP(3) NOT NULL,
    "status" "PostOpCaseStatus" NOT NULL DEFAULT 'INVITED',
    "activatedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "post_op_case_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_op_case_step" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "sourceTemplateStepId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "completionMode" "PostOpStepCompletionMode" NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "completesAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "skippedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "post_op_case_step_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_op_case_block" (
    "id" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "type" "PostOpContentType" NOT NULL,
    "text" TEXT,
    "objectPath" TEXT,
    "externalUrl" TEXT,
    "mediaAlt" TEXT,
    "bookingType" "PostOpBookingType",
    "bookingUrl" TEXT,
    "buttonLabel" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "post_op_case_block_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_op_case_reminder" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "stepId" TEXT,
    "type" "PostOpReminderType" NOT NULL,
    "text" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3),
    "notificationsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "repeatEveryHours" INTEGER,
    "nextNotificationAt" TIMESTAMP(3),
    "lastNotificationAt" TIMESTAMP(3),
    "isPinned" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "post_op_case_reminder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_op_invitation" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "patientUserId" TEXT,
    "recipientName" TEXT NOT NULL,
    "recipientEmail" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3),
    "openedAt" TIMESTAMP(3),
    "usedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "post_op_invitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_op_patient_note" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "stepId" TEXT,
    "patientUserId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "post_op_patient_note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_op_patient_note_attachment" (
    "id" TEXT NOT NULL,
    "noteId" TEXT NOT NULL,
    "objectPath" TEXT NOT NULL,
    "fileName" TEXT,
    "contentType" TEXT NOT NULL,
    "sizeBytes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_op_patient_note_attachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_op_alert" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "stepId" TEXT,
    "patientUserId" TEXT NOT NULL,
    "severity" "PostOpAlertSeverity" NOT NULL,
    "status" "PostOpAlertStatus" NOT NULL DEFAULT 'OPEN',
    "message" TEXT NOT NULL,
    "doctorNotifiedAt" TIMESTAMP(3),
    "acknowledgedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "doctorResponse" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "post_op_alert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "post_op_template_templateKey_key" ON "post_op_template"("templateKey");

-- CreateIndex
CREATE INDEX "post_op_template_procedureId_idx" ON "post_op_template"("procedureId");

-- CreateIndex
CREATE INDEX "post_op_template_doctorProfileId_idx" ON "post_op_template"("doctorProfileId");

-- CreateIndex
CREATE INDEX "post_op_template_procedureId_localeCode_idx" ON "post_op_template"("procedureId", "localeCode");

-- CreateIndex
CREATE INDEX "post_op_template_doctorProfileId_procedureId_idx" ON "post_op_template"("doctorProfileId", "procedureId");

-- CreateIndex
CREATE INDEX "post_op_template_scope_isActive_idx" ON "post_op_template"("scope", "isActive");

-- CreateIndex
CREATE INDEX "post_op_template_step_templateId_sortOrder_idx" ON "post_op_template_step"("templateId", "sortOrder");

-- CreateIndex
CREATE INDEX "post_op_template_block_stepId_sortOrder_idx" ON "post_op_template_block"("stepId", "sortOrder");

-- CreateIndex
CREATE INDEX "post_op_template_reminder_templateId_idx" ON "post_op_template_reminder"("templateId");

-- CreateIndex
CREATE INDEX "post_op_template_reminder_stepId_idx" ON "post_op_template_reminder"("stepId");

-- CreateIndex
CREATE INDEX "post_op_case_doctorProfileId_idx" ON "post_op_case"("doctorProfileId");

-- CreateIndex
CREATE INDEX "post_op_case_patientUserId_idx" ON "post_op_case"("patientUserId");

-- CreateIndex
CREATE INDEX "post_op_case_procedureId_idx" ON "post_op_case"("procedureId");

-- CreateIndex
CREATE INDEX "post_op_case_status_idx" ON "post_op_case"("status");

-- CreateIndex
CREATE INDEX "post_op_case_doctorProfileId_status_idx" ON "post_op_case"("doctorProfileId", "status");

-- CreateIndex
CREATE INDEX "post_op_case_patientUserId_status_idx" ON "post_op_case"("patientUserId", "status");

-- CreateIndex
CREATE INDEX "post_op_case_patientEmail_idx" ON "post_op_case"("patientEmail");

-- CreateIndex
CREATE INDEX "post_op_case_step_caseId_sortOrder_idx" ON "post_op_case_step"("caseId", "sortOrder");

-- CreateIndex
CREATE INDEX "post_op_case_step_startsAt_idx" ON "post_op_case_step"("startsAt");

-- CreateIndex
CREATE INDEX "post_op_case_block_stepId_sortOrder_idx" ON "post_op_case_block"("stepId", "sortOrder");

-- CreateIndex
CREATE INDEX "post_op_case_reminder_caseId_idx" ON "post_op_case_reminder"("caseId");

-- CreateIndex
CREATE INDEX "post_op_case_reminder_stepId_idx" ON "post_op_case_reminder"("stepId");

-- CreateIndex
CREATE INDEX "post_op_case_reminder_nextNotificationAt_idx" ON "post_op_case_reminder"("nextNotificationAt");

-- CreateIndex
CREATE UNIQUE INDEX "post_op_invitation_caseId_key" ON "post_op_invitation"("caseId");

-- CreateIndex
CREATE UNIQUE INDEX "post_op_invitation_tokenHash_key" ON "post_op_invitation"("tokenHash");

-- CreateIndex
CREATE INDEX "post_op_invitation_patientUserId_idx" ON "post_op_invitation"("patientUserId");

-- CreateIndex
CREATE INDEX "post_op_invitation_recipientEmail_idx" ON "post_op_invitation"("recipientEmail");

-- CreateIndex
CREATE INDEX "post_op_invitation_expiresAt_idx" ON "post_op_invitation"("expiresAt");

-- CreateIndex
CREATE INDEX "post_op_patient_note_caseId_createdAt_idx" ON "post_op_patient_note"("caseId", "createdAt");

-- CreateIndex
CREATE INDEX "post_op_patient_note_stepId_idx" ON "post_op_patient_note"("stepId");

-- CreateIndex
CREATE INDEX "post_op_patient_note_patientUserId_idx" ON "post_op_patient_note"("patientUserId");

-- CreateIndex
CREATE INDEX "post_op_patient_note_attachment_noteId_idx" ON "post_op_patient_note_attachment"("noteId");

-- CreateIndex
CREATE INDEX "post_op_alert_caseId_idx" ON "post_op_alert"("caseId");

-- CreateIndex
CREATE INDEX "post_op_alert_stepId_idx" ON "post_op_alert"("stepId");

-- CreateIndex
CREATE INDEX "post_op_alert_status_idx" ON "post_op_alert"("status");

-- CreateIndex
CREATE INDEX "post_op_alert_severity_idx" ON "post_op_alert"("severity");

-- CreateIndex
CREATE INDEX "post_op_alert_caseId_status_idx" ON "post_op_alert"("caseId", "status");

-- AddForeignKey
ALTER TABLE "post_op_template" ADD CONSTRAINT "post_op_template_procedureId_fkey" FOREIGN KEY ("procedureId") REFERENCES "procedure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_op_template" ADD CONSTRAINT "post_op_template_localeCode_fkey" FOREIGN KEY ("localeCode") REFERENCES "catalog_locale"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_op_template" ADD CONSTRAINT "post_op_template_doctorProfileId_fkey" FOREIGN KEY ("doctorProfileId") REFERENCES "doctor_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_op_template" ADD CONSTRAINT "post_op_template_sourceTemplateId_fkey" FOREIGN KEY ("sourceTemplateId") REFERENCES "post_op_template"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_op_template_step" ADD CONSTRAINT "post_op_template_step_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "post_op_template"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_op_template_block" ADD CONSTRAINT "post_op_template_block_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "post_op_template_step"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_op_template_reminder" ADD CONSTRAINT "post_op_template_reminder_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "post_op_template"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_op_template_reminder" ADD CONSTRAINT "post_op_template_reminder_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "post_op_template_step"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_op_case" ADD CONSTRAINT "post_op_case_doctorProfileId_fkey" FOREIGN KEY ("doctorProfileId") REFERENCES "doctor_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_op_case" ADD CONSTRAINT "post_op_case_procedureId_fkey" FOREIGN KEY ("procedureId") REFERENCES "procedure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_op_case" ADD CONSTRAINT "post_op_case_patientUserId_fkey" FOREIGN KEY ("patientUserId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_op_case" ADD CONSTRAINT "post_op_case_sourceTemplateId_fkey" FOREIGN KEY ("sourceTemplateId") REFERENCES "post_op_template"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_op_case_step" ADD CONSTRAINT "post_op_case_step_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "post_op_case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_op_case_block" ADD CONSTRAINT "post_op_case_block_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "post_op_case_step"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_op_case_reminder" ADD CONSTRAINT "post_op_case_reminder_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "post_op_case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_op_case_reminder" ADD CONSTRAINT "post_op_case_reminder_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "post_op_case_step"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_op_invitation" ADD CONSTRAINT "post_op_invitation_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "post_op_case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_op_invitation" ADD CONSTRAINT "post_op_invitation_patientUserId_fkey" FOREIGN KEY ("patientUserId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_op_patient_note" ADD CONSTRAINT "post_op_patient_note_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "post_op_case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_op_patient_note" ADD CONSTRAINT "post_op_patient_note_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "post_op_case_step"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_op_patient_note" ADD CONSTRAINT "post_op_patient_note_patientUserId_fkey" FOREIGN KEY ("patientUserId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_op_patient_note_attachment" ADD CONSTRAINT "post_op_patient_note_attachment_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "post_op_patient_note"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_op_alert" ADD CONSTRAINT "post_op_alert_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "post_op_case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_op_alert" ADD CONSTRAINT "post_op_alert_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "post_op_case_step"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_op_alert" ADD CONSTRAINT "post_op_alert_patientUserId_fkey" FOREIGN KEY ("patientUserId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
