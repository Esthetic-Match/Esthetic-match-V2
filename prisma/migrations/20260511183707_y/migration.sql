/*
  Warnings:

  - You are about to drop the `ConsultationBooking` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ConsultationBooking" DROP CONSTRAINT "ConsultationBooking_doctorProfileId_fkey";

-- DropTable
DROP TABLE "ConsultationBooking";

-- CreateTable
CREATE TABLE "consultation_booking" (
    "id" TEXT NOT NULL,
    "patientUserId" TEXT NOT NULL,
    "doctorProfileId" TEXT NOT NULL,
    "consultationType" "ConsultationType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "platformFee" INTEGER NOT NULL,
    "doctorAmount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'eur',
    "stripeCheckoutSessionId" TEXT,
    "stripePaymentIntentId" TEXT,
    "stripeChargeId" TEXT,
    "stripeTransferId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "paidAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "refundedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consultation_booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "in_clinic_consultation_access" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "patientUserId" TEXT NOT NULL,
    "doctorProfileId" TEXT NOT NULL,
    "approvedToView" BOOLEAN NOT NULL DEFAULT false,
    "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "in_clinic_consultation_access_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "online_consultation_access" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "patientUserId" TEXT NOT NULL,
    "doctorProfileId" TEXT NOT NULL,
    "activeChat" BOOLEAN NOT NULL DEFAULT false,
    "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activatedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "online_consultation_access_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "consultation_booking_stripeCheckoutSessionId_key" ON "consultation_booking"("stripeCheckoutSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "consultation_booking_stripePaymentIntentId_key" ON "consultation_booking"("stripePaymentIntentId");

-- CreateIndex
CREATE INDEX "consultation_booking_patientUserId_idx" ON "consultation_booking"("patientUserId");

-- CreateIndex
CREATE INDEX "consultation_booking_doctorProfileId_idx" ON "consultation_booking"("doctorProfileId");

-- CreateIndex
CREATE INDEX "consultation_booking_consultationType_idx" ON "consultation_booking"("consultationType");

-- CreateIndex
CREATE INDEX "consultation_booking_status_idx" ON "consultation_booking"("status");

-- CreateIndex
CREATE UNIQUE INDEX "in_clinic_consultation_access_bookingId_key" ON "in_clinic_consultation_access"("bookingId");

-- CreateIndex
CREATE INDEX "in_clinic_consultation_access_patientUserId_idx" ON "in_clinic_consultation_access"("patientUserId");

-- CreateIndex
CREATE INDEX "in_clinic_consultation_access_doctorProfileId_idx" ON "in_clinic_consultation_access"("doctorProfileId");

-- CreateIndex
CREATE INDEX "in_clinic_consultation_access_approvedToView_idx" ON "in_clinic_consultation_access"("approvedToView");

-- CreateIndex
CREATE UNIQUE INDEX "online_consultation_access_bookingId_key" ON "online_consultation_access"("bookingId");

-- CreateIndex
CREATE INDEX "online_consultation_access_patientUserId_idx" ON "online_consultation_access"("patientUserId");

-- CreateIndex
CREATE INDEX "online_consultation_access_doctorProfileId_idx" ON "online_consultation_access"("doctorProfileId");

-- CreateIndex
CREATE INDEX "online_consultation_access_activeChat_idx" ON "online_consultation_access"("activeChat");

-- AddForeignKey
ALTER TABLE "consultation_booking" ADD CONSTRAINT "consultation_booking_patientUserId_fkey" FOREIGN KEY ("patientUserId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultation_booking" ADD CONSTRAINT "consultation_booking_doctorProfileId_fkey" FOREIGN KEY ("doctorProfileId") REFERENCES "doctor_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "in_clinic_consultation_access" ADD CONSTRAINT "in_clinic_consultation_access_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "consultation_booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "in_clinic_consultation_access" ADD CONSTRAINT "in_clinic_consultation_access_patientUserId_fkey" FOREIGN KEY ("patientUserId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "in_clinic_consultation_access" ADD CONSTRAINT "in_clinic_consultation_access_doctorProfileId_fkey" FOREIGN KEY ("doctorProfileId") REFERENCES "doctor_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "online_consultation_access" ADD CONSTRAINT "online_consultation_access_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "consultation_booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "online_consultation_access" ADD CONSTRAINT "online_consultation_access_patientUserId_fkey" FOREIGN KEY ("patientUserId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "online_consultation_access" ADD CONSTRAINT "online_consultation_access_doctorProfileId_fkey" FOREIGN KEY ("doctorProfileId") REFERENCES "doctor_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
