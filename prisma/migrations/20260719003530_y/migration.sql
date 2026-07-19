-- AlterTable
ALTER TABLE "review_invitation" ALTER COLUMN "patientUserId" DROP NOT NULL,
ALTER COLUMN "recipientEmail" DROP NOT NULL;
