-- CreateTable
CREATE TABLE "review" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "review" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "patientUserId" TEXT NOT NULL,
    "doctorProfileId" TEXT NOT NULL,
    "invitationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_invitation" (
    "id" TEXT NOT NULL,
    "doctorProfileId" TEXT NOT NULL,
    "patientUserId" TEXT NOT NULL,
    "recipientEmail" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3),
    "usedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "review_invitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "review_invitationId_key" ON "review"("invitationId");

-- CreateIndex
CREATE INDEX "review_patientUserId_idx" ON "review"("patientUserId");

-- CreateIndex
CREATE INDEX "review_doctorProfileId_idx" ON "review"("doctorProfileId");

-- CreateIndex
CREATE INDEX "review_doctorProfileId_createdAt_idx" ON "review"("doctorProfileId", "createdAt");

-- CreateIndex
CREATE INDEX "review_rating_idx" ON "review"("rating");

-- CreateIndex
CREATE UNIQUE INDEX "review_invitation_tokenHash_key" ON "review_invitation"("tokenHash");

-- CreateIndex
CREATE INDEX "review_invitation_doctorProfileId_idx" ON "review_invitation"("doctorProfileId");

-- CreateIndex
CREATE INDEX "review_invitation_patientUserId_idx" ON "review_invitation"("patientUserId");

-- CreateIndex
CREATE INDEX "review_invitation_recipientEmail_idx" ON "review_invitation"("recipientEmail");

-- CreateIndex
CREATE INDEX "review_invitation_expiresAt_idx" ON "review_invitation"("expiresAt");

-- CreateIndex
CREATE INDEX "review_invitation_doctorProfileId_patientUserId_idx" ON "review_invitation"("doctorProfileId", "patientUserId");

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_patientUserId_fkey" FOREIGN KEY ("patientUserId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_doctorProfileId_fkey" FOREIGN KEY ("doctorProfileId") REFERENCES "doctor_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "review_invitation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_invitation" ADD CONSTRAINT "review_invitation_doctorProfileId_fkey" FOREIGN KEY ("doctorProfileId") REFERENCES "doctor_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_invitation" ADD CONSTRAINT "review_invitation_patientUserId_fkey" FOREIGN KEY ("patientUserId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
