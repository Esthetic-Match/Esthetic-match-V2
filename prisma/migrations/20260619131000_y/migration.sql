-- CreateTable
CREATE TABLE "consultation_refund_request" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "patientUserId" TEXT NOT NULL,
    "doctorProfileId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "adminNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "refundedAt" TIMESTAMP(3),

    CONSTRAINT "consultation_refund_request_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "consultation_refund_request_bookingId_idx" ON "consultation_refund_request"("bookingId");

-- CreateIndex
CREATE INDEX "consultation_refund_request_patientUserId_idx" ON "consultation_refund_request"("patientUserId");

-- CreateIndex
CREATE INDEX "consultation_refund_request_doctorProfileId_idx" ON "consultation_refund_request"("doctorProfileId");

-- CreateIndex
CREATE INDEX "consultation_refund_request_status_idx" ON "consultation_refund_request"("status");

-- AddForeignKey
ALTER TABLE "consultation_refund_request" ADD CONSTRAINT "consultation_refund_request_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "consultation_booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultation_refund_request" ADD CONSTRAINT "consultation_refund_request_patientUserId_fkey" FOREIGN KEY ("patientUserId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultation_refund_request" ADD CONSTRAINT "consultation_refund_request_doctorProfileId_fkey" FOREIGN KEY ("doctorProfileId") REFERENCES "doctor_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
