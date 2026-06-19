-- AlterTable
ALTER TABLE "consultation_booking" ADD COLUMN     "paymentConfirmedEmailSentAt" TIMESTAMP(3),
ADD COLUMN     "paymentFailedEmailSentAt" TIMESTAMP(3),
ADD COLUMN     "paymentProcessingEmailSentAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "doctor_profile" ALTER COLUMN "onlineActive" SET DEFAULT true;
